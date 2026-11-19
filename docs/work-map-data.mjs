export const projects = [
 {name:"Bazel Skylib",repo:"bazelbuild/bazel-skylib",number:641,head:"baac9cc1c57fb2ec3c64a713b1ee9434d02c4685",draft:true,summary:"Helper, collection, partial, provider and rule contracts.",checks:"Fork PR #1: root and Gazelle sty checks passed. Upstream head has a successful CLA check.",followup:"Includes open fixes #643 and #647. Native build_test tag handling is tracked separately in #644.",dependencies:[['Skylib #643','https://github.com/bazelbuild/bazel-skylib/pull/643'],['Skylib #647','https://github.com/bazelbuild/bazel-skylib/pull/647'],['Skylib #644','https://github.com/bazelbuild/bazel-skylib/pull/644']]},
 {name:"rules_cc",repo:"bazelbuild/rules_cc",number:940,head:"bbec9dfcba1604fa7c42810edec3b617a62f872f",draft:true,summary:"C++ toolchain providers, helper constructors and macro contracts.",checks:"Upstream and fork sty checks passed.",followup:"Related #960 closed without merging; #967 remains open. Do not treat the closed fix as landed.",dependencies:[['rules_cc #960','https://github.com/bazelbuild/rules_cc/pull/960'],['rules_cc #967','https://github.com/bazelbuild/rules_cc/pull/967']]},
 {name:"hermetic-llvm",repo:"hermeticbuild/hermetic-llvm",number:835,head:"53f3ce81e92dd1bffe6100797620b45740795ffd",draft:true,summary:"LLVM helper, selector and callback contracts compatible with older Bazel releases.",checks:"Upstream sty and the listed CI checks passed.",followup:"Consumes Skylib and rules_cc declarations or versioned stubs until releases include those types.",dependencies:[['Skylib #641','https://github.com/bazelbuild/bazel-skylib/pull/641'],['rules_cc #940','https://github.com/bazelbuild/rules_cc/pull/940']]},
 {name:"apple_support",repo:"bazelbuild/apple_support",number:668,head:"6e47ac0b4422ea9d9b9a7e3ae7889988f23fc3d8",draft:true,summary:"Xcode, lipo, Apple action, DMG and platform provider contracts.",checks:"sty passed.",followup:"Uses versioned Skylib stubs and a narrow rules_cc annotation patch until supported releases carry them.",dependencies:[['Skylib #641','https://github.com/bazelbuild/bazel-skylib/pull/641'],['rules_cc #940','https://github.com/bazelbuild/rules_cc/pull/940']]},
 {name:"with_cfg.bzl",repo:"fmeum/with_cfg.bzl",number:269,head:"52365fcdb3cf36149ee0937fb0b812968e4cb56f",draft:true,blocked:true,summary:"Settings, selectors, frontend rules, argument rewriting and provider contracts.",checks:"sty passed; a macOS test was cancelled.",followup:"GitHub reports a merge conflict. Reconcile against upstream before claiming readiness.",dependencies:[]},
 {name:"rules_runfiles_group",repo:"bazel-contrib/rules_runfiles_group",number:23,head:"0f3a7b23dd0624aeac263f5328b494a37fba5d9c",draft:true,summary:"Provider fields and generic handle types shared by materialize, transform and merge callbacks.",checks:"sty and Bazel matrix passed.",followup:"Draft awaiting further review and continuation.",dependencies:[]},
 {name:"rules_rs",repo:"hermeticbuild/rules_rs",number:306,head:"8c0866a3c27e7cad86b55cf09392ea44f34444a0",draft:true,blocked:true,summary:"Crate selection, generated Cargo workspaces, repository generation and Rust toolchain contracts.",checks:"sty passed. One Bazel 8 Ubuntu job failed while fetching NetBSD standard libraries.",followup:"The failed job reports No space left on device. This establishes runner disk exhaustion, not a typing regression.",dependencies:[['Failed runner log','https://github.com/hermeticbuild/rules_rs/actions/runs/41667742544/job/126028278197']]},
 {name:"bazel_features",repo:"bazel-contrib/bazel_features",number:158,head:"a14724e000bbdc0bb1406ac620465527d83e892f",draft:false,summary:"Feature compatibility declarations checked against implementations.",checks:"Fork sty passed; a macOS test was cancelled.",followup:"Open, non-draft. Qualification and approval status must be checked separately.",dependencies:[]}
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
    "id": "destructured-list-elements",
    "title": "Literal element types in destructured list loops",
    "state": "In qualification",
    "source": "c52778b7343432c867b5325b26fd5da72329b5ca",
    "summary": "Adapt shared iterable inference to immediate list displays; retain tuple behavior and test mutation and fallback cases. Not submitted upstream."
  }
];
