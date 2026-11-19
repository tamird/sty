export { ruffForkAudit } from './ruff-fork-audit.mjs';

export const projects = [
 {name:"Bazel Skylib",nextAction:"Resolve helper and tag follow-ups",repo:"bazelbuild/bazel-skylib",number:641,head:"baac9cc1c57fb2ec3c64a713b1ee9434d02c4685",draft:true,summary:"Helper, collection, partial, provider and rule contracts.",checks:"Fork PR #1: root and Gazelle sty checks passed. Upstream head has a successful CLA check.",followup:"Includes open fixes #643 and #647. Native build_test tag handling is tracked separately in #644.",dependencies:[['Skylib #643','https://github.com/bazelbuild/bazel-skylib/pull/643'],['Skylib #647','https://github.com/bazelbuild/bazel-skylib/pull/647'],['Skylib #644','https://github.com/bazelbuild/bazel-skylib/pull/644']]},
 {name:"rules_cc",nextAction:"Reconcile #960 / #967 fixes",repo:"bazelbuild/rules_cc",number:940,head:"bbec9dfcba1604fa7c42810edec3b617a62f872f",draft:true,summary:"C++ toolchain providers, helper constructors and macro contracts.",checks:"Upstream and fork sty checks passed.",followup:"Related #960 closed without merging; #967 remains open. Do not treat the closed fix as landed.",dependencies:[['rules_cc #960','https://github.com/bazelbuild/rules_cc/pull/960'],['rules_cc #967','https://github.com/bazelbuild/rules_cc/pull/967']]},
 {name:"hermetic-llvm",nextAction:"Track typed dependency releases",repo:"hermeticbuild/hermetic-llvm",number:835,head:"53f3ce81e92dd1bffe6100797620b45740795ffd",draft:true,summary:"LLVM helper, selector and callback contracts compatible with older Bazel releases.",checks:"Upstream sty and the listed CI checks passed.",followup:"Consumes Skylib and rules_cc declarations or versioned stubs until releases include those types.",dependencies:[['Skylib #641','https://github.com/bazelbuild/bazel-skylib/pull/641'],['rules_cc #940','https://github.com/bazelbuild/rules_cc/pull/940']]},
 {name:"apple_support",nextAction:"Replace temporary contracts after typed releases",repo:"bazelbuild/apple_support",number:668,head:"6e47ac0b4422ea9d9b9a7e3ae7889988f23fc3d8",draft:true,summary:"Xcode, lipo, Apple action, DMG and platform provider contracts.",checks:"sty passed.",followup:"Uses versioned Skylib stubs and a narrow rules_cc annotation patch until supported releases carry them.",dependencies:[['Skylib #641','https://github.com/bazelbuild/bazel-skylib/pull/641'],['rules_cc #940','https://github.com/bazelbuild/rules_cc/pull/940']]},
 {name:"with_cfg.bzl",nextAction:"Resolve merge conflict",repo:"fmeum/with_cfg.bzl",number:269,head:"52365fcdb3cf36149ee0937fb0b812968e4cb56f",draft:true,blocked:true,summary:"Settings, selectors, frontend rules, argument rewriting and provider contracts.",checks:"sty passed; a macOS test was cancelled.",followup:"GitHub reports a merge conflict. Reconcile against upstream before claiming readiness.",dependencies:[]},
 {name:"rules_runfiles_group",nextAction:"Confirm current-head checks; review draft",repo:"bazel-contrib/rules_runfiles_group",number:23,head:"0f3a7b23dd0624aeac263f5328b494a37fba5d9c",draft:true,summary:"Provider fields and generic handle types shared by materialize, transform and merge callbacks.",checks:"sty and Bazel matrix passed.",followup:"Draft awaiting further review and continuation.",dependencies:[]},
 {name:"rules_rs",nextAction:"Rerun CI after runner disk fix",repo:"hermeticbuild/rules_rs",number:306,head:"8c0866a3c27e7cad86b55cf09392ea44f34444a0",draft:true,blocked:true,summary:"Crate selection, generated Cargo workspaces, repository generation and Rust toolchain contracts.",checks:"sty passed. One Bazel 8 Ubuntu job failed while fetching NetBSD standard libraries.",followup:"The failed job reports No space left on device. This establishes runner disk exhaustion, not a typing regression.",dependencies:[['Failed runner log','https://github.com/hermeticbuild/rules_rs/actions/runs/41667742544/job/126028278197']]},
 {name:"bazel_features",nextAction:"Check remaining CI and reviews",repo:"bazel-contrib/bazel_features",number:158,head:"a14724e000bbdc0bb1406ac620465527d83e892f",draft:false,summary:"Feature compatibility declarations checked against implementations.",checks:"Fork sty passed; a macOS test was cancelled.",followup:"Open, non-draft. Qualification and approval status must be checked separately.",dependencies:[]}
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
    "id": "destructured-list-elements",
    "title": "Literal element types in destructured list loops",
    "state": "Awaiting Tamir review",
    "source": "c52778b7343432c867b5325b26fd5da72329b5ca",
    "summary": "Preserve literal types when destructuring immediately consumed lists, using the existing shared inference machinery. Qualified remotely and published on the Ruff fork; not submitted upstream.",
    "qualifiedBase": "912ba68f546006f42264c43180c9ce83a76b87cd",
    "qualifiedHead": "4cde8277a76d0f4c050b8fe3ff1a1a3bc13f842f",
    "qualifiedURL": "https://github.com/tamird/ruff/compare/912ba68f546006f42264c43180c9ce83a76b87cd...4cde8277a76d0f4c050b8fe3ff1a1a3bc13f842f",
    "qualification": {
      "summary": "Earlier Linux qualification covered the unchanged runtime implementation with full semantic, core, IDE and external mdtest suites and workspace Clippy. The final comment/test revision passed strict unpacking.md, including the 65-element tuple regression, formatting and required four-file hooks. Removing the guard demonstrably bypasses tuple literal widening. Run logs require BuildBuddy access.",
      "evidence": [
        {
          "label": "Final revision: strict unpacking fixture and formatting passed",
          "url": "https://app.buildbuddy.io/invocation/83431490-c343-48f0-afa6-16c73dab168d"
        },
        {
          "label": "Required hooks for all four changed files passed",
          "url": "https://app.buildbuddy.io/invocation/2d1f9fc3-7c4d-479c-a2f9-156072ffaa29"
        },
        {
          "label": "Guard removal fails the tuple-size regression",
          "url": "https://app.buildbuddy.io/invocation/165a5251-28f0-481f-9f8a-9701baee47c0"
        },
        {
          "label": "Upstream base fixture",
          "url": "https://github.com/astral-sh/ruff/blob/912ba68f546006f42264c43180c9ce83a76b87cd/crates/ty_python_semantic/resources/mdtest/unpacking.md"
        }
      ]
    }
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
export const bazelFeedbackObservedAt = "2026-11-19T21:01:03Z";
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
    "nextAction": "Retest the published reproduction on current Bazel before proposing follow-up feedback."
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
    "head": "0e050975ccf0a0c6964d6f75bc277929553b7888",
    "draft": false,
    "summary": "Declare netrc entry/auth-pattern value types at their allocation boundaries.",
    "checks": "Current check receipts have not been collected in this tracker.",
    "followup": "Native annotations would enable the whole-parser checker and encounter the optional-key narrowing gap in #32022. Current type-comment change does not require that bug to land first.",
    "nextAction": "Confirm current-head checks and reconcile current upstream before requesting review.",
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
export const tyWork = [
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
    "summary": "General constraint solving, callable/generic inference and type-variable improvements need separate Python regressions before porting.",
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
    "nextAction": "Reproduce each surviving behavior on current ty; split independent fixes and qualify their solver/semantic suites before requesting Tamir review."
  },
  {
    "id": "ty-overload-bodies",
    "title": "Annotated overload implementation analysis",
    "state": "Requires current-upstream reconciliation",
    "summary": "Preserve overload signatures while checking implementation bodies and projected callback signatures.",
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
    "nextAction": "Reproduce against current upstream; test public overload calls, implementation-body rejection and contextual callbacks independently."
  },
  {
    "id": "ty-saved-tag-narrowing",
    "title": "Saved runtime type and tagged-union narrowing",
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
    "nextAction": "Extract Python-meaningful regressions; qualify narrowing stability across mutation and keep Starlark tag interpretation in the host adapter."
  },
  {
    "id": "ty-contextual-empty",
    "title": "Contextual empty collection inference",
    "state": "Requires current-upstream reconciliation",
    "summary": "Empty collection defaults and call arguments can require expected-type context; the merged empty-peer change is a template, not proof this whole unit is upstream.",
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
    "nextAction": "Subtract the already merged empty-peer fix, reproduce remaining cases on current ty, and qualify mutable escape/default/argument boundaries.",
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
    "nextAction": "Run the diagnostics/attribute_assignment.md intersection instance/class examples on current ty, including Final rejection, optional union members and dynamic getter/base negatives; isolate only a still-failing behavior.",
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
    "nextAction": "Compare the current upstream archive reader and run the existing root-listing regression; qualify normalized paths, archive subdirectories and missing-directory behavior before proposing a residual fix."
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
    "id": "ty-fork-reconciliation",
    "title": "Reconcile the entire pinned Ruff fork",
    "state": "Reconciliation in progress",
    "summary": "The frozen old-fork diff has an auditable receipt for all 250 changed paths, with blob identities, changed API/test anchors, mechanism mappings and explicit unresolved hunks. Mapping every path does not finish semantic reconciliation or count independent proposals. The current rebase must receive its own surviving-delta audit.",
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
        "label": "Fork comparison from recorded base",
        "url": "https://github.com/tamird/ruff/compare/d63450150b...352ce32f76a8416551cb72d66dfa4f6d75a7c7e9"
      },
      {
        "label": "All 250 paths: immutable source receipt and coverage",
        "url": "https://tamird.github.io/sty/ruff-fork-audit.json"
      }
    ],
    "nextAction": "Reconcile the explicitly unresolved old-fork hunks, then audit every path and mechanism in the qualified rebased tree against current upstream. Subtract landed and superseded implementations before proposing independent changes."
  }
];

export const inventory = {
  "pinnedFork": "352ce32f76a8416551cb72d66dfa4f6d75a7c7e9",
  "forkBase": "d63450150b",
  "upstreamAudited": "aa46aae607",
  "divergentCommits": 495,
  "userAuthoredCommits": 483,
  "upstreamAuthoredPicks": 12,
  "status": "Reconciliation in progress",
  "scope": "All 17 user-authored Bazel typing issues were reconciled with GitHub. Ruff units group current mechanisms; the 495-commit history includes removed proof machinery and upstream picks, and has not yet been fully reduced to surviving current-upstream contributions. Source-history counts are not pending PR counts.",
  "qualification": "Every new upstream proposal needs a current-upstream reproduction, focused negative/positive cases, relevant full qualification and Tamir approval. Existing merged templates, in-review PRs, host extension design and remaining Python fixes are distinct."
};
