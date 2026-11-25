export { ruffForkAudit } from './ruff-fork-audit.mjs';
import { solverInventory } from './solver-inventory.mjs';
export { solverInventory };
import { ruffForwardAudit } from './ruff-forward-audit.mjs';
export { ruffForwardAudit };

// Curation time; collecting provider observations does not advance it.
export const reviewedAt = '2026-11-25T20:47:19+00:00';

export const projects = [
 {name:"Bazel Skylib",nextAction:"Prepare the qualified contribution for maintainer review.",repo:"bazelbuild/bazel-skylib",number:641,head:"0d67032913356f4e43f700a5e04b1efa20af96ae",draft:true,summary:"Helper, collection, partial, provider and rule contracts.",checks:"RBE 14d05b98: 88 root files and five Gazelle files pass with zero errors (two root warnings).",followup:"The qualified Sty 14d05b98 workflow update is published. GitHub CI and review observations are recorded separately below.",dependencies:[['Skylib #643','https://github.com/bazelbuild/bazel-skylib/pull/643'],['Skylib #647','https://github.com/bazelbuild/bazel-skylib/pull/647'],['Skylib #644','https://github.com/bazelbuild/bazel-skylib/pull/644']],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/8ff7faa8-2b15-4412-88dd-3bcdd71ec282"}, {"label": "Published workflow update", "url": "https://github.com/tamird/bazel-skylib/commit/0d67032913356f4e43f700a5e04b1efa20af96ae"}]},
 {name:"rules_cc",nextAction:"Reduce the remaining advisory diagnostics.",repo:"bazelbuild/rules_cc",number:940,head:"370815600228a45d71ee2509222ad24b298a45cb",draft:true,summary:"C++ toolchain providers, helper constructors and macro contracts.",checks:"RBE 14d05b98: 134 strict files pass. All 286 advisory files complete with 37,502 errors.",followup:"The qualified Sty 14d05b98 workflow update is published. GitHub CI and review observations are recorded separately below.",dependencies:[['rules_cc #960','https://github.com/bazelbuild/rules_cc/pull/960'],['rules_cc #967','https://github.com/bazelbuild/rules_cc/pull/967']],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/520974a9-09ce-4123-82a6-2f0fc1666564"}, {"label": "Published workflow update", "url": "https://github.com/tamird/rules_cc/commit/370815600228a45d71ee2509222ad24b298a45cb"}]},
 {name:"hermetic-llvm",nextAction:"Resolve the 31 example and 26 proposed-type errors.",repo:"hermeticbuild/hermetic-llvm",number:835,head:"cfe15581d127f92e1bcd5582c6b62497217915cd",draft:true,summary:"LLVM helper, selector and callback contracts compatible with older Bazel releases.",checks:"RBE 14d05b98: 70 released-root files pass; the rules_cc example retains 31 errors. Proposed-types checking retains 26 errors in 64 root files. Advisory checks, native tests and formatter complete.",followup:"The local rebase preserves the new upstream header-module implementation and the existing type contracts. All five header-module tests pass.",dependencies:[['Skylib #641','https://github.com/bazelbuild/bazel-skylib/pull/641'],['rules_cc #940','https://github.com/bazelbuild/rules_cc/pull/940']],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/dd978d27-6ff9-436d-8925-6e9e5afc8737"}, {"label": "Published workflow update", "url": "https://github.com/tamird/hermetic-llvm/commit/cfe15581d127f92e1bcd5582c6b62497217915cd"}, {"label": "Rebased header-module tests", "url": "https://app.buildbuddy.io/invocation/562b4a75-882e-4961-938d-d57d92880a76"}]},
 {name:"apple_support",nextAction:"Preserve LipoInfo through selected-toolchain lookup so strict checking accepts the lipo action.",repo:"bazelbuild/apple_support",number:668,head:"7173262d16db41fe32577f6add2d1826541e7768",draft:true,summary:"Xcode, lipo, Apple action, DMG and platform provider contracts.",checks:"RBE 14d05b98: All 46 strict files checked; two lipo toolchain-field errors remain. All 76 advisory files complete with 5,994 errors.",followup:"The qualified Sty 14d05b98 workflow update is published. GitHub CI and review observations are recorded separately below.",dependencies:[['Skylib #641','https://github.com/bazelbuild/bazel-skylib/pull/641'],['rules_cc #940','https://github.com/bazelbuild/rules_cc/pull/940']],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/842ad4c8-9294-49cf-af5d-a2f94fc894b1"}, {"label": "Published workflow update", "url": "https://github.com/tamird/apple_support/commit/7173262d16db41fe32577f6add2d1826541e7768"}]},
 {name:"with_cfg.bzl",nextAction:"Reduce the remaining advisory diagnostics.",repo:"fmeum/with_cfg.bzl",number:269,head:"7628aba59fc362d69d1106ac13bcadd6f64b9b1e",draft:true,summary:"Settings, selectors, frontend rules, argument rewriting and provider contracts.",checks:"RBE 14d05b98: 20 root and two example files pass with zero diagnostics. All five native suites pass in fast and optimized configurations.",followup:"The qualified Sty 14d05b98 workflow update is published. GitHub CI and review observations are recorded separately below.",dependencies:[],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/e508d5a7-d78e-4f07-9226-106a535011a7"}, {"label": "Published workflow update", "url": "https://github.com/tamird/with_cfg.bzl/commit/7628aba59fc362d69d1106ac13bcadd6f64b9b1e"}]},
 {name:"rules_runfiles_group",nextAction:"Reduce the remaining advisory diagnostics.",repo:"bazel-contrib/rules_runfiles_group",number:23,head:"b0f9531391d6683b7a1c0fbc66f16e0b9bfdde88",draft:true,summary:"Provider fields and generic handle types shared by materialize, transform and merge callbacks.",checks:"RBE 14d05b98: 32 root and 37 example files pass; advisory checks retain 646 and 344 errors.",followup:"The qualified Sty 14d05b98 workflow update is published. GitHub CI and review observations are recorded separately below.",dependencies:[],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/3f3eb196-021a-4da7-b375-92bc34aea1da"}, {"label": "Published workflow update", "url": "https://github.com/tamird/rules_runfiles_group/commit/b0f9531391d6683b7a1c0fbc66f16e0b9bfdde88"}]},
 {name:"rules_rs",nextAction:"Keep inherited formatter debt separate from typing qualification.",repo:"hermeticbuild/rules_rs",number:306,head:"9e40f59c20b79e50f163a465f8da5e7001be8cd6",draft:true,summary:"Crate selection, generated Cargo workspaces, repository generation and Rust toolchain contracts.",checks:"RBE 14d05b98: 36 root and four fixture files pass; both Cargo tests pass. Formatter exit 1 retains exactly 148 inherited warnings and no formatting differences.",followup:"The qualified Sty 14d05b98 workflow update is published. GitHub CI and review observations are recorded separately below.",dependencies:[],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/e50f7cbe-1644-47a6-ab44-9586d1b518c7"}, {"label": "Published workflow update", "url": "https://github.com/tamird/rules_rs/commit/9e40f59c20b79e50f163a465f8da5e7001be8cd6"}]},
 {name:"bazel_features",nextAction:"Reduce the remaining root and BCR advisory diagnostics.",repo:"bazel-contrib/bazel_features",number:158,head:"bd893b715c1f28e9533ad9630d22187adc2d5cd6",draft:false,summary:"Feature compatibility declarations checked against implementations.",checks:"RBE 14d05b98: Eleven strict files and native tests pass. Advisory root and BCR checks retain 64 and 22 errors.",followup:"The qualified Sty 14d05b98 workflow update is published. Both current GitHub Actions runs report action_required with zero jobs. Verification used an account with read-only access to the base repository; the API gives no exact policy reason.",dependencies:[],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/fd8a4ebc-dc39-486a-bd33-a252767c94eb"}, {"label": "Published workflow update", "url": "https://github.com/tamird/bazel_features/commit/bd893b715c1f28e9533ad9630d22187adc2d5cd6"}, {"label": "CI: action_required on published head", "url": "https://github.com/bazel-contrib/bazel_features/actions/runs/44955959050"}, {"label": "Starlark types: action_required on published head", "url": "https://github.com/bazel-contrib/bazel_features/actions/runs/44955959049"}]}
];

export const goals = [
  {
    "id": "checker",
    "title": "Build an excellent Bazel Starlark checker",
    "detail": "Use ty for inference and incrementality; qualify real implementations and intentionally incorrect callers."
  },
  {
    "id": "bazel",
    "title": "Improve upstream Bazel type checking",
    "detail": "Reduce discovered gaps to reproducible examples, distinguish host behavior from checker behavior, and prepare evidence-backed feedback."
  },
  {
    "id": "ty",
    "title": "Return general improvements to ty",
    "detail": "Adapt isolated improvements to Python semantics and upstream architecture. Track merged work and avoid duplicating contributions already in review."
  },
  {
    "id": "community",
    "title": "Give community projects complete support",
    "detail": "Prioritize prominent projects with engaged maintainers, especially active #hermeticbuild participants. Keep supported Bazel versions, source annotations, stubs, real callers, and CI consistent."
  },
  {
    "id": "hosts",
    "title": "Make the work reusable by other Starlark hosts",
    "detail": "Keep general inference and Starlark language behavior separate from Bazel APIs and repository discovery. Investigate Buck2 as another host; support is not yet established."
  }
];

export const upstream = [
  {
    "id": "intersection-attribute-presence",
    "ref": "review/intersection-attribute-presence-20261125",
    "title": "[ty] Check presence across intersection members",
    "state": "Awaiting Tamir review",
    "source": "ee0917acc7b83cc5a24f685a9bdef94043f0080a",
    "summary": "A required intersection member can establish attribute presence while the assignment still checks whether the member accepts the value.",
    "qualifiedBase": "aacccdff29525ed04398d400f4444a478f15d6aa",
    "qualifiedHead": "ee0917acc7b83cc5a24f685a9bdef94043f0080a",
    "qualifiedCommitCount": 1,
    "qualifiedURL": "https://github.com/tamird/ruff/commit/ee0917acc7b83cc5a24f685a9bdef94043f0080a",
    "qualification": {
      "summary": "The updated existing assertion fails on upstream and passes with the candidate. All 532 mdtests, native suites, formatting, strict Clippy and hooks pass. The patch removes the old TODO and expected error rather than adding a test fixture.",
      "evidence": [
        {
          "label": "Qualified two-file change",
          "url": "https://github.com/tamird/ruff/commit/ee0917acc7b83cc5a24f685a9bdef94043f0080a"
        },
        {
          "label": "Same-fixture negative control and all 532 mdtests",
          "url": "https://app.buildbuddy.io/invocation/3508273c-b6a7-4f48-a343-579688ca9c83"
        }
      ]
    }
  },
  {
    "id": "typeguard-expansion-targets",
    "ref": "review/typeguard-expansion-targets-20261125",
    "title": "[ty] Keep TypeGuard targets stable on expansion",
    "state": "Awaiting Tamir review",
    "source": "f082af91c9131f48c1189ae2c6572b007cce11ae",
    "summary": "Narrow an argument only when every successful expansion and matching overload identifies the same source expression.",
    "qualifiedBase": "aacccdff29525ed04398d400f4444a478f15d6aa",
    "qualifiedHead": "f082af91c9131f48c1189ae2c6572b007cce11ae",
    "qualifiedCommitCount": 1,
    "qualifiedURL": "https://github.com/tamird/ruff/commit/f082af91c9131f48c1189ae2c6572b007cce11ae",
    "qualification": {
      "summary": "Current upstream narrows an untested argument for one tuple-union order. The fix passes that case, the reversed and stable controls, all 532 mdtests, native suites, hooks, formatting and strict Clippy.",
      "evidence": [
        {
          "label": "Qualified three-file change",
          "url": "https://github.com/tamird/ruff/commit/f082af91c9131f48c1189ae2c6572b007cce11ae"
        },
        {
          "label": "Failing expansion-order control on upstream",
          "url": "https://app.buildbuddy.io/invocation/0b9c9d9c-14cb-49b7-b248-794dac3b3ba7"
        },
        {
          "label": "Passing regression, full Markdown, native and style checks",
          "url": "https://app.buildbuddy.io/invocation/244f4e63-c790-4675-adb7-73170385ccf4"
        }
      ]
    }
  },
  {
    "id": "vendored-archive-root",
    "ref": "review/vendored-root-20261125",
    "title": "List entries at the root of vendored archives",
    "state": "Awaiting Tamir review",
    "source": "7c83ee2994c4833edc7d0cda06c5a305d9b29aca",
    "summary": "Keep the prefix empty when listing the archive root so callers can discover top-level entries.",
    "qualifiedBase": "aacccdff29525ed04398d400f4444a478f15d6aa",
    "qualifiedHead": "7c83ee2994c4833edc7d0cda06c5a305d9b29aca",
    "qualifiedCommitCount": 1,
    "qualifiedURL": "https://github.com/tamird/ruff/commit/7c83ee2994c4833edc7d0cda06c5a305d9b29aca",
    "qualification": {
      "summary": "The root regression fails on current upstream and passes with the fix. Ruff DB has 140 passing tests and one ignored. Canonical hooks, formatting and strict Clippy pass.",
      "evidence": [
        {
          "label": "Qualified one-file root fix",
          "url": "https://github.com/tamird/ruff/commit/7c83ee2994c4833edc7d0cda06c5a305d9b29aca"
        },
        {
          "label": "Failing root-listing control on upstream",
          "url": "https://app.buildbuddy.io/invocation/ead0c18b-e9cc-4036-9745-b2502fb2aa34"
        },
        {
          "label": "Passing Ruff DB suite and style checks",
          "url": "https://app.buildbuddy.io/invocation/b6af58b2-db7e-4efe-8f5c-1a23ed8b94b7"
        },
        {
          "label": "Open archive rewrite touches the same method and retains the bug",
          "url": "https://github.com/astral-sh/ruff/pull/29829"
        }
      ]
    }
  },
  {
    "id": "typed-dict-get-key-groups",
    "ref": "review/typed-dict-get-groups-3f63e8b",
    "title": "[ty] Group equivalent TypedDict.get keys",
    "state": "Submitted",
    "source": "abaacc85856e55869b3a772b2e7e4ba509dfbbc2",
    "summary": "The approved amendment adds the literal-union overload filter and exercises the typed empty-dict default.",
    "qualifiedBase": "3f63e8b368924bb58875a7590e07f667805839a5",
    "qualifiedHead": "abaacc85856e55869b3a772b2e7e4ba509dfbbc2",
    "qualifiedCommitCount": 1,
    "qualifiedURL": "https://github.com/tamird/ruff/commit/abaacc85856e55869b3a772b2e7e4ba509dfbbc2",
    "qualification": {
      "summary": "All 532 default Markdown fixtures, native suites, formatting and strict Clippy pass on RBE. The many-group debug benchmark takes 627 ms versus 719 ms on the upstream parent.",
      "evidence": [
        {
          "label": "Published amendment",
          "url": "https://github.com/tamird/ruff/commit/abaacc85856e55869b3a772b2e7e4ba509dfbbc2"
        },
        {
          "label": "Amendment RBE qualification",
          "url": "https://app.buildbuddy.io/invocation/9e860df9-a2a4-4c9d-aa1d-ed07264d2d64"
        },
        {
          "label": "Many-group benchmark against upstream parent",
          "url": "https://app.buildbuddy.io/invocation/5d519f3d-7e1d-456d-9ba2-1769db46c593"
        },
        {
          "label": "Grouped-key performance and inference review",
          "url": "https://github.com/astral-sh/ruff/pull/30897#pullrequestreview-6044310559"
        },
        {
          "label": "Submitted Ruff PR #30897",
          "url": "https://github.com/astral-sh/ruff/pull/30897"
        },
        {
          "label": "Qualified standalone TypedDict.get grouping commit",
          "url": "https://github.com/tamird/ruff/commit/5d2628cbb2296f33d81828f6ce34a7140a36e5e4"
        },
        {
          "label": "Whole TypedDict, full Markdown and native/style qualification",
          "url": "https://app.buildbuddy.io/invocation/53e62ab8-5901-4039-b69b-650cbdef53e4"
        },
        {
          "label": "Current-base baseline: four intended type assertion failures",
          "url": "https://app.buildbuddy.io/invocation/dfff1183-c060-45f1-ae81-609bfa383ba2"
        },
        {
          "label": "Closed prior literal-call filtering proposal; distinct from signature grouping",
          "url": "https://github.com/astral-sh/ruff/pull/30109"
        },
        {
          "label": "Complementary AST-literal call filtering; does not group signatures or handle union-valued names",
          "url": "https://github.com/astral-sh/ruff/pull/30868"
        }
      ]
    },
    "number": 30897,
    "settledReviews": [
      {
        "kind": "proposal",
        "status": "approved",
        "head": "5d2628cbb2296f33d81828f6ce34a7140a36e5e4",
        "baseHead": "3f63e8b368924bb58875a7590e07f667805839a5",
        "url": "https://github.com/tamird/ruff/commit/5d2628cbb2296f33d81828f6ce34a7140a36e5e4",
        "title": "Review equivalent TypedDict.get key grouping",
        "summary": "Tamir approved exact 5d2628cbb for upstream submission; it is submitted as Ruff #30897.",
        "body": "Calls with a union of known keys could match the broad string fallback before argument expansion, losing their field types. With required `first: int` and `second: int` fields, `data.get(key)` should return `int` for `key: Literal[\"first\", \"second\"]`.\n\nThis change groups keys with the same declared value type and requiredness into an exact literal-key overload. Optional groups retain `None` or the supplied default; unions spanning different groups keep their existing fallback behavior.\n\nFour current-base type assertions fail before the change and pass afterward. The whole TypedDict fixture, all 532 default Markdown fixtures, core 86, semantic 539 (35 ignored), IDE 1964, canonical hooks, formatting and strict Clippy pass. No performance claim or network-enabled qualification is made. [Qualification](https://app.buildbuddy.io/invocation/53e62ab8-5901-4039-b69b-650cbdef53e4).\n\n[Read the complete proposed commit](https://github.com/tamird/ruff/commit/5d2628cbb2296f33d81828f6ce34a7140a36e5e4). Tamir approval is required before upstream submission.",
        "outcome": "approved"
      },
      {
        "kind": "amendment",
        "status": "approved",
        "head": "abaacc85856e55869b3a772b2e7e4ba509dfbbc2",
        "baseHead": "5d2628cbb2296f33d81828f6ce34a7140a36e5e4",
        "url": "https://github.com/tamird/ruff/commit/abaacc85856e55869b3a772b2e7e4ba509dfbbc2",
        "title": "TypedDict.get amendment approved",
        "summary": "Tamir approved abaacc8585, now published on Ruff #30897.",
        "outcome": "approved"
      },
      {
        "kind": "amendment",
        "status": "settled",
        "head": "abaacc85856e55869b3a772b2e7e4ba509dfbbc2",
        "baseHead": "5d2628cbb2296f33d81828f6ce34a7140a36e5e4",
        "url": "https://github.com/tamird/ruff/commit/abaacc85856e55869b3a772b2e7e4ba509dfbbc2",
        "title": "Review the TypedDict.get overload amendment",
        "summary": "Published the approved literal-union fast path and mdtest revision on Ruff #30897.",
        "body": "Carl asked about the cost of grouping many small sets of TypedDict keys. This revision defers a declared literal-union overload when every member is disjoint from the actual literal key. If the remaining overloads do not match, the deferred overloads still run for diagnostics.\n\nThe mdtest uses reveal assertions, exercises a contextually typed empty-dict default for optional keys, and records the limitation for reordered unions. Type aliases with different declared identities have the same limitation.\n\nThe debug benchmark with 200 two-key groups took 627 ms versus 719 ms on the upstream parent on the same worker. A separate same-worker run measured 515 ms versus 1.86 s on the published PR. [RBE checks](https://app.buildbuddy.io/invocation/9e860df9-a2a4-4c9d-aa1d-ed07264d2d64) · [Benchmark against upstream](https://app.buildbuddy.io/invocation/5d519f3d-7e1d-456d-9ba2-1769db46c593) · [Carl's review](https://github.com/astral-sh/ruff/pull/30897#pullrequestreview-6044310559)\n\nCaptured with `git range-diff --no-color --no-dual-color --creation-factor=999 5d2628cbb2296f33d81828f6ce34a7140a36e5e4^! abaacc85856e55869b3a772b2e7e4ba509dfbbc2^!`.\n\n```diff\n1:  5d2628cbb2 ! 1:  abaacc8585 [ty] Group equivalent TypedDict.get keys\n    @@ Metadata\n      ## Commit message ##\n         [ty] Group equivalent TypedDict.get keys\n     \n    -    Calls with a union of known keys could match the broad string fallback\n    -    before argument expansion, losing their field types.\n    +    A union of known keys can match the broad string fallback before\n    +    argument expansion, losing the fields' value type. Give keys with the\n    +    same declared type and requiredness a shared literal-key overload.\n    +    Optional groups still accept a default inferred from their value type.\n     \n    -    Group keys with the same declared value type and requiredness into an\n    -    exact literal-key overload. Required and optional groups retain their\n    -    existing default handling. Keys in different groups keep their existing\n    -    fallback behavior.\n    +    A call with a single literal key can set aside an overload if every\n    +    literal in its key union is disjoint from that key. This avoids\n    +    inferring generic defaults for unrelated key groups. If none of the\n    +    remaining overloads matches, check the deferred ones for diagnostics.\n    +\n    +    The debug-profile benchmark with 200 two-key groups took 627 ms\n    +    against its upstream parent's 719 ms on the same BuildBuddy worker.\n    +    In a separate same-worker comparison, the published grouping without\n    +    the literal-union filter took 1.86 s and this revision took 515 ms.\n    +\n    + ## crates/ruff_benchmark/benches/ty.rs ##\n    +@@ crates/ruff_benchmark/benches/ty.rs: fn benchmark_many_protocol_members_mismatch(criterion: &mut Criterion) {\n    +     });\n    + }\n    + \n    ++/// Literal-key groups should skip generic default inference for unrelated keys.\n    ++fn benchmark_typed_dict_get_many_groups(criterion: &mut Criterion) {\n    ++    let mut code =\n    ++        \"from typing import Literal, TypedDict\\n\\nclass Fields(TypedDict, total=False):\\n\"\n    ++            .to_string();\n    ++    for i in 0..200 {\n    ++        writeln!(code, \"    a{i}: Literal[{i}]\\n    b{i}: Literal[{i}]\").ok();\n    ++    }\n    ++    code.push_str(\"\\ndef check(data: Fields):\\n\");\n    ++    for i in 0..200 {\n    ++        writeln!(code, \"    data.get(\\\"a{i}\\\", None)\").ok();\n    ++    }\n    ++    benchmark_micro_case(criterion, \"ty_micro[typed_dict_get_many_groups]\", &code);\n    ++}\n    ++\n    + /// Regression benchmarks for ty#4269: recursive protocol inference and assignment diagnostics.\n    + ///\n    + /// Explicit receiver annotations can repeatedly expand inherited recursive protocol members\n    +@@ crates/ruff_benchmark/benches/ty.rs: criterion_group!(\n    +     benchmark_string_literal_union_comparison,\n    +     benchmark_many_enum_members_2,\n    +     benchmark_many_protocol_members_mismatch,\n    ++    benchmark_typed_dict_get_many_groups,\n    +     benchmark_inherited_recursive_protocol,\n    +     benchmark_nested_generic_constructor_arguments,\n    +     benchmark_nested_recursive_protocol_receiver,\n     \n      ## crates/ty_python_semantic/resources/mdtest/typed_dict.md ##\n     @@ crates/ty_python_semantic/resources/mdtest/typed_dict.md: def _(payload: Payload | Payload2) -> None:\n          takes_resolved(payload.get(\"resolved\", {}))\n      ```\n      \n    -+Equivalent keys retain their common value type when the key is a union of literals. Required and\n    -+non-required fields remain separate because only non-required fields can return the default:\n    ++Keys with identical declared types retain their common value type when the key is a union of\n    ++literals. Required and non-required fields remain separate because only non-required fields can\n    ++return the default:\n     +\n     +```py\n     +from typing import Literal, NotRequired, TypedDict\n    -+from typing_extensions import assert_type\n     +\n     +class Counts(TypedDict):\n     +    first: int\n    @@ crates/ty_python_semantic/resources/mdtest/typed_dict.md: def _(payload: Payload\n     +    optional: Literal[\"optional_first\", \"optional_second\"],\n     +    default: bytes,\n     +) -> None:\n    -+    assert_type(data.get(required), int)\n    -+    assert_type(data.get(required, default), int)\n    -+    assert_type(data.get(optional), int | None)\n    -+    assert_type(data.get(optional, default), int | bytes)\n    ++    reveal_type(data.get(required))  # revealed: int\n    ++    reveal_type(data.get(required, default))  # revealed: int\n    ++    reveal_type(data.get(optional))  # revealed: int | None\n    ++    reveal_type(data.get(optional, default))  # revealed: int | bytes\n    ++```\n    ++\n    ++The field type also provides context for an empty dictionary default with a union of optional keys:\n    ++\n    ++```py\n    ++class ResolvedPayload(TypedDict, total=False):\n    ++    first: ResolvedData\n    ++    second: ResolvedData\n    ++\n    ++def _(data: ResolvedPayload, key: Literal[\"first\", \"second\"]):\n    ++    reveal_type(data.get(key, {}))  # revealed: ResolvedData\n    ++```\n    ++\n    ++Grouping currently uses type identity rather than equivalence. TODO: Reordered unions and aliases\n    ++for the same type do not share an overload:\n    ++\n    ++```py\n    ++class ReorderedFields(TypedDict):\n    ++    first: int | str\n    ++    second: str | int\n    ++\n    ++def _(data: ReorderedFields, key: Literal[\"first\", \"second\"]):\n    ++    reveal_type(data.get(key))  # revealed: Unknown | None\n     +```\n     +\n      Nested calls can infer different defaults even when the overloads for different keys share a\n      synthetic type variable.\n      \n     \n    + ## crates/ty_python_semantic/src/types/call/bind.rs ##\n    +@@ crates/ty_python_semantic/src/types/call/bind.rs: impl<'db> Binding<'db> {\n    +                     return false;\n    +                 }\n    +                 let declared = parameter.annotated_type();\n    +-                let Some(expected) = declared.as_literal_value() else {\n    +-                    return false;\n    +-                };\n    +-                argument\n    ++                let Some(actual) = argument\n    +                     .matched_type(declared, matched.argument_type)\n    +                     .and_then(Type::as_literal_value)\n    +-                    .is_some_and(|actual| actual.is_disjoint_from(db, expected))\n    ++                else {\n    ++                    return false;\n    ++                };\n    ++                match declared {\n    ++                    Type::LiteralValue(expected) => actual.is_disjoint_from(db, expected),\n    ++                    Type::Union(union) => union.elements(db).iter().all(|element| {\n    ++                        element\n    ++                            .as_literal_value()\n    ++                            .is_some_and(|expected| actual.is_disjoint_from(db, expected))\n    ++                    }),\n    ++                    _ => false,\n    ++                }\n    +             })\n    +     }\n    + \n    +\n      ## crates/ty_python_semantic/src/types/class/typed_dict.rs ##\n     @@ crates/ty_python_semantic/src/types/class/typed_dict.rs: use crate::types::class::{\n      use crate::types::generics::GenericContext;\n```",
        "outcome": "posted",
        "postedAt": "2026-11-25T18:02:54+00:00",
        "postedURL": "https://github.com/astral-sh/ruff/pull/30897"
      }
    ],
    "nextAction": "Follow CI and check Carl’s review on the amended head."
  },
  {
    "id": "inplace-notimplemented",
    "ref": "review/inplace-notimplemented-3f63e8b",
    "title": "[ty] Honor NotImplemented in binary operators",
    "state": "Submitted",
    "source": "88b15ebe27958d0cdac952904b9f4d497c0a0d18",
    "summary": "Approved 88b15ebe is published. Hosted CodSpeed flags simple_script; eight alternating matched RBE rounds did not reproduce the slowdown (27.63 to 27.52 ms median round averages).",
    "qualifiedBase": "3f63e8b368924bb58875a7590e07f667805839a5",
    "qualifiedHead": "88b15ebe27958d0cdac952904b9f4d497c0a0d18",
    "qualifiedCommitCount": 1,
    "qualifiedURL": "https://github.com/tamird/ruff/commit/88b15ebe27958d0cdac952904b9f4d497c0a0d18",
    "qualification": {
      "summary": "Native suites, all 532 Markdown tests, canonical hooks, formatting and strict Clippy pass on 88b15ebe. Both regression fixtures fail on published 0af5b7f2e.",
      "evidence": [
        {
          "label": "Late CodSpeed performance report: simple_script regression",
          "url": "https://github.com/astral-sh/ruff/pull/30898#issuecomment-7163169790"
        },
        {
          "label": "Qualified arithmetic amendment 88b15ebe",
          "url": "https://github.com/tamird/ruff/commit/88b15ebe27958d0cdac952904b9f4d497c0a0d18"
        },
        {
          "label": "Native suites, full Markdown and strict style qualification",
          "url": "https://app.buildbuddy.io/invocation/f6a9e652-fe1f-4866-b3f2-251ac7fa181d"
        },
        {
          "label": "Published 0af regression controls",
          "url": "https://app.buildbuddy.io/invocation/dd07a677-6774-4678-89c6-55ccc1bb30fb"
        },
        {
          "label": "Alex: ordinary dunders and annotation conventions",
          "url": "https://github.com/astral-sh/ruff/pull/30898#issuecomment-7136569495"
        }
      ]
    },
    "number": 30898,
    "nextAction": "A Ruff maintainer with Actions write access can rerun the hosted walltime job. Keep the CodSpeed failure visible until the hosted result is resolved.",
    "settledReviews": [
      {
        "kind": "proposal",
        "status": "approved",
        "head": "0af5b7f2e02fa2efddd6b6ff0cc1e37af09142b9",
        "baseHead": "3f63e8b368924bb58875a7590e07f667805839a5",
        "url": "https://github.com/tamird/ruff/commit/0af5b7f2e02fa2efddd6b6ff0cc1e37af09142b9",
        "title": "Review in-place NotImplemented fallback",
        "summary": "Tamir approved exact 0af5b7f2e for upstream submission; it is submitted as Ruff #30898.",
        "body": "An in-place method can return `NotImplemented` to request the ordinary binary operation. The sentinel was instead assigned to the target, bypassing ordinary and reflected dispatch and missing unsupported-operand errors.\n\nThis change removes sentinel alternatives and uses the existing binary dispatch for them. Other return alternatives and the fallback for conditionally defined in-place methods remain.\n\nThe exact current-base regression fails before the change and passes afterward. The whole augmented-assignment fixture, all 532 default Markdown fixtures, core 86, semantic 539 (35 ignored), IDE 1964, canonical hooks, formatting and strict Clippy pass. Network-enabled modes were not separately qualified. [Qualification](https://app.buildbuddy.io/invocation/e19deaea-67f1-41bf-95bf-ac212d18d525).\n\n[Read the complete proposed commit](https://github.com/tamird/ruff/commit/0af5b7f2e02fa2efddd6b6ff0cc1e37af09142b9). Tamir approval is required before upstream submission.",
        "outcome": "approved"
      },
      {
        "kind": "amendment",
        "status": "approved",
        "head": "88b15ebe27958d0cdac952904b9f4d497c0a0d18",
        "baseHead": "0af5b7f2e02fa2efddd6b6ff0cc1e37af09142b9",
        "url": "https://github.com/tamird/ruff/commit/88b15ebe27958d0cdac952904b9f4d497c0a0d18",
        "title": "Review the arithmetic amendment for PR #30898",
        "summary": "Tamir approved exact 88b15ebe for the PR #30898 update.",
        "body": "Review the replacement for Ruff #30898: published `0af5b7f2e` \u2192 proposed `88b15ebe27`. Both commits use upstream `3f63e8b36` as their base.\n\nThe revision handles `NotImplemented` in ordinary and reflected arithmetic as well as augmented assignments. Existing successful-result annotations and parameter-based fallback remain supported. Direct method calls retain their original return types. Callability errors block reflection; methods on two operands with the same known runtime class are not retried as reflected calls.\n\nThe original two regression fixtures fail on published `0af5b7f2e`. The candidate passes core 86, semantic 539 (35 ignored), IDE 1,964, all 532 default Markdown tests, canonical hooks, formatting and strict Clippy. [Qualification](https://app.buildbuddy.io/invocation/f6a9e652-fe1f-4866-b3f2-251ac7fa181d); [published-head controls](https://app.buildbuddy.io/invocation/dd07a677-6774-4678-89c6-55ccc1bb30fb).\n\n[Read the complete proposed commit](https://github.com/tamird/ruff/commit/88b15ebe27958d0cdac952904b9f4d497c0a0d18).\n\n## Changes from the submitted commit\n\nThis is Git's actual paired range-diff of the two single-commit proposals.\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 3f63e8b368924bb58875a7590e07f667805839a5..0af5b7f2e02fa2efddd6b6ff0cc1e37af09142b9 3f63e8b368924bb58875a7590e07f667805839a5..88b15ebe27958d0cdac952904b9f4d497c0a0d18\n```\n\n```diff\n1:  0af5b7f2e0 ! 1:  88b15ebe27 [ty] Honor NotImplemented in augmented assignments\n    @@ Metadata\n     Author: Tamir Duberstein <tamird@gmail.com>\n     \n      ## Commit message ##\n    -    [ty] Honor NotImplemented in augmented assignments\n    +    [ty] Honor NotImplemented in binary operators\n     \n    -    An in-place method can return NotImplemented to request the ordinary\n    -    binary operation. That result was instead assigned to the target,\n    -    bypassing ordinary and reflected dispatch and missing unsupported-operand\n    -    errors.\n    +    Binary dispatch stopped when a method returned NotImplemented, so\n    +    arithmetic could infer the sentinel instead of trying a reflected method\n    +    or reporting an unsupported operation. The in-place fallback could\n    +    expose the same result after __iadd__ declined.\n     \n    -    Remove the sentinel alternatives and use the existing binary dispatch for\n    -    them. Retain other return alternatives and the fallback for conditionally\n    -    defined in-place methods.\n    +    Treat NotImplemented as a request to continue dispatch, preserving other\n    +    return alternatives when fallback succeeds. Conditionally defined\n    +    methods also retain their own return types alongside the fallback. Reuse\n    +    this partition for in-place results. Keep original call bindings for\n    +    navigation and retain deprecation warnings from methods that decline the\n    +    operation.\n    +\n    +    Distinguish unavailable methods from methods that may not be callable;\n    +    the latter can raise before reflection. Suppress reflected calls when\n    +    both operands have the same exact runtime class [1]. This includes\n    +    different specializations of a final generic class.\n    +\n    +    Conventional successful-result annotations and parameter-based fallback\n    +    remain supported; direct method calls keep their annotated or inferred\n    +    return types. This does not change the annotation validation discussed\n    +    in [2].\n    +\n    +    [1]: https://docs.python.org/3/reference/datamodel.html#object.__radd__\n    +    [2]: https://github.com/astral-sh/ty/issues/1150\n     \n      ## crates/ty_python_semantic/resources/mdtest/assignment/augmented.md ##\n     @@ crates/ty_python_semantic/resources/mdtest/assignment/augmented.md: x += \"Hello\"\n    @@ crates/ty_python_semantic/resources/mdtest/assignment/augmented.md: x += \"Hello\"\n     +Returning `NotImplemented` requests ordinary binary dispatch, including the reflected method. The\n     +sentinel is never assigned to the target; other in-place return alternatives are retained.\n     +\n    ++```toml\n    ++[analysis]\n    ++return-type-inference = \"always\"\n    ++```\n    ++\n     +```py\n     +from types import NotImplementedType\n    ++from typing import final\n     +\n     +InPlaceResult = int | NotImplementedType\n     +\n    ++@final\n     +class Left:\n    -+    def __iadd__(self, other: object) -> NotImplementedType:\n    ++    def __iadd__(self, other: object):\n     +        return NotImplemented\n     +\n     +    def __add__(self, other: int) -> str:\n     +        return \"added\"\n     +\n     +class Right:\n    -+    def __radd__(self, other: Left) -> bytes:\n    ++    def __radd__(self, other: object) -> bytes:\n     +        return b\"reflected\"\n     +\n     +left = Left()\n    @@ crates/ty_python_semantic/resources/mdtest/assignment/augmented.md: x += \"Hello\"\n     +mixed = Mixed()\n     +mixed += 1\n     +reveal_type(mixed)  # revealed: int | str\n    ++\n    ++@final\n    ++class Declines:\n    ++    def __iadd__(self, other: object) -> NotImplementedType:\n    ++        return NotImplemented\n    ++\n    ++    def __add__(self, other: object):\n    ++        return NotImplemented\n    ++\n    ++both = Declines()\n    ++both += Right()\n    ++reveal_type(both)  # revealed: bytes\n     +```\n     +\n      ## Unsupported types\n      \n      ```py\n     \n    + ## crates/ty_python_semantic/resources/mdtest/binary/instances.md ##\n    +@@ crates/ty_python_semantic/resources/mdtest/binary/instances.md: class GenericChild(GenericBase[T]):\n    + def add_generic(left: GenericBase[int], right: GenericChild[str]) -> Literal[\"left\", \"right\"]:\n    +     reveal_type(left + right)  # revealed: Literal[\"right\", \"left\"]\n    +     return left + right\n    ++\n    ++from types import NotImplementedType\n    ++from typing import final\n    ++\n    ++@final\n    ++class Box(Generic[T]):\n    ++    value: T\n    ++\n    ++    def __add__(self, other: object) -> NotImplementedType:\n    ++        return NotImplemented\n    ++\n    ++    def __radd__(self, other: object) -> int:\n    ++        return 1\n    ++\n    ++def same_runtime_class(left: Box[int], right: Box[str]):\n    ++    # error: [unsupported-operator]\n    ++    reveal_type(left + right)  # revealed: Unknown\n    + ```\n    + \n    + ## Class objects use their metaclasses for reflected precedence\n    +@@ crates/ty_python_semantic/resources/mdtest/binary/instances.md: class B:\n    + reveal_type(A() - B())  # revealed: B\n    + ```\n    + \n    ++## Methods returning `NotImplemented`\n    ++\n    ++An explicit or inferred `NotImplemented` return tries the next method. Direct calls retain the\n    ++method's return type:\n    ++\n    ++```toml\n    ++[analysis]\n    ++return-type-inference = \"always\"\n    ++```\n    ++\n    ++```py\n    ++from types import NotImplementedType\n    ++from typing import final\n    ++\n    ++class Reflected:\n    ++    def __radd__(self, other: object) -> int:\n    ++        return 1\n    ++\n    ++@final\n    ++class Inferred:\n    ++    def __add__(self, other: object):\n    ++        if isinstance(other, bytes):\n    ++            return other\n    ++        return NotImplemented\n    ++\n    ++reveal_type(Inferred().__add__(Reflected()))  # revealed: bytes | NotImplementedType\n    ++reveal_type(Inferred() + Reflected())  # revealed: bytes | int\n    ++\n    ++# error: [unsupported-operator]\n    ++reveal_type(Inferred() + object())  # revealed: Unknown\n    ++\n    ++class Declines:\n    ++    def __add__(self, other: object) -> NotImplementedType:\n    ++        return NotImplemented\n    ++\n    ++    def __radd__(self, other: object) -> int:\n    ++        return 1\n    ++\n    ++reveal_type(Declines() + Reflected())  # revealed: int\n    ++\n    ++# Reflected methods are not tried for two operands of the same runtime type.\n    ++# error: [unsupported-operator]\n    ++reveal_type(Declines() + Declines())  # revealed: Unknown\n    ++\n    ++class Refuses:\n    ++    def __radd__(self, other: object) -> NotImplementedType:\n    ++        return NotImplemented\n    ++\n    ++# error: [unsupported-operator]\n    ++reveal_type(Declines() + Refuses())  # revealed: Unknown\n    ++\n    ++class Blocked:\n    ++    __add__ = None\n    ++\n    ++# A non-callable method raises instead of trying the reflected method.\n    ++# error: [unsupported-operator]\n    ++reveal_type(Blocked() + Reflected())  # revealed: Unknown\n    ++```\n    ++\n    + ## Callable instances as dunders\n    + \n    + Believe it or not, this is supported at runtime:\n    +\n    + ## crates/ty_python_semantic/src/types/call.rs ##\n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> OperatorResult<'db> {\n    +         db: &'db dyn Db,\n    +         env: &ProgramEnvironment<'db>,\n    +         bindings: &Bindings<'db>,\n    ++    ) -> Self {\n    ++        Self::from_bindings_and_return_type(db, bindings, bindings.return_type(db, env))\n    ++    }\n    ++\n    ++    fn from_bindings_and_return_type(\n    ++        db: &'db dyn Db,\n    ++        bindings: &Bindings<'db>,\n    ++        return_type: Type<'db>,\n    +     ) -> Self {\n    +         Self {\n    +-            return_type: bindings.return_type(db, env),\n    ++            return_type,\n    +             deprecated_functions: bindings\n    +                 .deprecated_functions(db)\n    +                 .map(|(_, function)| function)\n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> OperatorResult<'db> {\n    +     }\n    + }\n    + \n    ++/// The methods called by a binary operation and its result after `NotImplemented` fallback.\n    ++///\n    ++/// Method bindings retain their original return types for IDE navigation. Arithmetic syntax\n    ++/// uses a separate result after `NotImplemented` fallback.\n    ++pub(crate) struct BinaryOperatorCall<'db> {\n    ++    pub(super) bindings: Bindings<'db>,\n    ++    pub(super) return_type: Type<'db>,\n    ++}\n    ++\n    ++impl<'db> BinaryOperatorCall<'db> {\n    ++    fn union(self, db: &'db dyn Db, env: &ProgramEnvironment<'db>, other: Self) -> Self {\n    ++        let Self {\n    ++            bindings: left,\n    ++            return_type: left_type,\n    ++        } = self;\n    ++        let Self {\n    ++            bindings: right,\n    ++            return_type: right_type,\n    ++        } = other;\n    ++        let callable_type =\n    ++            UnionType::from_two_elements(db, env, left.callable_type(), right.callable_type());\n    ++        Self {\n    ++            bindings: Bindings::from_union(callable_type, [left, right]),\n    ++            return_type: UnionType::from_two_elements(db, env, left_type, right_type),\n    ++        }\n    ++    }\n    ++\n    ++    pub(super) fn into_result(self, db: &'db dyn Db) -> OperatorResult<'db> {\n    ++        let Self {\n    ++            bindings,\n    ++            return_type,\n    ++        } = self;\n    ++        OperatorResult::from_bindings_and_return_type(db, &bindings, return_type)\n    ++    }\n    ++}\n    ++\n    ++#[expect(\n    ++    clippy::large_enum_variant,\n    ++    reason = \"Boxing adds an allocation to each successful call\"\n    ++)]\n    ++enum OperatorCallOutcome<'db> {\n    ++    Called {\n    ++        call: BinaryOperatorCall<'db>,\n    ++        /// The method can return `NotImplemented` or may not be defined at runtime.\n    ++        may_fall_through: bool,\n    ++    },\n    ++    Unavailable,\n    ++    Blocked,\n    ++}\n    ++\n    ++impl<'db> OperatorCallOutcome<'db> {\n    ++    fn into_error(self, db: &'db dyn Db) -> CallBinOpError<'db> {\n    ++        match self {\n    ++            Self::Called {\n    ++                call,\n    ++                may_fall_through: _,\n    ++            } => CallBinOpError::from_call(db, call),\n    ++            Self::Unavailable => CallBinOpError::default(),\n    ++            Self::Blocked => CallBinOpError::default(),\n    ++        }\n    ++    }\n    ++}\n    ++\n    ++fn operator_call_outcome<'db>(\n    ++    db: &'db dyn Db,\n    ++    env: &ProgramEnvironment<'db>,\n    ++    call: Result<Bindings<'db>, CallDunderError<'db>>,\n    ++) -> OperatorCallOutcome<'db> {\n    ++    let (bindings, possibly_unbound) = match call {\n    ++        Ok(bindings) => (bindings, false),\n    ++        Err(error) => match error {\n    ++            CallDunderError::PossiblyUnbound {\n    ++                bindings,\n    ++                unbound_on: _,\n    ++            } => (*bindings, true),\n    ++            CallDunderError::MethodNotAvailable => return OperatorCallOutcome::Unavailable,\n    ++            CallDunderError::CallError(kind, _, _) => match kind {\n    ++                // Calling a non-callable method can raise before reflection, even if other\n    ++                // possible method types are callable.\n    ++                CallErrorKind::NotCallable => return OperatorCallOutcome::Blocked,\n    ++                CallErrorKind::PossiblyNotCallable => return OperatorCallOutcome::Blocked,\n    ++                // Keep parameter-based fallback for the existing annotation convention.\n    ++                CallErrorKind::BindingError => return OperatorCallOutcome::Unavailable,\n    ++            },\n    ++        },\n    ++    };\n    ++    let (return_type, may_decline) = bindings.return_type(db, env).split_not_implemented(db, env);\n    ++    OperatorCallOutcome::Called {\n    ++        call: BinaryOperatorCall {\n    ++            bindings,\n    ++            return_type,\n    ++        },\n    ++        may_fall_through: may_decline || possibly_unbound,\n    ++    }\n    ++}\n    ++\n    ++fn resolve_ordered_operator_calls<'db>(\n    ++    db: &'db dyn Db,\n    ++    env: &ProgramEnvironment<'db>,\n    ++    first: OperatorCallOutcome<'db>,\n    ++    fallback: impl FnOnce() -> OperatorCallOutcome<'db>,\n    ++) -> Result<BinaryOperatorCall<'db>, CallBinOpError<'db>> {\n    ++    let first = match first {\n    ++        OperatorCallOutcome::Called {\n    ++            call,\n    ++            may_fall_through,\n    ++        } => {\n    ++            if !may_fall_through {\n    ++                return Ok(call);\n    ++            }\n    ++            Some(call)\n    ++        }\n    ++        OperatorCallOutcome::Unavailable => None,\n    ++        OperatorCallOutcome::Blocked => return Err(CallBinOpError::default()),\n    ++    };\n    ++    match fallback() {\n    ++        OperatorCallOutcome::Called {\n    ++            call: second,\n    ++            may_fall_through,\n    ++        } => {\n    ++            let call = match first {\n    ++                Some(first) => first.union(db, env, second),\n    ++                None => second,\n    ++            };\n    ++            if may_fall_through {\n    ++                Err(CallBinOpError::from_call(db, call))\n    ++            } else {\n    ++                Ok(call)\n    ++            }\n    ++        }\n    ++        OperatorCallOutcome::Unavailable => Err(match first {\n    ++            Some(call) => CallBinOpError::from_call(db, call),\n    ++            None => CallBinOpError::default(),\n    ++        }),\n    ++        OperatorCallOutcome::Blocked => Err(match first {\n    ++            Some(call) => CallBinOpError::from_call(db, call),\n    ++            None => CallBinOpError::default(),\n    ++        }),\n    ++    }\n    ++}\n    ++\n    ++fn resolve_possible_operator_calls<'db>(\n    ++    db: &'db dyn Db,\n    ++    env: &ProgramEnvironment<'db>,\n    ++    first: OperatorCallOutcome<'db>,\n    ++    second: OperatorCallOutcome<'db>,\n    ++) -> Result<BinaryOperatorCall<'db>, CallBinOpError<'db>> {\n    ++    let (call, may_fall_through) = match first {\n    ++        OperatorCallOutcome::Blocked => return Err(second.into_error(db)),\n    ++        OperatorCallOutcome::Unavailable => match second {\n    ++            OperatorCallOutcome::Called {\n    ++                call,\n    ++                may_fall_through,\n    ++            } => (call, may_fall_through),\n    ++            OperatorCallOutcome::Unavailable => return Err(CallBinOpError::default()),\n    ++            OperatorCallOutcome::Blocked => return Err(CallBinOpError::default()),\n    ++        },\n    ++        OperatorCallOutcome::Called {\n    ++            call: first,\n    ++            may_fall_through: first_declines,\n    ++        } => match second {\n    ++            OperatorCallOutcome::Called {\n    ++                call: second,\n    ++                may_fall_through: second_declines,\n    ++            } => (\n    ++                first.union(db, env, second),\n    ++                first_declines && second_declines,\n    ++            ),\n    ++            OperatorCallOutcome::Unavailable => (first, first_declines),\n    ++            OperatorCallOutcome::Blocked => return Err(CallBinOpError::from_call(db, first)),\n    ++        },\n    ++    };\n    ++    if may_fall_through {\n    ++        Err(CallBinOpError::from_call(db, call))\n    ++    } else {\n    ++        Ok(call)\n    ++    }\n    ++}\n    ++\n    + /// Whether the right operand's reflected method has priority based on the possible runtime\n    + /// classes of both operands.\n    + ///\n    +@@ crates/ty_python_semantic/src/types/call.rs: fn reflected_method_priority<'db>(\n    + }\n    + \n    + impl<'db> Type<'db> {\n    ++    /// Separate operator result values from a request to try another method.\n    ++    pub(super) fn split_not_implemented(\n    ++        self,\n    ++        db: &'db dyn Db,\n    ++        env: &ProgramEnvironment<'db>,\n    ++    ) -> (Self, bool) {\n    ++        let expanded = self.expand_top_level_aliases(db, env);\n    ++        let completing = match expanded {\n    ++            Type::Union(union) => union.filter(db, |ty| !ty.is_notimplemented(db)),\n    ++            ty => {\n    ++                if ty.is_notimplemented(db) {\n    ++                    Type::Never\n    ++                } else {\n    ++                    ty\n    ++                }\n    ++            }\n    ++        };\n    ++        if completing == expanded {\n    ++            (self, false)\n    ++        } else {\n    ++            (completing, true)\n    ++        }\n    ++    }\n    ++\n    +     /// Return the result of dispatching a rich comparison method between two operands.\n    +     ///\n    +     /// A strict subclass on the right takes precedence over the normal method on the left.\n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> Type<'db> {\n    + \n    +     /// Memoize the return type and deprecations from binary dunder resolution, without retaining\n    +     /// the full call bindings or repeating overload selection at each expression.\n    +-    /// Returns `None` if resolution fails; callers remain responsible for call-site diagnostics.\n    ++    /// Failed resolution retains called-method metadata;\n    ++    /// callers remain responsible for call-site diagnostics.\n    +     pub(crate) fn try_call_bin_op_result(\n    +         db: &'db dyn Db,\n    +         env: &ProgramEnvironment<'db>,\n    +         left_ty: Type<'db>,\n    +         op: ast::Operator,\n    +         right_ty: Type<'db>,\n    +-    ) -> Option<&'db OperatorResult<'db>> {\n    +-        #[salsa::tracked(returns(ref), cycle_initial=|_, _, _, _, _, _, _| None, heap_size=ruff_memory_usage::heap_size)]\n    ++    ) -> Result<&'db OperatorResult<'db>, &'db CallBinOpError<'db>> {\n    ++        #[salsa::tracked(returns(ref), cycle_initial=|_, _, _, _, _, _, _| Err(CallBinOpError::default()), heap_size=ruff_memory_usage::heap_size)]\n    +         fn try_call_bin_op_result_impl<'db>(\n    +             db: &'db dyn Db,\n    +             program: Program<'db>,\n    +             left_ty: Type<'db>,\n    +             op: ast::Operator,\n    +             right_ty: Type<'db>,\n    +-        ) -> Option<OperatorResult<'db>> {\n    ++        ) -> Result<OperatorResult<'db>, CallBinOpError<'db>> {\n    +             let env = &ProgramEnvironment::from_program(program);\n    +-            Type::try_call_bin_op(db, env, left_ty, op, right_ty)\n    +-                .ok()\n    +-                .map(|bindings| OperatorResult::from_bindings(db, env, &bindings))\n    ++            Type::try_call_bin_op(db, env, left_ty, op, right_ty).map(|call| call.into_result(db))\n    +         }\n    + \n    +         try_call_bin_op_result_impl(db, env.program(db), left_ty, op, right_ty).as_ref()\n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> Type<'db> {\n    +         left_ty: Type<'db>,\n    +         op: ast::Operator,\n    +         right_ty: Type<'db>,\n    +-    ) -> Result<Bindings<'db>, CallBinOpError> {\n    ++    ) -> Result<BinaryOperatorCall<'db>, CallBinOpError<'db>> {\n    +         Self::try_call_bin_op_with_policy(\n    +             db,\n    +             env,\n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> Type<'db> {\n    +         op: ast::Operator,\n    +         right_ty: Type<'db>,\n    +         policy: MemberLookupPolicy,\n    +-    ) -> Result<Bindings<'db>, CallBinOpError> {\n    +-        // We either want to call lhs.__op__ or rhs.__rop__. The full decision tree from\n    +-        // the Python spec [1] is:\n    +-        //\n    +-        //   - If rhs is a (proper) subclass of lhs, and it provides a different\n    +-        //     implementation of __rop__, use that.\n    +-        //   - Otherwise, if lhs implements __op__, use that.\n    +-        //   - Otherwise, if lhs and rhs are different types, and rhs implements __rop__,\n    +-        //     use that.\n    +-        //\n    +-        // [1] https://docs.python.org/3/reference/datamodel.html#object.__radd__\n    +-\n    +-        // Runtime classes determine reflected priority, but static operand types may only\n    +-        // establish that priority conditionally.\n    ++    ) -> Result<BinaryOperatorCall<'db>, CallBinOpError<'db>> {\n    ++        // A different reflected implementation on a proper subclass is tried first.\n    ++        // A method that returns NotImplemented lets the next method run; parameter\n    ++        // binding failures retain their existing fallback behavior.\n    ++        let call_dunder = |receiver: Type<'db>, argument: Type<'db>, name| {\n    ++            operator_call_outcome(\n    ++                db,\n    ++                env,\n    ++                receiver.try_call_dunder_with_policy(\n    ++                    db,\n    ++                    env,\n    ++                    name,\n    ++                    &mut CallArguments::positional([argument]),\n    ++                    TypeContext::default(),\n    ++                    policy,\n    ++                ),\n    ++            )\n    ++        };\n    ++        let call_left = || call_dunder(left_ty, right_ty, op.dunder());\n    ++        let call_right = || {\n    ++            if left_ty == right_ty {\n    ++                return OperatorCallOutcome::Unavailable;\n    ++            }\n    ++            // Different specializations can still have the same exact runtime class.\n    ++            let same_runtime_class = has_exact_runtime_class(db, env, left_ty)\n    ++                && has_exact_runtime_class(db, env, right_ty)\n    ++                && operator_dispatch_class(db, env, left_ty)\n    ++                    .zip(operator_dispatch_class(db, env, right_ty))\n    ++                    .is_some_and(|(left, right)| left.class_literal(db) == right.class_literal(db));\n    ++            if same_runtime_class {\n    ++                OperatorCallOutcome::Unavailable\n    ++            } else {\n    ++                call_dunder(right_ty, left_ty, op.reflected_dunder())\n    ++            }\n    ++        };\n    +         let reflected_priority = reflected_method_priority(db, env, left_ty, right_ty);\n    +-\n    +-        let left_class = left_ty.to_meta_type(db, env);\n    +-        let right_class = right_ty.to_meta_type(db, env);\n    +         if reflected_priority != ReflectedMethodPriority::Never {\n    +             let reflected_dunder = op.reflected_dunder();\n    ++            let left_class = left_ty.to_meta_type(db, env);\n    ++            let right_class = right_ty.to_meta_type(db, env);\n    +             let rhs_reflected = right_class.member(db, env, reflected_dunder).place;\n    +-            // TODO: if `rhs_reflected` is possibly unbound, we should union the two possible\n    +-            // Bindings together\n    +             if !rhs_reflected.is_undefined()\n    +                 && !rhs_reflected.is_equal_ignoring_provenance(\n    +                     left_class.member(db, env, reflected_dunder).place,\n    +                 )\n    +             {\n    +-                let call_on_right_instance = right_ty.try_call_dunder_with_policy(\n    +-                    db,\n    +-                    env,\n    +-                    reflected_dunder,\n    +-                    &mut CallArguments::positional([left_ty]),\n    +-                    TypeContext::default(),\n    +-                    policy,\n    +-                );\n    +-\n    +                 if reflected_priority == ReflectedMethodPriority::Definitely {\n    +-                    return Ok(call_on_right_instance.or_else(|_| {\n    +-                        left_ty.try_call_dunder_with_policy(\n    +-                            db,\n    +-                            env,\n    +-                            op.dunder(),\n    +-                            &mut CallArguments::positional([right_ty]),\n    +-                            TypeContext::default(),\n    +-                            policy,\n    +-                        )\n    +-                    })?);\n    ++                    return resolve_ordered_operator_calls(db, env, call_right(), call_left);\n    +                 }\n    +-\n    +-                let call_on_left_instance = left_ty.try_call_dunder_with_policy(\n    +-                    db,\n    +-                    env,\n    +-                    op.dunder(),\n    +-                    &mut CallArguments::positional([right_ty]),\n    +-                    TypeContext::default(),\n    +-                    policy,\n    +-                );\n    +-\n    +-                return match (call_on_right_instance, call_on_left_instance) {\n    +-                    (Ok(right_bindings), Ok(left_bindings)) => {\n    +-                        let callable_type = UnionType::from_two_elements(\n    +-                            db,\n    +-                            env,\n    +-                            right_bindings.callable_type(),\n    +-                            left_bindings.callable_type(),\n    +-                        );\n    +-                        Ok(Bindings::from_union(\n    +-                            callable_type,\n    +-                            [right_bindings, left_bindings],\n    +-                        ))\n    +-                    }\n    +-                    (Ok(bindings), Err(_)) | (Err(_), Ok(bindings)) => Ok(bindings),\n    +-                    (Err(_), Err(error)) => Err(error.into()),\n    +-                };\n    ++                // Either method may have runtime priority. Both are evaluated once; if\n    ++                // either always completes, neither ordering can exhaust both methods.\n    ++                return resolve_possible_operator_calls(db, env, call_right(), call_left());\n    +             }\n    +         }\n    +-\n    +-        let call_on_left_instance = left_ty.try_call_dunder_with_policy(\n    +-            db,\n    +-            env,\n    +-            op.dunder(),\n    +-            &mut CallArguments::positional([right_ty]),\n    +-            TypeContext::default(),\n    +-            policy,\n    +-        );\n    +-\n    +-        call_on_left_instance.or_else(|_| {\n    +-            if left_ty == right_ty {\n    +-                Err(CallBinOpError::NotSupported)\n    +-            } else {\n    +-                Ok(right_ty.try_call_dunder_with_policy(\n    +-                    db,\n    +-                    env,\n    +-                    op.reflected_dunder(),\n    +-                    &mut CallArguments::positional([left_ty]),\n    +-                    TypeContext::default(),\n    +-                    policy,\n    +-                )?)\n    +-            }\n    +-        })\n    ++        resolve_ordered_operator_calls(db, env, call_left(), call_right)\n    +     }\n    + }\n    + \n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> CallDunderError<'db> {\n    +     }\n    + }\n    + \n    +-#[derive(Debug)]\n    +-pub(crate) enum CallBinOpError {\n    +-    /// The dunder attribute exists but it can't be called with the given arguments.\n    +-    ///\n    +-    /// This includes non-callable dunder attributes that are possibly unbound.\n    +-    CallError,\n    +-\n    +-    NotSupported,\n    ++/// Called-method metadata retained when a binary operation is unsupported.\n    ++#[derive(Clone, Debug, Default, PartialEq, Eq, get_size2::GetSize, salsa::SalsaValue)]\n    ++pub(crate) struct CallBinOpError<'db> {\n    ++    /// Includes methods that were called but returned only `NotImplemented`.\n    ++    pub(super) deprecated_functions: Box<[OverloadLiteral<'db>]>,\n    + }\n    + \n    +-impl From<CallDunderError<'_>> for CallBinOpError {\n    +-    fn from(value: CallDunderError<'_>) -> Self {\n    +-        match value {\n    +-            CallDunderError::CallError(_, _, _) => Self::CallError,\n    +-            CallDunderError::MethodNotAvailable | CallDunderError::PossiblyUnbound { .. } => {\n    +-                CallBinOpError::NotSupported\n    +-            }\n    ++impl<'db> CallBinOpError<'db> {\n    ++    fn from_call(db: &'db dyn Db, call: BinaryOperatorCall<'db>) -> Self {\n    ++        Self {\n    ++            deprecated_functions: call.into_result(db).deprecated_functions,\n    +         }\n    +     }\n    + }\n    +\n    + ## crates/ty_python_semantic/src/types/ide_support.rs ##\n    +@@ crates/ty_python_semantic/src/types/ide_support.rs: pub fn definitions_for_bin_op<'db>(\n    +     let left_ty = binary_op.left.inferred_type(model)?;\n    +     let right_ty = binary_op.right.inferred_type(model)?;\n    +     let env = &model.program_environment();\n    +-    let Ok(bindings) = Type::try_call_bin_op(db, env, left_ty, binary_op.op, right_ty) else {\n    ++    let Ok(call) = Type::try_call_bin_op(db, env, left_ty, binary_op.op, right_ty) else {\n    +         return None;\n    +     };\n    ++    let bindings = call.bindings;\n    + \n    +     let callable_type = promote_for_self(db, env, bindings.callable_type());\n    + \n    +\n      ## crates/ty_python_semantic/src/types/infer/builder.rs ##\n     @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {\n                          &mut |builder, (_, _, tcx)| infer_value_ty(builder, tcx),\n    @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInfere\n                                  value_ty,\n                              );\n     -                        Err(bindings.return_type(db, env))\n    -+                        return Err(bindings.return_type(db, env));\n    ++                        let (return_type, may_decline) =\n    ++                            bindings.return_type(db, env).split_not_implemented(db, env);\n    ++                        return Err(if may_decline {\n    ++                            UnionType::from_two_elements(db, env, return_type, Type::unknown())\n    ++                        } else {\n    ++                            return_type\n    ++                        });\n                          }\n     +                };\n     +                state.deprecated_functions.extend(\n    @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInfere\n     +                        .map(|(_, function)| function),\n     +                );\n     +\n    -+                // Returning NotImplemented requests the ordinary binary operation; it is\n    -+                // never assigned back to the target. Other return alternatives still apply.\n    -+                let return_ty = outcome.return_type(db, env);\n    -+                let expanded_return_ty = return_ty.expand_top_level_aliases(db, env);\n    -+                let assigned_ty = match expanded_return_ty {\n    -+                    Type::Union(union) => union.filter(db, |ty| !ty.is_notimplemented(db)),\n    -+                    ty => {\n    -+                        if ty.is_notimplemented(db) {\n    -+                            Type::Never\n    -+                        } else {\n    -+                            ty\n    -+                        }\n    -+                    }\n    -+                };\n    -+                let assigned_ty = if assigned_ty == expanded_return_ty {\n    -+                    if !possibly_unbound {\n    -+                        return Ok(return_ty);\n    -+                    }\n    -+                    return_ty\n    -+                } else {\n    -+                    assigned_ty\n    -+                };\n    ++                let (assigned_ty, may_decline) =\n    ++                    outcome.return_type(db, env).split_not_implemented(db, env);\n    ++                if !possibly_unbound && !may_decline {\n    ++                    return Ok(assigned_ty);\n    ++                }\n     +\n     +                let value_ty = outcome.type_for_argument(&call_arguments, 0);\n     +                match binary_return_ty(self, value_ty, state) {\n    @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInfere\n                      }\n                  }\n              }\n    +\n    + ## crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs ##\n    +@@ crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs: use compact_str::CompactString;\n    + use ruff_python_ast::{self as ast, AnyNodeRef};\n    + \n    + use super::TypeInferenceBuilder;\n    +-use crate::types::call::CallArguments;\n    ++use crate::types::call::{CallArguments, CallBinOpError, OperatorResult};\n    + use crate::types::constraints::ConstraintSetBuilder;\n    + use crate::types::cyclic::CycleDetector;\n    + use crate::types::diagnostic::{\n    +@@ crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs: pub(super) struct BinaryInferenceState<'db> {\n    + }\n    + \n    + impl<'db> BinaryInferenceState<'db> {\n    ++    fn record_operator_result(\n    ++        &mut self,\n    ++        result: Result<&OperatorResult<'db>, &CallBinOpError<'db>>,\n    ++    ) -> Option<Type<'db>> {\n    ++        match result {\n    ++            Ok(result) => {\n    ++                self.deprecated_functions\n    ++                    .extend(&result.deprecated_functions);\n    ++                Some(result.return_type)\n    ++            }\n    ++            Err(error) => {\n    ++                self.deprecated_functions\n    ++                    .extend(&error.deprecated_functions);\n    ++                None\n    ++            }\n    ++        }\n    ++    }\n    ++\n    +     fn tuple_alternative_count(db: &'db dyn Db, ty: Type<'db>) -> usize {\n    +         match ty {\n    +             Type::Union(union) => union\n    +@@ crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs: impl<'db> TypeInferenceBuilder<'db, '_> {\n    +             left_ty,\n    +             op,\n    +             right_ty,\n    +-        )?;\n    +-        state\n    +-            .deprecated_functions\n    +-            .extend(&result.deprecated_functions);\n    +-        Some(result.return_type)\n    ++        );\n    ++        state.record_operator_result(result)\n    +     }\n    + \n    +     /// Infer the result type and collect deprecated methods for the enclosing operation.\n    +@@ crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs: impl<'db> TypeInferenceBuilder<'db, '_> {\n    +                 _,\n    +                 Type::ClassLiteral(..) | Type::GenericAlias(..) | Type::SubclassOf(..),\n    +                 ast::Operator::BitOr,\n    +-            ) => Type::try_call_bin_op_with_policy(\n    +-                db,\n    +-                env,\n    +-                left_ty,\n    +-                ast::Operator::BitOr,\n    +-                right_ty,\n    +-                MemberLookupPolicy::META_CLASS_NO_TYPE_FALLBACK,\n    +-            )\n    +-            .ok()\n    +-            .map(|binding| {\n    +-                state.deprecated_functions.extend(\n    +-                    binding\n    +-                        .deprecated_functions(db)\n    +-                        .map(|(_, function)| function),\n    +-                );\n    +-                binding.return_type(db, env)\n    +-            }),\n    ++            ) => {\n    ++                let result = Type::try_call_bin_op_with_policy(\n    ++                    db,\n    ++                    env,\n    ++                    left_ty,\n    ++                    ast::Operator::BitOr,\n    ++                    right_ty,\n    ++                    MemberLookupPolicy::META_CLASS_NO_TYPE_FALLBACK,\n    ++                )\n    ++                .map(|call| call.into_result(db));\n    ++                state.record_operator_result(result.as_ref())\n    ++            }\n    + \n    +             // We've handled all of the special cases that we support for literals, so we need to\n    +             // fall back on looking for dunder methods on one of the operand types.\n```\n",
        "outcome": "approved",
        "approvedAt": "2026-11-25T12:41:14.101073Z"
      },
      {
        "kind": "amendment",
        "status": "posted",
        "head": "88b15ebe27958d0cdac952904b9f4d497c0a0d18",
        "baseHead": "0af5b7f2e02fa2efddd6b6ff0cc1e37af09142b9",
        "url": "https://github.com/tamird/ruff/commit/88b15ebe27958d0cdac952904b9f4d497c0a0d18",
        "title": "Published arithmetic amendment range-diff",
        "summary": "Approved 88b15ebe is published on PR #30898; current GitHub checks are recorded separately.",
        "body": "Review the replacement for Ruff #30898: published `0af5b7f2e` \u2192 proposed `88b15ebe27`. Both commits use upstream `3f63e8b36` as their base.\n\nThe revision handles `NotImplemented` in ordinary and reflected arithmetic as well as augmented assignments. Existing successful-result annotations and parameter-based fallback remain supported. Direct method calls retain their original return types. Callability errors block reflection; methods on two operands with the same known runtime class are not retried as reflected calls.\n\nThe original two regression fixtures fail on published `0af5b7f2e`. The candidate passes core 86, semantic 539 (35 ignored), IDE 1,964, all 532 default Markdown tests, canonical hooks, formatting and strict Clippy. [Qualification](https://app.buildbuddy.io/invocation/f6a9e652-fe1f-4866-b3f2-251ac7fa181d); [published-head controls](https://app.buildbuddy.io/invocation/dd07a677-6774-4678-89c6-55ccc1bb30fb).\n\n[Read the complete proposed commit](https://github.com/tamird/ruff/commit/88b15ebe27958d0cdac952904b9f4d497c0a0d18).\n\n## Changes from the submitted commit\n\nThis is Git's actual paired range-diff of the two single-commit proposals.\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 3f63e8b368924bb58875a7590e07f667805839a5..0af5b7f2e02fa2efddd6b6ff0cc1e37af09142b9 3f63e8b368924bb58875a7590e07f667805839a5..88b15ebe27958d0cdac952904b9f4d497c0a0d18\n```\n\n```diff\n1:  0af5b7f2e0 ! 1:  88b15ebe27 [ty] Honor NotImplemented in augmented assignments\n    @@ Metadata\n     Author: Tamir Duberstein <tamird@gmail.com>\n     \n      ## Commit message ##\n    -    [ty] Honor NotImplemented in augmented assignments\n    +    [ty] Honor NotImplemented in binary operators\n     \n    -    An in-place method can return NotImplemented to request the ordinary\n    -    binary operation. That result was instead assigned to the target,\n    -    bypassing ordinary and reflected dispatch and missing unsupported-operand\n    -    errors.\n    +    Binary dispatch stopped when a method returned NotImplemented, so\n    +    arithmetic could infer the sentinel instead of trying a reflected method\n    +    or reporting an unsupported operation. The in-place fallback could\n    +    expose the same result after __iadd__ declined.\n     \n    -    Remove the sentinel alternatives and use the existing binary dispatch for\n    -    them. Retain other return alternatives and the fallback for conditionally\n    -    defined in-place methods.\n    +    Treat NotImplemented as a request to continue dispatch, preserving other\n    +    return alternatives when fallback succeeds. Conditionally defined\n    +    methods also retain their own return types alongside the fallback. Reuse\n    +    this partition for in-place results. Keep original call bindings for\n    +    navigation and retain deprecation warnings from methods that decline the\n    +    operation.\n    +\n    +    Distinguish unavailable methods from methods that may not be callable;\n    +    the latter can raise before reflection. Suppress reflected calls when\n    +    both operands have the same exact runtime class [1]. This includes\n    +    different specializations of a final generic class.\n    +\n    +    Conventional successful-result annotations and parameter-based fallback\n    +    remain supported; direct method calls keep their annotated or inferred\n    +    return types. This does not change the annotation validation discussed\n    +    in [2].\n    +\n    +    [1]: https://docs.python.org/3/reference/datamodel.html#object.__radd__\n    +    [2]: https://github.com/astral-sh/ty/issues/1150\n     \n      ## crates/ty_python_semantic/resources/mdtest/assignment/augmented.md ##\n     @@ crates/ty_python_semantic/resources/mdtest/assignment/augmented.md: x += \"Hello\"\n    @@ crates/ty_python_semantic/resources/mdtest/assignment/augmented.md: x += \"Hello\"\n     +Returning `NotImplemented` requests ordinary binary dispatch, including the reflected method. The\n     +sentinel is never assigned to the target; other in-place return alternatives are retained.\n     +\n    ++```toml\n    ++[analysis]\n    ++return-type-inference = \"always\"\n    ++```\n    ++\n     +```py\n     +from types import NotImplementedType\n    ++from typing import final\n     +\n     +InPlaceResult = int | NotImplementedType\n     +\n    ++@final\n     +class Left:\n    -+    def __iadd__(self, other: object) -> NotImplementedType:\n    ++    def __iadd__(self, other: object):\n     +        return NotImplemented\n     +\n     +    def __add__(self, other: int) -> str:\n     +        return \"added\"\n     +\n     +class Right:\n    -+    def __radd__(self, other: Left) -> bytes:\n    ++    def __radd__(self, other: object) -> bytes:\n     +        return b\"reflected\"\n     +\n     +left = Left()\n    @@ crates/ty_python_semantic/resources/mdtest/assignment/augmented.md: x += \"Hello\"\n     +mixed = Mixed()\n     +mixed += 1\n     +reveal_type(mixed)  # revealed: int | str\n    ++\n    ++@final\n    ++class Declines:\n    ++    def __iadd__(self, other: object) -> NotImplementedType:\n    ++        return NotImplemented\n    ++\n    ++    def __add__(self, other: object):\n    ++        return NotImplemented\n    ++\n    ++both = Declines()\n    ++both += Right()\n    ++reveal_type(both)  # revealed: bytes\n     +```\n     +\n      ## Unsupported types\n      \n      ```py\n     \n    + ## crates/ty_python_semantic/resources/mdtest/binary/instances.md ##\n    +@@ crates/ty_python_semantic/resources/mdtest/binary/instances.md: class GenericChild(GenericBase[T]):\n    + def add_generic(left: GenericBase[int], right: GenericChild[str]) -> Literal[\"left\", \"right\"]:\n    +     reveal_type(left + right)  # revealed: Literal[\"right\", \"left\"]\n    +     return left + right\n    ++\n    ++from types import NotImplementedType\n    ++from typing import final\n    ++\n    ++@final\n    ++class Box(Generic[T]):\n    ++    value: T\n    ++\n    ++    def __add__(self, other: object) -> NotImplementedType:\n    ++        return NotImplemented\n    ++\n    ++    def __radd__(self, other: object) -> int:\n    ++        return 1\n    ++\n    ++def same_runtime_class(left: Box[int], right: Box[str]):\n    ++    # error: [unsupported-operator]\n    ++    reveal_type(left + right)  # revealed: Unknown\n    + ```\n    + \n    + ## Class objects use their metaclasses for reflected precedence\n    +@@ crates/ty_python_semantic/resources/mdtest/binary/instances.md: class B:\n    + reveal_type(A() - B())  # revealed: B\n    + ```\n    + \n    ++## Methods returning `NotImplemented`\n    ++\n    ++An explicit or inferred `NotImplemented` return tries the next method. Direct calls retain the\n    ++method's return type:\n    ++\n    ++```toml\n    ++[analysis]\n    ++return-type-inference = \"always\"\n    ++```\n    ++\n    ++```py\n    ++from types import NotImplementedType\n    ++from typing import final\n    ++\n    ++class Reflected:\n    ++    def __radd__(self, other: object) -> int:\n    ++        return 1\n    ++\n    ++@final\n    ++class Inferred:\n    ++    def __add__(self, other: object):\n    ++        if isinstance(other, bytes):\n    ++            return other\n    ++        return NotImplemented\n    ++\n    ++reveal_type(Inferred().__add__(Reflected()))  # revealed: bytes | NotImplementedType\n    ++reveal_type(Inferred() + Reflected())  # revealed: bytes | int\n    ++\n    ++# error: [unsupported-operator]\n    ++reveal_type(Inferred() + object())  # revealed: Unknown\n    ++\n    ++class Declines:\n    ++    def __add__(self, other: object) -> NotImplementedType:\n    ++        return NotImplemented\n    ++\n    ++    def __radd__(self, other: object) -> int:\n    ++        return 1\n    ++\n    ++reveal_type(Declines() + Reflected())  # revealed: int\n    ++\n    ++# Reflected methods are not tried for two operands of the same runtime type.\n    ++# error: [unsupported-operator]\n    ++reveal_type(Declines() + Declines())  # revealed: Unknown\n    ++\n    ++class Refuses:\n    ++    def __radd__(self, other: object) -> NotImplementedType:\n    ++        return NotImplemented\n    ++\n    ++# error: [unsupported-operator]\n    ++reveal_type(Declines() + Refuses())  # revealed: Unknown\n    ++\n    ++class Blocked:\n    ++    __add__ = None\n    ++\n    ++# A non-callable method raises instead of trying the reflected method.\n    ++# error: [unsupported-operator]\n    ++reveal_type(Blocked() + Reflected())  # revealed: Unknown\n    ++```\n    ++\n    + ## Callable instances as dunders\n    + \n    + Believe it or not, this is supported at runtime:\n    +\n    + ## crates/ty_python_semantic/src/types/call.rs ##\n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> OperatorResult<'db> {\n    +         db: &'db dyn Db,\n    +         env: &ProgramEnvironment<'db>,\n    +         bindings: &Bindings<'db>,\n    ++    ) -> Self {\n    ++        Self::from_bindings_and_return_type(db, bindings, bindings.return_type(db, env))\n    ++    }\n    ++\n    ++    fn from_bindings_and_return_type(\n    ++        db: &'db dyn Db,\n    ++        bindings: &Bindings<'db>,\n    ++        return_type: Type<'db>,\n    +     ) -> Self {\n    +         Self {\n    +-            return_type: bindings.return_type(db, env),\n    ++            return_type,\n    +             deprecated_functions: bindings\n    +                 .deprecated_functions(db)\n    +                 .map(|(_, function)| function)\n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> OperatorResult<'db> {\n    +     }\n    + }\n    + \n    ++/// The methods called by a binary operation and its result after `NotImplemented` fallback.\n    ++///\n    ++/// Method bindings retain their original return types for IDE navigation. Arithmetic syntax\n    ++/// uses a separate result after `NotImplemented` fallback.\n    ++pub(crate) struct BinaryOperatorCall<'db> {\n    ++    pub(super) bindings: Bindings<'db>,\n    ++    pub(super) return_type: Type<'db>,\n    ++}\n    ++\n    ++impl<'db> BinaryOperatorCall<'db> {\n    ++    fn union(self, db: &'db dyn Db, env: &ProgramEnvironment<'db>, other: Self) -> Self {\n    ++        let Self {\n    ++            bindings: left,\n    ++            return_type: left_type,\n    ++        } = self;\n    ++        let Self {\n    ++            bindings: right,\n    ++            return_type: right_type,\n    ++        } = other;\n    ++        let callable_type =\n    ++            UnionType::from_two_elements(db, env, left.callable_type(), right.callable_type());\n    ++        Self {\n    ++            bindings: Bindings::from_union(callable_type, [left, right]),\n    ++            return_type: UnionType::from_two_elements(db, env, left_type, right_type),\n    ++        }\n    ++    }\n    ++\n    ++    pub(super) fn into_result(self, db: &'db dyn Db) -> OperatorResult<'db> {\n    ++        let Self {\n    ++            bindings,\n    ++            return_type,\n    ++        } = self;\n    ++        OperatorResult::from_bindings_and_return_type(db, &bindings, return_type)\n    ++    }\n    ++}\n    ++\n    ++#[expect(\n    ++    clippy::large_enum_variant,\n    ++    reason = \"Boxing adds an allocation to each successful call\"\n    ++)]\n    ++enum OperatorCallOutcome<'db> {\n    ++    Called {\n    ++        call: BinaryOperatorCall<'db>,\n    ++        /// The method can return `NotImplemented` or may not be defined at runtime.\n    ++        may_fall_through: bool,\n    ++    },\n    ++    Unavailable,\n    ++    Blocked,\n    ++}\n    ++\n    ++impl<'db> OperatorCallOutcome<'db> {\n    ++    fn into_error(self, db: &'db dyn Db) -> CallBinOpError<'db> {\n    ++        match self {\n    ++            Self::Called {\n    ++                call,\n    ++                may_fall_through: _,\n    ++            } => CallBinOpError::from_call(db, call),\n    ++            Self::Unavailable => CallBinOpError::default(),\n    ++            Self::Blocked => CallBinOpError::default(),\n    ++        }\n    ++    }\n    ++}\n    ++\n    ++fn operator_call_outcome<'db>(\n    ++    db: &'db dyn Db,\n    ++    env: &ProgramEnvironment<'db>,\n    ++    call: Result<Bindings<'db>, CallDunderError<'db>>,\n    ++) -> OperatorCallOutcome<'db> {\n    ++    let (bindings, possibly_unbound) = match call {\n    ++        Ok(bindings) => (bindings, false),\n    ++        Err(error) => match error {\n    ++            CallDunderError::PossiblyUnbound {\n    ++                bindings,\n    ++                unbound_on: _,\n    ++            } => (*bindings, true),\n    ++            CallDunderError::MethodNotAvailable => return OperatorCallOutcome::Unavailable,\n    ++            CallDunderError::CallError(kind, _, _) => match kind {\n    ++                // Calling a non-callable method can raise before reflection, even if other\n    ++                // possible method types are callable.\n    ++                CallErrorKind::NotCallable => return OperatorCallOutcome::Blocked,\n    ++                CallErrorKind::PossiblyNotCallable => return OperatorCallOutcome::Blocked,\n    ++                // Keep parameter-based fallback for the existing annotation convention.\n    ++                CallErrorKind::BindingError => return OperatorCallOutcome::Unavailable,\n    ++            },\n    ++        },\n    ++    };\n    ++    let (return_type, may_decline) = bindings.return_type(db, env).split_not_implemented(db, env);\n    ++    OperatorCallOutcome::Called {\n    ++        call: BinaryOperatorCall {\n    ++            bindings,\n    ++            return_type,\n    ++        },\n    ++        may_fall_through: may_decline || possibly_unbound,\n    ++    }\n    ++}\n    ++\n    ++fn resolve_ordered_operator_calls<'db>(\n    ++    db: &'db dyn Db,\n    ++    env: &ProgramEnvironment<'db>,\n    ++    first: OperatorCallOutcome<'db>,\n    ++    fallback: impl FnOnce() -> OperatorCallOutcome<'db>,\n    ++) -> Result<BinaryOperatorCall<'db>, CallBinOpError<'db>> {\n    ++    let first = match first {\n    ++        OperatorCallOutcome::Called {\n    ++            call,\n    ++            may_fall_through,\n    ++        } => {\n    ++            if !may_fall_through {\n    ++                return Ok(call);\n    ++            }\n    ++            Some(call)\n    ++        }\n    ++        OperatorCallOutcome::Unavailable => None,\n    ++        OperatorCallOutcome::Blocked => return Err(CallBinOpError::default()),\n    ++    };\n    ++    match fallback() {\n    ++        OperatorCallOutcome::Called {\n    ++            call: second,\n    ++            may_fall_through,\n    ++        } => {\n    ++            let call = match first {\n    ++                Some(first) => first.union(db, env, second),\n    ++                None => second,\n    ++            };\n    ++            if may_fall_through {\n    ++                Err(CallBinOpError::from_call(db, call))\n    ++            } else {\n    ++                Ok(call)\n    ++            }\n    ++        }\n    ++        OperatorCallOutcome::Unavailable => Err(match first {\n    ++            Some(call) => CallBinOpError::from_call(db, call),\n    ++            None => CallBinOpError::default(),\n    ++        }),\n    ++        OperatorCallOutcome::Blocked => Err(match first {\n    ++            Some(call) => CallBinOpError::from_call(db, call),\n    ++            None => CallBinOpError::default(),\n    ++        }),\n    ++    }\n    ++}\n    ++\n    ++fn resolve_possible_operator_calls<'db>(\n    ++    db: &'db dyn Db,\n    ++    env: &ProgramEnvironment<'db>,\n    ++    first: OperatorCallOutcome<'db>,\n    ++    second: OperatorCallOutcome<'db>,\n    ++) -> Result<BinaryOperatorCall<'db>, CallBinOpError<'db>> {\n    ++    let (call, may_fall_through) = match first {\n    ++        OperatorCallOutcome::Blocked => return Err(second.into_error(db)),\n    ++        OperatorCallOutcome::Unavailable => match second {\n    ++            OperatorCallOutcome::Called {\n    ++                call,\n    ++                may_fall_through,\n    ++            } => (call, may_fall_through),\n    ++            OperatorCallOutcome::Unavailable => return Err(CallBinOpError::default()),\n    ++            OperatorCallOutcome::Blocked => return Err(CallBinOpError::default()),\n    ++        },\n    ++        OperatorCallOutcome::Called {\n    ++            call: first,\n    ++            may_fall_through: first_declines,\n    ++        } => match second {\n    ++            OperatorCallOutcome::Called {\n    ++                call: second,\n    ++                may_fall_through: second_declines,\n    ++            } => (\n    ++                first.union(db, env, second),\n    ++                first_declines && second_declines,\n    ++            ),\n    ++            OperatorCallOutcome::Unavailable => (first, first_declines),\n    ++            OperatorCallOutcome::Blocked => return Err(CallBinOpError::from_call(db, first)),\n    ++        },\n    ++    };\n    ++    if may_fall_through {\n    ++        Err(CallBinOpError::from_call(db, call))\n    ++    } else {\n    ++        Ok(call)\n    ++    }\n    ++}\n    ++\n    + /// Whether the right operand's reflected method has priority based on the possible runtime\n    + /// classes of both operands.\n    + ///\n    +@@ crates/ty_python_semantic/src/types/call.rs: fn reflected_method_priority<'db>(\n    + }\n    + \n    + impl<'db> Type<'db> {\n    ++    /// Separate operator result values from a request to try another method.\n    ++    pub(super) fn split_not_implemented(\n    ++        self,\n    ++        db: &'db dyn Db,\n    ++        env: &ProgramEnvironment<'db>,\n    ++    ) -> (Self, bool) {\n    ++        let expanded = self.expand_top_level_aliases(db, env);\n    ++        let completing = match expanded {\n    ++            Type::Union(union) => union.filter(db, |ty| !ty.is_notimplemented(db)),\n    ++            ty => {\n    ++                if ty.is_notimplemented(db) {\n    ++                    Type::Never\n    ++                } else {\n    ++                    ty\n    ++                }\n    ++            }\n    ++        };\n    ++        if completing == expanded {\n    ++            (self, false)\n    ++        } else {\n    ++            (completing, true)\n    ++        }\n    ++    }\n    ++\n    +     /// Return the result of dispatching a rich comparison method between two operands.\n    +     ///\n    +     /// A strict subclass on the right takes precedence over the normal method on the left.\n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> Type<'db> {\n    + \n    +     /// Memoize the return type and deprecations from binary dunder resolution, without retaining\n    +     /// the full call bindings or repeating overload selection at each expression.\n    +-    /// Returns `None` if resolution fails; callers remain responsible for call-site diagnostics.\n    ++    /// Failed resolution retains called-method metadata;\n    ++    /// callers remain responsible for call-site diagnostics.\n    +     pub(crate) fn try_call_bin_op_result(\n    +         db: &'db dyn Db,\n    +         env: &ProgramEnvironment<'db>,\n    +         left_ty: Type<'db>,\n    +         op: ast::Operator,\n    +         right_ty: Type<'db>,\n    +-    ) -> Option<&'db OperatorResult<'db>> {\n    +-        #[salsa::tracked(returns(ref), cycle_initial=|_, _, _, _, _, _, _| None, heap_size=ruff_memory_usage::heap_size)]\n    ++    ) -> Result<&'db OperatorResult<'db>, &'db CallBinOpError<'db>> {\n    ++        #[salsa::tracked(returns(ref), cycle_initial=|_, _, _, _, _, _, _| Err(CallBinOpError::default()), heap_size=ruff_memory_usage::heap_size)]\n    +         fn try_call_bin_op_result_impl<'db>(\n    +             db: &'db dyn Db,\n    +             program: Program<'db>,\n    +             left_ty: Type<'db>,\n    +             op: ast::Operator,\n    +             right_ty: Type<'db>,\n    +-        ) -> Option<OperatorResult<'db>> {\n    ++        ) -> Result<OperatorResult<'db>, CallBinOpError<'db>> {\n    +             let env = &ProgramEnvironment::from_program(program);\n    +-            Type::try_call_bin_op(db, env, left_ty, op, right_ty)\n    +-                .ok()\n    +-                .map(|bindings| OperatorResult::from_bindings(db, env, &bindings))\n    ++            Type::try_call_bin_op(db, env, left_ty, op, right_ty).map(|call| call.into_result(db))\n    +         }\n    + \n    +         try_call_bin_op_result_impl(db, env.program(db), left_ty, op, right_ty).as_ref()\n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> Type<'db> {\n    +         left_ty: Type<'db>,\n    +         op: ast::Operator,\n    +         right_ty: Type<'db>,\n    +-    ) -> Result<Bindings<'db>, CallBinOpError> {\n    ++    ) -> Result<BinaryOperatorCall<'db>, CallBinOpError<'db>> {\n    +         Self::try_call_bin_op_with_policy(\n    +             db,\n    +             env,\n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> Type<'db> {\n    +         op: ast::Operator,\n    +         right_ty: Type<'db>,\n    +         policy: MemberLookupPolicy,\n    +-    ) -> Result<Bindings<'db>, CallBinOpError> {\n    +-        // We either want to call lhs.__op__ or rhs.__rop__. The full decision tree from\n    +-        // the Python spec [1] is:\n    +-        //\n    +-        //   - If rhs is a (proper) subclass of lhs, and it provides a different\n    +-        //     implementation of __rop__, use that.\n    +-        //   - Otherwise, if lhs implements __op__, use that.\n    +-        //   - Otherwise, if lhs and rhs are different types, and rhs implements __rop__,\n    +-        //     use that.\n    +-        //\n    +-        // [1] https://docs.python.org/3/reference/datamodel.html#object.__radd__\n    +-\n    +-        // Runtime classes determine reflected priority, but static operand types may only\n    +-        // establish that priority conditionally.\n    ++    ) -> Result<BinaryOperatorCall<'db>, CallBinOpError<'db>> {\n    ++        // A different reflected implementation on a proper subclass is tried first.\n    ++        // A method that returns NotImplemented lets the next method run; parameter\n    ++        // binding failures retain their existing fallback behavior.\n    ++        let call_dunder = |receiver: Type<'db>, argument: Type<'db>, name| {\n    ++            operator_call_outcome(\n    ++                db,\n    ++                env,\n    ++                receiver.try_call_dunder_with_policy(\n    ++                    db,\n    ++                    env,\n    ++                    name,\n    ++                    &mut CallArguments::positional([argument]),\n    ++                    TypeContext::default(),\n    ++                    policy,\n    ++                ),\n    ++            )\n    ++        };\n    ++        let call_left = || call_dunder(left_ty, right_ty, op.dunder());\n    ++        let call_right = || {\n    ++            if left_ty == right_ty {\n    ++                return OperatorCallOutcome::Unavailable;\n    ++            }\n    ++            // Different specializations can still have the same exact runtime class.\n    ++            let same_runtime_class = has_exact_runtime_class(db, env, left_ty)\n    ++                && has_exact_runtime_class(db, env, right_ty)\n    ++                && operator_dispatch_class(db, env, left_ty)\n    ++                    .zip(operator_dispatch_class(db, env, right_ty))\n    ++                    .is_some_and(|(left, right)| left.class_literal(db) == right.class_literal(db));\n    ++            if same_runtime_class {\n    ++                OperatorCallOutcome::Unavailable\n    ++            } else {\n    ++                call_dunder(right_ty, left_ty, op.reflected_dunder())\n    ++            }\n    ++        };\n    +         let reflected_priority = reflected_method_priority(db, env, left_ty, right_ty);\n    +-\n    +-        let left_class = left_ty.to_meta_type(db, env);\n    +-        let right_class = right_ty.to_meta_type(db, env);\n    +         if reflected_priority != ReflectedMethodPriority::Never {\n    +             let reflected_dunder = op.reflected_dunder();\n    ++            let left_class = left_ty.to_meta_type(db, env);\n    ++            let right_class = right_ty.to_meta_type(db, env);\n    +             let rhs_reflected = right_class.member(db, env, reflected_dunder).place;\n    +-            // TODO: if `rhs_reflected` is possibly unbound, we should union the two possible\n    +-            // Bindings together\n    +             if !rhs_reflected.is_undefined()\n    +                 && !rhs_reflected.is_equal_ignoring_provenance(\n    +                     left_class.member(db, env, reflected_dunder).place,\n    +                 )\n    +             {\n    +-                let call_on_right_instance = right_ty.try_call_dunder_with_policy(\n    +-                    db,\n    +-                    env,\n    +-                    reflected_dunder,\n    +-                    &mut CallArguments::positional([left_ty]),\n    +-                    TypeContext::default(),\n    +-                    policy,\n    +-                );\n    +-\n    +                 if reflected_priority == ReflectedMethodPriority::Definitely {\n    +-                    return Ok(call_on_right_instance.or_else(|_| {\n    +-                        left_ty.try_call_dunder_with_policy(\n    +-                            db,\n    +-                            env,\n    +-                            op.dunder(),\n    +-                            &mut CallArguments::positional([right_ty]),\n    +-                            TypeContext::default(),\n    +-                            policy,\n    +-                        )\n    +-                    })?);\n    ++                    return resolve_ordered_operator_calls(db, env, call_right(), call_left);\n    +                 }\n    +-\n    +-                let call_on_left_instance = left_ty.try_call_dunder_with_policy(\n    +-                    db,\n    +-                    env,\n    +-                    op.dunder(),\n    +-                    &mut CallArguments::positional([right_ty]),\n    +-                    TypeContext::default(),\n    +-                    policy,\n    +-                );\n    +-\n    +-                return match (call_on_right_instance, call_on_left_instance) {\n    +-                    (Ok(right_bindings), Ok(left_bindings)) => {\n    +-                        let callable_type = UnionType::from_two_elements(\n    +-                            db,\n    +-                            env,\n    +-                            right_bindings.callable_type(),\n    +-                            left_bindings.callable_type(),\n    +-                        );\n    +-                        Ok(Bindings::from_union(\n    +-                            callable_type,\n    +-                            [right_bindings, left_bindings],\n    +-                        ))\n    +-                    }\n    +-                    (Ok(bindings), Err(_)) | (Err(_), Ok(bindings)) => Ok(bindings),\n    +-                    (Err(_), Err(error)) => Err(error.into()),\n    +-                };\n    ++                // Either method may have runtime priority. Both are evaluated once; if\n    ++                // either always completes, neither ordering can exhaust both methods.\n    ++                return resolve_possible_operator_calls(db, env, call_right(), call_left());\n    +             }\n    +         }\n    +-\n    +-        let call_on_left_instance = left_ty.try_call_dunder_with_policy(\n    +-            db,\n    +-            env,\n    +-            op.dunder(),\n    +-            &mut CallArguments::positional([right_ty]),\n    +-            TypeContext::default(),\n    +-            policy,\n    +-        );\n    +-\n    +-        call_on_left_instance.or_else(|_| {\n    +-            if left_ty == right_ty {\n    +-                Err(CallBinOpError::NotSupported)\n    +-            } else {\n    +-                Ok(right_ty.try_call_dunder_with_policy(\n    +-                    db,\n    +-                    env,\n    +-                    op.reflected_dunder(),\n    +-                    &mut CallArguments::positional([left_ty]),\n    +-                    TypeContext::default(),\n    +-                    policy,\n    +-                )?)\n    +-            }\n    +-        })\n    ++        resolve_ordered_operator_calls(db, env, call_left(), call_right)\n    +     }\n    + }\n    + \n    +@@ crates/ty_python_semantic/src/types/call.rs: impl<'db> CallDunderError<'db> {\n    +     }\n    + }\n    + \n    +-#[derive(Debug)]\n    +-pub(crate) enum CallBinOpError {\n    +-    /// The dunder attribute exists but it can't be called with the given arguments.\n    +-    ///\n    +-    /// This includes non-callable dunder attributes that are possibly unbound.\n    +-    CallError,\n    +-\n    +-    NotSupported,\n    ++/// Called-method metadata retained when a binary operation is unsupported.\n    ++#[derive(Clone, Debug, Default, PartialEq, Eq, get_size2::GetSize, salsa::SalsaValue)]\n    ++pub(crate) struct CallBinOpError<'db> {\n    ++    /// Includes methods that were called but returned only `NotImplemented`.\n    ++    pub(super) deprecated_functions: Box<[OverloadLiteral<'db>]>,\n    + }\n    + \n    +-impl From<CallDunderError<'_>> for CallBinOpError {\n    +-    fn from(value: CallDunderError<'_>) -> Self {\n    +-        match value {\n    +-            CallDunderError::CallError(_, _, _) => Self::CallError,\n    +-            CallDunderError::MethodNotAvailable | CallDunderError::PossiblyUnbound { .. } => {\n    +-                CallBinOpError::NotSupported\n    +-            }\n    ++impl<'db> CallBinOpError<'db> {\n    ++    fn from_call(db: &'db dyn Db, call: BinaryOperatorCall<'db>) -> Self {\n    ++        Self {\n    ++            deprecated_functions: call.into_result(db).deprecated_functions,\n    +         }\n    +     }\n    + }\n    +\n    + ## crates/ty_python_semantic/src/types/ide_support.rs ##\n    +@@ crates/ty_python_semantic/src/types/ide_support.rs: pub fn definitions_for_bin_op<'db>(\n    +     let left_ty = binary_op.left.inferred_type(model)?;\n    +     let right_ty = binary_op.right.inferred_type(model)?;\n    +     let env = &model.program_environment();\n    +-    let Ok(bindings) = Type::try_call_bin_op(db, env, left_ty, binary_op.op, right_ty) else {\n    ++    let Ok(call) = Type::try_call_bin_op(db, env, left_ty, binary_op.op, right_ty) else {\n    +         return None;\n    +     };\n    ++    let bindings = call.bindings;\n    + \n    +     let callable_type = promote_for_self(db, env, bindings.callable_type());\n    + \n    +\n      ## crates/ty_python_semantic/src/types/infer/builder.rs ##\n     @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {\n                          &mut |builder, (_, _, tcx)| infer_value_ty(builder, tcx),\n    @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInfere\n                                  value_ty,\n                              );\n     -                        Err(bindings.return_type(db, env))\n    -+                        return Err(bindings.return_type(db, env));\n    ++                        let (return_type, may_decline) =\n    ++                            bindings.return_type(db, env).split_not_implemented(db, env);\n    ++                        return Err(if may_decline {\n    ++                            UnionType::from_two_elements(db, env, return_type, Type::unknown())\n    ++                        } else {\n    ++                            return_type\n    ++                        });\n                          }\n     +                };\n     +                state.deprecated_functions.extend(\n    @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInfere\n     +                        .map(|(_, function)| function),\n     +                );\n     +\n    -+                // Returning NotImplemented requests the ordinary binary operation; it is\n    -+                // never assigned back to the target. Other return alternatives still apply.\n    -+                let return_ty = outcome.return_type(db, env);\n    -+                let expanded_return_ty = return_ty.expand_top_level_aliases(db, env);\n    -+                let assigned_ty = match expanded_return_ty {\n    -+                    Type::Union(union) => union.filter(db, |ty| !ty.is_notimplemented(db)),\n    -+                    ty => {\n    -+                        if ty.is_notimplemented(db) {\n    -+                            Type::Never\n    -+                        } else {\n    -+                            ty\n    -+                        }\n    -+                    }\n    -+                };\n    -+                let assigned_ty = if assigned_ty == expanded_return_ty {\n    -+                    if !possibly_unbound {\n    -+                        return Ok(return_ty);\n    -+                    }\n    -+                    return_ty\n    -+                } else {\n    -+                    assigned_ty\n    -+                };\n    ++                let (assigned_ty, may_decline) =\n    ++                    outcome.return_type(db, env).split_not_implemented(db, env);\n    ++                if !possibly_unbound && !may_decline {\n    ++                    return Ok(assigned_ty);\n    ++                }\n     +\n     +                let value_ty = outcome.type_for_argument(&call_arguments, 0);\n     +                match binary_return_ty(self, value_ty, state) {\n    @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInfere\n                      }\n                  }\n              }\n    +\n    + ## crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs ##\n    +@@ crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs: use compact_str::CompactString;\n    + use ruff_python_ast::{self as ast, AnyNodeRef};\n    + \n    + use super::TypeInferenceBuilder;\n    +-use crate::types::call::CallArguments;\n    ++use crate::types::call::{CallArguments, CallBinOpError, OperatorResult};\n    + use crate::types::constraints::ConstraintSetBuilder;\n    + use crate::types::cyclic::CycleDetector;\n    + use crate::types::diagnostic::{\n    +@@ crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs: pub(super) struct BinaryInferenceState<'db> {\n    + }\n    + \n    + impl<'db> BinaryInferenceState<'db> {\n    ++    fn record_operator_result(\n    ++        &mut self,\n    ++        result: Result<&OperatorResult<'db>, &CallBinOpError<'db>>,\n    ++    ) -> Option<Type<'db>> {\n    ++        match result {\n    ++            Ok(result) => {\n    ++                self.deprecated_functions\n    ++                    .extend(&result.deprecated_functions);\n    ++                Some(result.return_type)\n    ++            }\n    ++            Err(error) => {\n    ++                self.deprecated_functions\n    ++                    .extend(&error.deprecated_functions);\n    ++                None\n    ++            }\n    ++        }\n    ++    }\n    ++\n    +     fn tuple_alternative_count(db: &'db dyn Db, ty: Type<'db>) -> usize {\n    +         match ty {\n    +             Type::Union(union) => union\n    +@@ crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs: impl<'db> TypeInferenceBuilder<'db, '_> {\n    +             left_ty,\n    +             op,\n    +             right_ty,\n    +-        )?;\n    +-        state\n    +-            .deprecated_functions\n    +-            .extend(&result.deprecated_functions);\n    +-        Some(result.return_type)\n    ++        );\n    ++        state.record_operator_result(result)\n    +     }\n    + \n    +     /// Infer the result type and collect deprecated methods for the enclosing operation.\n    +@@ crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs: impl<'db> TypeInferenceBuilder<'db, '_> {\n    +                 _,\n    +                 Type::ClassLiteral(..) | Type::GenericAlias(..) | Type::SubclassOf(..),\n    +                 ast::Operator::BitOr,\n    +-            ) => Type::try_call_bin_op_with_policy(\n    +-                db,\n    +-                env,\n    +-                left_ty,\n    +-                ast::Operator::BitOr,\n    +-                right_ty,\n    +-                MemberLookupPolicy::META_CLASS_NO_TYPE_FALLBACK,\n    +-            )\n    +-            .ok()\n    +-            .map(|binding| {\n    +-                state.deprecated_functions.extend(\n    +-                    binding\n    +-                        .deprecated_functions(db)\n    +-                        .map(|(_, function)| function),\n    +-                );\n    +-                binding.return_type(db, env)\n    +-            }),\n    ++            ) => {\n    ++                let result = Type::try_call_bin_op_with_policy(\n    ++                    db,\n    ++                    env,\n    ++                    left_ty,\n    ++                    ast::Operator::BitOr,\n    ++                    right_ty,\n    ++                    MemberLookupPolicy::META_CLASS_NO_TYPE_FALLBACK,\n    ++                )\n    ++                .map(|call| call.into_result(db));\n    ++                state.record_operator_result(result.as_ref())\n    ++            }\n    + \n    +             // We've handled all of the special cases that we support for literals, so we need to\n    +             // fall back on looking for dunder methods on one of the operand types.\n```\n",
        "outcome": "posted",
        "approvedAt": "2026-11-25T12:41:14.101073Z",
        "postedURL": "https://github.com/astral-sh/ruff/pull/30898",
        "postedAt": "2026-11-25T12:41:14.101073Z"
      }
    ],
    "refinement": {
      "before": {
        "head": "0af5b7f2e02fa2efddd6b6ff0cc1e37af09142b9"
      },
      "after": {
        "head": "88b15ebe27958d0cdac952904b9f4d497c0a0d18"
      }
    }
  },
  {
    "id": "fresh-collection-callback-context",
    "ref": "upstream/fresh-collection-context-75fabee2",
    "title": "Infer fresh collection argument contexts",
    "state": "Assessment in progress",
    "source": "ba712134db00258728314f30ae2a70d69de8728d",
    "summary": "Fresh collection arguments keep literal types supplied by other arguments in generic calls. Incompatible hints fall back to ordinary inference.",
    "qualifiedBase": "75fabee2e0a069b6bf5a1af4226025afa0324fa5",
    "qualifiedHead": "ba712134db00258728314f30ae2a70d69de8728d",
    "qualifiedCommitCount": 1,
    "qualifiedURL": "https://github.com/tamird/ruff/commit/ba712134db00258728314f30ae2a70d69de8728d",
    "qualification": {
      "summary": "Historical qualification for ba712: Core, semantic and IDE tests, style and all 532 default Markdown cases pass on 75fabee2. Current-parent attrs checks used same-worker ABBA with 30 samples per phase: 405.077 to 415.182 ms (+2.495%), with all 45 diagnostics byte-identical. This is one maintained workload; three untimed helper entries do not prove projection reuse, benefit or broad performance neutrality. Optimized no-LTO stress checks cost 12.0% more for 256 homogeneous arguments, 19.6% for alternating types and 16.2% for 1,500 rejected hints. Both focused lambda probes are rejected by parent and proposal: the same-key pair has the identical int.lower error; the callback-list variant changes invalid-argument-type to a missing-attribute error inside the lambda. Neither demonstrates a newly rejected valid call or broadly resolves the speculative-diagnostics question. The earlier cd2 attrs evidence is historical and exercised only two hint attempts.",
      "evidence": [
        {
          "label": "75fabee2: native suites, style and all 532 Markdown cases",
          "url": "https://app.buildbuddy.io/invocation/0fe3d6a1-9b2c-46d2-b18f-080dd07a501d"
        },
        {
          "label": "Current 75f parent versus ba712: attrs ABBA and identical 45 diagnostics",
          "url": "https://app.buildbuddy.io/invocation/f0f911a0-d824-4172-8334-e7705a4f238f"
        },
        {
          "label": "75fabee2: four optimized no-LTO stress workloads",
          "url": "https://app.buildbuddy.io/invocation/7092fd82-a176-46b5-835d-cbb0bbcfee09"
        },
        {
          "label": "75fabee2: alternating 256-argument control",
          "url": "https://app.buildbuddy.io/invocation/6dc7e19e-2db1-4835-b927-8083fc1d1ec7"
        },
        {
          "label": "Same-key TypedDict lambda: identical rejection on parent and proposal",
          "url": "https://app.buildbuddy.io/invocation/aa34b3ee-ca23-4175-86b8-222152944556"
        },
        {
          "label": "Callback-list lambda: both revisions reject with different diagnostics",
          "url": "https://app.buildbuddy.io/invocation/454468bc-85ff-46e5-ad86-5dbd9d332c7d"
        },
        {
          "label": "Earlier cd2 base: attrs cold check and unchanged diagnostics",
          "url": "https://app.buildbuddy.io/invocation/634403bf-91ee-4103-b845-d57d42b61243"
        }
      ]
    },
    "nextAction": "Simplify the design and prepare smaller, independently reviewable contributions. Do not bring the 749-line ba712 proposal back for review or merely split it cosmetically. Preserve independently declared literal donors inside fresh displays and final validation; contextual promotability does not establish an independent donor. The existing evidence is historical, not approval of the architecture."
  },
  {
    "id": "exception-tuple-alias-projection",
    "ref": "upstream/resolve-exception-tuple-aliases",
    "title": "Preserve exception types through tuple aliases",
    "state": "Merged",
    "source": "e752397a71030a39868a43a682835508238e3afd",
    "summary": "Merged by AlexWaygood on November 22, 2026 as Ruff #30758. The approved e752397 revision resolves the outer exception type alias once, preserving class and tuple alternatives in the caught value.",
    "qualifiedBase": "f31dd86f222f7d978a65cfc453eaf88f11456ed7",
    "qualifiedHead": "e752397a71030a39868a43a682835508238e3afd",
    "qualifiedCommitCount": 1,
    "qualifiedURL": "https://github.com/tamird/ruff/commit/e752397a71030a39868a43a682835508238e3afd",
    "qualification": {
      "summary": "The current e752397 amendment passes the whole exception fixture, both legacy and PEP695 alias fixtures, semantic tests (515 passed, 35 ignored), canonical hooks, formatting and strict Clippy. The added finite class-or-tuple union assertion fails on submitted 918 and passes with this revision. Earlier 918 core, IDE and full Markdown results remain historical evidence; they are not a new full-suite claim for e752397.",
      "evidence": [
        {
          "label": "Qualified contribution",
          "url": "https://github.com/tamird/ruff/commit/9188597e94983c89c39c386cb6d8a1c603d6bad5"
        },
        {
          "label": "Native and all 532 default Markdown cases",
          "url": "https://app.buildbuddy.io/invocation/731e2166-7327-4bcb-b58b-ec72235f39d7"
        },
        {
          "label": "Proposed e752397 amendment: resolve the alias once",
          "url": "https://github.com/tamird/ruff/commit/e752397a71030a39868a43a682835508238e3afd"
        },
        {
          "label": "e752397 amendment: matched regression, exception/alias fixtures, semantic tests and style",
          "url": "https://app.buildbuddy.io/invocation/f85ed6ea-83fa-436d-9eba-468ac1c7c9ac"
        }
      ]
    },
    "settledReviews": [
      {
        "kind": "proposal",
        "head": "9188597e94983c89c39c386cb6d8a1c603d6bad5",
        "url": "https://github.com/tamird/ruff/commit/9188597e94983c89c39c386cb6d8a1c603d6bad5",
        "outcome": "approved",
        "summary": "Tamir approved this exact commit for upstream submission."
      },
      {
        "kind": "amendment",
        "head": "e752397a71030a39868a43a682835508238e3afd",
        "baseHead": "9188597e94983c89c39c386cb6d8a1c603d6bad5",
        "url": "https://github.com/tamird/ruff/commit/e752397a71030a39868a43a682835508238e3afd",
        "title": "Review the exception-alias revision for PR #30758",
        "summary": "Tamir approved the exact e752397 amendment for PR #30758; it is now the published head.",
        "body": "Review the amendment to PR #30758. The PR still publishes `9188597`; this proposed replacement is `e752397`. The earlier approval does not cover the amendment.\n\nAlex requested resolving the outer alias once before class, tuple, union and intersection handling. The added class-or-tuple union assertion fails on the published commit and passes on the amendment. Whole exception and both alias fixtures, semantic tests (515 passed, 35 ignored), hooks, formatting and strict Clippy pass. [Qualification](https://app.buildbuddy.io/invocation/f85ed6ea-83fa-436d-9eba-468ac1c7c9ac).\n\n## Changes from the submitted commit\n\nThis is Git\u2019s actual range-diff of the two single-commit proposals on the same base. The pairing option matches the replacement commit with its predecessor.\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 f31dd86f222f7d978a65cfc453eaf88f11456ed7..9188597e94983c89c39c386cb6d8a1c603d6bad5 f31dd86f222f7d978a65cfc453eaf88f11456ed7..e752397a71030a39868a43a682835508238e3afd\n```\n\n```diff\n1:  9188597e94 ! 1:  e752397a71 [ty] Resolve aliases of exception tuples\n    @@ Metadata\n     Author: Tamir Duberstein <tamird@gmail.com>\n     \n      ## Commit message ##\n    -    [ty] Resolve aliases of exception tuples\n    +    [ty] Resolve exception-handler aliases\n     \n    -    An except handler annotated with an alias of a tuple of exception\n    -    classes inferred BaseException for its caught value, losing the tuple\n    -    element types. The structural handler inspected the alias wrapper\n    -    instead of the tuple it described.\n    +    Aliases of exception tuples and class-or-tuple unions could infer\n    +    BaseException for the caught value, losing the exception types described\n    +    by the alias.\n     \n    -    Resolve aliases when projecting the tuple specification. Keep the\n    -    original type for union and assignability handling so this projection\n    -    does not add recursive traversal through union aliases. Extend the\n    -    existing alias fixture with a plain tuple alias beside the narrowed one.\n    +    Resolve the outermost alias once before dispatching to the existing\n    +    tuple, class, union and intersection projections. Extend the existing\n    +    alias fixture with plain tuple and class-or-tuple union cases beside the\n    +    narrowed tuple.\n     \n      ## crates/ty_python_semantic/resources/mdtest/exception/basic.md ##\n    +@@ crates/ty_python_semantic/resources/mdtest/exception/basic.md: def catch(classes: tuple[type[ValueError], ...] | tuple[type[RuntimeError], ...]\n    +         reveal_type(exc)  # revealed: ValueError | RuntimeError\n    + ```\n    + \n    +-## Type alias for a narrowed tuple of exception classes\n    ++## Aliases for exception classes and tuples\n    + \n    +-The caught type comes from the tuple described by the alias.\n    ++The caught type comes from the exception classes and tuple elements described by the alias.\n    + \n    + ```toml\n    + [environment]\n     @@ crates/ty_python_semantic/resources/mdtest/exception/basic.md: python-version = \"3.12\"\n      ```py\n      from ty_extensions import AlwaysFalsy, Intersection, Not\n      \n     +type Errors = tuple[type[ValueError], ...]\n      type NonemptyErrors = Intersection[tuple[type[ValueError], ...], Not[AlwaysFalsy]]\n    ++type MixedErrors = type[ValueError] | tuple[type[RuntimeError], ...]\n      \n     -def catch(classes: NonemptyErrors):\n    -+def catch(classes: NonemptyErrors, plain: Errors):\n    ++def catch(classes: NonemptyErrors, plain: Errors, mixed: MixedErrors):\n          try:\n              help()\n          except classes as exc:\n    @@ crates/ty_python_semantic/resources/mdtest/exception/basic.md: python-version =\n     +        help()\n     +    except plain as exc:\n     +        reveal_type(exc)  # revealed: ValueError\n    ++\n    ++    try:\n    ++        help()\n    ++    except mixed as exc:\n    ++        reveal_type(exc)  # revealed: ValueError | RuntimeError\n      ```\n      \n      ## Negated dynamic type aliases\n    @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInfere\n                  )\n              };\n      \n    --        if let Some(tuple_spec) = ty.tuple_instance_spec(db, env) {\n    -+        if let Some(tuple_spec) = ty.resolve_type_alias(db).tuple_instance_spec(db, env) {\n    ++        let ty = ty.resolve_type_alias(db);\n    ++\n    +         if let Some(tuple_spec) = ty.tuple_instance_spec(db, env) {\n                  infer_from_tuple(&tuple_spec)\n              } else if ty.is_assignable_to(db, env, type_base_exception) {\n    -             // `except ValueError as e:`\n    +@@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {\n    +         ) {\n    +             // A tuple can retain its element types in a positive intersection member after\n    +             // narrowing, for example `tuple[type[ValueError], ...] & ~AlwaysFalsy`.\n    +-            let caught = ty\n    +-                .resolve_type_alias(db)\n    +-                .as_intersection()\n    +-                .and_then(|intersection| {\n    +-                    intersection.bounded_filter_map_positive(db, env, |member| {\n    +-                        infer_from_tuple(member.tuple_instance_spec(db, env)?.as_ref())\n    +-                    })\n    +-                });\n    ++            let caught = ty.as_intersection().and_then(|intersection| {\n    ++                intersection.bounded_filter_map_positive(db, env, |member| {\n    ++                    infer_from_tuple(member.tuple_instance_spec(db, env)?.as_ref())\n    ++                })\n    ++            });\n    +             Some(caught.unwrap_or_else(|| KnownClass::BaseException.to_instance(db, env)))\n    +         } else {\n    +             None\n```\n\n[Read the complete proposed commit](https://github.com/tamird/ruff/commit/e752397a71030a39868a43a682835508238e3afd). No PR-head update or maintainer reply has been posted.",
        "outcome": "approved"
      }
    ],
    "number": 30758,
    "refinement": {
      "before": {
        "head": "9188597e94983c89c39c386cb6d8a1c603d6bad5"
      },
      "after": {
        "head": "e752397a71030a39868a43a682835508238e3afd"
      }
    },
    "merge": "acf15a39e2aa7b97ff7feda4fe94275447fa68ed"
  },
  {
    "id": "receiver-union-overload-selection",
    "ref": "review/receiver-union-screening",
    "title": "[ty] Widen builtins with falsy fallbacks",
    "state": "Submitted",
    "source": "7b148056cd81a79c3b67ce5afcfdcfba1e6f565a",
    "summary": "The approved revision widens inferred or expressions with matching fallbacks. Explicit truthiness unions retain their precision.",
    "qualifiedBase": "493fe0d6639f7e437e01814718ef094373a1bab3",
    "qualifiedHead": "7b148056cd81a79c3b67ce5afcfdcfba1e6f565a",
    "qualifiedCommitCount": 1,
    "qualifiedURL": "https://github.com/tamird/ruff/commit/7b148056cd81a79c3b67ce5afcfdcfba1e6f565a",
    "qualification": {
      "summary": "The reduced pytest-autoprofile case and explicit-annotation controls pass on RBE. Native suites, all 532 mdtests, formatting and strict Clippy pass. The two conditional and tuple split probes still produce the invariant-list error.",
      "evidence": [
        {
          "label": "CodSpeed simple_script report on delivered head",
          "url": "https://github.com/astral-sh/ruff/pull/30761#issuecomment-7173586551"
        },
        {
          "label": "Eight matched simple_script rounds on the exact CI trees",
          "url": "https://app.buildbuddy.io/invocation/7d45838c-76ff-45ce-9cd9-2700ae8a1d5f"
        },
        {
          "label": "Published inferred-or amendment",
          "url": "https://github.com/tamird/ruff/commit/7b148056cd81a79c3b67ce5afcfdcfba1e6f565a"
        },
        {
          "label": "Native suites and application, annotation, conditional and tuple controls",
          "url": "https://app.buildbuddy.io/invocation/617505e3-98eb-409a-a523-d5e68a065c2a"
        },
        {
          "label": "Alex’s review of the typeshed alternative",
          "url": "https://github.com/astral-sh/ruff/pull/30761#issuecomment-7167004660"
        },
        {
          "label": "Alex on consistency of public type forms",
          "url": "https://github.com/astral-sh/ruff/pull/30761#issuecomment-7167092595"
        },
        {
          "label": "Review notes for Alex’s feedback",
          "url": "https://github.com/tamird/sty/blob/main/docs/ruff-30761-review.md"
        },
        {
          "label": "RBE comparison of current stubs, stub-only change and published Ruff revision",
          "url": "https://app.buildbuddy.io/invocation/3a83c724-9a58-4307-89d3-e35cc8ea6063"
        },
        {
          "label": "Qualified three-type normalization commit",
          "url": "https://github.com/tamird/ruff/commit/142c9403b03b7e03d5559663823689da81cca214"
        },
        {
          "label": "All 532 fixtures with the complete three-file source tree",
          "url": "https://app.buildbuddy.io/invocation/ee240434-6ef4-4903-97f6-9bcf5497204b"
        },
        {
          "label": "Native suites and strict style",
          "url": "https://app.buildbuddy.io/invocation/52b055b4-21b5-4e81-b60c-75fb6c38f3d0"
        },
        {
          "label": "Matched published8a fallback controls",
          "url": "https://app.buildbuddy.io/invocation/c8d4ad79-c787-4c61-b380-076bcac0ca11"
        },
        {
          "label": "Approved and published 8a2c order-independent normalization commit",
          "url": "https://github.com/tamird/ruff/commit/8a2c814d3c7b236dee569aa55983ca2d06b84d0a"
        },
        {
          "label": "Published-head regression control, candidate whole fixture, native suites, all532 Markdown and strict style",
          "url": "https://app.buildbuddy.io/invocation/1670b6d4-8b0a-47e6-b460-35761f99e9b7"
        },
        {
          "label": "Carl’s insertion-order review request",
          "url": "https://github.com/astral-sh/ruff/pull/30761#discussion_r4672859828"
        },
        {
          "label": "Delivered 71295c conflict port",
          "url": "https://github.com/tamird/ruff/commit/71295c0e4f774078fbdd23c3c8636e5be92711d7"
        },
        {
          "label": "Current-base conflict-port qualification: native, 532 maintained Markdown and strict style",
          "url": "https://app.buildbuddy.io/invocation/f7becdd7-7793-4f88-9b8e-c1013a7cb1ce"
        },
        {
          "label": "Proposed edc8 complete replacement commit",
          "url": "https://github.com/tamird/ruff/commit/edc8e4990cd10109fadea84e15447438a7141a31"
        },
        {
          "label": "edc8: maintained532MD plus1temporary review fixture; core/semantic/IDE and strict style",
          "url": "https://app.buildbuddy.io/invocation/459a1ca0-d642-491d-970f-b35ccdbd261c"
        },
        {
          "label": "Carl: changes requested on submitted ce523",
          "url": "https://github.com/astral-sh/ruff/pull/30761#pullrequestreview-6013560748"
        },
        {
          "label": "Partial calls must retain receiver correlation",
          "url": "https://github.com/astral-sh/ruff/pull/30761#discussion_r4659214352"
        },
        {
          "label": "Property setters must retain individual accessor identity",
          "url": "https://github.com/astral-sh/ruff/pull/30761#discussion_r4659214358"
        },
        {
          "label": "Overload order can relate result and receiver",
          "url": "https://github.com/astral-sh/ruff/pull/30761#discussion_r4659214368"
        },
        {
          "label": "Separate receivers retain expansion behavior and budget",
          "url": "https://github.com/astral-sh/ruff/pull/30761#discussion_r4659214372"
        },
        {
          "label": "Narrow UnionBuilder empty-string reconstruction",
          "url": "https://github.com/astral-sh/ruff/pull/30761#discussion_r4659248502"
        },
        {
          "label": "Submitted ce523f7 commit",
          "url": "https://github.com/tamird/ruff/commit/ce523f7be15caa2f1dbcbdd16dfc1d64826fa47e"
        },
        {
          "label": "ce523f7: six whole fixtures, semantic tests, hooks and strict style",
          "url": "https://app.buildbuddy.io/invocation/3108c385-3841-4250-868f-e9b9bac86188"
        },
        {
          "label": "New 61c71bb single commit for review",
          "url": "https://github.com/tamird/ruff/commit/61c71bb62410ceb55c45c0f6d223c437858e07c1"
        },
        {
          "label": "61c71bb: six existing fixtures, semantic tests, hooks and strict style checks",
          "url": "https://app.buildbuddy.io/invocation/b2334840-f593-40d3-85b7-c08feadc29e5"
        },
        {
          "label": "Earlier d367: Review the qualified commit",
          "url": "https://github.com/tamird/ruff/commit/d367097750ddf7a8cd0f1e23b543cd3a8208af56"
        },
        {
          "label": "Earlier d367: Guard-preserving fix: native and all 532 default Markdown cases",
          "url": "https://app.buildbuddy.io/invocation/5fd38933-656b-48ca-9496-4bb62970bd88"
        },
        {
          "label": "Earlier d367: Existing enum fixture and final canonical hooks",
          "url": "https://app.buildbuddy.io/invocation/68523e7a-4661-400e-9e87-cbf65205f4f2"
        },
        {
          "label": "Earlier d367: Current Dulwich and SymPy: unchanged diagnostics",
          "url": "https://app.buildbuddy.io/invocation/2ad7d8d4-5061-4c34-a4ea-64a11df3bb10"
        }
      ]
    },
    "number": 30761,
    "settledReviews": [
      {
        "kind": "proposal",
        "head": "ce523f7be15caa2f1dbcbdd16dfc1d64826fa47e",
        "url": "https://github.com/tamird/ruff/commit/ce523f7be15caa2f1dbcbdd16dfc1d64826fa47e",
        "outcome": "approved",
        "title": "Approved receiver-union revision: 61c71bb to ce523f7",
        "summary": "Tamir approved this exact commit under the conditional LGTM after the requested predicate and comment changes were verified and qualified.",
        "body": "The requested receiver-union changes are qualified and submitted as [Ruff #30761](https://github.com/astral-sh/ruff/pull/30761). The unsupported-overload predicate allows an empty set, and comments explain the remaining screening and reconstruction. Tamir’s conditional approval is satisfied; this is review history, not a new decision request.\n\n## Changes from the previous proposal\n\nGit’s actual range-diff pairs the two single-commit proposals on the same base.\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 f31dd86f222f7d978a65cfc453eaf88f11456ed7..61c71bb62410ceb55c45c0f6d223c437858e07c1 f31dd86f222f7d978a65cfc453eaf88f11456ed7..ce523f7be15caa2f1dbcbdd16dfc1d64826fa47e\n```\n\n```diff\n1:  61c71bb624 ! 1:  ce523f7be1 [ty] Unify receivers of one bound method\n    @@ crates/ty_python_semantic/src/types/method.rs: impl<'db> BoundMethodType<'db> {\n     +            }\n     +        }\n     +        let signatures = first.unbound_signatures_with_inferred_return_type(db)?;\n    -+        if signatures.overloads.is_empty()\n    -+            || !signatures\n    -+                .overloads\n    -+                .iter()\n    -+                .all(|signature| signature.supports_receiver_union(db, env))\n    ++        // Parameters, returns, or predicates that depend on one receiver need separate bindings.\n    ++        if signatures\n    ++            .overloads\n    ++            .iter()\n    ++            .any(|signature| !signature.supports_receiver_union(db, env))\n     +        {\n     +            return None;\n     +        }\n    ++        // The shared overload matcher needs the full receiver union to determine its return type.\n     +        let receiver = UnionType::from_elements(\n     +            db,\n     +            env,\n    @@ crates/ty_python_semantic/src/types/method.rs: impl<'db> BoundMethodType<'db> {\n     +                method.self_instance(db)\n     +            }),\n     +        );\n    ++        // The identity checks let the first method retain the shared function and program.\n     +        Some(first.map_self_type(db, |_receiver| receiver))\n     +    }\n     +\n```\n\n[Read the complete commit](https://github.com/tamird/ruff/commit/ce523f7be15caa2f1dbcbdd16dfc1d64826fa47e)."
      },
      {
        "kind": "amendment",
        "status": "approved",
        "head": "edc8e4990cd10109fadea84e15447438a7141a31",
        "baseHead": "ce523f7be15caa2f1dbcbdd16dfc1d64826fa47e",
        "url": "https://github.com/tamird/ruff/commit/edc8e4990cd10109fadea84e15447438a7141a31",
        "title": "Review the narrow string-union replacement for PR #30761",
        "summary": "Tamir approved exact edc8e499 as the string-union replacement for PR #30761.",
        "body": "Review replacing submitted `ce523f7` with `edc8e499` on PR #30761. This removes the receiver-merging approach and implements Carl’s requested UnionBuilder fix: `(str & ~AlwaysFalsy) | Literal[\"\"]` becomes `str`. Nonempty fallbacks, additional intersection constraints and literal-string precision retain their existing handling.\n\nFor ordinary `str` annotations that include subclasses with a false-returning `__bool__`, this deliberately widens the modeled type; it is not an exact runtime-class claim.\n\nQualification passes all 532 maintained Markdown fixtures plus one temporary reviewer-case fixture, core 86, semantic 515 (35 ignored), IDE 1964, canonical hooks, formatting and strict Clippy. The temporary examples are not committed; network-backed modes were not separately qualified. [Qualification](https://app.buildbuddy.io/invocation/459a1ca0-d642-491d-970f-b35ccdbd261c).\n\n## Replacement range-diff\n\nThe complete paired comparison follows. PR #30761 remains at the old head until this replacement is approved.\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 f31dd86f222f7d978a65cfc453eaf88f11456ed7..ce523f7be15caa2f1dbcbdd16dfc1d64826fa47e f31dd86f222f7d978a65cfc453eaf88f11456ed7..edc8e4990cd10109fadea84e15447438a7141a31\n```\n\n```diff\n1:  ce523f7be1 ! 1:  edc8e4990c [ty] Unify receivers of one bound method\n    @@ Metadata\n     Author: Tamir Duberstein <tamird@gmail.com>\n     \n      ## Commit message ##\n    -    [ty] Unify receivers of one bound method\n    +    [ty] Simplify strings with empty fallbacks\n     \n    -    A boolean fallback could produce a union of bound methods for the same\n    -    function. Selecting overloads separately for each receiver chose a\n    -    LiteralString-specific return for str.split, even when another receiver\n    -    required the ordinary list[str] result.\n    +    Normalize `(str & ~AlwaysFalsy) | Literal[\"\"]` to `str` in the union\n    +    builder. This lets methods on `s or \"\"` use their ordinary `str` overloads\n    +    without combining bound methods from different receivers.\n     \n    -    Combine receiver alternatives before overload selection when they refer\n    -    to the same instance method and its signatures have no receiver-dependent\n    -    correlations. Preserve independent bindings for class methods, generic\n    -    correlations and predicates. Keep the original callable union for\n    -    diagnostics and reject alternatives with no matching overload.\n    +    Match only the builtin `str` core with the single truthiness exclusion,\n    +    and handle both insertion orders through the existing union reductions.\n    +    Nonempty fallbacks retain their truthiness narrowing, and a literal empty\n    +    receiver still selects LiteralString-specific overloads.\n     \n    - ## crates/ty_python_semantic/resources/mdtest/call/overloads.md ##\n    -@@ crates/ty_python_semantic/resources/mdtest/call/overloads.md: def narrowed(color: Color):\n    -         return\n    -     reveal_type(color.label())  # revealed: int | str\n    - \n    --def explicit(color: Literal[Color.GREEN, Color.BLUE]):\n    -+def explicit(\n    -+    color: Literal[Color.GREEN, Color.BLUE],\n    -+    unsupported: Literal[Color.RED, Color.GREEN],\n    -+):\n    -     reveal_type(color.label())  # revealed: int | str\n    -+    unsupported.label()  # error: [no-matching-overload]\n    - ```\n    - \n    - ### Expanding PEP 695 type alias\n    +    This deliberately widens the broad `str` annotation for subclasses that\n    +    override `__bool__` to return false. Other intersection constraints and\n    +    subclass-specific cores retain their original unions.\n     \n      ## crates/ty_python_semantic/resources/mdtest/expression/boolean.md ##\n     @@ crates/ty_python_semantic/resources/mdtest/expression/boolean.md: def _(foo: str):\n          reveal_type(False or False)  # revealed: Literal[False]\n          reveal_type(foo or False)  # revealed: (str & ~AlwaysFalsy) | Literal[False]\n          reveal_type(foo or True)  # revealed: (str & ~AlwaysFalsy) | Literal[True]\n    -+\n    -+    # Splitting str with an empty-string fallback still returns list[str].\n    ++    reveal_type(foo or \"\")  # revealed: str\n     +    reveal_type((foo or \"\").split())  # revealed: list[str]\n    ++    reveal_type(foo or \"fallback\")  # revealed: str & ~AlwaysFalsy\n     +\n     +# A literal receiver still selects the LiteralString overload.\n     +reveal_type(\"\".split())  # revealed: list[LiteralString]\n    @@ crates/ty_python_semantic/resources/mdtest/expression/boolean.md: def _(foo: str\n      \n      ## AND\n     \n    - ## crates/ty_python_semantic/src/types.rs ##\n    -@@ crates/ty_python_semantic/src/types.rs: impl<'db> Type<'db> {\n    -                 Binding::single(self, Signature::dynamic(self)).into()\n    -             }\n    + ## crates/ty_python_semantic/resources/mdtest/narrow/len.md ##\n    +@@ crates/ty_python_semantic/resources/mdtest/narrow/len.md: def _(x: Literal[\"foo\", \"\"] | list[int]):\n    +         reveal_type(x)  # revealed: Literal[\"\"] | list[int]\n    + ```\n      \n    --            // Note that this correctly returns `None` if none of the union elements are callable.\n    --            Type::Union(union) => Bindings::from_union(\n    --                self,\n    --                union.elements(db).iter().map(|element| {\n    --                    element.bindings_with_receiver(db, env, recursion_guard, receiver)\n    --                }),\n    --            ),\n    -+            // Select one function's overloads against all of its possible receivers together.\n    -+            Type::Union(union) => {\n    -+                if let Some(method) = BoundMethodType::from_receiver_union(db, env, union) {\n    -+                    return Type::BoundMethod(method)\n    -+                        .bindings_with_receiver(db, env, recursion_guard, receiver)\n    -+                        .with_callable_type(self);\n    -+                }\n    -+                Bindings::from_union(\n    -+                    self,\n    -+                    union.elements(db).iter().map(|element| {\n    -+                        element.bindings_with_receiver(db, env, recursion_guard, receiver)\n    -+                    }),\n    -+                )\n    -+            }\n    +-## Narrowing away empty literals\n    ++## An empty fallback restores `str`\n      \n    -             // A narrowed `type[T: Base] & type[Child]` still needs to construct `T & Child`,\n    -             // but its constructor must come from `Child`, not from `Base` as an independent,\n    +-This pattern is common when a prior truthiness check narrows a type, and then a conditional\n    +-expression adds an empty literal back:\n    ++A truthiness check narrows a string, but adding an empty string back restores broad `str`, in either\n    ++branch order. A later length check leaves that type unchanged:\n    + \n    + ```py\n    + def _(lines: list[str]):\n    +@@ crates/ty_python_semantic/resources/mdtest/narrow/len.md: def _(lines: list[str]):\n    + \n    +         reveal_type(line)  # revealed: str & ~AlwaysFalsy\n    +         value = line if len(line) < 3 else \"\"\n    +-        reveal_type(value)  # revealed: (str & ~AlwaysFalsy) | Literal[\"\"]\n    ++        reveal_type(value)  # revealed: str\n    ++        value = \"\" if len(line) < 3 else line\n    ++        reveal_type(value)  # revealed: str\n    + \n    +         if len(value):\n    +-            # `Literal[\"\"]` is removed, `str & ~AlwaysFalsy` is unchanged\n    +-            reveal_type(value)  # revealed: str & ~AlwaysFalsy\n    +-            # Accessing value[0] is safe here\n    ++            reveal_type(value)  # revealed: str\n    +             _ = value[0]\n    + ```\n     \n    - ## crates/ty_python_semantic/src/types/method.rs ##\n    -@@ crates/ty_python_semantic/src/types/method.rs: impl<'db> BoundMethodType<'db> {\n    -         )\n    -     }\n    + ## crates/ty_python_semantic/src/types/set_theoretic/builder.rs ##\n    +@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: use itertools::Itertools;\n    + use rustc_hash::FxHashSet;\n    + use smallvec::SmallVec;\n      \n    -+    /// Combine receivers of the same instance method before choosing its overloads.\n    -+    ///\n    -+    /// Signatures that depend on individual receivers must still be bound separately.\n    -+    pub(super) fn from_receiver_union(\n    -+        db: &'db dyn Db,\n    -+        env: &ProgramEnvironment<'db>,\n    -+        union: UnionType<'db>,\n    -+    ) -> Option<Self> {\n    -+        let (first, remaining) = union.elements(db).split_first()?;\n    -+        let Type::BoundMethod(first) = *first else {\n    -+            return None;\n    -+        };\n    -+        let function = first.func(db);\n    -+        let Type::FunctionLiteral(_) = function else {\n    -+            return None;\n    -+        };\n    -+        // Class methods capture a class object but substitute its instance type for `Self`.\n    -+        // They cannot use the single instance-receiver union constructed below.\n    -+        if first.class_method(db) {\n    -+            return None;\n    -+        }\n    -+        // A constrained receiver checks one alternative while retaining the original `__self__`.\n    -+        // Combining it with other receivers would lose that alternative's constraint.\n    -+        if first.self_instance(db) != first.signature_receiver(db) {\n    -+            return None;\n    -+        }\n    -+\n    -+        let program = first.program(db);\n    -+        for element in remaining {\n    -+            let Type::BoundMethod(method) = element else {\n    -+                return None;\n    -+            };\n    -+            // Binding only the first method must not discard another function's overloads or\n    -+            // class specialization, or use signatures from a different program.\n    -+            if method.func(db) != function || method.program(db) != program {\n    -+                return None;\n    -+            }\n    -+            if method.class_method(db) {\n    -+                return None;\n    -+            }\n    -+            if method.self_instance(db) != method.signature_receiver(db) {\n    -+                return None;\n    -+            }\n    -+        }\n    -+        let signatures = first.unbound_signatures_with_inferred_return_type(db)?;\n    -+        // Parameters, returns, or predicates that depend on one receiver need separate bindings.\n    -+        if signatures\n    -+            .overloads\n    ++fn is_exact_truthy_str<'db>(db: &'db dyn Db, env: &ProgramEnvironment<'db>, ty: Type<'db>) -> bool {\n    ++    let Type::Intersection(intersection) = ty else {\n    ++        return false;\n    ++    };\n    ++    intersection\n    ++        .positive(db)\n    ++        .iter()\n    ++        .copied()\n    ++        .eq([KnownClass::Str.to_instance(db, env)])\n    ++        && intersection\n    ++            .negative(db)\n     +            .iter()\n    -+            .any(|signature| !signature.supports_receiver_union(db, env))\n    ++            .copied()\n    ++            .eq([Type::AlwaysFalsy])\n    ++}\n    ++\n    + /// Extract `(core, guard)` from truthiness-guarded intersections.\n    + ///\n    + /// e.g.\n    +@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionElement<'db> {\n    +             return ReduceResult::KeepIf(true);\n    +         }\n    + \n    ++        // Treat an empty-string fallback as broad `str`, while keeping truthiness\n    ++        // narrowing for nonempty fallbacks and intersections with other constraints.\n    ++        if let UnionElement::StringLiterals(literals) = self\n    ++            && is_exact_truthy_str(db, env, other_type)\n    ++            && literals.keys().any(|literal| literal.value(db).is_empty())\n     +        {\n    -+            return None;\n    ++            return ReduceResult::Merged(KnownClass::Str.to_instance(db, env));\n     +        }\n    -+        // The shared overload matcher needs the full receiver union to determine its return type.\n    -+        let receiver = UnionType::from_elements(\n    -+            db,\n    -+            env,\n    -+            union.elements(db).iter().map(|element| {\n    -+                let Type::BoundMethod(method) = element else {\n    -+                    unreachable!(\"all union elements are bound methods\");\n    -+                };\n    -+                method.self_instance(db)\n    -+            }),\n    -+        );\n    -+        // The identity checks let the first method retain the shared function and program.\n    -+        Some(first.map_self_type(db, |_receiver| receiver))\n    -+    }\n     +\n    -     pub(super) fn apply_type_mapping_impl(\n    -         self,\n    -         db: &'db dyn Db,\n    -\n    - ## crates/ty_python_semantic/src/types/signatures.rs ##\n    -@@ crates/ty_python_semantic/src/types/signatures.rs: impl<'db> Signature<'db> {\n    -         self.receiver_constraints().is_none() && !self.is_paramspec_value()\n    +         let mut other_type_negated_cache = None;\n    + \n    +         let mut collapse = false;\n    +@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: enum ReduceResult<'db> {\n    +     /// The given `Type` can stand-in for the entire `UnionElement` for further union\n    +     /// simplification checks.\n    +     Type(Type<'db>),\n    ++    /// Replace both this element and the incoming type, reconsidering earlier elements.\n    ++    Merged(Type<'db>),\n    + }\n    + \n    + /// If the value ​​is defined recursively, widening is performed from fewer literal elements,\n    +@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBuilder<'db> {\n    +                                 UnionElement::Type(existing)\n    +                                     if can_compare_with_literals(*existing) =>\n    +                                 {\n    ++                                    if string_literal.value(db).is_empty()\n    ++                                        && is_exact_truthy_str(db, &self.env, *existing)\n    ++                                    {\n    ++                                        self.elements.swap_remove(index);\n    ++                                        self.add_in_place_impl(\n    ++                                            KnownClass::Str.to_instance(db, &self.env),\n    ++                                            seen_aliases,\n    ++                                        );\n    ++                                        return;\n    ++                                    }\n    +                                     // e.g. `existing` could be `Literal[\"\"] & Any`,\n    +                                     // and `ty` could be `Literal[\"\"]`\n    +                                     if ty.is_redundant_with(db, &self.env, *existing) {\n    +@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBuilder<'db> {\n    +         }\n          }\n      \n    -+    /// Whether all receiver alternatives can be checked against one signature.\n    -+    pub(super) fn supports_receiver_union(\n    -+        &self,\n    -+        db: &'db dyn Db,\n    -+        env: &ProgramEnvironment<'db>,\n    -+    ) -> bool {\n    -+        let Some((receiver, parameters)) = self.parameters.as_slice().split_first() else {\n    -+            return false;\n    -+        };\n    -+        if !self.supports_overload_aggregation() {\n    -+            return false;\n    -+        }\n    -+        if !receiver.is_positional() {\n    -+            return false;\n    -+        }\n    -+        // `Self` in another parameter or the return type relates that type to one receiver.\n    -+        if self.needs_self_mapping(db, env, parameters) {\n    -+            return false;\n    -+        }\n    -+        // Predicate results narrow an argument; retain the receiver that established that narrowing.\n    -+        if super::visitor::any_over_type_expanding_aliases(db, env, self.return_ty, |ty| {\n    -+            matches!(ty, Type::TypeIs(_) | Type::TypeGuard(_))\n    -+        }) {\n    -+            return false;\n    ++    fn reinsert_merged_type(\n    ++        &mut self,\n    ++        merged: Type<'db>,\n    ++        to_remove: SmallVec<[usize; 2]>,\n    ++        seen_aliases: &mut Vec<Type<'db>>,\n    ++    ) {\n    ++        for index in to_remove.into_iter().rev() {\n    ++            self.elements.swap_remove(index);\n     +        }\n    -+        // Other type parameters can correlate the receiver with arguments or the result.\n    -+        // A sole implicit `Self` is safe only when no other type depends on it.\n    -+        self.is_non_generic() || self.with_unused_self_upper_bound(db, env).is_some()\n    ++        // A merged type may subsume elements visited before the pair that produced it.\n    ++        self.add_in_place_impl(merged, seen_aliases);\n     +    }\n     +\n    -     /// Restrict the base signature to positional calls for parameters whose keyword name\n    -     /// is lost in every overriding overload. This comparison-only signature may contain\n    -     /// a positional-only parameter after a positional-or-keyword parameter so that we\n    +     fn push_type(&mut self, ty: Type<'db>, seen_aliases: &mut Vec<Type<'db>>) {\n    +         let db = self.db;\n    +         let mut ty = ty;\n    +@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBuilder<'db> {\n    +                     }\n    +                     continue;\n    +                 }\n    ++                ReduceResult::Merged(merged) => {\n    ++                    to_remove.push(i);\n    ++                    self.reinsert_merged_type(merged, to_remove, seen_aliases);\n    ++                    return;\n    ++                }\n    +                 ReduceResult::Type(ty) => ty,\n    +                 ReduceResult::CollapseToObject => {\n    +                     self.collapse_to_object();\n    +@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBuilder<'db> {\n    +                     ty = merged_type;\n    +                     continue;\n    +                 }\n    +-                for index in to_remove.into_iter().rev() {\n    +-                    self.elements.swap_remove(index);\n    +-                }\n    +-                // The merged type can also subsume earlier elements, such as `bool` when\n    +-                // the truthy and falsy parts of `int` merge.\n    +-                self.add_in_place_impl(merged_type, seen_aliases);\n    ++                self.reinsert_merged_type(merged_type, to_remove, seen_aliases);\n    +                 return;\n    +             }\n    + \n```\n\n[Read the complete proposed commit](https://github.com/tamird/ruff/commit/edc8e4990cd10109fadea84e15447438a7141a31).",
        "outcome": "approved"
      },
      {
        "kind": "amendment",
        "head": "71295c0e4f774078fbdd23c3c8636e5be92711d7",
        "baseHead": "edc8e4990cd10109fadea84e15447438a7141a31",
        "url": "https://github.com/tamird/ruff/commit/71295c0e4f774078fbdd23c3c8636e5be92711d7",
        "postedURL": "https://github.com/astral-sh/ruff/pull/30761",
        "title": "Delivered conflict port of the approved string normalization",
        "summary": "Delivered the required behavior-preserving conflict port of the edc8 contribution under its existing approval; Tamir’s exact approval remains recorded on edc8.",
        "body": "PR #30761 now publishes `71295c0e`, a required conflict port of approved `edc8e499` to upstream `493fe0d`. The exact string predicate, both insertion rules and maintained Markdown assertions are unchanged. The port commits upstream pending literal filters and removals before reinserting the merged type. This is authorized delivery of the approved contribution, not a new exact-head user approval.\n\nCurrent-base qualification passes core 86, semantic 541 (35 ignored), IDE 1964, all 532 maintained default Markdown fixtures plus the temporary review fixture, canonical hooks, formatting and strict Clippy. [Qualification](https://app.buildbuddy.io/invocation/f7becdd7-7793-4f88-9b8e-c1013a7cb1ce).\n\n## Changes from the approved contribution\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 f31dd86f222f7d978a65cfc453eaf88f11456ed7..edc8e4990cd10109fadea84e15447438a7141a31 493fe0d6639f7e437e01814718ef094373a1bab3..71295c0e4f774078fbdd23c3c8636e5be92711d7\n```\n\n```diff\n1:  edc8e4990c ! 1:  71295c0e4f [ty] Simplify strings with empty fallbacks\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: use itertools::Ite\n     +            .eq([Type::AlwaysFalsy])\n     +}\n     +\n    - /// Extract `(core, guard)` from truthiness-guarded intersections.\n    - ///\n    - /// e.g.\n    + /// The truthiness excluded by a single guard, e.g. `AlwaysFalsy` in `A & ~AlwaysFalsy`.\n    + /// Intersections that exclude both truthy and falsy values have no single guard.\n    + fn excluded_truthiness<'db>(db: &'db dyn Db, ty: Type<'db>) -> Option<Type<'db>> {\n     @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionElement<'db> {\n                  return ReduceResult::KeepIf(true);\n              }\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionEle\n     +            return ReduceResult::Merged(KnownClass::Str.to_instance(db, env));\n     +        }\n     +\n    -         let mut other_type_negated_cache = None;\n    - \n    -         let mut collapse = false;\n    +         match self {\n    +             UnionElement::IntLiterals(literals) => {\n    +                 Self::reduce_literals(db, env, other_type, LiteralKind::Int, literals)\n     @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: enum ReduceResult<'db> {\n          /// The given `Type` can stand-in for the entire `UnionElement` for further union\n          /// simplification checks.\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: enum ReduceResult<\n     +    Merged(Type<'db>),\n      }\n      \n    - /// If the value ​​is defined recursively, widening is performed from fewer literal elements,\n    + /// Removals to apply if the incoming type is added to the union or merged with an\n     @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBuilder<'db> {\n                                      UnionElement::Type(existing)\n                                          if can_compare_with_literals(*existing) =>\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBui\n     +                                        );\n     +                                        return;\n     +                                    }\n    -                                     // e.g. `existing` could be `Literal[\"\"] & Any`,\n    -                                     // and `ty` could be `Literal[\"\"]`\n    -                                     if ty.is_redundant_with(db, &self.env, *existing) {\n    +                                     // Neither a string literal nor its complement is a subtype of\n    +                                     // `type[C]`. The reverse check still matters when the callable\n    +                                     // used as C's metaclass returns `Never`.\n     @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBuilder<'db> {\n              }\n          }\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBui\n     +    fn reinsert_merged_type(\n     +        &mut self,\n     +        merged: Type<'db>,\n    -+        to_remove: SmallVec<[usize; 2]>,\n    ++        reductions: UnionReductions,\n     +        seen_aliases: &mut Vec<Type<'db>>,\n     +    ) {\n    -+        for index in to_remove.into_iter().rev() {\n    -+            self.elements.swap_remove(index);\n    -+        }\n    ++        reductions.apply(&mut self.elements, None);\n     +        // A merged type may subsume elements visited before the pair that produced it.\n     +        self.add_in_place_impl(merged, seen_aliases);\n     +    }\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBui\n              let db = self.db;\n              let mut ty = ty;\n     @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBuilder<'db> {\n    -                     }\n    +                     reductions.literal_filters.push((i, keep));\n                          continue;\n                      }\n     +                ReduceResult::Merged(merged) => {\n    -+                    to_remove.push(i);\n    -+                    self.reinsert_merged_type(merged, to_remove, seen_aliases);\n    ++                    reductions.to_remove.push(i);\n    ++                    self.reinsert_merged_type(merged, reductions, seen_aliases);\n     +                    return;\n     +                }\n                      ReduceResult::Type(ty) => ty,\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBui\n                          ty = merged_type;\n                          continue;\n                      }\n    --                for index in to_remove.into_iter().rev() {\n    --                    self.elements.swap_remove(index);\n    --                }\n    +-                reductions.apply(&mut self.elements, None);\n     -                // The merged type can also subsume earlier elements, such as `bool` when\n     -                // the truthy and falsy parts of `int` merge.\n     -                self.add_in_place_impl(merged_type, seen_aliases);\n    -+                self.reinsert_merged_type(merged_type, to_remove, seen_aliases);\n    ++                self.reinsert_merged_type(merged_type, reductions, seen_aliases);\n                      return;\n                  }\n      \n```\n\n[Read the delivered commit](https://github.com/tamird/ruff/commit/71295c0e4f774078fbdd23c3c8636e5be92711d7).",
        "outcome": "posted"
      },
      {
        "kind": "amendment",
        "status": "approved",
        "head": "8a2c814d3c7b236dee569aa55983ca2d06b84d0a",
        "baseHead": "71295c0e4f774078fbdd23c3c8636e5be92711d7",
        "url": "https://github.com/tamird/ruff/commit/8a2c814d3c7b236dee569aa55983ca2d06b84d0a",
        "title": "Review the order-independent string-normalization amendment",
        "summary": "Tamir approved exact 8a2c814d for PR #30761; this order-independent normalization is now the published head.",
        "body": "PR #30761 still publishes `71295c0e`. This proposed amendment is `8a2c814d`; it needs Tamir approval before the PR is updated.\n\nWith a third `LiteralString` member, the published normalization depended on insertion order: one tuple order accepted a `list[str]` assignment and the other rejected it. The revision checks empty-string coverage once after union insertion, including `LiteralString`, then rebuilds through the existing normalizer. It removes both insertion-time checks and the special merge/reinsertion path.\n\nThe rule still requires builtin `str` with only the falsy exclusion. Nonempty fallbacks, additional intersection constraints and subclass-specific cores keep their handling; literal empty receivers retain their LiteralString-specific overloads.\n\nThe reported cases fail on published 71295c and pass on the revision. The whole Boolean fixture, core 86, semantic 541 (35 ignored), IDE 1964, all 532 default Markdown fixtures and strict style checks pass. [Qualification](https://app.buildbuddy.io/invocation/1670b6d4-8b0a-47e6-b460-35761f99e9b7).\n\n## Changes from the published commit\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 493fe0d6639f7e437e01814718ef094373a1bab3..71295c0e4f774078fbdd23c3c8636e5be92711d7 493fe0d6639f7e437e01814718ef094373a1bab3..8a2c814d3c7b236dee569aa55983ca2d06b84d0a\n```\n\n```diff\n1:  71295c0e4f ! 1:  8a2c814d3c [ty] Simplify strings with empty fallbacks\n    @@ Metadata\n      ## Commit message ##\n         [ty] Simplify strings with empty fallbacks\n     \n    -    Normalize `(str & ~AlwaysFalsy) | Literal[\"\"]` to `str` in the union\n    -    builder. This lets methods on `s or \"\"` use their ordinary `str` overloads\n    -    without combining bound methods from different receivers.\n    +    Normalize unions of `str & ~AlwaysFalsy` with either `Literal[\"\"]` or\n    +    `LiteralString` to `str`. This lets methods on string fallback expressions\n    +    use ordinary `str` overloads. A literal empty-string receiver still selects\n    +    LiteralString-specific overloads.\n     \n    -    Match only the builtin `str` core with the single truthiness exclusion,\n    -    and handle both insertion orders through the existing union reductions.\n    -    Nonempty fallbacks retain their truthiness narrowing, and a literal empty\n    -    receiver still selects LiteralString-specific overloads.\n    +    Collect empty-string coverage after union insertion, alongside covered\n    +    literal exclusions. `LiteralString` includes the empty string and can\n    +    subsume an explicit empty-string member while the union is constructed.\n     \n    -    This deliberately widens the broad `str` annotation for subclasses that\n    -    override `__bool__` to return false. Other intersection constraints and\n    -    subclass-specific cores retain their original unions.\n    +    Match only the builtin `str` core with the single truthiness exclusion.\n    +    Nonempty fallbacks, other intersection constraints and subclass-specific\n    +    cores retain their original handling. This deliberately widens the broad\n    +    `str` annotation for subclasses that override `__bool__` to return false.\n     \n      ## crates/ty_python_semantic/resources/mdtest/expression/boolean.md ##\n     @@ crates/ty_python_semantic/resources/mdtest/expression/boolean.md: def _(foo: str):\n    @@ crates/ty_python_semantic/resources/mdtest/expression/boolean.md: def _(foo: str\n     +\n     +# A literal receiver still selects the LiteralString overload.\n     +reveal_type(\"\".split())  # revealed: list[LiteralString]\n    ++\n    ++from typing import LiteralString\n    ++\n    ++def _(s: str, t: LiteralString, i: int):\n    ++    reveal_type(s or t)  # revealed: str\n    ++    if s:\n    ++        a: list[str] = (s, t, \"\")[i].split()  # ok\n    ++        b: list[str] = (t, s, \"\")[i].split()  # ok\n      ```\n      \n      ## AND\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: use itertools::Ite\n      /// The truthiness excluded by a single guard, e.g. `AlwaysFalsy` in `A & ~AlwaysFalsy`.\n      /// Intersections that exclude both truthy and falsy values have no single guard.\n      fn excluded_truthiness<'db>(db: &'db dyn Db, ty: Type<'db>) -> Option<Type<'db>> {\n    -@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionElement<'db> {\n    -             return ReduceResult::KeepIf(true);\n    -         }\n    - \n    -+        // Treat an empty-string fallback as broad `str`, while keeping truthiness\n    -+        // narrowing for nonempty fallbacks and intersections with other constraints.\n    -+        if let UnionElement::StringLiterals(literals) = self\n    -+            && is_exact_truthy_str(db, env, other_type)\n    -+            && literals.keys().any(|literal| literal.value(db).is_empty())\n    -+        {\n    -+            return ReduceResult::Merged(KnownClass::Str.to_instance(db, env));\n    -+        }\n    -+\n    -         match self {\n    -             UnionElement::IntLiterals(literals) => {\n    -                 Self::reduce_literals(db, env, other_type, LiteralKind::Int, literals)\n    -@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: enum ReduceResult<'db> {\n    -     /// The given `Type` can stand-in for the entire `UnionElement` for further union\n    -     /// simplification checks.\n    -     Type(Type<'db>),\n    -+    /// Replace both this element and the incoming type, reconsidering earlier elements.\n    -+    Merged(Type<'db>),\n    - }\n    - \n    - /// Removals to apply if the incoming type is added to the union or merged with an\n    -@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBuilder<'db> {\n    -                                 UnionElement::Type(existing)\n    -                                     if can_compare_with_literals(*existing) =>\n    -                                 {\n    -+                                    if string_literal.value(db).is_empty()\n    -+                                        && is_exact_truthy_str(db, &self.env, *existing)\n    -+                                    {\n    -+                                        self.elements.swap_remove(index);\n    -+                                        self.add_in_place_impl(\n    -+                                            KnownClass::Str.to_instance(db, &self.env),\n    -+                                            seen_aliases,\n    -+                                        );\n    -+                                        return;\n    -+                                    }\n    -                                     // Neither a string literal nor its complement is a subtype of\n    -                                     // `type[C]`. The reverse check still matters when the callable\n    -                                     // used as C's metaclass returns `Never`.\n    -@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBuilder<'db> {\n    -         }\n    +@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: fn normalize_covered_literal_exclusions<'db>(\n    +     if literals.is_empty() {\n    +         return false;\n          }\n    ++    // LiteralString can subsume an explicit empty-string member during insertion.\n    ++    let covers_empty_string = literals.iter().any(|literal| match literal {\n    ++        LiteralValueTypeKind::LiteralString => true,\n    ++        LiteralValueTypeKind::String(literal) => literal.value(db).is_empty(),\n    ++        _ => false,\n    ++    });\n      \n    -+    fn reinsert_merged_type(\n    -+        &mut self,\n    -+        merged: Type<'db>,\n    -+        reductions: UnionReductions,\n    -+        seen_aliases: &mut Vec<Type<'db>>,\n    -+    ) {\n    -+        reductions.apply(&mut self.elements, None);\n    -+        // A merged type may subsume elements visited before the pair that produced it.\n    -+        self.add_in_place_impl(merged, seen_aliases);\n    -+    }\n    -+\n    -     fn push_type(&mut self, ty: Type<'db>, seen_aliases: &mut Vec<Type<'db>>) {\n    -         let db = self.db;\n    -         let mut ty = ty;\n    -@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBuilder<'db> {\n    -                     reductions.literal_filters.push((i, keep));\n    -                     continue;\n    -                 }\n    -+                ReduceResult::Merged(merged) => {\n    -+                    reductions.to_remove.push(i);\n    -+                    self.reinsert_merged_type(merged, reductions, seen_aliases);\n    -+                    return;\n    -+                }\n    -                 ReduceResult::Type(ty) => ty,\n    -                 ReduceResult::CollapseToObject => {\n    -                     self.collapse_to_object();\n    -@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: impl<'db> UnionBuilder<'db> {\n    -                     ty = merged_type;\n    -                     continue;\n    -                 }\n    --                reductions.apply(&mut self.elements, None);\n    --                // The merged type can also subsume earlier elements, such as `bool` when\n    --                // the truthy and falsy parts of `int` merge.\n    --                self.add_in_place_impl(merged_type, seen_aliases);\n    -+                self.reinsert_merged_type(merged_type, reductions, seen_aliases);\n    -                 return;\n    -             }\n    - \n    +     let mut changed = false;\n    +     for ty in types {\n    +         if !unpack_aliases && any_over_type(db, env, *ty, false, Type::is_alias_like) {\n    +             continue;\n    +         }\n    ++        if covers_empty_string && is_exact_truthy_str(db, env, *ty) {\n    ++            *ty = KnownClass::Str.to_instance(db, env);\n    ++            changed = true;\n    ++            continue;\n    ++        }\n    +         if let Some(widened) = remove_covered_exclusions(db, env, *ty, |excluded| {\n    +             excluded\n    +                 .as_literal_value_kind()\n```\n\n[Read the complete proposed commit](https://github.com/tamird/ruff/commit/8a2c814d3c7b236dee569aa55983ca2d06b84d0a).",
        "outcome": "approved"
      },
      {
        "kind": "scope",
        "status": "approved",
        "head": "8a2c814d3c7b236dee569aa55983ca2d06b84d0a",
        "url": "https://github.com/astral-sh/ruff/pull/30761",
        "title": "Authorize preparing str/bytes/int normalization",
        "summary": "Tamir authorized preparation and Bazel/RBE qualification of the str/bytes/int revision. Publication of its qualified source requires separate approval.",
        "body": "Authorize preparing and qualifying a revision of PR #30761 covering `str`, `bytes`, and `int` together? The published string-only head remains `8a2c814d3c7b236dee569aa55983ca2d06b84d0a`. No broader source has been prepared or qualified.\n\nRecommendation: use the existing post-insertion normalization for these matching builtin fallbacks:\n\n| Union | Proposed result |\n|---|---|\n| `(str & ~AlwaysFalsy) \\| Literal[\"\"]` | `str` |\n| `(bytes & ~AlwaysFalsy) \\| Literal[b\"\"]` | `bytes` |\n| `(int & ~AlwaysFalsy) \\| Literal[0]` | `int` |\n\nRetain `LiteralString` as empty-string coverage. Match only a single builtin core with the sole `~AlwaysFalsy` exclusion. Preserve extra constraints, subclass-specific cores, alias and cycle safeguards, and nonempty/nonzero fallback precision. Keep `False` distinct from integer zero; a `False`-only fallback does not trigger integer widening. Existing boolean normalization needs no separate extension.\n\nThis is deliberate widening, not type equivalence. Broad results admit falsy subclass and enum values and lose some later narrowing. Broad `int` also admits `False` and zero-valued `IntEnum` members. The global union normalizer affects explicitly written intersection annotations as well as inferred expressions.\n\n[Carl supports weighing this precision tradeoff and agrees that bytes and integers should be considered together](https://github.com/astral-sh/ruff/pull/30761#issuecomment-7140743217). [Alex identifies lost enum narrowing and requests the same consistency](https://github.com/astral-sh/ruff/pull/30761#issuecomment-7133051265). The demonstrated split-overload benefit is specific to strings; bytes and integers extend consistency. Both independent technical assessments support this bounded plan.\n\nIf authorized, extend the existing Boolean OR fixture for bytes/int empty-or-zero fallbacks and nonempty/nonzero controls, reuse existing order and truthiness coverage, and qualify through Bazel/RBE. Present the qualified commit and actual range-diff for separate approval before updating the PR.\n\nThis decision authorizes preparation and qualification only. It does not approve source publication, a reply, closure, or merge. The separate #30898 amendment `88b15ebe` remains pending and unchanged.\n",
        "outcome": "approved",
        "approvedAt": "2026-11-25T12:41:14.101073Z"
      },
      {
        "kind": "amendment",
        "status": "approved",
        "head": "142c9403b03b7e03d5559663823689da81cca214",
        "baseHead": "8a2c814d3c7b236dee569aa55983ca2d06b84d0a",
        "url": "https://github.com/tamird/ruff/commit/142c9403b03b7e03d5559663823689da81cca214",
        "title": "Review str/bytes/int normalization amendment",
        "summary": "Approve updating PR #30761 from published 8a2c814d to qualified 142c9403. The earlier scope authorization is retained separately.",
        "body": "Review the replacement for PR #30761: published `8a2c814d` → proposed `142c9403`. Both single-commit revisions use upstream `493fe0d6639f7e437e01814718ef094373a1bab3` as their base.\n\nThe shared post-insertion pass now widens matching `str`, `bytes`, and `int` fallbacks. It retains `LiteralString` coverage and extra constraints; a `False`-only fallback does not trigger integer widening. The existing OR fixture adds five assertions for bytes/int fallbacks and their negative controls.\n\nThis deliberate widening also applies to written intersection annotations. The broad results admit falsy subclass values; `int` additionally admits `False` and zero-valued `IntEnum` members. Your authorization to prepare and qualify this scope is recorded separately from this source decision.\n\nThe two new positive fallback assertions fail on published `8a2c814d`. The final source passes core 86, semantic 541 (35 ignored), IDE 1,964, all 532 Markdown fixtures, formatting, canonical hooks and strict Clippy on RBE. [Matched controls](https://app.buildbuddy.io/invocation/c8d4ad79-c787-4c61-b380-076bcac0ca11), [native and strict style](https://app.buildbuddy.io/invocation/52b055b4-21b5-4e81-b60c-75fb6c38f3d0), [complete three-file Markdown qualification](https://app.buildbuddy.io/invocation/ee240434-6ef4-4903-97f6-9bcf5497204b).\n\n[Read the complete proposed commit](https://github.com/tamird/ruff/commit/142c9403b03b7e03d5559663823689da81cca214). Updating #30761 requires approval of this source; replies, closure and merge remain held.\n\n## Changes from the submitted commit\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 493fe0d6639f7e437e01814718ef094373a1bab3..8a2c814d3c7b236dee569aa55983ca2d06b84d0a 493fe0d6639f7e437e01814718ef094373a1bab3..142c9403b03b7e03d5559663823689da81cca214\n```\n\n```diff\n1:  8a2c814d3c ! 1:  142c9403b0 [ty] Simplify strings with empty fallbacks\n    @@ Metadata\n     Author: Tamir Duberstein <tamird@gmail.com>\n     \n      ## Commit message ##\n    -    [ty] Simplify strings with empty fallbacks\n    +    [ty] Widen builtins with falsy fallbacks\n     \n    -    Normalize unions of `str & ~AlwaysFalsy` with either `Literal[\"\"]` or\n    -    `LiteralString` to `str`. This lets methods on string fallback expressions\n    -    use ordinary `str` overloads. A literal empty-string receiver still selects\n    -    LiteralString-specific overloads.\n    +    Normalize unions of T & ~AlwaysFalsy with a matching fallback to T for\n    +    builtin str, bytes and int. Match \"\" or LiteralString for str, b\"\" for\n    +    bytes, and integer 0 for int. String fallback expressions can then use\n    +    ordinary str overloads.\n     \n    -    Collect empty-string coverage after union insertion, alongside covered\n    -    literal exclusions. `LiteralString` includes the empty string and can\n    -    subsume an explicit empty-string member while the union is constructed.\n    +    Collect these witnesses after union insertion, alongside covered literal\n    +    exclusions, so normalization does not depend on insertion order.\n    +    LiteralString may have absorbed an explicit empty-string member.\n     \n    -    Match only the builtin `str` core with the single truthiness exclusion.\n    -    Nonempty fallbacks, other intersection constraints and subclass-specific\n    -    cores retain their original handling. This deliberately widens the broad\n    -    `str` annotation for subclasses that override `__bool__` to return false.\n    +    Apply the rule globally, including unions written in annotations. The\n    +    widened builtin types include falsy subclass values. A widened int also\n    +    admits False and IntEnum members whose value is zero. Using False as the\n    +    fallback does not trigger the integer rule. Additional intersection\n    +    constraints, subclass cores and enum cores retain their original\n    +    handling.\n     \n      ## crates/ty_python_semantic/resources/mdtest/expression/boolean.md ##\n     @@ crates/ty_python_semantic/resources/mdtest/expression/boolean.md: def _(foo: str):\n    @@ crates/ty_python_semantic/resources/mdtest/expression/boolean.md: def _(foo: str\n     +    reveal_type((foo or \"\").split())  # revealed: list[str]\n     +    reveal_type(foo or \"fallback\")  # revealed: str & ~AlwaysFalsy\n     +\n    ++def _(data: bytes, number: int):\n    ++    reveal_type(data or b\"\")  # revealed: bytes\n    ++    reveal_type(data or b\"fallback\")  # revealed: bytes & ~AlwaysFalsy\n    ++    reveal_type(number or 0)  # revealed: int\n    ++    reveal_type(number or 1)  # revealed: int & ~AlwaysFalsy\n    ++    reveal_type(number or False)  # revealed: (int & ~AlwaysFalsy) | Literal[False]\n    ++\n     +# A literal receiver still selects the LiteralString overload.\n     +reveal_type(\"\".split())  # revealed: list[LiteralString]\n     +\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: use itertools::Ite\n      use rustc_hash::FxHashSet;\n      use smallvec::SmallVec;\n      \n    -+fn is_exact_truthy_str<'db>(db: &'db dyn Db, env: &ProgramEnvironment<'db>, ty: Type<'db>) -> bool {\n    ++fn is_exact_truthy_builtin<'db>(\n    ++    db: &'db dyn Db,\n    ++    env: &ProgramEnvironment<'db>,\n    ++    ty: Type<'db>,\n    ++    class: KnownClass,\n    ++) -> bool {\n     +    let Type::Intersection(intersection) = ty else {\n     +        return false;\n     +    };\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: use itertools::Ite\n     +        .positive(db)\n     +        .iter()\n     +        .copied()\n    -+        .eq([KnownClass::Str.to_instance(db, env)])\n    ++        .eq([class.to_instance(db, env)])\n     +        && intersection\n     +            .negative(db)\n     +            .iter()\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: use itertools::Ite\n      /// Intersections that exclude both truthy and falsy values have no single guard.\n      fn excluded_truthiness<'db>(db: &'db dyn Db, ty: Type<'db>) -> Option<Type<'db>> {\n     @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: fn normalize_covered_literal_exclusions<'db>(\n    -     if literals.is_empty() {\n    +     }) {\n              return false;\n          }\n    +-    let literals: FxHashSet<_> = types\n    +-        .iter()\n    +-        .filter_map(|ty| ty.as_literal_value_kind())\n    +-        .collect();\n     +    // LiteralString can subsume an explicit empty-string member during insertion.\n    -+    let covers_empty_string = literals.iter().any(|literal| match literal {\n    -+        LiteralValueTypeKind::LiteralString => true,\n    -+        LiteralValueTypeKind::String(literal) => literal.value(db).is_empty(),\n    -+        _ => false,\n    -+    });\n    - \n    -     let mut changed = false;\n    -     for ty in types {\n    ++    let mut literals = FxHashSet::default();\n    ++    let mut covers_empty_string = false;\n    ++    let mut covers_empty_bytes = false;\n    ++    let mut covers_zero = false;\n    ++    for literal in types.iter().filter_map(|ty| ty.as_literal_value_kind()) {\n    ++        literals.insert(literal);\n    ++        match literal {\n    ++            LiteralValueTypeKind::LiteralString => covers_empty_string = true,\n    ++            LiteralValueTypeKind::String(literal) => {\n    ++                covers_empty_string |= literal.value(db).is_empty();\n    ++            }\n    ++            LiteralValueTypeKind::Bytes(literal) => {\n    ++                covers_empty_bytes |= literal.value(db).is_empty();\n    ++            }\n    ++            LiteralValueTypeKind::Int(literal) => covers_zero |= literal.as_i64() == 0,\n    ++            LiteralValueTypeKind::Bool(_) => {}\n    ++            LiteralValueTypeKind::Enum(_) => {}\n    ++        }\n    ++    }\n    +     if literals.is_empty() {\n    +         return false;\n    +     }\n    +@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: fn normalize_covered_literal_exclusions<'db>(\n              if !unpack_aliases && any_over_type(db, env, *ty, false, Type::is_alias_like) {\n                  continue;\n              }\n    -+        if covers_empty_string && is_exact_truthy_str(db, env, *ty) {\n    -+            *ty = KnownClass::Str.to_instance(db, env);\n    ++        // Widen the guarded built-in when its matching empty or zero value is present.\n    ++        // This also admits falsy subclass values and, for int, False.\n    ++        let widened_builtin = [\n    ++            (KnownClass::Str, covers_empty_string),\n    ++            (KnownClass::Bytes, covers_empty_bytes),\n    ++            (KnownClass::Int, covers_zero),\n    ++        ]\n    ++        .into_iter()\n    ++        .find_map(|(class, covered)| {\n    ++            (covered && is_exact_truthy_builtin(db, env, *ty, class)).then_some(class)\n    ++        });\n    ++        if let Some(class) = widened_builtin {\n    ++            *ty = class.to_instance(db, env);\n     +            changed = true;\n     +            continue;\n     +        }\n```\n",
        "outcome": "approved",
        "approvedAt": "2026-11-25T15:14:54.126641Z"
      },
      {
        "kind": "amendment",
        "status": "posted",
        "head": "142c9403b03b7e03d5559663823689da81cca214",
        "baseHead": "8a2c814d3c7b236dee569aa55983ca2d06b84d0a",
        "url": "https://github.com/tamird/ruff/commit/142c9403b03b7e03d5559663823689da81cca214",
        "title": "Published normalization amendment range-diff",
        "summary": "Approved 142c9403 is published on PR #30761.",
        "body": "Review the replacement for PR #30761: published `8a2c814d` → proposed `142c9403`. Both single-commit revisions use upstream `493fe0d6639f7e437e01814718ef094373a1bab3` as their base.\n\nThe shared post-insertion pass now widens matching `str`, `bytes`, and `int` fallbacks. It retains `LiteralString` coverage and extra constraints; a `False`-only fallback does not trigger integer widening. The existing OR fixture adds five assertions for bytes/int fallbacks and their negative controls.\n\nThis deliberate widening also applies to written intersection annotations. The broad results admit falsy subclass values; `int` additionally admits `False` and zero-valued `IntEnum` members. Your authorization to prepare and qualify this scope is recorded separately from this source decision.\n\nThe two new positive fallback assertions fail on published `8a2c814d`. The final source passes core 86, semantic 541 (35 ignored), IDE 1,964, all 532 Markdown fixtures, formatting, canonical hooks and strict Clippy on RBE. [Matched controls](https://app.buildbuddy.io/invocation/c8d4ad79-c787-4c61-b380-076bcac0ca11), [native and strict style](https://app.buildbuddy.io/invocation/52b055b4-21b5-4e81-b60c-75fb6c38f3d0), [complete three-file Markdown qualification](https://app.buildbuddy.io/invocation/ee240434-6ef4-4903-97f6-9bcf5497204b).\n\n[Read the complete proposed commit](https://github.com/tamird/ruff/commit/142c9403b03b7e03d5559663823689da81cca214). Updating #30761 requires approval of this source; replies, closure and merge remain held.\n\n## Changes from the submitted commit\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 493fe0d6639f7e437e01814718ef094373a1bab3..8a2c814d3c7b236dee569aa55983ca2d06b84d0a 493fe0d6639f7e437e01814718ef094373a1bab3..142c9403b03b7e03d5559663823689da81cca214\n```\n\n```diff\n1:  8a2c814d3c ! 1:  142c9403b0 [ty] Simplify strings with empty fallbacks\n    @@ Metadata\n     Author: Tamir Duberstein <tamird@gmail.com>\n     \n      ## Commit message ##\n    -    [ty] Simplify strings with empty fallbacks\n    +    [ty] Widen builtins with falsy fallbacks\n     \n    -    Normalize unions of `str & ~AlwaysFalsy` with either `Literal[\"\"]` or\n    -    `LiteralString` to `str`. This lets methods on string fallback expressions\n    -    use ordinary `str` overloads. A literal empty-string receiver still selects\n    -    LiteralString-specific overloads.\n    +    Normalize unions of T & ~AlwaysFalsy with a matching fallback to T for\n    +    builtin str, bytes and int. Match \"\" or LiteralString for str, b\"\" for\n    +    bytes, and integer 0 for int. String fallback expressions can then use\n    +    ordinary str overloads.\n     \n    -    Collect empty-string coverage after union insertion, alongside covered\n    -    literal exclusions. `LiteralString` includes the empty string and can\n    -    subsume an explicit empty-string member while the union is constructed.\n    +    Collect these witnesses after union insertion, alongside covered literal\n    +    exclusions, so normalization does not depend on insertion order.\n    +    LiteralString may have absorbed an explicit empty-string member.\n     \n    -    Match only the builtin `str` core with the single truthiness exclusion.\n    -    Nonempty fallbacks, other intersection constraints and subclass-specific\n    -    cores retain their original handling. This deliberately widens the broad\n    -    `str` annotation for subclasses that override `__bool__` to return false.\n    +    Apply the rule globally, including unions written in annotations. The\n    +    widened builtin types include falsy subclass values. A widened int also\n    +    admits False and IntEnum members whose value is zero. Using False as the\n    +    fallback does not trigger the integer rule. Additional intersection\n    +    constraints, subclass cores and enum cores retain their original\n    +    handling.\n     \n      ## crates/ty_python_semantic/resources/mdtest/expression/boolean.md ##\n     @@ crates/ty_python_semantic/resources/mdtest/expression/boolean.md: def _(foo: str):\n    @@ crates/ty_python_semantic/resources/mdtest/expression/boolean.md: def _(foo: str\n     +    reveal_type((foo or \"\").split())  # revealed: list[str]\n     +    reveal_type(foo or \"fallback\")  # revealed: str & ~AlwaysFalsy\n     +\n    ++def _(data: bytes, number: int):\n    ++    reveal_type(data or b\"\")  # revealed: bytes\n    ++    reveal_type(data or b\"fallback\")  # revealed: bytes & ~AlwaysFalsy\n    ++    reveal_type(number or 0)  # revealed: int\n    ++    reveal_type(number or 1)  # revealed: int & ~AlwaysFalsy\n    ++    reveal_type(number or False)  # revealed: (int & ~AlwaysFalsy) | Literal[False]\n    ++\n     +# A literal receiver still selects the LiteralString overload.\n     +reveal_type(\"\".split())  # revealed: list[LiteralString]\n     +\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: use itertools::Ite\n      use rustc_hash::FxHashSet;\n      use smallvec::SmallVec;\n      \n    -+fn is_exact_truthy_str<'db>(db: &'db dyn Db, env: &ProgramEnvironment<'db>, ty: Type<'db>) -> bool {\n    ++fn is_exact_truthy_builtin<'db>(\n    ++    db: &'db dyn Db,\n    ++    env: &ProgramEnvironment<'db>,\n    ++    ty: Type<'db>,\n    ++    class: KnownClass,\n    ++) -> bool {\n     +    let Type::Intersection(intersection) = ty else {\n     +        return false;\n     +    };\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: use itertools::Ite\n     +        .positive(db)\n     +        .iter()\n     +        .copied()\n    -+        .eq([KnownClass::Str.to_instance(db, env)])\n    ++        .eq([class.to_instance(db, env)])\n     +        && intersection\n     +            .negative(db)\n     +            .iter()\n    @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: use itertools::Ite\n      /// Intersections that exclude both truthy and falsy values have no single guard.\n      fn excluded_truthiness<'db>(db: &'db dyn Db, ty: Type<'db>) -> Option<Type<'db>> {\n     @@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: fn normalize_covered_literal_exclusions<'db>(\n    -     if literals.is_empty() {\n    +     }) {\n              return false;\n          }\n    +-    let literals: FxHashSet<_> = types\n    +-        .iter()\n    +-        .filter_map(|ty| ty.as_literal_value_kind())\n    +-        .collect();\n     +    // LiteralString can subsume an explicit empty-string member during insertion.\n    -+    let covers_empty_string = literals.iter().any(|literal| match literal {\n    -+        LiteralValueTypeKind::LiteralString => true,\n    -+        LiteralValueTypeKind::String(literal) => literal.value(db).is_empty(),\n    -+        _ => false,\n    -+    });\n    - \n    -     let mut changed = false;\n    -     for ty in types {\n    ++    let mut literals = FxHashSet::default();\n    ++    let mut covers_empty_string = false;\n    ++    let mut covers_empty_bytes = false;\n    ++    let mut covers_zero = false;\n    ++    for literal in types.iter().filter_map(|ty| ty.as_literal_value_kind()) {\n    ++        literals.insert(literal);\n    ++        match literal {\n    ++            LiteralValueTypeKind::LiteralString => covers_empty_string = true,\n    ++            LiteralValueTypeKind::String(literal) => {\n    ++                covers_empty_string |= literal.value(db).is_empty();\n    ++            }\n    ++            LiteralValueTypeKind::Bytes(literal) => {\n    ++                covers_empty_bytes |= literal.value(db).is_empty();\n    ++            }\n    ++            LiteralValueTypeKind::Int(literal) => covers_zero |= literal.as_i64() == 0,\n    ++            LiteralValueTypeKind::Bool(_) => {}\n    ++            LiteralValueTypeKind::Enum(_) => {}\n    ++        }\n    ++    }\n    +     if literals.is_empty() {\n    +         return false;\n    +     }\n    +@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: fn normalize_covered_literal_exclusions<'db>(\n              if !unpack_aliases && any_over_type(db, env, *ty, false, Type::is_alias_like) {\n                  continue;\n              }\n    -+        if covers_empty_string && is_exact_truthy_str(db, env, *ty) {\n    -+            *ty = KnownClass::Str.to_instance(db, env);\n    ++        // Widen the guarded built-in when its matching empty or zero value is present.\n    ++        // This also admits falsy subclass values and, for int, False.\n    ++        let widened_builtin = [\n    ++            (KnownClass::Str, covers_empty_string),\n    ++            (KnownClass::Bytes, covers_empty_bytes),\n    ++            (KnownClass::Int, covers_zero),\n    ++        ]\n    ++        .into_iter()\n    ++        .find_map(|(class, covered)| {\n    ++            (covered && is_exact_truthy_builtin(db, env, *ty, class)).then_some(class)\n    ++        });\n    ++        if let Some(class) = widened_builtin {\n    ++            *ty = class.to_instance(db, env);\n     +            changed = true;\n     +            continue;\n     +        }\n```\n",
        "outcome": "posted",
        "postedAt": "2026-11-25T15:14:54.126641Z",
        "postedURL": "https://github.com/astral-sh/ruff/pull/30761"
      },
      {
        "kind": "amendment",
        "status": "approved",
        "baseHead": "142c9403b03b7e03d5559663823689da81cca214",
        "head": "7b148056cd81a79c3b67ce5afcfdcfba1e6f565a",
        "url": "https://github.com/tamird/ruff/commit/7b148056cd81a79c3b67ce5afcfdcfba1e6f565a",
        "title": "Inferred-or amendment approved",
        "summary": "Tamir approved 7b148056cd, now published on Ruff #30761.",
        "outcome": "approved"
      },
      {
        "kind": "amendment",
        "status": "settled",
        "head": "7b148056cd81a79c3b67ce5afcfdcfba1e6f565a",
        "baseHead": "142c9403b03b7e03d5559663823689da81cca214",
        "url": "https://github.com/tamird/ruff/commit/7b148056cd81a79c3b67ce5afcfdcfba1e6f565a",
        "title": "Review inferred-or widening for Ruff #30761",
        "summary": "Tamir approved 7b148056cd, now published on Ruff #30761.",
        "body": "The revised patch widens only an inferred `or` result with a matching final fallback and no expected type. It keeps the explicit truthiness union intact, including when an annotated return requires it. A union supplied entirely by the final operand, as in `False or value`, retains its precision.\n\nThe reduced `pytest-autoprofile` case uses the reported return expression and the project's `ImportPath` annotations. It fails on the upstream parent and passes with this revision. `LiteralString` receivers still retain literal split results. The conditional and tuple probes still produce `list[str] | list[LiteralString]`. This revision confines the precision tradeoff to `or` expressions and leaves the other cases open.\n\nCanonical hooks, native suites, all 532 mdtests, formatting, and strict Clippy passed. [RBE results](https://app.buildbuddy.io/invocation/617505e3-98eb-409a-a523-d5e68a065c2a)\n\nCaptured with `git range-diff --no-color --no-dual-color --creation-factor=999 142c9403b03b7e03d5559663823689da81cca214^! 7b148056cd81a79c3b67ce5afcfdcfba1e6f565a^!`.\n\n```diff\n1:  142c9403b0 ! 1:  7b148056cd [ty] Widen builtins with falsy fallbacks\n    @@ Metadata\n     Author: Tamir Duberstein <tamird@gmail.com>\n     \n      ## Commit message ##\n    -    [ty] Widen builtins with falsy fallbacks\n    +    [ty] Widen inferred or fallbacks\n     \n    -    Normalize unions of T & ~AlwaysFalsy with a matching fallback to T for\n    -    builtin str, bytes and int. Match \"\" or LiteralString for str, b\"\" for\n    -    bytes, and integer 0 for int. String fallback expressions can then use\n    -    ordinary str overloads.\n    +    In pytest-autoprofile, (target.object or \"\").split(\".\") inferred\n    +    list[str] | list[LiteralString]. The return annotation wants list[str],\n    +    and list's invariant element type prevents that assignment.\n     \n    -    Collect these witnesses after union insertion, alongside covered literal\n    -    exclusions, so normalization does not depend on insertion order.\n    -    LiteralString may have absorbed an explicit empty-string member.\n    +    When an unconstrained or expression combines a truthy builtin with its\n    +    matching final fallback, use the builtin as the result type. This\n    +    allows calls such as split to select the ordinary builtin overload.\n    +    The widened type can include falsy subclass instances, so retain the\n    +    precise union when a caller supplies an expected type.\n     \n    -    Apply the rule globally, including unions written in annotations. The\n    -    widened builtin types include falsy subclass values. A widened int also\n    -    admits False and IntEnum members whose value is zero. Using False as the\n    -    fallback does not trigger the integer rule. Additional intersection\n    -    constraints, subclass cores and enum cores retain their original\n    -    handling.\n    +    Match the type of the final operand before widening. An or expression\n    +    such as False or value can return a union supplied entirely by value.\n     \n      ## crates/ty_python_semantic/resources/mdtest/expression/boolean.md ##\n     @@ crates/ty_python_semantic/resources/mdtest/expression/boolean.md: def _(foo: str):\n    @@ crates/ty_python_semantic/resources/mdtest/expression/boolean.md: def _(foo: str\n     +    reveal_type(number or 0)  # revealed: int\n     +    reveal_type(number or 1)  # revealed: int & ~AlwaysFalsy\n     +    reveal_type(number or False)  # revealed: (int & ~AlwaysFalsy) | Literal[False]\n    ++```\n     +\n    -+# A literal receiver still selects the LiteralString overload.\n    -+reveal_type(\"\".split())  # revealed: list[LiteralString]\n    ++An expected type can preserve the truthiness constraint.\n     +\n    -+from typing import LiteralString\n    ++```py\n    ++from typing import Literal\n    ++from ty_extensions import AlwaysFalsy, Intersection, Not\n     +\n    -+def _(s: str, t: LiteralString, i: int):\n    -+    reveal_type(s or t)  # revealed: str\n    -+    if s:\n    -+        a: list[str] = (s, t, \"\")[i].split()  # ok\n    -+        b: list[str] = (t, s, \"\")[i].split()  # ok\n    ++def _(value: str) -> Intersection[str, Not[AlwaysFalsy]] | Literal[\"\"]:\n    ++    return value or \"\"\n      ```\n      \n      ## AND\n     \n    - ## crates/ty_python_semantic/resources/mdtest/narrow/len.md ##\n    -@@ crates/ty_python_semantic/resources/mdtest/narrow/len.md: def _(x: Literal[\"foo\", \"\"] | list[int]):\n    -         reveal_type(x)  # revealed: Literal[\"\"] | list[int]\n    - ```\n    - \n    --## Narrowing away empty literals\n    -+## An empty fallback restores `str`\n    - \n    --This pattern is common when a prior truthiness check narrows a type, and then a conditional\n    --expression adds an empty literal back:\n    -+A truthiness check narrows a string, but adding an empty string back restores broad `str`, in either\n    -+branch order. A later length check leaves that type unchanged:\n    - \n    - ```py\n    - def _(lines: list[str]):\n    -@@ crates/ty_python_semantic/resources/mdtest/narrow/len.md: def _(lines: list[str]):\n    - \n    -         reveal_type(line)  # revealed: str & ~AlwaysFalsy\n    -         value = line if len(line) < 3 else \"\"\n    --        reveal_type(value)  # revealed: (str & ~AlwaysFalsy) | Literal[\"\"]\n    -+        reveal_type(value)  # revealed: str\n    -+        value = \"\" if len(line) < 3 else line\n    -+        reveal_type(value)  # revealed: str\n    + ## crates/ty_python_semantic/src/types/infer/builder.rs ##\n    +@@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {\n    +         // accumulating prior types cannot affect inference.\n    +         let track_peer_types = values.iter().skip(1).any(is_collection_literal)\n    +             && prefer_collection_literal_peer_context(self.db(), self.program_environment(), tcx);\n    +-        self.infer_chained_boolean_types(\n    ++        let can_widen = matches!(op, ast::BoolOp::Or) && tcx.expected_type().is_none();\n    ++        let mut fallback = None;\n    ++        let result = self.infer_chained_boolean_types(\n    +             *op,\n    +             track_peer_types,\n    +             values.iter().enumerate(),\n    +             |(_, value)| is_collection_literal(value),\n    +             |builder, (index, value), peer_ty| {\n    +                 let ty = if index == values.len() - 1 {\n    +-                    builder\n    +-                        .infer_expression_with_collection_literal_peer_context(value, tcx, peer_ty)\n    ++                    let ty = builder\n    ++                        .infer_expression_with_collection_literal_peer_context(value, tcx, peer_ty);\n    ++                    if can_widen {\n    ++                        fallback = Some(ty);\n    ++                    }\n    ++                    ty\n    +                 } else {\n    +                     builder.infer_maybe_standalone_expression_with_collection_literal_peer_context(\n    +                         value, tcx, peer_ty,\n    +@@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {\n      \n    -         if len(value):\n    --            # `Literal[\"\"]` is removed, `str & ~AlwaysFalsy` is unchanged\n    --            reveal_type(value)  # revealed: str & ~AlwaysFalsy\n    --            # Accessing value[0] is safe here\n    -+            reveal_type(value)  # revealed: str\n    -             _ = value[0]\n    - ```\n    -\n    - ## crates/ty_python_semantic/src/types/set_theoretic/builder.rs ##\n    -@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: use itertools::Itertools;\n    - use rustc_hash::FxHashSet;\n    - use smallvec::SmallVec;\n    - \n    -+fn is_exact_truthy_builtin<'db>(\n    -+    db: &'db dyn Db,\n    -+    env: &ProgramEnvironment<'db>,\n    -+    ty: Type<'db>,\n    -+    class: KnownClass,\n    -+) -> bool {\n    -+    let Type::Intersection(intersection) = ty else {\n    -+        return false;\n    -+    };\n    -+    intersection\n    -+        .positive(db)\n    -+        .iter()\n    -+        .copied()\n    -+        .eq([class.to_instance(db, env)])\n    -+        && intersection\n    -+            .negative(db)\n    -+            .iter()\n    -+            .copied()\n    -+            .eq([Type::AlwaysFalsy])\n    -+}\n    +                 (ty, value.range())\n    +             },\n    +-        )\n    +-        .value_type\n    ++        );\n    ++        if let Some(fallback) = fallback {\n    ++            self.widen_or_fallback(result.value_type, fallback)\n    ++        } else {\n    ++            result.value_type\n    ++        }\n    ++    }\n     +\n    - /// The truthiness excluded by a single guard, e.g. `AlwaysFalsy` in `A & ~AlwaysFalsy`.\n    - /// Intersections that exclude both truthy and falsy values have no single guard.\n    - fn excluded_truthiness<'db>(db: &'db dyn Db, ty: Type<'db>) -> Option<Type<'db>> {\n    -@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: fn normalize_covered_literal_exclusions<'db>(\n    -     }) {\n    -         return false;\n    -     }\n    --    let literals: FxHashSet<_> = types\n    --        .iter()\n    --        .filter_map(|ty| ty.as_literal_value_kind())\n    --        .collect();\n    -+    // LiteralString can subsume an explicit empty-string member during insertion.\n    -+    let mut literals = FxHashSet::default();\n    -+    let mut covers_empty_string = false;\n    -+    let mut covers_empty_bytes = false;\n    -+    let mut covers_zero = false;\n    -+    for literal in types.iter().filter_map(|ty| ty.as_literal_value_kind()) {\n    -+        literals.insert(literal);\n    -+        match literal {\n    -+            LiteralValueTypeKind::LiteralString => covers_empty_string = true,\n    -+            LiteralValueTypeKind::String(literal) => {\n    -+                covers_empty_string |= literal.value(db).is_empty();\n    ++    /// An empty fallback can make `(s or \"\").split()` select both the `str`\n    ++    /// and `LiteralString` overloads. Widen the inferred result to the builtin\n    ++    /// so those overloads do not see separate union members.\n    ++    fn widen_or_fallback(&self, result: Type<'db>, fallback: Type<'db>) -> Type<'db> {\n    ++        let db = self.db();\n    ++        let Type::Union(union) = result else {\n    ++            return result;\n    ++        };\n    ++        let [left, right] = union.elements(db) else {\n    ++            return result;\n    ++        };\n    ++        let guarded = if *right == fallback {\n    ++            *left\n    ++        } else if *left == fallback {\n    ++            *right\n    ++        } else {\n    ++            return result;\n    ++        };\n    ++        let Type::Intersection(guarded) = guarded else {\n    ++            return result;\n    ++        };\n    ++        if !guarded.negative(db).iter().copied().eq([Type::AlwaysFalsy]) {\n    ++            return result;\n    ++        }\n    ++\n    ++        let builtin = match fallback.as_literal_value_kind() {\n    ++            Some(LiteralValueTypeKind::LiteralString) => Some(KnownClass::Str),\n    ++            Some(LiteralValueTypeKind::String(value)) => {\n    ++                value.value(db).is_empty().then_some(KnownClass::Str)\n     +            }\n    -+            LiteralValueTypeKind::Bytes(literal) => {\n    -+                covers_empty_bytes |= literal.value(db).is_empty();\n    ++            Some(LiteralValueTypeKind::Bytes(value)) => {\n    ++                value.value(db).is_empty().then_some(KnownClass::Bytes)\n     +            }\n    -+            LiteralValueTypeKind::Int(literal) => covers_zero |= literal.as_i64() == 0,\n    -+            LiteralValueTypeKind::Bool(_) => {}\n    -+            LiteralValueTypeKind::Enum(_) => {}\n    ++            Some(LiteralValueTypeKind::Int(value)) => {\n    ++                (value.as_i64() == 0).then_some(KnownClass::Int)\n    ++            }\n    ++            _ => None,\n    ++        };\n    ++        let Some(builtin) = builtin else {\n    ++            return result;\n    ++        };\n    ++        let widened = builtin.to_instance(db, self.program_environment());\n    ++        if guarded.positive(db).iter().copied().eq([widened]) {\n    ++            widened\n    ++        } else {\n    ++            result\n     +        }\n    -+    }\n    -     if literals.is_empty() {\n    -         return false;\n          }\n    -@@ crates/ty_python_semantic/src/types/set_theoretic/builder.rs: fn normalize_covered_literal_exclusions<'db>(\n    -         if !unpack_aliases && any_over_type(db, env, *ty, false, Type::is_alias_like) {\n    -             continue;\n    -         }\n    -+        // Widen the guarded built-in when its matching empty or zero value is present.\n    -+        // This also admits falsy subclass values and, for int, False.\n    -+        let widened_builtin = [\n    -+            (KnownClass::Str, covers_empty_string),\n    -+            (KnownClass::Bytes, covers_empty_bytes),\n    -+            (KnownClass::Int, covers_zero),\n    -+        ]\n    -+        .into_iter()\n    -+        .find_map(|(class, covered)| {\n    -+            (covered && is_exact_truthy_builtin(db, env, *ty, class)).then_some(class)\n    -+        });\n    -+        if let Some(class) = widened_builtin {\n    -+            *ty = class.to_instance(db, env);\n    -+            changed = true;\n    -+            continue;\n    -+        }\n    -         if let Some(widened) = remove_covered_exclusions(db, env, *ty, |excluded| {\n    -             excluded\n    -                 .as_literal_value_kind()\n    + \n    +     /// Computes the output of a chain of (one) boolean operation, consuming as input an iterator\n```",
        "outcome": "posted",
        "postedAt": "2026-11-25T19:59:53+00:00",
        "postedURL": "https://github.com/astral-sh/ruff/pull/30761"
      }
    ],
    "refinement": {
      "before": {
        "head": "142c9403b03b7e03d5559663823689da81cca214"
      },
      "after": {
        "head": "7b148056cd81a79c3b67ce5afcfdcfba1e6f565a"
      }
    },
    "nextAction": "Investigate simple_script timing on the delivered revision. CodSpeed reports a 5.23% regression. Matched RBE rounds averaged 37.775 to 38.568 ms in round medians, with overlapping timings."
  },
  {
    "id": "residual-truthiness-guards",
    "ref": "validation/joint-truthiness-guards",
    "title": "Simplify residual truthiness guards",
    "state": "Redesign required",
    "source": "7b813717d3098e237cf8beb97eb5f046bf6230bc",
    "summary": "Prototype combining #27106 with immutable-value guards. Full qualification found lost predicate and exception-type information. Keep this prototype out of Sty; fix the string-splitting bug at its method-binding owner. Nothing has been submitted upstream.",
    "qualifiedBase": "f31dd86f222f7d978a65cfc453eaf88f11456ed7",
    "qualifiedHead": "7b813717d3098e237cf8beb97eb5f046bf6230bc",
    "qualifiedURL": "https://github.com/tamird/ruff/commit/7b813717d3098e237cf8beb97eb5f046bf6230bc",
    "qualification": {
      "summary": "Focused native checks pass, but full default Markdown is 508/532 versus pristine upstream 532/532. Current Dulwich and SymPy checks also add diagnostics. No golden assertions were weakened. Global guard removal is unqualified and will not be promoted.",
      "evidence": [
        {
          "label": "Combined proposal and rewritten comments",
          "url": "https://github.com/tamird/ruff/commit/7b813717d3098e237cf8beb97eb5f046bf6230bc"
        },
        {
          "label": "Native and five-fixture qualification",
          "url": "https://app.buildbuddy.io/invocation/f2696a7d-6873-472c-8038-ed4b105293d7"
        },
        {
          "label": "Full original default Markdown: 532 pass",
          "url": "https://app.buildbuddy.io/invocation/6cbb61e0-873f-4c47-9673-fdfba3af5285"
        },
        {
          "label": "Full prototype default Markdown: 24 failures",
          "url": "https://app.buildbuddy.io/invocation/2cffb9f4-4e6b-48e5-8cb1-305c20ee1651"
        },
        {
          "label": "Current Dulwich and SymPy diagnostic comparison",
          "url": "https://app.buildbuddy.io/invocation/773c2717-bcbf-47f7-a4a6-11f3aa0bf813"
        }
      ]
    },
    "nextAction": "Fix the original string-splitting bug at method binding while preserving internal guards, negative constraints and inference order. This global-removal prototype is not ready for submission."
  },
  {
    "id": "related-upstream-27106",
    "title": "Drop residual truthiness guards from intersections",
    "number": 27106,
    "state": "Related upstream work",
    "author": "carljm",
    "summary": "Draft global guard-removal proposal. Full qualification found lost predicate and exception information. A separate method-binding fix for the original string-splitting bug now passes all 532 default Markdown cases with guards retained; current Dulwich and SymPy diagnostics are unchanged."
  },
  {
    "id": "call-completion-key-lifetime",
    "ref": "upstream/retain-call-completion-keys",
    "title": "Retain call-completion query keys",
    "state": "Merged",
    "source": "1b9535f986af582c86f75977c4741c3b93eac83e",
    "summary": "Merged by AlexWaygood on November 22, 2026 as Ruff #30759. The approved 1b9535 revision retains call-completion query keys as semantic-index outputs and includes the deterministic dependency regression.",
    "qualifiedBase": "7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc",
    "qualifiedHead": "1b9535f986af582c86f75977c4741c3b93eac83e",
    "qualifiedCommitCount": 1,
    "qualifiedURL": "https://github.com/tamird/ruff/commit/1b9535f986af582c86f75977c4741c3b93eac83e",
    "qualification": {
      "summary": "The current 1b9535 amendment passes the focused deterministic dependency regression, the full semantic suite (516 passed, 35 ignored), canonical hooks, formatting and strict Clippy. The same regression fails on submitted 5678. It verifies the absence of an interned-call-key dependency when validating the cached semantic index; it does not claim to force eviction on every CPU or shard count. Earlier 5678/e905 native and benchmark results remain historical evidence; no new hardware or performance claim is made.",
      "evidence": [
        {
          "label": "Current-base refresh: independent guarded phases",
          "url": "https://app.buildbuddy.io/invocation/4076d5be-7ee1-4e87-a1ed-5a6f5a0e0520"
        },
        {
          "label": "Review the revised single commit",
          "url": "https://github.com/tamird/ruff/commit/5678a81398ae87c721118445dd539e568f940c10"
        },
        {
          "label": "Matched baseline and complete functional qualification",
          "url": "https://app.buildbuddy.io/invocation/1e98da07-c0a4-4ec7-bfa3-30f51a281f29"
        },
        {
          "label": "Original repeated-call benchmarks with profiling code generation",
          "url": "https://app.buildbuddy.io/invocation/9a013a63-e833-4f89-9470-35264ab4d88b"
        },
        {
          "label": "Proposed1b9535 amendment: deterministic dependency regression",
          "url": "https://github.com/tamird/ruff/commit/1b9535f986af582c86f75977c4741c3b93eac83e"
        },
        {
          "label": "1b9535: focused regression, full semantic suite, hooks and style",
          "url": "https://app.buildbuddy.io/invocation/94b0a1df-fff3-4102-af51-7c19d032ca3c"
        },
        {
          "label": "Submitted5678: matched deterministic dependency failure",
          "url": "https://app.buildbuddy.io/invocation/b0a41fcc-1144-423e-a4bb-c9b4365a34ef"
        }
      ]
    },
    "settledReviews": [
      {
        "kind": "proposal",
        "head": "5678a81398ae87c721118445dd539e568f940c10",
        "url": "https://github.com/tamird/ruff/commit/5678a81398ae87c721118445dd539e568f940c10",
        "outcome": "approved",
        "summary": "Tamir approved this exact commit after confirmation of the existing negative controls."
      },
      {
        "kind": "amendment",
        "head": "1b9535f986af582c86f75977c4741c3b93eac83e",
        "baseHead": "5678a81398ae87c721118445dd539e568f940c10",
        "url": "https://github.com/tamird/ruff/commit/1b9535f986af582c86f75977c4741c3b93eac83e",
        "title": "Review the call-key dependency revision for PR #30759",
        "summary": "Tamir approved the exact 1b9535 amendment for PR #30759; it is now the published head.",
        "body": "Review the amendment to PR #30759. The PR still publishes `5678a813`; this proposed replacement is `1b9535f`. The earlier approval does not cover this amendment.\n\nThe revision adds a deterministic check that validating an unchanged semantic index does not depend on interned call keys. It fails on the submitted commit and passes with the amendment. The original optimization sentence is restored. This test does not claim to force slot eviction on every CPU or shard count.\n\nThe focused regression, full semantic suite (516 passed, 35 ignored), canonical hooks, formatting and strict Clippy pass. [Candidate qualification](https://app.buildbuddy.io/invocation/94b0a1df-fff3-4102-af51-7c19d032ca3c); [matched baseline failure](https://app.buildbuddy.io/invocation/b0a41fcc-1144-423e-a4bb-c9b4365a34ef).\n\n## Changes from the submitted commit\n\nThis is Git\u2019s actual range-diff of the two single-commit proposals on the same base. The pairing option matches the replacement commit with its predecessor.\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc..5678a81398ae87c721118445dd539e568f940c10 7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc..1b9535f986af582c86f75977c4741c3b93eac83e\n```\n\n```diff\n1:  5678a81398 ! 1:  1b9535f986 [ty] Retain call-completion query keys\n    @@ Commit message\n         unchanged file when its interned call-completion keys were collected.\n     \n         Make these keys tracked outputs of the semantic-index query, matching the\n    -    lifetime of the expressions they contain. Cover reuse across unrelated\n    -    revisions and invalidation after the indexed source changes.\n    +    lifetime of the expressions they contain. Check the dependency directly\n    +    after a low-durability write so the regression test does not depend on an\n    +    LRU shard reusing a slot. Keep the check that editing the indexed source\n    +    still invalidates the index.\n     \n      ## crates/ty_python_core/src/predicate.rs ##\n     @@ crates/ty_python_core/src/predicate.rs: impl PredicateOrLiteral<'_> {\n    @@ crates/ty_python_core/src/predicate.rs: impl PredicateOrLiteral<'_> {\n     -/// queries use its ID directly, without looking up its components in Salsa's intern table again.\n     -#[salsa::interned(debug, heap_size=ruff_memory_usage::heap_size)]\n     +/// A call-completion query key owned by the semantic index that creates its expressions.\n    ++///\n    ++/// Creating it while building predicates lets cached queries use its ID directly, without looking\n    ++/// up its components in Salsa's intern table again.\n    ++///\n     +/// Tracking the key keeps unrelated revisions from collecting it and invalidating that index.\n     +#[salsa::tracked(debug, heap_size=ruff_memory_usage::heap_size)]\n      pub struct CallableAndCallExpr<'db> {\n    @@ crates/ty_python_semantic/src/types/infer/tests.rs: fn dependency_implicit_alias\n     +        ruff_db::system::SystemPath::new(\"/src/project\"),\n     +        ruff_db::files::FileRootKind::Project,\n     +    );\n    -+    let source = format!(\"def run(callback):\\n{}\", \"    callback()\\n\".repeat(4));\n    -+    db.write_file(\"/src/project/target.py\", &source)?;\n    ++    let source = \"def run(callback):\\n    callback()\\n\";\n    ++    db.write_file(\"/src/project/target.py\", source)?;\n     +    let file = system_path_to_file(&db, \"/src/project/target.py\")?;\n    -+    let mut others = Vec::new();\n    -+    for revision in 0..4 {\n    -+        let path = format!(\"/src/project/other_{revision}.py\");\n    -+        db.write_file(&path, \"\")?;\n    -+        let other = system_path_to_file(&db, &path)?;\n    -+        others.push((path, other));\n    -+    }\n     +    semantic_index(&db, program_file(&db, file));\n    -+    // Fresh call keys in four revisions age Salsa's three-revision retention queue.\n    -+    for (path, other) in others {\n    -+        let source = format!(\"def run(callback):\\n{}\", \"    callback()\\n\".repeat(16));\n    -+        db.write_file(&path, source)?;\n    -+        semantic_index(&db, program_file(&db, other));\n    -+    }\n    ++\n    ++    db.synthetic_write(salsa::Durability::LOW);\n     +    db.clear_salsa_events();\n     +    semantic_index(&db, program_file(&db, file));\n     +    let events = db.take_salsa_events();\n     +    assert_function_query_was_not_run(&db, semantic_index, program_file(&db, file), &events);\n    ++    assert!(\n    ++        !events.iter().any(|event| matches!(\n    ++            event.kind,\n    ++            salsa::EventKind::DidValidateInternedValue { key, .. }\n    ++                if db.ingredient_debug_name(key.ingredient_index()) == \"CallableAndCallExpr\"\n    ++        )),\n    ++        \"validating the semantic index depended on an interned call key\"\n    ++    );\n     +\n     +    db.write_file(\"/src/project/target.py\", format!(\"{source}changed = 1\\n\"))?;\n     +    semantic_index(&db, program_file(&db, file));\n```\n\n[Read the complete proposed commit](https://github.com/tamird/ruff/commit/1b9535f986af582c86f75977c4741c3b93eac83e). No PR-head update or maintainer reply has been posted.",
        "outcome": "approved"
      }
    ],
    "number": 30759,
    "refinement": {
      "before": {
        "head": "5678a81398ae87c721118445dd539e568f940c10"
      },
      "after": {
        "head": "1b9535f986af582c86f75977c4741c3b93eac83e"
      }
    },
    "merge": "a604f8ac5b27f9bfe1f594878c5d1fddbca23520"
  },
  {
    "id": "destructured-list-elements",
    "ref": "review/iteration-extraction-investigation",
    "title": "[ty] Preserve literals in loop unpacking",
    "state": "Submitted",
    "source": "50c072ba534604a0f69f0f4645f2441974201271",
    "summary": "PR #30848 now publishes 50c072, the one-line visibility repair of approved 6f413cc6. Shared sequence extraction and the uniform List/Tuple promotion policy are unchanged.",
    "qualifiedBase": "7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc",
    "qualifiedHead": "50c072ba534604a0f69f0f4645f2441974201271",
    "qualifiedCommitCount": 1,
    "qualifiedURL": "https://github.com/tamird/ruff/commit/50c072ba534604a0f69f0f4645f2441974201271",
    "qualification": {
      "summary": "Current 50c072 removes only helper visibility and passes semantic 515 (35 ignored), canonical hooks, formatting and strict Clippy. Python behavior and tests are unchanged; exact 6f retains the prior 532 Markdown, native and style proof. The measured benchmark remains exact 6f versus direct upstream parent 7d1: List 60.20 to 15.61 ms and Tuple 56.78 to 15.24 ms (one 256-pair shape, same-worker ABBA, 30 samples/run). The visibility-only head was not measured. The older 31bf comparison is historical. No general speedup or network-mode qualification is claimed.",
      "evidence": [
        {
          "label": "Delivered 50c072 visibility-only repair",
          "url": "https://github.com/tamird/ruff/commit/50c072ba534604a0f69f0f4645f2441974201271"
        },
        {
          "label": "Visibility repair: semantic tests, canonical hooks and strict style",
          "url": "https://app.buildbuddy.io/invocation/e0223e27-df23-4576-a308-6d5458e56199"
        },
        {
          "label": "Submitted Ruff PR #30848",
          "url": "https://github.com/astral-sh/ruff/pull/30848"
        },
        {
          "label": "Exact upstream-parent 7d1 versus 6f: 256-pair List/Tuple ABBA comparison",
          "url": "https://app.buildbuddy.io/invocation/088bcff0-12dc-4ac7-8006-3783c004ef8d"
        },
        {
          "label": "6f413cc6 shared extraction and bounded loop joins",
          "url": "https://github.com/tamird/ruff/commit/6f413cc6e6675225ce6f30e3e49c82f3929644fd"
        },
        {
          "label": "6f413cc6: final 532 Markdown, semantic, IDE and strict style qualification",
          "url": "https://app.buildbuddy.io/invocation/53184f7a-f684-4bbf-b5fc-7c00fcbb5b6d"
        },
        {
          "label": "Core 86 and ten consumer fixtures before equivalent early-return rewrite",
          "url": "https://app.buildbuddy.io/invocation/200e642c-8ec0-4064-9103-a3125d5bc690"
        },
        {
          "label": "Historical: 31bf versus 6f, 256-pair List/Tuple same-worker ABBA comparison",
          "url": "https://app.buildbuddy.io/invocation/2c8b5c1e-742f-41aa-889a-9d240b30307b"
        },
        {
          "label": "Historical: 31bf complete expression-iteration owner commit",
          "url": "https://github.com/tamird/ruff/commit/31bf4e4fd869f34c947e32701f5c5af386106587"
        },
        {
          "label": "Historical: 31bf: five whole boundary fixtures, 532 default Markdown and native/style qualification",
          "url": "https://app.buildbuddy.io/invocation/fbee6f68-fbd4-45e8-9d96-1324c61d391b"
        },
        {
          "label": "Historical: New comments-only 6e08 commit",
          "url": "https://github.com/tamird/ruff/commit/6e08e84a339ee7d27a36371c2b439db84cf58a3d"
        },
        {
          "label": "Historical: 6e08 canonical hooks; verified unchanged code/tests and reused native proof",
          "url": "https://app.buildbuddy.io/invocation/06b8444c-860c-4a54-a164-eaffb7b17c21"
        },
        {
          "label": "Historical: New f69 single commit for review",
          "url": "https://github.com/tamird/ruff/commit/f69b792ae4530552c91cff7375a2b6f2e9497a5c"
        },
        {
          "label": "Historical: f69: five fixtures, semantic tests and successful style build; wrapper-count failure disclosed",
          "url": "https://app.buildbuddy.io/invocation/378c990e-1dd7-4bca-9dae-aaf45f4c77d6"
        },
        {
          "label": "Historical: Earlier bf95: Current-base refresh: independent guarded phases",
          "url": "https://app.buildbuddy.io/invocation/4076d5be-7ee1-4e87-a1ed-5a6f5a0e0520"
        },
        {
          "label": "Historical: Earlier bf95: Review the single upstream commit",
          "url": "https://github.com/tamird/ruff/commit/bf95f29c54153597cd59bfb602fe5e56aa965e75"
        },
        {
          "label": "Historical: Earlier bf95: Matched baseline and revised qualification",
          "url": "https://app.buildbuddy.io/invocation/3e27961a-71f9-4e9f-abd3-526529ae6c41"
        }
      ]
    },
    "refinement": {
      "before": {
        "head": "6f413cc6e6675225ce6f30e3e49c82f3929644fd"
      },
      "after": {
        "head": "50c072ba534604a0f69f0f4645f2441974201271"
      }
    },
    "number": 30848,
    "nextAction": "Follow current-head CI and maintainer feedback. No reply has been posted.",
    "settledReviews": [
      {
        "kind": "proposal",
        "status": "approved",
        "head": "6f413cc6e6675225ce6f30e3e49c82f3929644fd",
        "baseHead": "7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc",
        "url": "https://github.com/tamird/ruff/commit/6f413cc6e6675225ce6f30e3e49c82f3929644fd",
        "title": "Review shared sequence extraction and bounded loop joins",
        "summary": "Tamir approved exact 6f413cc6 for upstream submission; it is published as PR #30848.",
        "body": "Review `6f413cc6`, replacing `31bf`. List and tuple displays now use the same sequence extraction as namedtuple, pytest and dynamic-class metadata. Metadata retains exact entries. Loops apply the existing 64-element promotion policy before joining those entries, uniformly for List and Tuple; explicitly annotated literals remain protected. Lazy root types, early stopping at unknown starred shapes, aliases and async recovery are retained.\n\nIn one same-worker ABBA workload with 256 distinct pairs, List changed from 82.96 to 22.39 ms and Tuple from 22.55 to 21.61 ms (30 samples per run). This is one shape and size, not a general performance claim. [Measurements](https://app.buildbuddy.io/invocation/2c8b5c1e-742f-41aa-889a-9d240b30307b).\n\nAll 532 default Markdown fixtures, semantic 515 (35 ignored), IDE 1964 and strict style checks pass on the final source. Core 86 passed before an equivalent early-return rewrite; the final Markdown run repeats all ten consumer fixtures. Existing List/Tuple blocks were reused, with no new suite. [Qualification](https://app.buildbuddy.io/invocation/53184f7a-f684-4bbf-b5fc-7c00fcbb5b6d).\n\n## Changes from the previous proposal\n\nUser approval is required before upstream submission.\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc..31bf4e4fd869f34c947e32701f5c5af386106587 7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc..6f413cc6e6675225ce6f30e3e49c82f3929644fd\n```\n\n```diff\n1:  31bf4e4fd8 ! 1:  6f413cc6e6 [ty] Preserve literals in loop unpacking\n    @@ Metadata\n      ## Commit message ##\n         [ty] Preserve literals in loop unpacking\n     \n    -    Destructuring an immediately consumed list widened literal elements,\n    -    while single-target iteration preserved them. Share expression iteration\n    -    between loop targets, comprehensions, and unpacking so display precision\n    -    and ordinary iteration have one owner.\n    +    Recover the same fixed sequence from immediately consumed list and tuple\n    +    displays when inferring loop targets. Share that recovery with declaration\n    +    metadata, retaining exact values and positions for names, defaults, and\n    +    class bases.\n     \n    -    Read already-inferred expression types, leaving error reporting and\n    -    recovery at the callers. Preserve the existing asynchronous target\n    -    behavior and the fixed-length iterable extractor.\n    +    Apply the existing literal promotion budget before joining loop elements\n    +    from large displays. This avoids expensive unions of distinct literal\n    +    tuples for either container, while preserving explicitly annotated literal\n    +    types. Keep ordinary iteration results and errors instead of discarding\n    +    variable-length results and iterating again.\n     \n      ## crates/ty_python_semantic/resources/mdtest/unpacking.md ##\n     @@ crates/ty_python_semantic/resources/mdtest/unpacking.md: for a, b in ((1, 2), (3, 4)):\n          reveal_type(b)  # revealed: Literal[2, 4]\n      ```\n      \n    -+### Large tuple literals\n    ++### Large list literals\n     +\n    -+Tuple inference widens literal types in tuples with more than 64 elements to limit inference cost.\n    -+Destructured loop targets preserve this widening.\n    ++Large display iterations widen inferred literals before combining their element types. This also\n    ++limits the cost of destructuring many distinct tuple elements.\n     +\n     +```py\n     +# fmt: off\n    -+for a, b in (\n    ++for a, b in [\n     +    (0, 0), (1, 1), (2, 2), (3, 3), (4, 4),\n     +    (5, 5), (6, 6), (7, 7), (8, 8), (9, 9),\n     +    (10, 10), (11, 11), (12, 12), (13, 13), (14, 14),\n    @@ crates/ty_python_semantic/resources/mdtest/unpacking.md: for a, b in ((1, 2), (3\n     +    (50, 50), (51, 51), (52, 52), (53, 53), (54, 54),\n     +    (55, 55), (56, 56), (57, 57), (58, 58), (59, 59),\n     +    (60, 60), (61, 61), (62, 62), (63, 63), (64, 64),\n    -+):\n    ++]:\n     +    reveal_type(a)  # revealed: int\n     +    reveal_type(b)  # revealed: int\n     +# fmt: on\n    @@ crates/ty_python_semantic/resources/mdtest/unpacking.md: for a, b in ((1, 2), (3\n     +\n     +### Large tuple literals with a single target\n     +\n    -+A single loop target preserves the same tuple inference limit as destructuring.\n    ++The same promotion budget applies when a loop has a single target.\n     +\n     +```py\n     +# fmt: off\n    @@ crates/ty_python_semantic/src/types/infer/builder.rs: use crate::types::infer::{\n      use crate::types::match_pattern::{ClassPatternPositionalResult, class_pattern_positional_result};\n      use crate::types::member::{class_body_declaration_from_bases, inherited_class_body_declaration};\n      use crate::types::narrow::NarrowingEvaluatorExtension;\n    +@@ crates/ty_python_semantic/src/types/infer/builder.rs: use crate::types::typevar::{\n    +     BoundTypeVarIdentity, TypeVarConstraints, TypeVarIdentity, TypeVarInstance, TypeVarSet,\n    + };\n    + use crate::types::unpacker::{\n    +-    UnpackResult, fixed_sequence_elements, sequence_from_literal_elements,\n    +-    tuple_literal_needs_promotion,\n    ++    UnpackResult, fixed_sequence_elements, literal_sequence_needs_promotion,\n    ++    sequence_from_literal_elements,\n    + };\n    + use crate::types::visitor::any_over_type_expanding_aliases;\n    + use crate::types::{\n     @@ crates/ty_python_semantic/src/types/infer/builder.rs: use crate::types::{\n          SentinelInstance, Signature, SpecialFormType, SubclassOfType, Type, TypeAliasType,\n          TypeAndQualifiers, TypeContext, TypeQualifiers, TypeVarBoundOrConstraints, TypeVarKind,\n    @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInfere\n                  }\n              };\n      \n    +@@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {\n    +         };\n    +         let spec = sequence_from_literal_elements(\n    +             elts,\n    +-            tuple_literal_needs_promotion(elts),\n    ++            literal_sequence_needs_promotion(elts),\n    +             &inferred_type,\n    +             &|expression, promote, known_length| {\n    +                 // Starred-expression inference has already reported iteration errors.\n     @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {\n                  // TODO: `infer_comprehension_definition` reports a diagnostic if `iter_ty` isn't iterable\n                  //  but only if the target is a name. We should report a diagnostic here if the target isn't a name:\n    @@ crates/ty_python_semantic/src/types/infer/builder.rs: impl<'db, 'ast> TypeInfere\n                  }\n              };\n      \n    +@@ crates/ty_python_semantic/src/types/infer/builder.rs: impl TupleInferenceMode {\n    +     /// when the tuple is large enough to require literal promotion.\n    +     fn for_literal(tuple: &ast::ExprTuple) -> Self {\n    +         if tuple.elts.iter().any(ast::Expr::is_starred_expr)\n    +-            || tuple_literal_needs_promotion(&tuple.elts)\n    ++            || literal_sequence_needs_promotion(&tuple.elts)\n    +         {\n    +             Self::WholeTuple\n    +         } else {\n     \n      ## crates/ty_python_semantic/src/types/iteration.rs ##\n     @@\n      use crate::Db;\n      use crate::ProgramEnvironment;\n     +use crate::types::dict::dict_literal_key_value_types;\n    ++use crate::types::unpacker::{literal_sequence_needs_promotion, sequence_elts};\n      use crate::types::{\n          AwaitError, Bindings, CallArguments, CallDunderError, KnownClass, LintDiagnosticGuard,\n          LintDiagnosticGuardBuilder, LiteralValueTypeKind, Type, TypeContext, TypeVarBoundOrConstraints,\n     @@ crates/ty_python_semantic/src/types/iteration.rs: pub(crate) fn extract_fixed_length_iterable_element_types<'db>(\n    -     Some(element_types.into_boxed_slice())\n    - }\n    +     iterable: &ast::Expr,\n    +     mut expression_type: impl FnMut(&ast::Expr) -> Type<'db>,\n    + ) -> Option<Box<[Type<'db>]>> {\n    +-    fn extend_fixed_length_iterable<'db>(\n    ++    let sequence = try_iterate_expression(db, env, iterable, &mut expression_type, |provider| {\n    ++        provider(iterable)\n    ++    })\n    ++    .ok()\n    ++    .flatten()?;\n    ++    let elements = sequence.as_fixed_length()?;\n    ++    Some(elements.all_elements().to_vec().into_boxed_slice())\n    ++}\n    ++\n    ++// Keep the ordinary type lazy: deferred declaration metadata can inspect literal children\n    ++// without inferring their container, and loop callers retain their authoritative inferred type.\n    ++fn try_iterate_expression<'db, F>(\n    ++    db: &'db dyn Db,\n    ++    env: &ProgramEnvironment<'db>,\n    ++    iterable: &ast::Expr,\n    ++    expression_type: &mut F,\n    ++    ordinary_type: impl FnOnce(&mut F) -> Type<'db>,\n    ++) -> Result<Option<Cow<'db, TupleSpec<'db>>>, IterationError<'db>>\n    ++where\n    ++    F: FnMut(&ast::Expr) -> Type<'db>,\n    ++{\n    ++    fn fixed_literal_sequence<'db>(\n    +         db: &'db dyn Db,\n    +         env: &ProgramEnvironment<'db>,\n    +-        iterable: &ast::Expr,\n    ++        elements: &[ast::Expr],\n    +         expression_type: &mut impl FnMut(&ast::Expr) -> Type<'db>,\n    +-        element_types: &mut Vec<Type<'db>>,\n    +-    ) -> Option<()> {\n    +-        let elements = match iterable {\n    +-            ast::Expr::List(list) => Some(&list.elts),\n    +-            ast::Expr::Tuple(tuple) => Some(&tuple.elts),\n    +-            _ => None,\n    +-        };\n    +-\n    +-        if let Some(elements) = elements {\n    +-            for element in elements {\n    +-                if let ast::Expr::Starred(starred) = element {\n    +-                    extend_fixed_length_iterable(\n    +-                        db,\n    +-                        env,\n    +-                        starred.value.as_ref(),\n    +-                        expression_type,\n    +-                        element_types,\n    +-                    )?;\n    ++    ) -> Option<TupleSpec<'db>> {\n    ++        let mut sequence = TupleSpecBuilder::with_capacity(elements.len());\n    ++        for element in elements {\n    ++            if let ast::Expr::Starred(starred) = element {\n    ++                let value = starred.value.as_ref();\n    ++                let unpacked = if let Some(elements) = sequence_elts(value) {\n    ++                    Cow::Owned(fixed_literal_sequence(db, env, elements, expression_type)?)\n    +                 } else {\n    +-                    element_types.push(expression_type(element));\n    +-                }\n    ++                    expression_type(value).try_iterate(db, env).ok()?\n    ++                };\n    ++                unpacked.as_fixed_length()?;\n    ++                sequence = sequence.concat(db, env, &unpacked);\n    ++            } else {\n    ++                sequence.push(expression_type(element));\n    +             }\n    +-            return Some(());\n    +         }\n    ++        Some(sequence.build())\n    ++    }\n      \n    +-        let iterable_type = expression_type(iterable);\n    +-        let spec = iterable_type.try_iterate(db, env).ok()?;\n    +-        let tuple = spec.as_fixed_length()?;\n    +-        element_types.extend(tuple.all_elements().iter().copied());\n    +-        Some(())\n    ++    let Some(elements) = sequence_elts(iterable) else {\n    ++        return ordinary_type(expression_type)\n    ++            .try_iterate(db, env)\n    ++            .map(Some);\n    ++    };\n    ++    Ok(fixed_literal_sequence(db, env, elements, expression_type).map(Cow::Owned))\n    ++}\n    ++\n     +/// Return the element type of an already-inferred iterable expression.\n     +pub(super) fn iterable_element_type<'db>(\n     +    db: &'db dyn Db,\n     +    env: &ProgramEnvironment<'db>,\n     +    iterable_type: Type<'db>,\n     +    iterable: &ast::Expr,\n    -+    expression_type: impl FnMut(&ast::Expr) -> Type<'db>,\n    ++    mut expression_type: impl FnMut(&ast::Expr) -> Type<'db>,\n     +    mode: EvaluationMode,\n     +) -> Result<Type<'db>, IterationError<'db>> {\n    -+    if !mode.is_async() {\n    -+        match iterable {\n    -+            ast::Expr::List(_) => {\n    -+                // List inference promotes literals for later mutation. This display is consumed\n    -+                // immediately, so use its already-inferred element expression types.\n    -+                if let Some(element_types) =\n    -+                    extract_fixed_length_iterable_element_types(db, env, iterable, expression_type)\n    -+                    && !element_types.is_empty()\n    -+                {\n    -+                    return Ok(UnionType::from_elements(\n    -+                        db,\n    -+                        env,\n    -+                        element_types.iter().copied(),\n    -+                    ));\n    -+                }\n    -+            }\n    -+            ast::Expr::Dict(dict) => {\n    -+                if let Some((keys, _values)) =\n    -+                    dict_literal_key_value_types(db, env, dict, expression_type)\n    -+                {\n    -+                    return Ok(keys);\n    -+                }\n    -+            }\n    -+            _ => {}\n    -+        }\n    ++    if mode.is_async() {\n    ++        return iterable_type\n    ++            .try_iterate_with_mode(db, env, mode)\n    ++            .map(|tuple| tuple.homogeneous_element_type(db, env));\n     +    }\n    -+    iterable_type\n    -+        .try_iterate_with_mode(db, env, mode)\n    -+        .map(|tuple| tuple.homogeneous_element_type(db, env))\n    -+}\n    -+\n    ++    if let ast::Expr::Dict(dict) = iterable\n    ++        && let Some((keys, _values)) =\n    ++            dict_literal_key_value_types(db, env, dict, &mut expression_type)\n    ++    {\n    ++        return Ok(keys);\n    +     }\n    + \n    +-    let mut element_types = Vec::new();\n    +-    extend_fixed_length_iterable(db, env, iterable, &mut expression_type, &mut element_types)?;\n    +-    Some(element_types.into_boxed_slice())\n    ++    let literal_elements = sequence_elts(iterable);\n    ++    let extracted =\n    ++        try_iterate_expression(db, env, iterable, &mut expression_type, |_| iterable_type)?;\n    ++    // Failed or variable-length literal expansions use the inferred container type. Inference\n    ++    // already reported starred-expression errors, and an empty list keeps its ordinary recovery.\n    ++    let extracted = extracted.filter(|sequence| {\n    ++        literal_elements.is_none()\n    ++            || sequence\n    ++                .as_fixed_length()\n    ++                .is_some_and(|elements| !elements.all_elements().is_empty())\n    ++    });\n    ++    let sequence = match extracted {\n    ++        Some(sequence) => sequence,\n    ++        None => iterable_type.try_iterate(db, env)?,\n    ++    };\n    ++    if let Some(elements) = sequence.as_fixed_length()\n    ++        && !elements.all_elements().is_empty()\n    ++    {\n    ++        // Promote before constructing unions of distinct literal tuples, which the generic\n    ++        // literal-union caps do not cover. Lists and tuples use the same sequence limit.\n    ++        let promote = literal_elements.is_some_and(literal_sequence_needs_promotion);\n    ++        return Ok(UnionType::from_elements_leave_aliases(\n    ++            db,\n    ++            env,\n    ++            elements\n    ++                .iter_all_elements()\n    ++                .map(|ty| if promote { ty.promote(db, env) } else { ty }),\n    ++        ));\n    ++    }\n    ++    Ok(sequence.homogeneous_element_type(db, env))\n    + }\n    + \n      impl<'db> Type<'db> {\n    -     /// Recognizes coroutines whose results can be iterated over asynchronously.\n    -     ///\n     \n      ## crates/ty_python_semantic/src/types/unpacker.rs ##\n     @@ crates/ty_python_semantic/src/types/unpacker.rs: use ruff_python_ast::{self as ast, AnyNodeRef};\n    @@ crates/ty_python_semantic/src/types/unpacker.rs: impl<'db, 'ast> Unpacker<'db, '\n                  }\n                  UnpackKind::ContextManager { mode } => {\n                      let env = self.context.program_environment();\n    +@@ crates/ty_python_semantic/src/types/unpacker.rs: fn literal_sequence_elements(\n    +     // `a, *rest = (items := [1, \"two\"])` has the same elements as the list itself.\n    +     let expression = expression.expression_value();\n    +     let values = sequence_elts(expression)?;\n    +-    let promote = promote || (expression.is_tuple_expr() && tuple_literal_needs_promotion(values));\n    ++    let promote =\n    ++        promote || (expression.is_tuple_expr() && literal_sequence_needs_promotion(values));\n    +     Some((values, promote))\n    + }\n    + \n    +-/// Applies the tuple precision limit after expanding literal elements. For `(*[1, 2], 3)`,\n    ++/// Applies the literal precision limit after expanding sequence elements. For `(*[1, 2], 3)`,\n    + /// all three positions count, even though the outer tuple has only two AST elements.\n    + /// Other starred iterables count as one item because their elements are not recovered from\n    + /// literal syntax. Stop counting as soon as the limit is exceeded.\n    +-pub(super) fn tuple_literal_needs_promotion(values: &[ast::Expr]) -> bool {\n    +-    /// Limit literal precision in large tuple expressions to avoid pathological inference costs.\n    +-    const MAX_TUPLE_LENGTH_FOR_UNANNOTATED_LITERAL_INFERENCE: usize = 64;\n    ++pub(super) fn literal_sequence_needs_promotion(values: &[ast::Expr]) -> bool {\n    ++    /// Limit literal precision in large sequence expressions to avoid pathological inference costs.\n    ++    const MAX_SEQUENCE_LENGTH_FOR_LITERAL_INFERENCE: usize = 64;\n    + \n    +     fn remaining_budget(values: &[ast::Expr], remaining: usize) -> Option<usize> {\n    +         values.iter().try_fold(remaining, |remaining, value| {\n    +@@ crates/ty_python_semantic/src/types/unpacker.rs: pub(super) fn tuple_literal_needs_promotion(values: &[ast::Expr]) -> bool {\n    +         })\n    +     }\n    + \n    +-    remaining_budget(values, MAX_TUPLE_LENGTH_FOR_UNANNOTATED_LITERAL_INFERENCE).is_none()\n    ++    remaining_budget(values, MAX_SEQUENCE_LENGTH_FOR_LITERAL_INFERENCE).is_none()\n    + }\n    + \n    + /// Builds a literal's sequence shape from already-inferred elements and iterable shapes.\n    +@@ crates/ty_python_semantic/src/types/unpacker.rs: fn literal_iterable_length(expression: &ast::Expr) -> Option<usize> {\n    + }\n    + \n    + /// Extract the element slice from a list or tuple expression.\n    +-fn sequence_elts(expr: &ast::Expr) -> Option<&[ast::Expr]> {\n    ++pub(super) fn sequence_elts(expr: &ast::Expr) -> Option<&[ast::Expr]> {\n    +     match expr {\n    +         ast::Expr::List(list) => Some(&list.elts),\n    +         ast::Expr::Tuple(tuple) => Some(&tuple.elts),\n```\n\n[Read the complete proposed commit](https://github.com/tamird/ruff/commit/6f413cc6e6675225ce6f30e3e49c82f3929644fd).",
        "outcome": "approved"
      },
      {
        "kind": "amendment",
        "head": "50c072ba534604a0f69f0f4645f2441974201271",
        "baseHead": "6f413cc6e6675225ce6f30e3e49c82f3929644fd",
        "url": "https://github.com/tamird/ruff/commit/50c072ba534604a0f69f0f4645f2441974201271",
        "postedURL": "https://github.com/astral-sh/ruff/pull/30848",
        "title": "Delivered visibility repair of the approved loop contribution",
        "summary": "Delivered the one-line private-visibility CI repair of the 6f contribution under its existing approval; Tamir\u2019s exact approval remains recorded on 6f.",
        "body": "PR #30848 now publishes `50c072ba`, the visibility-only repair of approved `6f413cc6`. It removes `pub(super)` from an iteration helper whose uses are all in the same module. Python behavior, tests and benchmark code are unchanged. This is authorized delivery of the approved contribution, not a new exact-head user approval.\n\nThe visibility repair passes semantic 515 (35 ignored), canonical hooks, formatting and strict Clippy. The original 6f native and all-532-Markdown qualification remains applicable to the unchanged behavior. [Repair qualification](https://app.buildbuddy.io/invocation/e0223e27-df23-4576-a308-6d5458e56199). The direct upstream-parent benchmark measured exact 6f against 7d1: List 60.20 to 15.61 ms and Tuple 56.78 to 15.24 ms in one 256-pair same-worker ABBA workload. The later visibility-only head was not measured; no general performance claim is made. [Measurements](https://app.buildbuddy.io/invocation/088bcff0-12dc-4ac7-8006-3783c004ef8d).\n\n## Changes from the approved contribution\n\n```sh\ngit range-diff --no-color --no-dual-color --creation-factor=999 7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc..6f413cc6e6675225ce6f30e3e49c82f3929644fd 7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc..50c072ba534604a0f69f0f4645f2441974201271\n```\n\n```diff\n1:  6f413cc6e6 ! 1:  50c072ba53 [ty] Preserve literals in loop unpacking\n    @@ crates/ty_python_semantic/src/types/iteration.rs: pub(crate) fn extract_fixed_le\n      }\n      \n      impl<'db> Type<'db> {\n    +@@ crates/ty_python_semantic/src/types/iteration.rs: impl<'db> Type<'db> {\n    +         self.try_iterate_with_mode(db, env, EvaluationMode::Sync)\n    +     }\n    + \n    +-    pub(super) fn try_iterate_with_mode(\n    ++    fn try_iterate_with_mode(\n    +         self,\n    +         db: &'db dyn Db,\n    +         env: &ProgramEnvironment<'db>,\n     \n      ## crates/ty_python_semantic/src/types/unpacker.rs ##\n     @@ crates/ty_python_semantic/src/types/unpacker.rs: use ruff_python_ast::{self as ast, AnyNodeRef};\n```\n\n[Read the delivered commit](https://github.com/tamird/ruff/commit/50c072ba534604a0f69f0f4645f2441974201271).",
        "outcome": "posted"
      }
    ]
  },
  {
    "id": "related-upstream-29027",
    "title": "Add existential quantification nodes",
    "number": 29027,
    "state": "Related upstream work",
    "author": "dcreager",
    "summary": "Overlaps the fork's existential binders, freshening and signed proofs. Compare source and runtime behavior before extracting another binder implementation."
  },
  {
    "id": "related-upstream-27665",
    "title": "Collect type context from function calls during full-scope bidirectional inference",
    "number": 27665,
    "state": "Related upstream work",
    "author": "ibraheemdev",
    "summary": "Existing collection-context implementation overlaps the fork: identity-specialized collection calls, sibling constraints, original overload filtering and protection against self-feedback. Reconcile later refinements with this PR before proposing additions."
  },
  {
    "id": "related-upstream-29553",
    "title": "Stabilize lambda inference with finite signatures",
    "number": 29553,
    "state": "Related upstream work",
    "author": "charliermarsh",
    "summary": "Stabilizes lambda identity and signature inference. Compare this work before extracting contextual lambda and callback changes; source overlap is still being reviewed."
  },
  {
    "id": "related-upstream-29681",
    "title": "Respect declared dictionary value types when narrowing keys",
    "number": 29681,
    "state": "Related upstream work",
    "author": "charliermarsh",
    "summary": "Preserves declared dictionary value types using annotated-assignment rules. Related to observation policy; it does not establish that the fork's snapshot and transfer implementation is already upstream."
  },
  {
    "id": "related-upstream-23937",
    "title": "Support narrowing with aliased conditional expressions",
    "number": 23937,
    "state": "Related upstream work",
    "author": "mtshiba",
    "summary": "Handles cross-scope and chained condition aliases through structural places and reassignment snapshots. Reconcile with the fork's saved member, key and call histories; these implementations are not equivalent."
  },
  {
    "id": "related-upstream-27661",
    "title": "Resolve deferred references from current and future bindings",
    "number": 27661,
    "state": "Related upstream work",
    "author": "carljm",
    "summary": "Resolves deferred annotations from current and future bindings. Compare with host source/stub and foreign annotation changes before proposing overlapping lookup work."
  },
  {
    "id": "related-upstream-29555",
    "title": "Experiment with generic FunctionType inference",
    "number": 29555,
    "state": "Related upstream work",
    "author": "carljm",
    "summary": "Experiments with generic FunctionType and MethodType. Compare the callable representation and ParamSpec requirements before extracting related function and method changes."
  },
  {
    "id": "local-keyword-dicts",
    "title": "Local keyword dictionaries",
    "number": 29138,
    "state": "In upstream review",
    "author": "zsol"
  },
  {
    "id": "conditional-keyword-dicts",
    "title": "Conditional keyword dictionaries",
    "number": 29141,
    "state": "In upstream review",
    "author": "zsol"
  },
  {
    "id": "nested-access-design",
    "title": "Alternative semantic-index design",
    "number": 29186,
    "state": "Related upstream design",
    "author": "upstream"
  },
  {
    "id": "dictionary-completions",
    "title": "Dictionary-key completions",
    "number": 28820,
    "state": "Merged",
    "author": "zsol",
    "source": "3cd0176407",
    "merge": "6cddbe8ee3"
  },
  {
    "id": "literal-call-unpacking",
    "title": "Literal call unpacking",
    "number": 28821,
    "state": "Merged",
    "author": "zsol",
    "source": "26e5603efa",
    "merge": "da9e37289d"
  },
  {
    "id": "empty-collection-peers",
    "title": "Empty collection peers",
    "number": 29131,
    "state": "Merged",
    "author": "zsol",
    "source": "7914a959af",
    "merge": "5d16eb00e9"
  },
  {
    "id": "final-receivers",
    "title": "Composite Final restrictions",
    "number": 29135,
    "state": "Merged",
    "author": "zsol",
    "source": "cf8a56c1a9",
    "merge": "73e6c488b6"
  },
  {
    "id": "closed-dict-defaults",
    "title": "Absent closed-TypedDict get defaults",
    "number": 29136,
    "state": "Merged",
    "author": "zsol",
    "source": "773bc39f51",
    "merge": "97aa1f69d8"
  }
];

// Reconciled against user-authored Bazel typing issues; successful API read, not fresh repros.
export const bazelFeedbackObservedAt = "2026-11-21T01:08:20Z";
export const bazelFeedback = [
  {
    "number": 32381,
    "title": "Express a hashability bound on a generic type parameter",
    "summary": "Skylib collections.uniq preserves element types but must reject nested unhashable inputs. Bound syntax is rejected; do not equate an unconstrained generic with a safe dictionary key.",
    "state": "open",
    "updatedAt": "2026-11-05T02:48:57Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32379,
    "title": "Describe predicates that narrow a caller’s argument type",
    "summary": "Skylib types.is_string and types.is_list need caller narrowing that preserves list element types. A boolean return alone does not supply this contract.",
    "state": "open",
    "updatedAt": "2026-11-03T22:10:37Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32377,
    "title": "Reference a provider type without introducing a load cycle",
    "summary": "DirectoryInfo helpers cannot load their calling provider module only for annotations without a cycle; moving a provider changes its defining-label identity.",
    "state": "open",
    "updatedAt": "2026-11-13T19:25:41Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32370,
    "title": "Describe the fields a helper reads from a host object",
    "summary": "A helper requiring readable ctx.file or bazel_module fields cannot accept the real host object through an open struct contract. Distinct from rule callback inference.",
    "state": "open",
    "updatedAt": "2026-11-03T15:20:19Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32369,
    "title": "Type-check ctx.attr against the attributes declared on a rule",
    "summary": "The native checker accepts assigning attr.bool() to str and reading misspelled ctx.attr fields. Infer callback context from the declaration instead of repeating its schema.",
    "state": "open",
    "updatedAt": "2026-11-03T15:09:45Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32343,
    "title": "Type forwarded keyword arguments in Starlark macros",
    "summary": "Ordinary **kwargs wrappers hide required-argument and value-type errors. sty prototypes Unpack[KeywordArgs[callee]]; symbolic macro inherit_attrs is a different mechanism.",
    "state": "open",
    "updatedAt": "2026-11-02T19:00:52Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32311,
    "title": "Expose an annotation type for repository paths",
    "summary": "repository_ctx.path() values cannot be named as path or Path in native annotations.",
    "state": "open",
    "updatedAt": "2026-10-31T11:32:36Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32207,
    "title": "Allow Starlark provider declarations to specify field types",
    "summary": "Native provider(fields=...) assigns Any to fields and misses wrong returns. sty accepts source field comments and companion provider contracts.",
    "state": "open",
    "updatedAt": "2026-10-28T18:14:45Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32104,
    "title": "Annotate parameters with finite sets of strings",
    "summary": "platforms_contrib accepts x86-64 levels v1–v4, but native annotations cannot express Literal strings and reject v5 statically.",
    "state": "open",
    "updatedAt": "2026-10-26T15:05:37Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32086,
    "title": "Allow AnalysisTestResultInfo as an annotation type",
    "summary": "The native checker rejects the public analysis-test result constructor as a type.",
    "state": "open",
    "updatedAt": "2026-11-02T22:51:48Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32085,
    "title": "Expose the type of a rule’s provider values",
    "summary": "list[struct] admits ctx.outputs although analysis rejects it as a provider. Provider constructors and provider instances need distinct contracts.",
    "state": "open",
    "updatedAt": "2026-10-25T22:15:49Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32059,
    "title": "Accept iterable OutputGroupInfo values as Collection",
    "summary": "OutputGroupInfo iterates keys and is accepted by native visibility but rejected at a Collection annotation. Starlark #318 already merged the collection distinction.",
    "state": "open",
    "updatedAt": "2026-10-25T16:00:36Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32044,
    "title": "Support recursive type aliases",
    "summary": "A recursive Json alias cannot resolve its own list/dictionary references in the native checker.",
    "state": "open",
    "updatedAt": "2026-10-23T21:48:58Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32024,
    "title": "Accept real Target values in dynamic type checking",
    "summary": "Native dynamic annotation checking rejects dependency and source-file Targets. Disabling dynamic checking makes the reproduced analysis succeed; this is separate from static inference.",
    "state": "open",
    "updatedAt": "2026-10-23T14:39:45Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32022,
    "title": "Narrow optional lists after a None guard",
    "summary": "The native checker still treats a guarded list[str] as list[str] | None. This blocks using native annotations throughout the netrc parser, not its current type-comment fix.",
    "state": "open",
    "updatedAt": "2026-10-23T14:00:20Z",
    "nextAction": "The current prerelease still reproduces this report. Prepare a concise confirmation for Tamir review; nothing has been posted.",
    "retest": {
      "summary": "Retested 2026-11-20: official Bazel 10.0.0rc4 rejects the original guarded for-loop under --experimental_starlark_type_checking; the same module loads without that flag. Bazel 9.3.3 accepts both commands, which does not establish a fix in the newer checker.",
      "url": "https://app.buildbuddy.io/invocation/4549ead0-7c3d-441e-98d9-2334aa8ba52a"
    }
  },
  {
    "number": 32021,
    "title": "Support depset element types in annotations",
    "summary": "Bare depset is accepted, but depset[str] is rejected as a nullary type constructor; collection payload contracts need parameterization.",
    "state": "open",
    "updatedAt": "2026-10-23T14:00:13Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  },
  {
    "number": 32020,
    "title": "Expose module and repository context annotation types",
    "summary": "Ctx exists for rule callbacks, while module_ctx and repository_ctx are absent from the native annotation environment.",
    "state": "open",
    "updatedAt": "2026-11-04T21:26:56Z",
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
  }
];

export const relatedChanges = [
  {
    "repo": "bazelbuild/bazel-skylib",
    "number": 643,
    "title": "Report duplicate Label conditions",
    "head": "c37db57d4f08817c1cabdb8cd8c9fc0a2cdd56d8",
    "state": "open",
    "summary": "Extracted from Skylib #641; runtime duplicate-label diagnostic fix.",
    "parent": [
      "bazelbuild/bazel-skylib",
      641
    ],
    "relation": "includes"
  },
  {
    "repo": "bazelbuild/bazel-skylib",
    "number": 647,
    "title": "Recommend execpath in run_binary",
    "head": "f64c8d9fa0898a9041ac6d1b996eca99f0a34ee5",
    "state": "open",
    "summary": "Buildifier documentation/parser compatibility; recorded inside Skylib #641.",
    "parent": [
      "bazelbuild/bazel-skylib",
      641
    ],
    "relation": "includes"
  },
  {
    "repo": "bazelbuild/bazel-skylib",
    "number": 644,
    "title": "Accept native tag inputs in build_test",
    "head": "dc432570bb651ab14df44e33db75877da55ec17e",
    "state": "open",
    "summary": "Separate runtime tags compatibility fix extracted from #641; not an established landing prerequisite."
  },
  {
    "repo": "bazelbuild/rules_cc",
    "number": 960,
    "title": "Use public Bazel Features compatibility flag",
    "head": "e64ff1bf4df7e8f8f728db44c35181d31247a57a",
    "state": "closed",
    "summary": "Closed without merging. Do not count the compatibility-proxy change as landed."
  },
  {
    "repo": "bazelbuild/rules_cc",
    "number": 967,
    "title": "Allow header-only Objective-C compilation artifacts",
    "head": "a39dcb143af056cc8eb0736ce39c933e3f7a38a2",
    "state": "open",
    "summary": "Runtime empty-source handling and actionable missing-factory error; related to rules_cc typing, not a proven blocker."
  }
];

export const languageWork = [
  {
    "repo": "bazelbuild/starlark",
    "number": 362,
    "title": "Specify Starlark annotation syntax",
    "state": "open",
    "summary": "Open language-spec proposal includes namespaced type names used by Buck2. Syntax only: it does not specify checking semantics. sty field-map, openness and record semantics remain extensions."
  },
  {
    "repo": "bazelbuild/starlark",
    "number": 318,
    "title": "Align Collection, Sequence and Iterable",
    "state": "merged",
    "summary": "Merged 2025-09-02. sty already follows Collection for iterables and Sequence for indexed/sliced containers. A landed specification does not prove every host implementation conforms."
  }
];

export const additionalProjects = [
  {
    "name": "Bazel netrc helpers",
    "repo": "bazelbuild/bazel",
    "number": 32042,
    "title": "Type empty netrc entries and auth patterns",
    "head": "0e0a4084463d41831a1b6d77e88b7a39d1272609",
    "draft": false,
    "summary": "Declare netrc entry/auth-pattern value types at their allocation boundaries.",
    "checks": "The mechanical rebase resolves the generated lockfile conflict. Bazel’s default-lockfile verifier passed remotely, including on master 1b7e3767.",
    "followup": "Native annotations would enable the whole-parser checker and encounter the optional-key narrowing gap in #32022. Current type-comment change does not require that bug to land first.",
    "nextAction": "Follow CI and maintainer review on the rebased head.",
    "settledReviews": [
      {
        "kind": "amendment",
        "status": "settled",
        "head": "0e0a4084463d41831a1b6d77e88b7a39d1272609",
        "baseHead": "0e050975ccf0a0c6964d6f75bc277929553b7888",
        "url": "https://github.com/tamird/bazel/commit/0e0a4084463d41831a1b6d77e88b7a39d1272609",
        "title": "Review regenerated Bazel test lockfile",
        "summary": "The mechanical rebase is published on #32042. The Starlark annotations are unchanged.",
        "body": "Bazel master changed the generated test lockfile. The rebased commit keeps both Starlark annotations and uses the digests emitted by the repository’s lockfile generator. [Remote lockfile verification](https://app.buildbuddy.io/invocation/8aebe42f-eb88-43e6-9eaf-01010c9d5d2f).\n\nCaptured with `git range-diff --no-color --no-dual-color --creation-factor=999 0e050975ccf0a0c6964d6f75bc277929553b7888^! 0e0a4084463d41831a1b6d77e88b7a39d1272609^!`.\n\n```diff\n1:  0e050975 ! 1:  0e0a4084 Type empty netrc entries and auth patterns\n    @@ src/test/tools/bzlmod/MODULE.bazel.lock\n        \"moduleExtensions\": {\n          \"@@rules_kotlin+//src/main/starlark/core/repositories:bzlmod_setup.bzl%rules_kotlin_extensions\": {\n            \"general\": {\n    --        \"bzlTransitiveDigest\": \"NQFIdq+YnfvjDoMTtaioZwbozGcB7rrpgG8sO/Zz30k=\",\n    -+        \"bzlTransitiveDigest\": \"CBolO2P5L7Ofqt9FhraKPpbSSChR+gmj6p/YOxjWETw=\",\n    +-        \"bzlTransitiveDigest\": \"6ME6/jGDagS39Ejq+9RGIUiKVWKi5JsB5f/WuN2b4gU=\",\n    ++        \"bzlTransitiveDigest\": \"MBLFxyNs7mQPCLrv7GDEeq9+GpM0cAmKgZS4nZD2/QM=\",\n              \"usagesDigest\": \"ZQiGVXrj8yl+WvAOGWZCipKxak7/2zZWT+1/qI4Ac4U=\",\n              \"recordedInputs\": [\n                \"REPO_MAPPING:rules_kotlin+,bazel_tools bazel_tools\"\n```",
        "outcome": "posted"
      }
    ],
    "dependencies": [
      [
        "Bazel None-narrowing feedback #32022",
        "https://github.com/bazelbuild/bazel/issues/32022"
      ]
    ]
  },
  {
    "name": "rules_java",
    "repo": "bazelbuild/rules_java",
    "number": 388,
    "title": "Construct java_common with explicit fields",
    "head": "ddd484a4dc5e46879bca1df691f6648fa274d63d",
    "draft": false,
    "summary": "Expose unconditional struct fields directly while preserving conditional-field values and evaluation order.",
    "checks": "PR reports a downstream sty check resolves provider key/callable signatures; provider-level current check receipts are not collected here.",
    "followup": "sty loses field types across the unannotated java_common factory. This is a support refactor, not a claim that all rules_java sources are type checked.",
    "nextAction": "Recheck factory inference before retaining the source refactor workaround.",
    "dependencies": []
  }
];

// Units are mechanisms to reconcile, not a claim that each historical commit remains needed.
const reviewedTyWork = [
  {
    "id": "ty-inplace-notimplemented",
    "title": "Fall back when an in-place operator returns NotImplemented",
    "state": "Submitted upstream",
    "summary": "Tamir approved exact 0af5b7f2e, submitted as Ruff #30898. The in-place NotImplemented correction preserves other return alternatives and uses existing ordinary/reflected dispatch.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Treat NotImplemented from in-place operations as binary fallback",
        "paths": [
          "crates/ty_python_semantic/src/types/infer/builder.rs"
        ]
      },
      {
        "commit": "0af5b7f2e02fa2efddd6b6ff0cc1e37af09142b9",
        "detail": "Qualified independent in-place NotImplemented fallback on current upstream",
        "paths": [
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/resources/mdtest/assignment/augmented.md"
        ]
      }
    ],
    "nextAction": "Reconcile the fork with the outcome of upstream PR #30898 after review and merge.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/infer/builder.rs#L5354"
      },
      {
        "label": "Approved standalone contribution",
        "url": "https://github.com/tamird/ruff/commit/0af5b7f2e02fa2efddd6b6ff0cc1e37af09142b9"
      },
      {
        "label": "Submitted upstream PR #30898",
        "url": "https://github.com/astral-sh/ruff/pull/30898"
      }
    ]
  },
  {
    "id": "ty-protocol-collection-context",
    "title": "Use nongeneric protocols as collection literal context",
    "state": "Python enhancement candidate",
    "summary": "Use compatible protocol members to infer collection elements, including nested TypedDict fields. A protocol need not declare a type parameter to supply useful context. Extraction and runtime qualification remain incomplete.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Use nongeneric protocol members as collection literal context",
        "paths": [
          "crates/ty_python_semantic/src/types/infer/builder.rs"
        ]
      }
    ],
    "nextAction": "Compare with upstream #27665 before extracting; qualify aliases, unions, missing and extra fields, and incompatible index signatures.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/infer/builder.rs#L7197"
      }
    ]
  },
  {
    "id": "ty-boolean-payload-tuples",
    "title": "Retain Boolean tags alongside tuple payloads",
    "state": "Python enhancement candidate",
    "summary": "Keep the relationship between a Boolean tag and its payload when a tuple is formed from local values. Extraction and runtime qualification remain incomplete.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Retain tag/payload relationships when forming tuples from passive locals",
        "paths": [
          "crates/ty_python_semantic/src/types/infer/builder.rs"
        ]
      }
    ],
    "nextAction": "Reduce a Python example; verify mutations, loop headers, ownership of the source values and subsequent narrowing.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/infer/builder.rs#L8099"
      }
    ]
  },
  {
    "id": "ty-collection-use-inference",
    "title": "Reconcile collection-use inference with upstream #27665",
    "state": "Fork correction qualified; upstream extraction pending",
    "summary": "The published checker retains complete later contexts for empty dictionaries, lists and sets. Skylib root and Gazelle checks now pass. Thirty native cases and incremental query-order controls cover generic keys, aliases, conflicting consumers and invalid writes; current-upstream extraction and overlap review remain open.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Infer one tracked collection argument from sibling call constraints without self-feedback",
        "paths": [
          "crates/ty_python_semantic/src/types/infer/builder.rs"
        ]
      }
    ],
    "nextAction": "Reduce the correction on current upstream and compare with ibraheemdev’s draft PR27665 at e344ca6974. Its four-file patch collects context from generic calls with one tracked collection argument; do not treat it as equivalent to selecting complete later invariant contexts. Preserve invalid writes, caller variables, conflicting consumers and query-order coverage before requesting Tamir review.",
    "evidence": [
      {
        "label": "Published collection correction",
        "url": "https://github.com/tamird/ruff/commit/7ee1132fd198c1b1de4971af746cf875c0a07e84"
      },
      {
        "label": "Thirty actual cases and stable repository hooks",
        "url": "https://app.buildbuddy.io/invocation/3254b6ac-fab4-40ea-9416-3e21728421fd"
      },
      {
        "label": "Experimental run: existing collection regressions restored; new context controls still fail",
        "url": "https://app.buildbuddy.io/invocation/4f07218d-8e09-4dfc-aef3-0cb1c7c1feca"
      },
      {
        "label": "Existing collection-context workstream #27665",
        "url": "https://github.com/astral-sh/ruff/pull/27665"
      },
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/infer/builder.rs#L10413"
      }
    ]
  },
  {
    "id": "ty-operator-context",
    "title": "Use expected types when inferring operator calls",
    "state": "Python enhancement candidate",
    "summary": "Normal and reflected operator calls can use the caller's expected type. Keep dispatch order and cache identity correct. Source reviewed at dfe98a7d; extraction and runtime qualification remain incomplete.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Contextual inference at the actual selected binary operator call",
        "paths": [
          "crates/ty_python_semantic/src/types/call.rs"
        ]
      }
    ],
    "nextAction": "Reduce a Python example; test reflected subclass priority, contextual callbacks and recursive calls.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call.rs#L235"
      }
    ]
  },
  {
    "id": "ty-constructor-class-arguments",
    "title": "Keep explicit constructor type arguments fixed",
    "state": "Python bugfix candidate",
    "summary": "Infer omitted class parameters during construction while preserving parameters explicitly supplied by the caller. Source reviewed at dfe98a7d; extraction and runtime qualification remain incomplete.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Keep explicit constructor class arguments fixed",
        "paths": [
          "crates/ty_python_semantic/src/types/call/bind/constructor.rs"
        ]
      }
    ],
    "nextAction": "Compare C(...) with C[int](...) on upstream; cover both __new__ and __init__, receiver overrides and omitted constructor stages.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind/constructor.rs#L52"
      }
    ]
  },
  {
    "id": "ty-typed-dict-key-groups",
    "title": "Group TypedDict.get keys without losing literals",
    "state": "Submitted upstream",
    "summary": "Tamir approved exact 5d2628cbb, submitted as Ruff #30897. The TypedDict.get correction groups keys only within one declared value-type and requiredness group; mixed groups keep existing fallback behavior.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Preserve precise get results for unions of equivalent literal keys",
        "paths": [
          "crates/ty_python_semantic/src/types/class/typed_dict.rs"
        ]
      },
      {
        "commit": "5d2628cbb2296f33d81828f6ce34a7140a36e5e4",
        "detail": "Qualified independent grouping of equivalent TypedDict.get keys",
        "paths": [
          "crates/ty_python_semantic/src/types/class/typed_dict.rs",
          "crates/ty_python_semantic/resources/mdtest/typed_dict.md"
        ]
      }
    ],
    "nextAction": "Reconcile the fork with the outcome of upstream PR #30897 after review and merge.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/class/typed_dict.rs#L391"
      },
      {
        "label": "Approved standalone contribution",
        "url": "https://github.com/tamird/ruff/commit/5d2628cbb2296f33d81828f6ce34a7140a36e5e4"
      },
      {
        "label": "Submitted upstream PR #30897",
        "url": "https://github.com/astral-sh/ruff/pull/30897"
      }
    ]
  },
  {
    "id": "ty-typed-dict-views",
    "title": "Derive TypedDict views from dictionary declarations",
    "state": "Python enhancement / host API candidate",
    "summary": "Use the configured dictionary declarations for keys, values and items views while retaining each schema's key and value types. Source reviewed at dfe98a7d; extraction and runtime qualification remain incomplete.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Derive TypedDict items/keys/values from configured dict declarations",
        "paths": [
          "crates/ty_python_semantic/src/types/class/typed_dict.rs"
        ]
      }
    ],
    "nextAction": "Qualify ordinary Python view classes plus open, closed and extra-item schemas; test a host with custom dictionary views.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/class/typed_dict.rs#L6"
      }
    ]
  },
  {
    "id": "ty-typed-dict-merge",
    "title": "Preserve overwrite direction in TypedDict merges",
    "state": "Python enhancement candidate",
    "summary": "Infer merge result values from the operand that wins each key, including additional keys and reflected operations. Source reviewed at dfe98a7d; extraction and runtime qualification remain incomplete.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Preserve merge direction, schema values and fresh dictionary results",
        "paths": [
          "crates/ty_python_semantic/src/types/class/typed_dict.rs"
        ]
      }
    ],
    "nextAction": "Reduce upstream failures; check both operand orders, read-only extra items and the fresh ordinary dictionary result.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/class/typed_dict.rs#L6"
      }
    ]
  },
  {
    "id": "ty-known-generic-subclass",
    "title": "Specialize known generic subclasses before checking them",
    "state": "Python bugfix candidate",
    "summary": "Apply default specialization when checking subclasses of known generic classes. Source reviewed at dfe98a7d; extraction and runtime qualification remain incomplete.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Use default specialization for known generic subclass checks",
        "paths": [
          "crates/ty_python_semantic/src/types/class/known.rs"
        ]
      }
    ],
    "nextAction": "Produce a minimal Python regression on upstream and verify recursive subtype checks.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/class/known.rs#L1518"
      }
    ]
  },
  {
    "id": "ty-factory-instance-storage",
    "title": "Separate factory instance fields from class descriptors",
    "state": "Host API design",
    "summary": "Host-created instances need field storage whose callable values remain ordinary fields; class descriptors retain their own binding behavior. Source reviewed at dfe98a7d; extraction and runtime qualification remain incomplete.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Separate factory-supplied immutable instance storage from class descriptors",
        "paths": [
          "crates/ty_python_semantic/src/types/class/dynamic_literal.rs"
        ]
      }
    ],
    "nextAction": "Agree the reusable API; qualify optional and dynamic fields, recursive types, source identity and callable field access.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/class/dynamic_literal.rs#L3"
      }
    ]
  },
  {
    "id": "host-buck2-source-modes",
    "title": "Buck2 file modes and builtin scopes",
    "state": "Host adaptation not implemented",
    "summary": "Sty currently selects Standard or Bazel dialects; native annotations and builtin extensions are tied to Bazel. Buck2 needs distinct BUCK, rule-definition and BXL environments. Existing ty parser and supplied-binding hooks are reusable boundaries, not established Buck2 support.",
    "sources": [],
    "nextAction": "Separate host file modes and builtin catalog selection from Bazel metadata; qualify native annotations and isolation between Buck2 environments.",
    "evidence": [
      {
        "label": "Current dialect and annotation-mode owner",
        "url": "https://github.com/tamird/sty/blob/0e6aed3cf87fe18936ee8c36762e8085eb668af3/crates/starpls_common/src/lib.rs#L21"
      },
      {
        "label": "Current Bazel builtin-extension owner",
        "url": "https://github.com/tamird/sty/blob/0e6aed3cf87fe18936ee8c36762e8085eb668af3/crates/starpls_ide/src/ty/host.rs#L28"
      },
      {
        "label": "Buck2 documents three Starlark environments",
        "url": "https://buck2.build/docs/api/"
      }
    ]
  },
  {
    "id": "host-buck2-loads",
    "title": "Buck2 cell and data-module loading",
    "state": "Host adaptation not implemented",
    "summary": "Reuse Sty\u2019s FileLoader boundary for Buck2 resolution rather than Bazel repository labels. Buck2 cells come from .buckconfig; JSON and TOML can be loaded as modules exporting value. Source lookup, exports and invalidation need the same logical module identity.",
    "sources": [],
    "nextAction": "Implement a Buck2 loader using cell-relative identities and explicit data-module exports; qualify cross-cell aliases and edits to loaded data.",
    "evidence": [
      {
        "label": "Existing module-loader interface",
        "url": "https://github.com/tamird/sty/blob/0e6aed3cf87fe18936ee8c36762e8085eb668af3/crates/starpls_ide/src/lib.rs#L965"
      },
      {
        "label": "Buck2 cells configuration",
        "url": "https://buck2.build/docs/concepts/buckconfig/#cells"
      },
      {
        "label": "Buck2 JSON and TOML module contracts",
        "url": "https://buck2.build/docs/users/loading_data/"
      }
    ]
  },
  {
    "id": "host-buck2-type-constructors",
    "title": "Buck2 record and enum contracts",
    "state": "Host semantics require qualification",
    "summary": "Buck2 exposes record, field and enum constructors alongside namespaced typing values. Map those values through host-supplied semantic contracts instead of assuming Bazel provider or struct behavior. Documentation differs on using record constructors directly versus .type in annotations; settle that against a pinned runtime.",
    "sources": [],
    "nextAction": "Pin the target Buck2/Starlark runtime, establish constructor and annotation behavior, then qualify field defaults, invalid values and nominal type identity.",
    "evidence": [
      {
        "label": "Buck2 record and field API",
        "url": "https://buck2.build/docs/api/starlark/#record"
      },
      {
        "label": "Starlark Rust annotation and constructor semantics",
        "url": "https://github.com/meta/starlark-rust/blob/main/docs/types.md"
      },
      {
        "label": "Current Bazel-specific declaration generation",
        "url": "https://github.com/tamird/sty/blob/0e6aed3cf87fe18936ee8c36762e8085eb668af3/crates/starpls_ide/src/ty/native.rs#L1"
      }
    ]
  },
  {
    "id": "ty-host-parser",
    "title": "Host parser and semantic file identity",
    "state": "Host-extension design",
    "summary": "Expose custom parsing, annotation parsing and literal decoding without changing Python defaults. Preserve namespace-sensitive identities for the same physical file.",
    "sources": [
      {
        "commit": "dbaf2b63ba2a5bdcd51cfb4e0bdbc03cdd3ebda4",
        "detail": "Allow explicit grammar in cached Python parses",
        "paths": [
          "crates/ruff_db/src/lib.rs",
          "crates/ruff_db/src/parsed.rs",
          "crates/ruff_python_ast/src/lib.rs"
        ]
      },
      {
        "commit": "43e2ef185fd950d5965823012b1ed59b15392db0",
        "detail": "Separate embedded semantic program identities",
        "paths": [
          "crates/ty_python_core/src/program.rs",
          "crates/ty_python_core/src/program_file.rs"
        ]
      },
      {
        "commit": "d441e20a8f9fdefc1ffd75af8f7f430013c232ae",
        "detail": "Allow embedders to select a module parser",
        "paths": [
          "crates/ruff_db/src/lib.rs",
          "crates/ruff_db/src/parsed.rs"
        ]
      },
      {
        "commit": "8bb0b9cb0384ffd567841eedfc863e002706e281",
        "detail": "Allow embedders to parse detached annotations",
        "paths": [
          "crates/ruff_db/src/lib.rs",
          "crates/ruff_db/src/parsed.rs"
        ]
      },
      {
        "commit": "5ec8d1ed1b58f5b57b990daed5a1176130809e4f",
        "detail": "Parse type parameters at an offset in the source",
        "paths": [
          "crates/ruff_python_parser/src/lib.rs",
          "crates/ruff_python_parser/src/parser/mod.rs",
          "crates/ruff_python_parser/src/parser/statement.rs"
        ]
      }
    ],
    "nextAction": "Reconcile the public extension boundary with current ty; qualify unchanged Python parsing plus sty comment offsets and host identity."
  },
  {
    "id": "ty-host-contracts",
    "title": "Host-supplied semantic contracts",
    "state": "Host-extension design",
    "summary": "Keep reusable extension points separate from Bazel providers, contexts and rule reflection. sty consumes the provided_* database contract; accepting the entire Bazel model into ty is not assumed.",
    "sources": [
      {
        "commit": "e7b5ba34b42483c4774dab0f3865592a6d5501cc",
        "detail": "Accept embedded source bindings and builtins",
        "paths": [
          "crates/ty_python_core/src/builder.rs",
          "crates/ty_python_core/src/db.rs",
          "crates/ty_python_core/src/definition.rs",
          "crates/ty_python_core/src/lib.rs",
          "crates/ty_python_semantic/src/db.rs",
          "crates/ty_python_semantic/src/lexical_name_path.rs",
          "crates/ty_python_semantic/src/lib.rs",
          "crates/ty_python_semantic/src/place.rs",
          "crates/ty_python_semantic/src/semantic_model.rs",
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/context.rs",
          "crates/ty_python_semantic/src/types/definition_resolution.rs",
          "crates/ty_python_semantic/src/types/diagnostic.rs",
          "crates/ty_python_semantic/src/types/generics.rs",
          "crates/ty_python_semantic/src/types/ide_support.rs",
          "crates/ty_python_semantic/src/types/ide_support/unused_bindings.rs",
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/src/types/infer/builder/imports.rs",
          "crates/ty_python_semantic/src/types/infer/builder/suspicious_conditions/diagnostic.rs",
          "crates/ty_python_semantic/src/types/infer/builder/suspicious_conditions/exemptions.rs",
          "crates/ty_python_semantic/src/types/provided.rs",
          "crates/ty_python_semantic/src/types/provided/source_tests.rs"
        ]
      },
      {
        "commit": "5078c1f9f0b2f30aa0ecf2b978487410373d7b7d",
        "detail": "Model embedded factories with ordinary Ty types",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/ide_support/all_members.md",
          "crates/ty_python_semantic/src/db.rs",
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/call.rs",
          "crates/ty_python_semantic/src/types/call/bind.rs",
          "crates/ty_python_semantic/src/types/call/checked.rs",
          "crates/ty_python_semantic/src/types/callable.rs",
          "crates/ty_python_semantic/src/types/class/dynamic_literal.rs",
          "crates/ty_python_semantic/src/types/class/known.rs",
          "crates/ty_python_semantic/src/types/display.rs",
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/src/types/infer/builder/new_class.rs",
          "crates/ty_python_semantic/src/types/infer/builder/type_call.rs",
          "crates/ty_python_semantic/src/types/instance.rs",
          "crates/ty_python_semantic/src/types/list_members.rs",
          "crates/ty_python_semantic/src/types/provided.rs",
          "crates/ty_python_semantic/src/types/provided/data.rs",
          "crates/ty_python_semantic/src/types/provided/tests.rs",
          "crates/ty_python_semantic/src/types/signatures.rs"
        ]
      },
      {
        "commit": "23fa67398bdc5e361bdacd52e4b979131c1aa83f",
        "detail": "Share checked calls with native refinements",
        "paths": [
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/call.rs",
          "crates/ty_python_semantic/src/types/call/bind.rs",
          "crates/ty_python_semantic/src/types/call/checked.rs",
          "crates/ty_python_semantic/src/types/class/known.rs",
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/src/types/infer/builder/function.rs"
        ]
      },
      {
        "commit": "45c16c583a0ac6042b0bf49b1296b3bdac746713",
        "detail": "Check supplied assignment annotations",
        "paths": [
          "crates/ty_python_core/src/db.rs",
          "crates/ty_python_core/src/definition.rs",
          "crates/ty_python_semantic/src/semantic_model.rs",
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/diagnostic.rs",
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/src/types/provided/source_tests.rs"
        ]
      }
    ],
    "nextAction": "Migrate supplied bindings into the current PlaceLoadResolver owning mechanism introduced by upstream #29791; agree a maintainable host API before proposing it.",
    "evidence": [
      {
        "label": "Upstream PlaceLoadResolver refactor #29791",
        "url": "https://github.com/astral-sh/ruff/pull/29791"
      }
    ]
  },
  {
    "id": "ty-selected-toolchain-fields",
    "title": "Selected toolchain fields and indexed host bounds",
    "state": "Host API design",
    "summary": "Apple lipo still lacks a static ToolchainInfo field contract. An RBE aspect/cquery probe follows the selected producer, field shape and configured dependency edge through an --extra_toolchains replacement. Producer bodies remain unchecked.",
    "sources": [
      {
        "commit": "ec5ee4693e7c1cf9a4ba432e3b0f4d494e89b805",
        "detail": "The existing subscript result-bound hook receives a file and receiver, but no index. Per-toolchain results need the inferred key as well.",
        "paths": [
          "crates/ty_python_semantic/src/db.rs",
          "crates/ty_python_semantic/src/types/infer/builder/subscript.rs"
        ]
      }
    ],
    "nextAction": "Check selected producer bodies and handle multiple configurations without label-only joins before adding keyed host bounds. Universal source contracts still require an enforced ABI. Sty integration is not implemented.",
    "evidence": [
      {
        "label": "Bazel 9.3.1 selected-toolchain replacement probe",
        "url": "https://app.buildbuddy.io/invocation/d9603257-a7df-4706-a3ce-254d442e9b86"
      },
      {
        "label": "Bazel 9.3 aspect toolchain access",
        "url": "https://github.com/bazelbuild/bazel/blob/9.3.0/src/main/java/com/google/devtools/build/lib/starlarkbuildapi/platform/ToolchainContextApi.java#L43"
      },
      {
        "label": "Bazel 9.3 wildcard toolchain propagation",
        "url": "https://github.com/bazelbuild/bazel/blob/9.3.0/src/main/java/com/google/devtools/build/lib/packages/AspectPropagationEdgesSupplier.java#L226"
      }
    ]
  },
  {
    "id": "ty-dictionary-flow",
    "title": "Dictionary observations and flow precision",
    "state": "Requires current-upstream reconciliation",
    "summary": "Track allocation contents, indexed writes, membership guards and finite keyword schemas. Overlaps the local and conditional keyword dictionary work already in upstream review.",
    "sources": [
      {
        "commit": "956ddb3c7cd4f1e55d6e83e315c5553e5cd42532",
        "detail": "Move dictionary observations out of call checking",
        "paths": [
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/call.rs",
          "crates/ty_python_semantic/src/types/call/arguments.rs",
          "crates/ty_python_semantic/src/types/call/bind.rs",
          "crates/ty_python_semantic/src/types/call/checked.rs",
          "crates/ty_python_semantic/src/types/dictionary.rs",
          "crates/ty_python_semantic/src/types/typed_dict.rs"
        ]
      },
      {
        "commit": "74d28cc028a02fa315e40b6c368b62e73beaf794",
        "detail": "Track dictionary contents through control flow",
        "paths": [
          "crates/ty_python_core/src/builder.rs",
          "crates/ty_python_core/src/builder/dictionary_contents.rs",
          "crates/ty_python_core/src/builder/loop_bindings_visitor.rs",
          "crates/ty_python_core/src/definition.rs",
          "crates/ty_python_core/src/lib.rs",
          "crates/ty_python_core/src/member.rs",
          "crates/ty_python_core/src/place.rs",
          "crates/ty_python_core/src/symbol.rs",
          "crates/ty_python_core/src/use_def.rs",
          "crates/ty_python_core/src/use_def/place_state.rs",
          "crates/ty_python_semantic/resources/mdtest/call/dictionary_contents.md",
          "crates/ty_python_semantic/resources/mdtest/call/local_dictionary_unpacking.md",
          "crates/ty_python_semantic/src/lexical_name_path.rs",
          "crates/ty_python_semantic/src/place.rs",
          "crates/ty_python_semantic/src/semantic_model.rs",
          "crates/ty_python_semantic/src/types/call/arguments.rs",
          "crates/ty_python_semantic/src/types/diagnostic.rs",
          "crates/ty_python_semantic/src/types/dictionary.rs",
          "crates/ty_python_semantic/src/types/dictionary/contents.rs",
          "crates/ty_python_semantic/src/types/ide_support.rs",
          "crates/ty_python_semantic/src/types/ide_support/unused_bindings.rs",
          "crates/ty_python_semantic/src/types/infer.rs",
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/src/types/infer/builder/suspicious_conditions/exemptions.rs",
          "crates/ty_python_semantic/src/types/narrow.rs",
          "crates/ty_python_semantic/src/types/provided/tests.rs"
        ]
      },
      {
        "commit": "08fb15feb45a15b7b23091ab529d5c18944d3ca4",
        "detail": "[ty] Move dictionary inventory joining to DictionaryItems",
        "paths": [
          "crates/ty_python_semantic/src/types/dictionary.rs",
          "crates/ty_python_semantic/src/types/dictionary/contents.rs"
        ]
      },
      {
        "commit": "352ce32f76a8416551cb72d66dfa4f6d75a7c7e9",
        "detail": "[ty] Accept immediately guarded dictionary reads",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/narrow/conditionals/in.md",
          "crates/ty_python_semantic/src/types/dictionary.rs",
          "crates/ty_python_semantic/src/types/infer/builder/subscript.rs",
          "crates/ty_python_semantic/src/types/subscript.rs"
        ]
      }
    ],
    "nextAction": "Compare current upstream and PRs29138/29141/29186, isolate remaining Python regressions, then port through shared index/inference machinery.",
    "evidence": [
      {
        "label": "Upstream overlapping design #29138",
        "url": "https://github.com/astral-sh/ruff/pull/29138"
      },
      {
        "label": "Upstream overlapping design #29141",
        "url": "https://github.com/astral-sh/ruff/pull/29141"
      },
      {
        "label": "Upstream overlapping design #29186",
        "url": "https://github.com/astral-sh/ruff/pull/29186"
      }
    ]
  },
  {
    "id": "ty-solver-inference",
    "title": "Solver and callable generic inference",
    "state": "Requires current-upstream reconciliation",
    "summary": "General constraint solving, callable/generic inference and type-variable improvements need separate Python regressions before porting. The existing LLVM callback case with a fresh list of \"ok\" and list[Literal[\"ok\"]] fails on the fork and pristine upstream. A fix passes the strengthened existing fixture; broader qualification is in progress.",
    "sources": [
      {
        "commit": "b49d6ea5e7727b10015e87e3a8e2584b1d59560b",
        "detail": "[ty] Isolate inference for call candidates",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/call/union.md",
          "crates/ty_python_semantic/resources/mdtest/generics/legacy/classes.md",
          "crates/ty_python_semantic/resources/mdtest/generics/legacy/paramspec.md",
          "crates/ty_python_semantic/resources/mdtest/generics/pep695/classes.md",
          "crates/ty_python_semantic/resources/mdtest/generics/pep695/paramspec.md",
          "crates/ty_python_semantic/src/types/call/bind.rs"
        ]
      },
      {
        "commit": "5becae77b1455155940db1570e93be80f40a270a",
        "detail": "[ty] Separate atomic constraint operations",
        "paths": [
          "crates/ty_python_semantic/src/types/constraints/sequents.rs",
          "crates/ty_python_semantic/src/types/constraints/variables.rs"
        ]
      },
      {
        "commit": "bfd71700b5ff0922f3e570c79ba866098e567368",
        "detail": "[ty] Group solver bounds by type variable",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/type_properties/materialization.md",
          "crates/ty_python_semantic/src/types/constraints.rs",
          "crates/ty_python_semantic/src/types/constraints/solutions.rs"
        ]
      },
      {
        "commit": "18bf8b414cd2e2387f4a201cc8681a19211751f6",
        "detail": "Preserve generics through pending narrowing",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/generics/legacy/functions.md",
          "crates/ty_python_semantic/resources/mdtest/generics/pep695/functions.md",
          "crates/ty_python_semantic/src/types/generics.rs",
          "crates/ty_python_semantic/src/types/ide_support/unreachable_code.rs"
        ]
      }
    ],
    "nextAction": "Finish qualification of the fresh-literal callback fix, including the actual LLVM corpus case, before preparing an upstream proposal. Continue isolating the remaining solver improvements.",
    "evidence": [
      {
        "label": "Pristine upstream literal-callback failure",
        "url": "https://app.buildbuddy.io/invocation/807642d3-cc5a-4840-af59-3be7eb523295"
      }
    ]
  },
  {
    "id": "ty-overload-bodies",
    "title": "Annotated overload implementation analysis",
    "state": "Requires current-upstream reconciliation",
    "summary": "Sty now pairs overloaded interfaces with checked source bodies and uses the same finite domains for strictness. General Python body-domain analysis still needs an upstream split and review.",
    "sources": [
      {
        "commit": "a8439ae9f7959c5ad2c82fb6a06180f8735839fa",
        "detail": "[ty] Prototype overload body domains",
        "paths": [
          "crates/ty_python_semantic/src/place.rs",
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/context.rs",
          "crates/ty_python_semantic/src/types/infer.rs",
          "crates/ty_python_semantic/src/types/infer/body_domain.rs",
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/src/types/infer/builder/function.rs"
        ]
      },
      {
        "commit": "07b86b2901fc89973eb4ee226dc1694e6b549fa6",
        "detail": "[ty] Use complete overload body analysis",
        "paths": [
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/call/bind.rs",
          "crates/ty_python_semantic/src/types/context.rs",
          "crates/ty_python_semantic/src/types/diagnostic.rs",
          "crates/ty_python_semantic/src/types/ide_support.rs",
          "crates/ty_python_semantic/src/types/infer.rs",
          "crates/ty_python_semantic/src/types/infer/body_domain.rs",
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/src/types/infer/builder/annotation_expression.rs",
          "crates/ty_python_semantic/src/types/infer/builder/suspicious_conditions/diagnostic.rs",
          "crates/ty_python_semantic/src/types/string_annotation.rs"
        ]
      },
      {
        "commit": "4b54a19d0cb52d081ba052fee443450a2dcaa904",
        "detail": "Use declared overloads for annotated implementations",
        "paths": [
          "crates/ty_python_semantic/src/types/function.rs",
          "crates/ty_python_semantic/src/types/provided/source_tests.rs",
          "crates/ty_python_semantic/src/types/string_annotation.rs"
        ]
      }
    ],
    "evidence": [
      {
        "label": "Restored checked Starlark interfaces",
        "url": "https://github.com/tamird/sty/commit/9f8e3aa"
      },
      {
        "label": "Historical removal of Starlark overload support",
        "url": "https://github.com/tamird/sty/commit/5960a4bda9c70ea815747b4ab3a5c35c6fdd0bcf"
      },
      {
        "label": "Current body-domain test exercises upstream reachability checkpoints",
        "url": "https://github.com/tamird/ruff/blob/afbd0d25a528ccdfb782a8985316128a7cccf7e3/crates/ty_python_semantic/src/types/infer/body_domain.rs#L2760"
      },
      {
        "label": "Upstream statement-call checkpoint implementation",
        "url": "https://github.com/astral-sh/ruff/pull/30561"
      }
    ],
    "nextAction": "Repair with_cfg dictionary-union admission and the fork-only generic callback rejection; compare the remaining body-domain APIs with upstream."
  },
  {
    "id": "ty-saved-tag-narrowing",
    "title": "Saved conditions and tagged-union narrowing",
    "state": "Requires current-upstream reconciliation",
    "summary": "Type-test results saved in values and tagged dictionary unions retain useful branch facts. Separate general Python flow improvements from Starlark type() string semantics.",
    "sources": [
      {
        "commit": "ca48a9779386a7e0ee171e99e57e5c7c8f5d738b",
        "detail": "[ty] Narrow through saved runtime type tests",
        "paths": [
          "crates/ty_python_core/src/builder.rs",
          "crates/ty_python_core/src/use_def.rs",
          "crates/ty_python_semantic/resources/mdtest/narrow/type.md",
          "crates/ty_python_semantic/src/types/ide_support/unused_bindings.rs",
          "crates/ty_python_semantic/src/types/narrow.rs",
          "crates/ty_python_semantic/src/types/provided/tests.rs"
        ]
      },
      {
        "commit": "fd259774b672dd8d5f1e500d4eb89c1a5e716c43",
        "detail": "[ty] Narrow unions through saved attribute tags",
        "paths": [
          "crates/ty_python_core/src/builder.rs",
          "crates/ty_python_semantic/resources/mdtest/narrow/aliased_conditions.md",
          "crates/ty_python_semantic/src/types/narrow.rs"
        ]
      },
      {
        "commit": "ea11b62358b4197de3bcbf8b0e2497aeeff71cf5",
        "detail": "Narrow tagged unions through saved subscripts",
        "paths": [
          "crates/ty_python_core/src/builder.rs",
          "crates/ty_python_semantic/resources/mdtest/narrow/aliased_conditions.md",
          "crates/ty_python_semantic/src/types/narrow.rs"
        ]
      }
    ],
    "evidence": [
      {
        "label": "Unqualified global prototype and revised comments",
        "url": "https://github.com/tamird/ruff/commit/7b813717d3098e237cf8beb97eb5f046bf6230bc"
      },
      {
        "label": "Core, semantic, IDE, format, Clippy and four Markdown fixtures pass",
        "url": "https://app.buildbuddy.io/invocation/f2220608-b748-4af2-8b82-ecd4f5d98750"
      },
      {
        "label": "Related proposal drops required truthiness guards",
        "url": "https://github.com/astral-sh/ruff/pull/27106"
      },
      {
        "label": "Composition check reproduces range | str false positive",
        "url": "https://app.buildbuddy.io/invocation/a35b07c9-e754-4b32-a922-9afd35d10364"
      }
    ],
    "nextAction": "Reject global guard removal: full upstream Markdown has 24 new failing fixtures and current project checks add diagnostics. Fix the original string-splitting bug without discarding internal guards. Saved runtime type tests and tagged-union mechanisms still need separate reconciliation."
  },
  {
    "id": "ty-contextual-empty",
    "title": "Contextual empty collection inference",
    "state": "Requires current-upstream reconciliation",
    "summary": "Empty collection defaults and call arguments can require expected-type context; the merged empty-peer change is a template, not proof this whole unit is upstream. The fresh-literal callback fix is now qualified in the fork and passes the actual LLVM corpus case. The expanded official port covers both bounded and unbounded type variables and passes native suites and all 532 default Markdown fixtures. The fork backport passes the current corpus. The official port is withheld after benchmarks found material inference overhead; a correction must preserve required return precision.",
    "sources": [
      {
        "commit": "604759e7cb541d2d2c1443c2d6f00ee987e4c4a9",
        "detail": "Infer nonempty collection branches first; this lineage is already upstream in #29131, so subtract it before identifying remaining work",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/conditional/if_expression.md",
          "crates/ty_python_semantic/src/types/infer/builder.rs"
        ]
      },
      {
        "commit": "c58c6ae7d2ff11d9ff1311140f97a52da4c30fde",
        "detail": "[ty] Preserve empty collection context",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/bidirectional.md",
          "crates/ty_python_semantic/src/types/call/bind.rs",
          "crates/ty_python_semantic/src/types/infer/builder.rs"
        ]
      },
      {
        "commit": "372b2fc678e8190c0188bc0a399e71a413a4446d",
        "detail": "[ty] Use return types for empty dictionaries",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/bidirectional.md",
          "crates/ty_python_semantic/src/types/infer/builder.rs"
        ]
      }
    ],
    "nextAction": "Find a smaller callback-inference change that preserves the shared-TypeVar TypedDict case, then measure it on current upstream. Keep the stored-collection overlap with #27665 separate.",
    "evidence": [
      {
        "label": "Merged empty collection peer inference #29131",
        "url": "https://github.com/astral-sh/ruff/pull/29131"
      }
    ]
  },
  {
    "id": "ty-editor-api",
    "title": "Reusable editor queries",
    "state": "Requires current-upstream reconciliation",
    "summary": "Expose reusable editor queries while keeping host resolution and presentation policy outside Python semantics.",
    "sources": [
      {
        "commit": "7ff920b199c5094e91de972c472abc8aee60f796",
        "detail": "Share active signature parameter selection",
        "paths": [
          "crates/ty_ide/src/signature_help.rs",
          "crates/ty_python_semantic/src/types/ide_support.rs"
        ]
      },
      {
        "commit": "71f92d63100ccd58bb9441ca4ec9c9bc3e88674a",
        "detail": "Share semantic token classification",
        "paths": [
          "crates/ty_ide/src/lib.rs",
          "crates/ty_ide/src/semantic_tokens.rs"
        ]
      },
      {
        "commit": "bc6cd6ade301e7880ed630a6ddb906c1a68849a6",
        "detail": "Expose file-local semantic references",
        "paths": [
          "crates/ty_ide/src/lib.rs",
          "crates/ty_ide/src/references.rs"
        ]
      },
      {
        "commit": "e21beab86ff5bfb3071cf81fb35abcecf6ac8356",
        "detail": "Separate inlay hints from Python edits",
        "paths": [
          "crates/ty_ide/src/inlay_hints.rs",
          "crates/ty_ide/src/lib.rs"
        ]
      }
    ],
    "nextAction": "Compare surviving source with current upstream, classify host-only policy separately, and reproduce each general improvement before preparing a qualified proposal."
  },
  {
    "id": "ty-diagnostic-policy",
    "title": "Host diagnostic and suppression policy",
    "state": "Requires current-upstream reconciliation",
    "summary": "Separate host diagnostic selection and suppression policy from shared diagnostic production.",
    "sources": [
      {
        "commit": "fc3b29f0adb11528151e387373eea142481a5218",
        "detail": "Allow embedders to require valid suppressions",
        "paths": [
          "crates/ty/docs/rules.md",
          "crates/ty_python_semantic/resources/lint_docs/blanket-ignore-comment.md",
          "crates/ty_python_semantic/src/lint.rs",
          "crates/ty_python_semantic/src/suppression.rs",
          "crates/ty_python_semantic/src/suppression/unused.rs",
          "ty.schema.json"
        ]
      },
      {
        "commit": "5ee6d94cf53e4746684f7048666274b6060afbaf",
        "detail": "[ty] Require scoped suppressions for embedders",
        "paths": [
          "crates/ty/docs/rules.md",
          "crates/ty_python_semantic/resources/lint_docs/blanket-ignore-comment.md",
          "crates/ty_python_semantic/src/lint.rs",
          "crates/ty_python_semantic/src/suppression.rs",
          "ty.schema.json"
        ]
      }
    ],
    "nextAction": "Compare surviving source with current upstream, classify host-only policy separately, and reproduce each general improvement before preparing a qualified proposal."
  },
  {
    "id": "ty-host-runtime",
    "title": "Host iterator, string and Boolean semantics",
    "state": "Requires current-upstream reconciliation",
    "summary": "Reconcile host runtime differences with Python defaults and keep Starlark behavior explicit.",
    "sources": [
      {
        "commit": "5dc76a7745ed08465ec32f3003a9bce384822a81",
        "detail": "Respect declared string iteration contracts",
        "paths": [
          "Cargo.lock",
          "crates/ty_python_semantic/Cargo.toml",
          "crates/ty_python_semantic/src/db.rs",
          "crates/ty_python_semantic/src/types/iteration.rs",
          "crates/ty_python_semantic/src/types/relation.rs",
          "crates/ty_python_semantic/src/types/tests.rs"
        ]
      },
      {
        "commit": "d5b2f3db259cd1d0b6e3f8200f48b70be61911bd",
        "detail": "Gate Boolean numeric literal optimizations",
        "paths": [
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/class/known.rs",
          "crates/ty_python_semantic/src/types/enums.rs",
          "crates/ty_python_semantic/src/types/equality.rs",
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs",
          "crates/ty_python_semantic/src/types/infer/builder/enum_call.rs",
          "crates/ty_python_semantic/src/types/infer/comparisons.rs",
          "crates/ty_python_semantic/src/types/instance.rs",
          "crates/ty_python_semantic/src/types/narrow.rs",
          "crates/ty_python_semantic/src/types/subscript.rs",
          "crates/ty_python_semantic/src/types/tests.rs"
        ]
      },
      {
        "commit": "6ad38a59c6268796d1ed49af724cbc05a101836a",
        "detail": "Support embedded string literal interpretation",
        "paths": [
          "crates/ruff_db/src/lib.rs",
          "crates/ruff_db/src/parsed.rs",
          "crates/ruff_python_parser/src/lib.rs",
          "crates/ruff_python_parser/src/parser/expression.rs",
          "crates/ruff_python_parser/src/parser/mod.rs",
          "crates/ruff_python_parser/src/parser/options.rs",
          "crates/ruff_python_parser/src/string.rs",
          "crates/ty_python_semantic/src/semantic_model.rs",
          "crates/ty_python_semantic/src/types/infer/builder/suspicious_conditions/diagnostic.rs",
          "crates/ty_python_semantic/src/types/infer/implicit_alias.rs",
          "crates/ty_python_semantic/src/types/string_annotation.rs"
        ]
      }
    ],
    "nextAction": "Compare surviving source with current upstream, classify host-only policy separately, and reproduce each general improvement before preparing a qualified proposal."
  },
  {
    "id": "ty-structural-relations",
    "title": "TypedDict and protocol relations",
    "state": "Requires current-upstream reconciliation",
    "summary": "Check surviving structural relation changes against current TypedDict and protocol behavior.",
    "sources": [
      {
        "commit": "cb54d4b8e0ea88ff5bff0b2b4245ee1c59ba19f9",
        "detail": "Infer closed TypedDict values in protocols",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/typed_dict.md",
          "crates/ty_python_semantic/src/types/class/typed_dict.rs"
        ]
      },
      {
        "commit": "c18d08bf614fac225a18aad33f7e638e2180c1cb",
        "detail": "[ty] Check TypedDict unions with literals",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/typed_dict.md",
          "crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs",
          "crates/ty_python_semantic/src/types/infer/builder/typed_dict.rs"
        ]
      },
      {
        "commit": "8478653dc0f30541ee1790b113c2d18d79b31510",
        "detail": "[ty] Reuse compatible TypedDict union results",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/typed_dict.md",
          "crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs"
        ]
      },
      {
        "commit": "14518b0b59f746166f55a8f86fb4610f315c8e83",
        "detail": "Preserve bounded TypedDict values in dictionary merges",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/typed_dict.md",
          "crates/ty_python_semantic/src/types/class/typed_dict.rs"
        ]
      }
    ],
    "nextAction": "Compare surviving source with current upstream, classify host-only policy separately, and reproduce each general improvement before preparing a qualified proposal."
  },
  {
    "id": "ty-contextual-callbacks",
    "title": "Contextual lambda and callback inference",
    "state": "Requires current-upstream reconciliation",
    "summary": "Reconcile expected-type inference for lambdas and callbacks with current upstream inference.",
    "sources": [
      {
        "commit": "8532eec7571c63559c6401858047cef4ffb808db",
        "detail": "[ty] Infer lambda positional captures",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/bidirectional.md",
          "crates/ty_python_semantic/resources/mdtest/expression/lambda.md",
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/src/types/infer/builder/function.rs",
          "crates/ty_python_semantic/src/types/signatures.rs"
        ]
      },
      {
        "commit": "c521d505b8e1000e218ceafe9eb1e45622f7f439",
        "detail": "[ty] Preserve contextual lambda tuple shapes",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/cycle/implicit_instance_attributes.md",
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/provided/tests.rs"
        ]
      },
      {
        "commit": "0b5c59dbadbfde1b836cdf4f7c1e82056b4783b2",
        "detail": "Infer lambda defaults with parameter context",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/expression/lambda.md",
          "crates/ty_python_semantic/src/types/infer/builder.rs"
        ]
      },
      {
        "commit": "815d619e2dea9becd7d42c588653118c97971b99",
        "detail": "Infer lambda inputs from callback protocols",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/cycle/basic.md",
          "crates/ty_python_semantic/resources/mdtest/expression/lambda.md",
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/src/types/infer/builder/function.rs"
        ]
      }
    ],
    "nextAction": "Compare surviving source with current upstream, classify host-only policy separately, and reproduce each general improvement before preparing a qualified proposal."
  },
  {
    "id": "ty-return-inference",
    "title": "Source function return inference",
    "state": "Requires current-upstream reconciliation",
    "summary": "Determine which source return-inference refinements remain necessary on current upstream.",
    "sources": [
      {
        "commit": "68824c5e9831b7064734ec042d0c0739c209ebe2",
        "detail": "[ty] Infer unannotated function call results",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/decorators.md",
          "crates/ty_python_semantic/resources/mdtest/function/return_type_inference.md",
          "crates/ty_python_semantic/src/db.rs",
          "crates/ty_python_semantic/src/lib.rs",
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/function.rs",
          "crates/ty_python_semantic/src/types/infer.rs",
          "crates/ty_python_semantic/src/types/infer/builder.rs",
          "crates/ty_python_semantic/src/types/method.rs",
          "crates/ty_python_semantic/src/types/provided/tests.rs"
        ]
      }
    ],
    "nextAction": "Compare surviving source with current upstream, classify host-only policy separately, and reproduce each general improvement before preparing a qualified proposal."
  },
  {
    "id": "ty-loop-initial-binding",
    "title": "Relate initial bindings across coordinated loop updates",
    "state": "Old-fork candidate; current-upstream reproduction pending",
    "summary": "certifies_predicate and initial_binding_implies_empty preserve an initial binding when a proven untouched empty list and coordinated assignments rule it out after a loop. This is a bounded tracked proof, not general loop invariant inference.",
    "sources": [
      {
        "commit": "1f5b037531454583e815927916829ac08063bb62",
        "detail": "Relate initial bindings across simple for loops",
        "paths": [
          "crates/ty_python_core/src/builder.rs",
          "crates/ty_python_core/src/definition.rs",
          "crates/ty_python_core/src/lib.rs",
          "crates/ty_python_core/src/reachability_constraints.rs",
          "crates/ty_python_semantic/resources/mdtest/loops/for.md",
          "crates/ty_python_semantic/src/place.rs",
          "crates/ty_python_semantic/src/reachability.rs",
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/loop_bindings.rs"
        ]
      }
    ],
    "nextAction": "Reproduce the coordinated-update example on current ty; retain partial-write, allocation-mutation, cycle/query-order and incremental edit negatives from loop_bindings.rs. Compare current loop reachability ownership before porting.",
    "evidence": []
  },
  {
    "id": "ty-attribute-presence",
    "title": "Required intersection members during attribute assignment",
    "state": "Old-fork candidate; current-upstream reproduction pending",
    "summary": "AttributeWriteRequirement::is_definitely_bound lets a required intersection component establish member presence without treating dynamic getters or Any bases as declared storage. AssignmentAttributeWriteEvaluator preserves Final and union diagnostics.",
    "sources": [
      {
        "commit": "fa52c04a810e25fbf4265750f576210797ad94fe",
        "detail": "[ty] Fix missing-attribute intersection warnings",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/diagnostics/attribute_assignment.md",
          "crates/ty_python_semantic/src/types/attribute_write.rs",
          "crates/ty_python_semantic/src/types/infer/builder/attribute_assignment.rs"
        ]
      }
    ],
    "nextAction": "Review the qualified presence fix. The existing intersection-write test caught the false warning and required only removing its obsolete TODO and error expectation.",
    "evidence": []
  },
  {
    "id": "ty-bound-receiver",
    "title": "Preserve the instance while checking specialized method receivers",
    "state": "Old-fork candidate; current-upstream reproduction pending",
    "summary": "SplitBoundMethodReceiver separates the actual instance used for __self__/typing.Self from the signature receiver used to check an alternative of a bounded union. Its call/methods and legacy generic fixtures are old-fork evidence.",
    "sources": [
      {
        "commit": "327e0042634dcbd7d1db5793b7bb0bd0d29d48a8",
        "detail": "[ty] Bind members through union upper bounds",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/call/methods.md",
          "crates/ty_python_semantic/resources/mdtest/generics/legacy/classes.md",
          "crates/ty_python_semantic/resources/mdtest/regression/noninferable_projection_to_terminal.md",
          "crates/ty_python_semantic/resources/mdtest/subscript/typevar.md",
          "crates/ty_python_semantic/src/types.rs",
          "crates/ty_python_semantic/src/types/infer/comparisons.rs",
          "crates/ty_python_semantic/src/types/method.rs"
        ]
      }
    ],
    "nextAction": "Reproduce bound-union receiver, Self and subscript/typevar examples on current ty. Qualify method binding and generic suites and inspect current descriptor/member policy before extracting a proposal.",
    "evidence": []
  },
  {
    "id": "ty-recursive-protocol-materialization",
    "title": "Subtract landed recursive-protocol materialization work",
    "state": "Old-fork candidate; current-upstream reproduction pending",
    "summary": "Upstream 19cb997763936be5bd7f3f791965366a99b3989b carries the same #29026 change title. The fork also contains later protocol and constraint changes: this lineage is not proof that the complete instance/protocol/visitor delta is equivalent.",
    "sources": [
      {
        "commit": "cfe08719485af4506aae4ca1462a1dd13042e09e",
        "detail": "[ty] Avoid expanding recursive protocol materializations (#29026)",
        "paths": [
          "crates/ruff_benchmark/benches/ty.rs",
          "crates/ty_python_semantic/resources/mdtest/generics/legacy/classes.md",
          "crates/ty_python_semantic/resources/mdtest/generics/pep695/classes.md",
          "crates/ty_python_semantic/resources/mdtest/protocols.md",
          "crates/ty_python_semantic/resources/mdtest/type_properties/materialization.md",
          "crates/ty_python_semantic/resources/mdtest/with/async.md",
          "crates/ty_python_semantic/src/types/generics.rs",
          "crates/ty_python_semantic/src/types/infer/tests.rs",
          "crates/ty_python_semantic/src/types/instance.rs",
          "crates/ty_python_semantic/src/types/protocol_class.rs",
          "crates/ty_python_semantic/src/types/visitor.rs"
        ]
      }
    ],
    "nextAction": "Compare the #29026 patches and subtract their equivalent behavior; benchmark any residual recursive specialization changes using the added recursive protocol microbenchmarks and incremental member-edit test.",
    "evidence": [
      {
        "label": "Upstream #29026 commit",
        "url": "https://github.com/astral-sh/ruff/commit/19cb997763936be5bd7f3f791965366a99b3989b"
      }
    ]
  },
  {
    "id": "ty-vendored-root",
    "title": "List entries at a vendored archive root",
    "state": "Old-fork candidate; current-upstream reproduction pending",
    "summary": "VendoredFileSystem::read_directory treats normalized empty paths as the archive root instead of prefixing a slash. read_directory_root checks empty, dot, slash and normalized-parent spellings.",
    "sources": [
      {
        "commit": "17ee6afa71944cbc0f46d652e7e3a78940f9f873",
        "detail": "List root entries in vendored archives",
        "paths": [
          "crates/ruff_db/src/vendored.rs"
        ]
      }
    ],
    "nextAction": "Review the qualified root-listing fix and coordinate the overlap with the draft archive rewrite #29829."
  },
  {
    "id": "ty-guard-call-mapping",
    "title": "Keep TypeIs and TypeGuard targets through argument expansion",
    "state": "Old-fork candidate; current-upstream reproduction pending",
    "summary": "TypeGuardArgument distinguishes a mapped call argument, an omitted target and unavailable mapping. bind_type_guard_return_type uses parameter provenance rather than guessing another argument after expansion. Later ambiguous-call changes share this boundary.",
    "sources": [
      {
        "commit": "babd7e2affadeb88fd328fd516d43a5e5f232f4c",
        "detail": "[ty] Track guard targets across call expansions",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/narrow/type_guards.md",
          "crates/ty_python_semantic/src/types/call/bind.rs",
          "crates/ty_python_semantic/src/types/infer/builder/typeguard.rs"
        ]
      }
    ],
    "nextAction": "Reproduce starred/keyword expansion, omitted targets, bound receivers and overload disagreement on current ty; retain identity-function forwarding and provisional inference negatives before extracting any still-needed change."
  },
  {
    "id": "ty-generic-method-target-variables",
    "title": "Reject incompatible payloads behind generic methods",
    "state": "Upstream reproduced; fix not qualified",
    "summary": "Structural comparison accepts Result[str] as Result[int] when a generic first_or method returns its payload or a caller-supplied fallback. The same false acceptance occurs with nested recursive payloads. Direct recursive payload comparison rejects correctly. Baseline and deferred-receiver experiments agree in both generic syntaxes, so this is a separate signature-comparison defect.",
    "sources": [],
    "evidence": [
      {
        "label": "Existing upstream existential-binder proposal",
        "url": "https://github.com/astral-sh/ruff/pull/29027"
      },
      {
        "label": "Earlier higher-rank comparison attempt, closed unmerged",
        "url": "https://github.com/astral-sh/ruff/pull/26638"
      },
      {
        "label": "Related upstream report: generic callable implementations",
        "url": "https://github.com/astral-sh/ty/issues/2924"
      },
      {
        "label": "Related maintainer discussion: generic protocol soundness",
        "url": "https://github.com/astral-sh/ty/issues/2323"
      },
      {
        "label": "Pristine upstream aee01ae4: all four strict regressions fail",
        "url": "https://app.buildbuddy.io/invocation/c9bd6662-24de-4657-a240-8790f755e77b"
      },
      {
        "label": "Baseline and receiver candidate: all 12 causal comparisons",
        "url": "https://app.buildbuddy.io/invocation/66c01da1-5560-4a0c-8a22-54ed5b51477e"
      },
      {
        "label": "Published generic Result and recursive factory definitions",
        "url": "https://github.com/tamird/ruff/blob/f9d7ec289b4b428a8994181d3c117477a8709f03/crates/ty_python_semantic/resources/mdtest/generics/legacy/functions.md#L6310"
      }
    ],
    "nextAction": "Reconcile existing upstream reports #2924 and #2323, binder PR #29027 and the closed higher-rank attempt #26638 before preparing feedback or extracting another binder implementation. Keep the scoped-binder prerequisite under ty-scoped-witness-proofs. Resolve capture avoidance, bounded mapping and complete versus incomplete witness families at the actual decision boundary. Then qualify caller variables, constrained domains and recursive comparisons before requesting Tamir review."
  },
  {
    "id": "ty-fork-reconciliation",
    "title": "Reconcile the entire pinned Ruff fork",
    "state": "Reconciliation in progress",
    "summary": "Qualified Sty 14d05b98 pins Ruff 07a4f30c on official 75fabee2. Eight native targets, the optimized build and all 148 unchanged corpus cases pass. All 20 community checks execute with unchanged outcomes: 11 strict passes, six advisory completions and three known failures. All eight qualified workflow refreshes are published. Full Ruff Markdown retains 507 passing and 31 unchanged failing fixtures. Ruff’s maintained build branch now pins Bazel rustfmt to Rust 1.100.0 in 928316fb; Cargo inputs and Rust sources are unchanged.",
    "sources": [
      {
        "commit": "352ce32f76a8416551cb72d66dfa4f6d75a7c7e9",
        "detail": "[ty] Accept immediately guarded dictionary reads",
        "paths": [
          "crates/ty_python_semantic/resources/mdtest/narrow/conditionals/in.md",
          "crates/ty_python_semantic/src/types/dictionary.rs",
          "crates/ty_python_semantic/src/types/infer/builder/subscript.rs",
          "crates/ty_python_semantic/src/types/subscript.rs"
        ]
      }
    ],
    "evidence": [
      {
        "label": "Qualified Sty engine and Ruff pin",
        "url": "https://github.com/tamird/sty/commit/14d05b98238e2c0bf7773c81bbeb209861a7145b"
      },
      {
        "label": "Eight native targets and optimized build on RBE",
        "url": "https://app.buildbuddy.io/invocation/d3a78c0a-0ae7-45be-bc93-d6c0eac85c25"
      },
      {
        "label": "Ruff native and full Markdown: 538 fixtures; 31 known failures",
        "url": "https://app.buildbuddy.io/invocation/43ad4d02-b014-4606-b1e5-35fdc81f700a"
      },
      {
        "label": "Current source audit and separate runtime observations",
        "url": "https://tamird.github.io/sty/ruff-forward-audit.json"
      },
      {
        "label": "All eight LLVM checks execute; two strict failures remain",
        "url": "https://app.buildbuddy.io/invocation/dd978d27-6ff9-436d-8925-6e9e5afc8737"
      },
      {
        "label": "Bazel rustfmt pinned to Rust 1.100.0",
        "url": "https://github.com/tamird/ruff/commit/928316fb0471779f50fb65f7041c6642bd241ff1"
      },
      {
        "label": "Pinned formatter, ty_format and changed-config hooks on RBE",
        "url": "https://app.buildbuddy.io/invocation/b88fbd58-7aa0-4903-bc8f-03a009f57cce"
      },
      {
        "label": "Frozen source receipt and historical coverage",
        "url": "https://tamird.github.io/sty/ruff-fork-audit.json"
      }
    ],
    "nextAction": "Follow current-head CI and maintainer feedback on submitted PRs #30761, #30848, #30897 and #30898, then reconcile their outcomes with the fork. Continue the existing Apple/LLVM contract work and smaller-contribution redesign of the withdrawn fresh-collection proposal.",
  }
];

export const tyWork = [...reviewedTyWork, ...solverInventory.tasks];

export const inventory = {
  "pinnedFork": "07a4f30c36d8f27455d2785f9abef566e0bf3641",
  "forkBase": "75fabee2e0a069b6bf5a1af4226025afa0324fa5",
  "upstreamAudited": "75fabee2e0a069b6bf5a1af4226025afa0324fa5",
  "divergentCommits": 55,
  "userAuthoredCommits": 55,
  "upstreamAuthoredPicks": 0,
  "status": "Qualified Sty 14d05b98 pins Ruff 07a4f30c on official 75fabee2. Native targets, optimized Linux and all 148 unchanged corpus cases pass. All 20 community checks execute with unchanged outcomes: 11 strict zero-error passes, six advisory completions and three known failures. All eight qualified workflow refreshes are published; GitHub CI and reviews are tracked separately from completed RBE qualification.",
  "reviewedCandidate": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
  "reviewedBase": "6b5b5eca948c05261a3909e78133884cd9e61c9e",
  "sourceReviewComplete": false,
  "sourceReview": {
    "candidate": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
    "base": "6b5b5eca948c05261a3909e78133884cd9e61c9e",
    "changedPaths": 231,
    "runtimePathsWithSourceRecords": 142,
    "solverHunksAttributed": 939,
    "solverReviewUnits": 169,
    "forwardCandidate": "07a4f30c36d8f27455d2785f9abef566e0bf3641",
    "forwardBase": "75fabee2e0a069b6bf5a1af4226025afa0324fa5",
    "url": "https://tamird.github.io/sty/ruff-source-audit.json",
    "qualified": false,
    "forwardNetPaths": 316,
    "forwardRustSourcePaths": 155,
    "forwardAttributedRustPaths": 59,
    "forwardHunks": 455,
    "forwardProducerFamilies": 20
  },
  "scope": "All 17 user-authored Bazel typing issues have dated GitHub receipts. Ruff's frozen source audit and forward reconciliation enumerate surviving mechanisms; reduced upstream reproductions, runtime qualification and remaining overlap review are incomplete. Historical commit counts and source review units are not pending PR counts.",
  "qualification": "Every new upstream proposal needs a current-upstream reproduction, focused negative/positive cases, relevant full qualification and Tamir approval. Existing merged templates, in-review PRs, host extension design and remaining Python fixes are distinct.",
  "historicalGitInventory": {
    "pinnedFork": "352ce32f76a8416551cb72d66dfa4f6d75a7c7e9",
    "forkBase": "d63450150b",
    "upstreamAudited": "aa46aae607",
    "divergentCommits": 495,
    "userAuthoredCommits": 483,
    "upstreamAuthoredPicks": 12
  },
  "publishedRuffCheckpoint": {
    "revision": "07a4f30c36d8f27455d2785f9abef566e0bf3641",
    "sourceRevision": "07a4f30c36d8f27455d2785f9abef566e0bf3641",
    "url": "https://github.com/tamird/ruff/commit/07a4f30c36d8f27455d2785f9abef566e0bf3641",
    "selectedTestsURL": "https://app.buildbuddy.io/invocation/43ad4d02-b014-4606-b1e5-35fdc81f700a",
    "testScope": "Core 101, semantic 904 (35 ignored), IDE 1979, canonical hooks, formatting and strict Clippy pass. Full default Markdown executes 538 fixtures: 507 pass and the same 31 fail, with full failure bodies unchanged after proven line shifts. The inventory action is excluded from this aggregate; network-backed cases remain separate. The compatible-context optimization retains per-expression validation and has separate official cost evidence.",
    "fullMarkdownQualified": false,
    "styIntegrationQualified": true,
    "markdownResults": {
      "revision": "07a4f30c36d8f27455d2785f9abef566e0bf3641",
      "fixtures": 538,
      "passed": 507,
      "failed": 31,
      "compiledHarnesses": 1,
      "url": "https://app.buildbuddy.io/invocation/43ad4d02-b014-4606-b1e5-35fdc81f700a",
      "historical": false,
      "runtimeParent": "940e9c43b2fff543b344863986159b3fda11ae46",
      "identicalFullFailureBodies": 31,
      "improvedFailureBodies": 0,
      "newFailedFiles": 0,
      "resolvedFailedFiles": 0,
      "inventoryActionExcludedFromAggregate": true
    },
    "previousMarkdownResults": {
      "revision": "940e9c43b2fff543b344863986159b3fda11ae46",
      "fixtures": 538,
      "passed": 507,
      "failed": 31,
      "inventoryPassed": true,
      "compiledHarnesses": 1,
      "actionsCompleted": 539,
      "url": "https://app.buildbuddy.io/invocation/91010805-fa38-4499-b97c-137628a5ee57",
      "historical": true,
      "runtimeParent": "5cdb4547e2e2ba2b059abc56ddc245c20675ee4b",
      "identicalFullFailureBodies": 31,
      "improvedFailureBodies": 0,
      "newFailedFiles": 0,
      "resolvedFailedFiles": 0
    }
  },
  "currentSty": {
    "revision": "14d05b98238e2c0bf7773c81bbeb209861a7145b",
    "url": "https://github.com/tamird/sty/commit/14d05b98238e2c0bf7773c81bbeb209861a7145b",
    "ruffRevision": "07a4f30c36d8f27455d2785f9abef566e0bf3641",
    "testScope": "All eight native targets, formatting and the optimized Linux executable pass on RBE with frozen locks. All 148 real corpus cases pass with zero fixture changes and exact source-plan/artifact guards.",
    "testsURL": "https://app.buildbuddy.io/invocation/1aa1749b-e3e7-4d35-9fbc-669a2207b7c1",
    "frozenBuildURL": "https://app.buildbuddy.io/invocation/8a801ba7-161c-4566-834b-7d91c8146965",
    "communityWorkflowExecutionsPlanned": 20,
    "communityRefreshPublished": true,
    "runtimeCorpusQualified": true,
    "fullRuffMarkdownQualified": false,
    "communityQualification": {
      "revision": "14d05b98238e2c0bf7773c81bbeb209861a7145b",
      "planned": 20,
      "executed": 20,
      "strictZeroErrorPasses": 11,
      "advisoryCompletions": 6,
      "failures": 3,
      "requiredSkipped": 0,
      "published": true,
      "scope": "All 20 checks execute with complete coverage and exact source snapshots, identical in outcome, coverage and inputs to 43d26607. Apple retains two toolchain-field errors; LLVM retains 31 released-example and 26 proposed-types errors. RBE native tests pass. rules_rs has zero formatting differences and 148 inherited formatter warnings (exit 1). All eight qualified workflow refreshes are published; current GitHub CI and review status is recorded separately.",
      "assembledFromLatestProjectRuns": true,
      "publishedProjects": [
        "bazel-skylib",
        "bazel_features",
        "rules_runfiles_group",
        "rules_cc",
        "rules_rs",
        "with_cfg.bzl",
        "apple_support",
        "hermetic-llvm"
      ],
      "remainingProjects": 0,
      "historicalForCurrentSty": false,
      "currentRevisionPending": false,
      "readyProjects": [
        "bazel-skylib",
        "bazel_features",
        "rules_runfiles_group",
        "rules_cc",
        "rules_rs",
        "with_cfg.bzl"
      ],
      "repairProjects": 2,
      "publicationBlocker": null
    },
    "defaultCorpusManifestCurrent": true,
    "corpusQualification": {
      "revision": "14d05b98238e2c0bf7773c81bbeb209861a7145b",
      "passed": 148,
      "failed": 0,
      "manifestPublished": true,
      "inputsPublished": true,
      "fixtureChanges": 0,
      "scope": "All 148 actual cases pass on Sty 14d05b98 with zero fixture changes. All eight artifact hashes and exact source plans are verified; the existing published corpus manifest and source commits are unchanged.",
      "projects": [
        {
          "project": "bazel_features",
          "sourceCommit": "657a891ce2224a999dcc766c4acaa0ed328c9dcc",
          "casesPassed": 3,
          "url": "https://app.buildbuddy.io/invocation/01cb2b3f-1ded-4f99-a55e-2fcc1a34169f",
          "artifactSHA256": "913af95905d131c265196c8e40ff716a976db7ff0be04f87c267f3577c60e321"
        },
        {
          "project": "rules_cc",
          "sourceCommit": "a8ab72427b395721342468c8d64ab14e44482983",
          "casesPassed": 7,
          "url": "https://app.buildbuddy.io/invocation/b5565378-45f7-4754-93e6-59565255ace2",
          "artifactSHA256": "6689476894d5f68a9c438968271ab714330623ec34d92486e4fb74b2efe0a08b"
        },
        {
          "project": "bazel-skylib",
          "sourceCommit": "903bcc4b5175b7dff751c4ed8f4fecce84634fe4",
          "casesPassed": 8,
          "url": "https://app.buildbuddy.io/invocation/a0b59233-7311-4d33-a681-aec6a4ce224a",
          "artifactSHA256": "13ce054ad2014ba7efbb4019832cd6932812fb1ccedbf7713ab37c6b42abc78f"
        },
        {
          "project": "rules_rs",
          "sourceCommit": "fa5b73e2ac1c77470c52e2776034a314803a8029",
          "casesPassed": 6,
          "url": "https://app.buildbuddy.io/invocation/c78be14d-ea22-41f6-b91a-6edd652ab041",
          "artifactSHA256": "9692d49894bd171c6a18a222729b65c4813870efbb1a8544d8e3fb8f99d442c2"
        },
        {
          "project": "rules_runfiles_group",
          "sourceCommit": "0501509db0839f5dff9f743d6fc4f45c9c2656ea",
          "casesPassed": 14,
          "url": "https://app.buildbuddy.io/invocation/87a5a0d6-b6a3-4a8c-ad18-153f321c70b5",
          "artifactSHA256": "232f9502bfa361222da35b6addca60603d7de06f308fc97365ad7f496fae7854"
        },
        {
          "project": "apple_support",
          "sourceCommit": "ec0fb009f2e2ddd0199365f6600d28c598d386c9",
          "casesPassed": 11,
          "url": "https://app.buildbuddy.io/invocation/ad927792-8987-4859-8bc4-267e58e8b785",
          "artifactSHA256": "b87c3df1b4d5279f33d1ecfef009b8af291e74890ce50133afcce5f39aa1ead4"
        },
        {
          "project": "hermetic-llvm",
          "sourceCommit": "dd08026d84b8fc4756d7d682858826ef27702fff",
          "casesPassed": 18,
          "url": "https://app.buildbuddy.io/invocation/24af6077-99eb-4a70-94b7-092a15867638",
          "artifactSHA256": "8123846ac9c373c8ce4c07400873f3d9735a3a6f971d660080f06edb23b0bffb"
        },
        {
          "project": "with_cfg.bzl",
          "sourceCommit": "cace8639b445a96301d6f010d628fb862504665e",
          "casesPassed": 81,
          "url": "https://app.buildbuddy.io/invocation/acc3376f-a0f7-4900-8207-3a0bf7e7093e",
          "artifactSHA256": "33b45fff3e10f3bafabeaa6bf3e0342ee9d4fd9d141c72106f9ea332f376ee68"
        }
      ]
    }
  },
  "latestUpstream": {
    "revision": "75fabee2e0a069b6bf5a1af4226025afa0324fa5",
    "observedOn": "2026-11-21",
    "rebasePending": false,
    "pendingChanges": [],
    "scope": "The 14 recorded merged upstream changes are inherited by public Ruff 07a4f30c on official 75fabee2. The native and Sty integration gates pass; 31 preexisting Ruff Markdown fixtures remain failures. Source accounting remains separate from runtime qualification.",
    "integratedChanges": [
      {
        "number": 30641,
        "area": "TypedDict literal candidate filtering",
        "url": "https://github.com/astral-sh/ruff/pull/30641"
      },
      {
        "number": 30650,
        "area": "Solver path-cache keys and constraint support",
        "url": "https://github.com/astral-sh/ruff/pull/30650"
      },
      {
        "number": 30646,
        "area": "Legacy namespace source-scan cache",
        "url": "https://github.com/astral-sh/ruff/pull/30646"
      },
      {
        "number": 30658,
        "area": "[ty] Skip impossible coverage checks in constraint diagrams (#30658)",
        "url": "https://github.com/astral-sh/ruff/pull/30658",
        "commit": "f29d832189bb5eeeabb0898c823aa4a7e42e2ba6"
      },
      {
        "number": 30643,
        "area": "[ty] Reuse unchanged specializations during cycle recovery (#30643)",
        "url": "https://github.com/astral-sh/ruff/pull/30643",
        "commit": "31cfa858b944e879929aeb63dcadf95faeffb286"
      },
      {
        "number": 30700,
        "area": "[ty] Skip prefix checks when no outer scope can bind a member (#30700)",
        "url": "https://github.com/astral-sh/ruff/pull/30700",
        "commit": "cb79f61f9f3d1eeb13833d05ad42c602cee123af"
      },
      {
        "number": 30668,
        "area": "[ty] Defer semantic indexing until `__all__` analysis needs an expression type (#30668)",
        "url": "https://github.com/astral-sh/ruff/pull/30668",
        "commit": "1b0606b218e6fbede35d22c8921c6c71f7ebfdac"
      },
      {
        "number": 30684,
        "area": "[ty] Avoid quadratic deduplication when displaying literal unions (#30684)",
        "url": "https://github.com/astral-sh/ruff/pull/30684",
        "commit": "dee3e8cd82a330678da00c023be4a6a71d125a94"
      },
      {
        "number": 30667,
        "area": "[ty] Skip tuple specialization for unrelated nominal targets (#30667)",
        "url": "https://github.com/astral-sh/ruff/pull/30667",
        "commit": "4cdf7cacc3f3dc4413579a718eef755095d801d2"
      },
      {
        "number": 30671,
        "area": "[ty] Avoid rebuilding ordinary function signatures to check for type guards (#30671)",
        "url": "https://github.com/astral-sh/ruff/pull/30671",
        "commit": "bda568d1b665fe1581b38f749debc5ecb25f9643"
      },
      {
        "number": 30674,
        "area": "[ty] Skip unnecessary member lookups for enum values (#30674)",
        "url": "https://github.com/astral-sh/ruff/pull/30674",
        "commit": "68354a7ba38109ca6648209bfcc487991b5f5f70"
      },
      {
        "number": 30645,
        "area": "[ty] Reuse materializations of shared unions (#30645)",
        "url": "https://github.com/astral-sh/ruff/pull/30645",
        "commit": "661a84100c4736f507090dd31143069215a451df"
      },
      {
        "number": 30714,
        "area": "[ty] Filter member completions before looking up documentation (#30714)",
        "url": "https://github.com/astral-sh/ruff/pull/30714",
        "commit": "b2287d635d9be03e9f57452c15cb0a16b4fe3e50"
      },
      {
        "number": 30680,
        "area": "[ty] Defer constructing instance types during generated member lookup (#30680)",
        "url": "https://github.com/astral-sh/ruff/pull/30680",
        "commit": "b7014a05ff6db310ca2b3b24f6d82263067d17a6"
      },
      {
        "number": 30665,
        "area": "[ty] Skip unrelated definitions and imports in semantic token range requests (#30665)",
        "url": "https://github.com/astral-sh/ruff/pull/30665",
        "commit": "dd5afa8e5338a2fb81fa1ce26cde97dc0d03d0e3"
      },
      {
        "number": 30702,
        "area": "[ty] Skip inclusion checks when selecting a program under a source root (#30702)",
        "url": "https://github.com/astral-sh/ruff/pull/30702",
        "commit": "295982d1919680d1c63af946e8f0bac8bae344a2"
      },
      {
        "number": 30698,
        "area": "[ty] Skip impossible subtype checks for strings in class object unions (#30698)",
        "url": "https://github.com/astral-sh/ruff/pull/30698",
        "commit": "75fabee2e0a069b6bf5a1af4226025afa0324fa5"
      }
    ]
  }
};
