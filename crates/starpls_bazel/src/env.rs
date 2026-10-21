use std::collections::HashMap;

use serde::Deserialize;
use serde::Serialize;

use crate::builtin::Callable;
use crate::builtin::Param;
use crate::builtin::Type;
use crate::builtin::Value;
use crate::Builtins;

/// Normalize HTML embedded in Bazel's exported documentation and type names.
pub fn normalize_doc(text: &str, is_type: bool) -> String {
    let mut result = String::new();
    let mut in_tag = false;
    let mut tag = String::new();
    for ch in text.chars() {
        match ch {
            '<' => in_tag = true,
            '>' => {
                if !in_tag {
                    result.push(ch);
                    continue;
                }
                let replacement = match tag.as_str() {
                    "p" => "\n\n",
                    "code" => {
                        if is_type {
                            ""
                        } else {
                            "`"
                        }
                    }
                    "/code" => {
                        if is_type {
                            ""
                        } else {
                            "`"
                        }
                    }
                    _ => "",
                };
                result.push_str(replacement);
                in_tag = false;
                tag.clear();
            }
            _ => {
                if in_tag {
                    tag.push(ch);
                } else {
                    result.push(ch);
                }
            }
        }
    }
    result
}

/// The possible rules exposed by an immutable reflected-rule query.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ExistingRuleScope {
    Any,
    Build,
}

impl ExistingRuleScope {
    /// A return-type description that retains the query's rule scope.
    pub fn return_type(self, name: &str) -> Option<&'static str> {
        match (self, name) {
            (Self::Any, "existing_rule") => Some("dict_like_view; or None"),
            (Self::Any, "existing_rules") => Some("dict_like_view"),
            (Self::Build, "existing_rule") => {
                Some("dict_like_view of build rule attributes; or None")
            }
            (Self::Build, "existing_rules") => Some("dict_like_view of build rule views"),
            _ => None,
        }
    }
}

/// The major and minor components reported by `bazel info release`.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct BazelVersion {
    major: u32,
    minor: u32,
}

impl BazelVersion {
    pub fn parse_release(release: &str) -> Option<Self> {
        let mut parts = release.strip_prefix("release ")?.split('.');
        Some(Self {
            major: parts.next()?.parse().ok()?,
            minor: parts.next()?.parse().ok()?,
        })
    }

    pub fn at_least(self, major: u32, minor: u32) -> bool {
        (self.major, self.minor) >= (major, minor)
    }
}

/// Complete version-dependent API metadata using `bazel info release`.
pub fn apply_versioned_signatures(builtins: &mut Builtins, release: &str) {
    let Some(BazelVersion { major, minor }) = BazelVersion::parse_release(release) else {
        return;
    };
    let version = (major, minor);
    if version >= (8, 0) {
        // Bazel 8 removed the option to return mutable dictionaries.
        // https://github.com/bazelbuild/bazel/commit/0fa8f9f39542a093ebc6819642b58dce643c7af3
        // Bazel 9 removed repository-rule packages, so queries can only
        // reflect build rules.
        // https://github.com/bazelbuild/bazel/commit/e812374c01f6f1795e61818cd027973a03bfb7db
        let scope = if version >= (9, 0) {
            ExistingRuleScope::Build
        } else {
            ExistingRuleScope::Any
        };
        for value in builtins.global.iter_mut().chain(
            builtins
                .r#type
                .iter_mut()
                .filter(|class| class.name == "native")
                .flat_map(|class| &mut class.field),
        ) {
            let Some(result) = scope.return_type(&value.name) else {
                continue;
            };
            let Some(callable) = &mut value.callable else {
                continue;
            };
            if normalize_doc(&callable.return_type, true).eq_ignore_ascii_case("unknown") {
                callable.return_type = result.to_owned();
            }
        }
    }
    if let Some(platform_type) = builtins
        .r#type
        .iter_mut()
        .find(|class| class.name == "apple_common")
        .and_then(|class| {
            class.field.iter_mut().find(|field| {
                field.name == "platform_type" && normalize_doc(&field.r#type, true) == "struct"
            })
        })
    {
        // Bazel 8 moved these enum values to string constants in apple_platform.bzl.
        // https://github.com/bazelbuild/bazel/blob/8.0.0/src/main/starlark/builtins_bzl/common/objc/apple_platform.bzl
        platform_type.r#type = "_ApplePlatformTypes".to_owned();
        let value_type = if version >= (8, 0) {
            "string"
        } else {
            "apple_platform_type"
        };
        if version < (8, 0) && !builtins.r#type.iter().any(|class| class.name == value_type) {
            builtins.r#type.push(Type {
                name: value_type.to_owned(),
                ..Default::default()
            });
        }
        if !builtins
            .r#type
            .iter()
            .any(|class| class.name == "_ApplePlatformTypes")
        {
            builtins.r#type.push(Type {
                name: "_ApplePlatformTypes".to_owned(),
                field: ["ios", "visionos", "watchos", "tvos", "macos", "catalyst"]
                    .into_iter()
                    .map(|name| Value {
                        name: name.to_owned(),
                        r#type: value_type.to_owned(),
                        ..Default::default()
                    })
                    .collect(),
                ..Default::default()
            });
        }
    }
    // Provider requirements accepted legacy string names until Bazel 9.
    // Keep precise supplied metadata; only complete the inventory's bare sequences.
    // https://github.com/bazelbuild/bazel/commit/8fe29f07c58a74135aee4c9810929142eb91c6af
    let refine_provider_requirements = |parameter: &mut Param, nested: bool| {
        if !matches!(
            normalize_doc(&parameter.r#type, true).as_str(),
            "sequence" | "Sequence" | "list" | "List"
        ) {
            return;
        }
        parameter.r#type = match (version < (9, 0), nested) {
            (false, false) => "sequence of ProviderKeys",
            (false, true) => "sequence of ProviderKeys; or sequence of sequences of ProviderKeys",
            (true, false) => "sequence of ProviderKeys or strings",
            (true, true) => "sequence of ProviderKeys or strings; or sequence of sequences of ProviderKeys or strings",
        }
        .to_owned();
    };
    for value in &mut builtins.global {
        if !matches!(value.name.as_str(), "rule" | "aspect") {
            continue;
        }
        let Some(callable) = &mut value.callable else {
            continue;
        };
        for parameter in &mut callable.param {
            if parameter.name == "provides" {
                refine_provider_requirements(parameter, false);
            } else if value.name == "aspect"
                && matches!(
                    parameter.name.as_str(),
                    "required_providers" | "required_aspect_providers"
                )
            {
                refine_provider_requirements(parameter, true);
            }
        }
    }
    for class in &mut builtins.r#type {
        if class.name == "actions" && version >= (9, 0) {
            complete_action_write_parameters(class, version);
            continue;
        }
        if matches!(class.name.as_str(), "repository_ctx" | "module_ctx") {
            refine_execute_environment(class, version >= (8, 0));
            continue;
        }
        if class.name == "cpp" && version >= (8, 0) {
            add_cpp_fdo_methods(class);
            continue;
        }
        if class.name != "attr" {
            continue;
        }
        if version >= (9, 0) {
            if let Some(value) = label_list_dict(&class.field) {
                class.field.push(value);
            }
        }
        for value in &mut class.field {
            let Some(callable) = &mut value.callable else {
                continue;
            };
            for parameter in &mut callable.param {
                if parameter.name == "providers" {
                    refine_provider_requirements(parameter, true);
                }
            }
        }
    }
    if version < (9, 3) {
        return;
    }

    // Bazel 9.3 accepts the callback's numeric dictionary directly as well.
    // Preserve the rest of the inventory, including newer supplied signatures.
    for class in &mut builtins.r#type {
        if class.name != "actions" {
            continue;
        }
        for method in &mut class.field {
            if !matches!(method.name.as_str(), "run" | "run_shell" | "map_directory") {
                continue;
            }
            let Some(callable) = &mut method.callable else {
                continue;
            };
            for parameter in &mut callable.param {
                if parameter.name == "resource_set"
                    && !normalize_doc(&parameter.r#type, true)
                        .split("; or ")
                        .any(|member| member == "dict")
                {
                    parameter.r#type.push_str("; or dict");
                }
            }
        }
    }
}

fn complete_action_write_parameters(class: &mut Type, version: (u32, u32)) {
    let Some(callable) = class
        .field
        .iter_mut()
        .find(|field| field.name == "write")
        .and_then(|field| field.callable.as_mut())
    else {
        return;
    };
    // https://github.com/bazelbuild/bazel/commit/34673f3371229fe310b433cf6ade353b9610f9fb
    // https://github.com/bazelbuild/bazel/commit/2e4abf8b2252512947298300a03750574f050ce6
    for (name, parameter_type, introduced) in [
        ("mnemonic", "string; or None", (9, 0)),
        ("execution_requirements", "dict; or None", (9, 1)),
    ] {
        if version >= introduced
            && !callable
                .param
                .iter()
                .any(|parameter| parameter.name == name)
        {
            callable.param.push(Param {
                name: name.to_owned(),
                r#type: parameter_type.to_owned(),
                default_value: "None".to_owned(),
                ..Default::default()
            });
        }
    }
    if let Some(index) = callable.param.iter().position(|parameter| {
        matches!(
            parameter.name.as_str(),
            "mnemonic" | "execution_requirements"
        )
    }) {
        if !callable.param[..index]
            .iter()
            .any(|parameter| parameter.is_star_arg)
        {
            callable.param.insert(
                index,
                Param {
                    is_star_arg: true,
                    ..Default::default()
                },
            );
        }
    }
}

fn add_cpp_fdo_methods(class: &mut Type) {
    // Bazel 8 moved FDO analysis into allowlisted Starlark. These undocumented
    // methods are omitted from the exported inventory; Bazel still enforces
    // its C++ Starlarkification allowlist when they are called.
    // https://github.com/bazelbuild/bazel/blob/8.0.0/src/main/java/com/google/devtools/build/lib/rules/cpp/CppConfiguration.java
    for (name, return_type) in [
        ("compilation_mode", "string"),
        ("fdo_path", "string; or None"),
        ("cs_fdo_path", "string; or None"),
        ("propeller_optimize_absolute_cc_profile", "string; or None"),
        ("propeller_optimize_absolute_ld_profile", "string; or None"),
        ("proto_profile", "bool"),
    ] {
        if class.field.iter().any(|field| field.name == name) {
            continue;
        }
        class.field.push(Value {
            name: name.to_owned(),
            doc: "Private Bazel API restricted by the C++ Starlarkification allowlist.".to_owned(),
            callable: Some(Callable {
                return_type: return_type.to_owned(),
                ..Default::default()
            }),
            ..Default::default()
        });
    }
}

fn refine_execute_environment(class: &mut Type, nullable_values: bool) {
    let Some(environment) = class
        .field
        .iter_mut()
        .find(|method| method.name == "execute")
        .and_then(|method| method.callable.as_mut())
        .and_then(|callable| {
            callable
                .param
                .iter_mut()
                .find(|parameter| parameter.name == "environment")
        })
    else {
        return;
    };
    if !matches!(
        normalize_doc(&environment.r#type, true).as_str(),
        "dict" | "Dict" | "Dictionary"
    ) {
        return;
    }
    // Bazel 8 permits None values to remove inherited variables.
    // https://github.com/bazelbuild/bazel/commit/ad0ef02eb05842a5fc48871f4a90bce6e8d1bfc7
    environment.r#type = if nullable_values {
        "Dictionary: string -> string or None"
    } else {
        "Dictionary: string -> string"
    }
    .to_owned();
}

/// Bazel 9 added a dictionary-valued dependency attribute. Its parameters
/// match `label_list` except for `default` and `materializer`.
/// https://github.com/bazelbuild/bazel/blob/9.0.0/src/main/java/com/google/devtools/build/lib/starlarkbuildapi/StarlarkAttrModuleApi.java
fn label_list_dict(fields: &[Value]) -> Option<Value> {
    if fields.iter().any(|field| field.name == "label_list_dict") {
        return None;
    }
    let mut value = fields
        .iter()
        .find(|field| field.name == "label_list")?
        .clone();
    let callable = value.callable.as_mut()?;
    let default = callable
        .param
        .iter_mut()
        .find(|param| param.name == "default")?;
    default.r#type = "dict".to_owned();
    default.default_value = "{}".to_owned();
    default.doc = "Default value of the attribute.".to_owned();
    callable.param.retain(|param| {
        matches!(
            param.name.as_str(),
            "allow_empty"
                | "configurable"
                | "default"
                | "doc"
                | "allow_files"
                | "allow_rules"
                | "providers"
                | "for_dependency_resolution"
                | "flags"
                | "mandatory"
                | "skip_validations"
                | "cfg"
                | "aspects"
        )
    });
    value.name = "label_list_dict".to_owned();
    value.doc =
        "Creates a dependency attribute holding a dictionary from strings to lists of labels."
            .to_owned();
    Some(value)
}

#[derive(Debug, Serialize, Deserialize)]
struct BuiltinsJson {
    builtins: Vec<ValueJson>,
}

impl From<BuiltinsJson> for Builtins {
    fn from(value: BuiltinsJson) -> Self {
        Self {
            global: value
                .builtins
                .into_iter()
                .map(|value| value.into())
                .collect(),
            ..Default::default()
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct ValueJson {
    name: String,
    #[serde(default)]
    r#type: String,
    doc: String,
    callable: Option<CallableJson>,
}

impl From<ValueJson> for Value {
    fn from(val: ValueJson) -> Self {
        let ValueJson {
            name,
            r#type,
            doc,
            callable,
        } = val;
        Value {
            name,
            r#type,
            doc,
            callable: callable.map(|callable| Callable {
                param: callable
                    .params
                    .into_iter()
                    .map(|param| Param {
                        name: param.name,
                        r#type: param.r#type,
                        doc: param.doc,
                        default_value: param.default_value,
                        is_mandatory: param.is_mandatory,
                        is_star_arg: param.is_star_arg,
                        is_star_star_arg: param.is_star_star_arg,
                    })
                    .collect(),
                return_type: callable.return_type,
            }),
            ..Default::default()
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct CallableJson {
    params: Vec<ParamJson>,
    return_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ParamJson {
    name: String,
    r#type: String,
    doc: String,
    default_value: String,
    is_mandatory: bool,
    is_star_arg: bool,
    is_star_star_arg: bool,
}

/// The builtin.pb file is missing `module_extension`, `repository_rule` and `tag_class`.
pub fn make_bzl_builtins() -> Builtins {
    serde_json::from_str::<BuiltinsJson>(include_str!("../data/bzl.builtins.json"))
        .expect("bug: invalid bzl.builtins.json")
        .into()
}

pub fn make_build_builtins() -> Builtins {
    serde_json::from_str::<BuiltinsJson>(include_str!("../data/build.builtins.json"))
        .expect("bug: invalid build.builtins.json")
        .into()
}

pub fn make_module_bazel_builtins() -> Builtins {
    serde_json::from_str::<BuiltinsJson>(include_str!("../data/module-bazel.builtins.json"))
        .expect("bug: invalid module-bazel.builtins.json")
        .into()
}

pub fn make_workspace_builtins() -> Builtins {
    serde_json::from_str::<BuiltinsJson>(include_str!("../data/workspace.builtins.json"))
        .expect("bug: invalid workspace.builtins.json")
        .into()
}

pub fn make_repo_builtins() -> Builtins {
    serde_json::from_str::<BuiltinsJson>(include_str!("../data/repo.builtins.json"))
        .expect("bug: invalid repo.builtins.json")
        .into()
}

pub fn make_cquery_builtins() -> Builtins {
    serde_json::from_str::<BuiltinsJson>(include_str!("../data/cquery.builtins.json"))
        .expect("bug: invalid cquery.builtins.json")
        .into()
}

pub fn make_vendor_builtins() -> Builtins {
    serde_json::from_str::<BuiltinsJson>(include_str!("../data/vendor.builtins.json"))
        .expect("bug: invalid vendor.builtins.json")
        .into()
}

pub fn make_missing_module_members() -> HashMap<String, Vec<Value>> {
    serde_json::from_str::<HashMap<String, Vec<ValueJson>>>(include_str!(
        "../data/missingModuleFields.json"
    ))
    .expect("bug: invalid missingModuleFields.json")
    .into_iter()
    .map(|(name, fields)| (name, fields.into_iter().map(|field| field.into()).collect()))
    .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cpp_fdo_methods_follow_bazel_release() {
        let supplied = Value {
            name: "compilation_mode".to_owned(),
            callable: Some(Callable {
                return_type: "supplied type".to_owned(),
                ..Default::default()
            }),
            ..Default::default()
        };
        let original = Builtins {
            r#type: vec![Type {
                name: "cpp".to_owned(),
                field: vec![supplied.clone()],
                ..Default::default()
            }],
            ..Default::default()
        };
        for release in ["development version", "release 7.4.0"] {
            let mut builtins = original.clone();
            apply_versioned_signatures(&mut builtins, release);
            assert_eq!(builtins, original);
        }
        let mut builtins = original;
        apply_versioned_signatures(&mut builtins, "release 8.0.0");
        let fields = &builtins.r#type[0].field;
        assert_eq!(fields.len(), 6);
        assert_eq!(fields[0], supplied);
        assert_eq!(
            fields[1].callable.as_ref().unwrap().return_type,
            "string; or None"
        );
        assert_eq!(fields[5].callable.as_ref().unwrap().return_type, "bool");
        let once = builtins.clone();
        apply_versioned_signatures(&mut builtins, "release 9.0.0");
        assert_eq!(builtins, once);
    }

    #[test]
    fn platform_types_follow_bazel_release() {
        let original = Builtins {
            r#type: vec![Type {
                name: "apple_common".to_owned(),
                field: vec![Value {
                    name: "platform_type".to_owned(),
                    r#type: "struct".to_owned(),
                    ..Default::default()
                }],
                ..Default::default()
            }],
            ..Default::default()
        };
        for (release, expected) in [
            ("development version", None),
            ("release 7.6.0", Some("apple_platform_type")),
            ("release 8.0.0", Some("string")),
            ("release 9.3.0", Some("string")),
        ] {
            let mut builtins = original.clone();
            apply_versioned_signatures(&mut builtins, release);
            if let Some(expected) = expected {
                let namespace = builtins
                    .r#type
                    .iter()
                    .find(|class| class.name == "_ApplePlatformTypes")
                    .unwrap();
                assert_eq!(namespace.field.len(), 6);
                assert!(namespace.field.iter().all(|field| field.r#type == expected));
            } else {
                assert_eq!(builtins, original);
            }
            let once = builtins.clone();
            apply_versioned_signatures(&mut builtins, release);
            assert_eq!(builtins, once);
        }
        let mut supplied = original;
        supplied.r#type[0].field[0].r#type = "KnownPlatformTypes".to_owned();
        let unchanged = supplied.clone();
        apply_versioned_signatures(&mut supplied, "release 9.2.0");
        assert_eq!(supplied, unchanged);
    }

    #[test]
    fn provider_requirements_follow_bazel_release() {
        let callable = |name: &str, parameters: &[&str]| Value {
            name: name.to_owned(),
            callable: Some(Callable {
                param: parameters
                    .iter()
                    .map(|name| Param {
                        name: (*name).to_owned(),
                        r#type: "sequence".to_owned(),
                        ..Default::default()
                    })
                    .collect(),
                ..Default::default()
            }),
            ..Default::default()
        };
        let original = Builtins {
            global: vec![
                callable("rule", &["provides", "unrelated"]),
                callable(
                    "aspect",
                    &[
                        "provides",
                        "required_providers",
                        "required_aspect_providers",
                    ],
                ),
                callable("unrelated", &["provides"]),
            ],
            r#type: vec![Type {
                name: "attr".to_owned(),
                field: vec![callable("label", &["providers", "unrelated"])],
                ..Default::default()
            }],
        };
        for (release, flat, nested) in [
            ("development version", "sequence", "sequence"),
            ("release 8.6.0", "sequence of ProviderKeys or strings", "sequence of ProviderKeys or strings; or sequence of sequences of ProviderKeys or strings"),
            ("release 9.0.0", "sequence of ProviderKeys", "sequence of ProviderKeys; or sequence of sequences of ProviderKeys"),
            ("release 10.0.0", "sequence of ProviderKeys", "sequence of ProviderKeys; or sequence of sequences of ProviderKeys"),
        ] {
            let mut builtins = original.clone();
            apply_versioned_signatures(&mut builtins, release);
            let rule = builtins.global[0].callable.as_ref().unwrap();
            assert_eq!(rule.param[0].r#type, flat, "{release}");
            assert_eq!(rule.param[1].r#type, "sequence");
            let aspect = builtins.global[1].callable.as_ref().unwrap();
            assert_eq!(aspect.param[0].r#type, flat, "{release}");
            assert_eq!(aspect.param[1].r#type, nested, "{release}");
            assert_eq!(aspect.param[2].r#type, nested, "{release}");
            let label = builtins.r#type[0].field[0].callable.as_ref().unwrap();
            assert_eq!(label.param[0].r#type, nested, "{release}");
            assert_eq!(label.param[1].r#type, "sequence");
            assert_eq!(builtins.global[2], original.global[2]);
            let once = builtins.clone();
            apply_versioned_signatures(&mut builtins, release);
            assert_eq!(builtins, once);
            apply_versioned_signatures(&mut builtins, "development version");
            assert_eq!(builtins, once);
        }
        let mut supplied = original;
        supplied.global[0].callable.as_mut().unwrap().param[0].r#type =
            "sequence of ProviderKeys".to_owned();
        apply_versioned_signatures(&mut supplied, "release 8.6.0");
        assert_eq!(
            supplied.global[0].callable.as_ref().unwrap().param[0].r#type,
            "sequence of ProviderKeys"
        );
        apply_versioned_signatures(&mut Builtins::default(), "release 9.0.0");
    }

    #[test]
    fn resource_set_signatures_follow_bazel_release() {
        let old_type = "<a href=\"callable.html\">callable</a>; or None";
        let original = Builtins {
            r#type: vec![crate::builtin::Type {
                name: "actions".to_owned(),
                field: ["run", "run_shell", "map_directory", "unrelated"]
                    .into_iter()
                    .map(|name| Value {
                        name: name.to_owned(),
                        callable: Some(Callable {
                            param: vec![Param {
                                name: "resource_set".to_owned(),
                                r#type: old_type.to_owned(),
                                ..Default::default()
                            }],
                            ..Default::default()
                        }),
                        ..Default::default()
                    })
                    .collect(),
                ..Default::default()
            }],
            ..Default::default()
        };
        for (release, dictionary) in [
            ("", false),
            ("development version", false),
            ("release 9", false),
            ("release 9.2.9", false),
            ("release 9.3.0", true),
            ("release 9.3.0rc1", true),
            ("release 9.10.0", true),
            ("release 10.0.0", true),
        ] {
            let mut builtins = original.clone();
            apply_versioned_signatures(&mut builtins, release);
            for method in &builtins.r#type[0].field {
                let expected = if dictionary && method.name != "unrelated" {
                    format!("{old_type}; or dict")
                } else {
                    old_type.to_owned()
                };
                assert_eq!(
                    method.callable.as_ref().unwrap().param[0].r#type,
                    expected,
                    "{release}: {}",
                    method.name
                );
            }
            let once = builtins.clone();
            apply_versioned_signatures(&mut builtins, release);
            assert_eq!(builtins, once, "{release}: refinement must be idempotent");
            apply_versioned_signatures(&mut builtins, "development version");
            assert_eq!(
                builtins, once,
                "unknown releases preserve supplied metadata"
            );
        }
    }
}
