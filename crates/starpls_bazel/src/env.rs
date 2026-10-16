use std::collections::HashMap;

use serde::Deserialize;
use serde::Serialize;

use crate::builtin::Callable;
use crate::builtin::Param;
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

/// Apply API additions that postdate the bundled inventory, using `bazel info release`.
pub fn apply_versioned_signatures(builtins: &mut Builtins, release: &str) {
    let version = release.strip_prefix("release ").and_then(|version| {
        let mut parts = version.split('.');
        Some((
            parts.next()?.parse::<u32>().ok()?,
            parts.next()?.parse::<u32>().ok()?,
        ))
    });
    if !version.is_some_and(|version| version >= (9, 3)) {
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
