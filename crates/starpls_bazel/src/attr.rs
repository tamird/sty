use serde::Deserialize;
use serde::Serialize;

use crate::build::attribute::Discriminator;
use crate::build::BuildLanguage;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CommonAttributes {
    pub build: Vec<Attribute>,
    pub test: Vec<Attribute>,
    pub binary: Vec<Attribute>,
    pub repository: Vec<Attribute>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum AttributeKind {
    #[serde(rename = "boolean")]
    Bool,
    #[serde(rename = "int")]
    Int,
    #[serde(rename = "List of ints")]
    IntList,
    #[serde(rename = "Label")]
    Label,
    // TODO(withered-magic): Add a `rename`.
    LabelKeyedStringDict,
    #[serde(rename = "List of Labels")]
    LabelList,
    NodepLabelList,
    // TODO(withered-magic): Add a `rename`.
    Output,
    #[serde(rename = "List of Outputs")]
    OutputList,
    #[serde(rename = "string")]
    String,
    #[serde(rename = "List of strings")]
    StringList,
    #[serde(rename = "Dictionary of strings")]
    StringDict,
    // TODO(withered-magic): Add a `rename`.
    StringKeyedLabelDict,
    StringKeyedLabelListDict,
    // TODO(withered-magic): Add a `rename`.
    StringListDict,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Attribute {
    pub name: String,
    pub r#type: AttributeKind,
    pub doc: String,
    pub default_value: String,
    pub is_mandatory: bool,
    pub configurable: bool,
}

/// Complete the stable Starlark rule base using the discovered native inventory.
/// Missing evidence (including a partial inventory) retains the older base.
pub fn make_common_attributes(rules: &BuildLanguage) -> CommonAttributes {
    let mut common: CommonAttributes =
        serde_json::from_str(include_str!("../data/commonAttributes.json"))
            .expect("bug: invalid commonAttributes.json");
    for (name, discriminator, kind) in [
        (
            "package_metadata",
            Discriminator::LabelList,
            AttributeKind::LabelList,
        ),
        (
            "exec_group_compatible_with",
            Discriminator::LabelListDict,
            AttributeKind::StringKeyedLabelListDict,
        ),
    ] {
        let Some(attribute) =
            rules
                .rule
                .iter()
                .flat_map(|rule| &rule.attribute)
                .find(|attribute| {
                    attribute.name == name
                        && attribute.r#type() == discriminator
                        && attribute.configurable == Some(false)
                        && !attribute.mandatory()
                })
        else {
            continue;
        };
        if name == "package_metadata" {
            common
                .build
                .retain(|attribute| attribute.name != "applicable_licenses");
        }
        common.build.push(Attribute {
            name: name.to_owned(),
            r#type: kind,
            doc: attribute.documentation().to_owned(),
            default_value: if name == "package_metadata" {
                "[]"
            } else {
                "{}"
            }
            .to_owned(),
            is_mandatory: false,
            configurable: false,
        });
    }
    common
}

/// Accepted input spelling, distinct from the canonical analyzed attribute.
pub fn input_alias(name: &str) -> Option<&'static str> {
    (name == "package_metadata").then_some("applicable_licenses")
}

pub fn is_undocumented(name: &str) -> bool {
    matches!(
        name,
        "generator_name" | "generator_function" | "generator_location"
    )
}

pub fn visible_in_rule_context(name: &str) -> bool {
    !matches!(name, "aspect_hints" | "exec_group_compatible_with")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::build::AttributeDefinition;
    use crate::build::RuleDefinition;

    #[test]
    fn common_rule_attributes_follow_discovered_features() {
        let legacy = make_common_attributes(&BuildLanguage::default());
        assert!(legacy
            .build
            .iter()
            .any(|attribute| attribute.name == "applicable_licenses"));
        assert!(!legacy
            .build
            .iter()
            .any(|attribute| attribute.name == "distribs"));
        assert!(legacy
            .binary
            .iter()
            .any(|attribute| attribute.name == "output_licenses"));
        assert!(!legacy
            .test
            .iter()
            .any(|attribute| attribute.name == "output_licenses"));
        let mut rules = BuildLanguage {
            rule: vec![RuleDefinition {
                name: "genrule".to_owned(),
                attribute: [
                    ("package_metadata", Discriminator::LabelList),
                    ("exec_group_compatible_with", Discriminator::LabelListDict),
                ]
                .into_iter()
                .map(|(name, kind)| AttributeDefinition {
                    name: name.to_owned(),
                    r#type: kind as i32,
                    configurable: Some(false),
                    documentation: Some(format!("Host documentation for {name}")),
                    ..Default::default()
                })
                .collect(),
                ..Default::default()
            }],
        };
        let current = make_common_attributes(&rules);
        assert!(!current
            .build
            .iter()
            .any(|attribute| attribute.name == "applicable_licenses"));
        for name in ["package_metadata", "exec_group_compatible_with"] {
            let attribute = current
                .build
                .iter()
                .find(|attribute| attribute.name == name)
                .unwrap();
            assert!(!attribute.configurable);
            assert!(!attribute.is_mandatory);
            assert_eq!(attribute.doc, format!("Host documentation for {name}"));
        }
        // A same-named custom or incomplete native field is not feature evidence.
        rules.rule[0].attribute[0].r#type = Discriminator::String as i32;
        rules.rule[0].attribute[1].configurable = None;
        let incomplete = make_common_attributes(&rules);
        assert!(!incomplete.build.iter().any(|attribute| matches!(
            attribute.name.as_str(),
            "package_metadata" | "exec_group_compatible_with"
        )));
    }
}
