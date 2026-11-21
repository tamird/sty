export { ruffForkAudit } from './ruff-fork-audit.mjs';
import { solverInventory } from './solver-inventory.mjs';
export { solverInventory };
import { ruffForwardAudit } from './ruff-forward-audit.mjs';
export { ruffForwardAudit };

// Curation time; collecting provider observations does not advance it.
export const reviewedAt = "2026-11-21T22:37:11.372833Z";

export const projects = [
 {name:"Bazel Skylib",nextAction:"Prepare the qualified contribution for maintainer review.",repo:"bazelbuild/bazel-skylib",number:641,head:"0d67032913356f4e43f700a5e04b1efa20af96ae",draft:true,summary:"Helper, collection, partial, provider and rule contracts.",checks:"RBE 14d05b98: 88 root files and five Gazelle files pass with zero errors (two root warnings).",followup:"The qualified Sty 14d05b98 workflow update is published. GitHub CI and review observations are recorded separately below.",dependencies:[['Skylib #643','https://github.com/bazelbuild/bazel-skylib/pull/643'],['Skylib #647','https://github.com/bazelbuild/bazel-skylib/pull/647'],['Skylib #644','https://github.com/bazelbuild/bazel-skylib/pull/644']],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/8ff7faa8-2b15-4412-88dd-3bcdd71ec282"}, {"label": "Published workflow update", "url": "https://github.com/tamird/bazel-skylib/commit/0d67032913356f4e43f700a5e04b1efa20af96ae"}]},
 {name:"rules_cc",nextAction:"Reduce the remaining advisory diagnostics.",repo:"bazelbuild/rules_cc",number:940,head:"370815600228a45d71ee2509222ad24b298a45cb",draft:true,summary:"C++ toolchain providers, helper constructors and macro contracts.",checks:"RBE 14d05b98: 134 strict files pass. All 286 advisory files complete with 37,502 errors.",followup:"The qualified Sty 14d05b98 workflow update is published. GitHub CI and review observations are recorded separately below.",dependencies:[['rules_cc #960','https://github.com/bazelbuild/rules_cc/pull/960'],['rules_cc #967','https://github.com/bazelbuild/rules_cc/pull/967']],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/520974a9-09ce-4123-82a6-2f0fc1666564"}, {"label": "Published workflow update", "url": "https://github.com/tamird/rules_cc/commit/370815600228a45d71ee2509222ad24b298a45cb"}]},
 {name:"hermetic-llvm",nextAction:"Resolve the 31 example and 26 proposed-type errors.",repo:"hermeticbuild/hermetic-llvm",number:835,head:"cfe15581d127f92e1bcd5582c6b62497217915cd",draft:true,summary:"LLVM helper, selector and callback contracts compatible with older Bazel releases.",checks:"RBE 14d05b98: 70 released-root files pass; the rules_cc example retains 31 errors. Proposed-types checking retains 26 errors in 64 root files. Advisory checks, native tests and formatter complete.",followup:"The qualified Sty 14d05b98 workflow update is published. GitHub CI and review observations are recorded separately below.",dependencies:[['Skylib #641','https://github.com/bazelbuild/bazel-skylib/pull/641'],['rules_cc #940','https://github.com/bazelbuild/rules_cc/pull/940']],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/dd978d27-6ff9-436d-8925-6e9e5afc8737"}, {"label": "Published workflow update", "url": "https://github.com/tamird/hermetic-llvm/commit/cfe15581d127f92e1bcd5582c6b62497217915cd"}]},
 {name:"apple_support",nextAction:"Resolve the two lipo toolchain-field errors.",repo:"bazelbuild/apple_support",number:668,head:"7173262d16db41fe32577f6add2d1826541e7768",draft:true,summary:"Xcode, lipo, Apple action, DMG and platform provider contracts.",checks:"RBE 14d05b98: All 46 strict files checked; two lipo toolchain-field errors remain. All 76 advisory files complete with 5,994 errors.",followup:"The qualified Sty 14d05b98 workflow update is published. GitHub CI and review observations are recorded separately below.",dependencies:[['Skylib #641','https://github.com/bazelbuild/bazel-skylib/pull/641'],['rules_cc #940','https://github.com/bazelbuild/rules_cc/pull/940']],evidence:[{"label": "14d05b98 workflow qualification", "url": "https://app.buildbuddy.io/invocation/842ad4c8-9294-49cf-af5d-a2f94fc894b1"}, {"label": "Published workflow update", "url": "https://github.com/tamird/apple_support/commit/7173262d16db41fe32577f6add2d1826541e7768"}]},
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
    "id": "fresh-collection-callback-context",
    "ref": "upstream/fresh-collection-context-75fabee2",
    "title": "Infer fresh collection argument contexts",
    "state": "Awaiting Tamir review",
    "source": "ba712134db00258728314f30ae2a70d69de8728d",
    "summary": "Fresh collection arguments keep literal types supplied by other arguments in generic calls. Incompatible hints fall back to ordinary inference.",
    "qualifiedBase": "75fabee2e0a069b6bf5a1af4226025afa0324fa5",
    "qualifiedHead": "ba712134db00258728314f30ae2a70d69de8728d",
    "qualifiedURL": "https://github.com/tamird/ruff/compare/75fabee2e0a069b6bf5a1af4226025afa0324fa5...ba712134db00258728314f30ae2a70d69de8728d",
    "qualification": {
      "summary": "Core, semantic and IDE tests, style and all 532 default Markdown cases pass on 75fabee2. Current-parent attrs checks used same-worker ABBA with 30 samples per phase: 405.077 to 415.182 ms (+2.495%), with all 45 diagnostics byte-identical. This is one maintained workload; three untimed helper entries do not prove projection reuse, benefit or broad performance neutrality. Optimized no-LTO stress checks cost 12.0% more for 256 homogeneous arguments, 19.6% for alternating types and 16.2% for 1,500 rejected hints. Both focused lambda probes are rejected by parent and proposal: the same-key pair has the identical int.lower error; the callback-list variant changes invalid-argument-type to a missing-attribute error inside the lambda. Neither demonstrates a newly rejected valid call or broadly resolves the speculative-diagnostics question. The earlier cd2 attrs evidence is historical and exercised only two hint attempts.",
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
    "nextAction": "Tamir: approve this exact ba712 proposal before upstream submission, taking the measured attrs and stress costs into account."
  },
  {
    "id": "exception-tuple-alias-projection",
    "ref": "upstream/resolve-exception-tuple-aliases",
    "title": "Preserve exception types through tuple aliases",
    "state": "Awaiting Tamir review",
    "source": "9188597e94983c89c39c386cb6d8a1c603d6bad5",
    "summary": "A tuple alias in an exception-handler parameter lost its ValueError element type and produced BaseException. Resolve the alias when projecting tuple elements.",
    "qualifiedBase": "f31dd86f222f7d978a65cfc453eaf88f11456ed7",
    "qualifiedHead": "9188597e94983c89c39c386cb6d8a1c603d6bad5",
    "qualifiedURL": "https://github.com/tamird/ruff/commit/9188597e94983c89c39c386cb6d8a1c603d6bad5",
    "qualification": {
      "summary": "The existing fixture fails on pristine upstream and passes with the one-line fix. Core, semantic, IDE, all 532 default Markdown cases, canonical hooks, formatting and strict Clippy pass on RBE.",
      "evidence": [
        {
          "label": "Qualified contribution",
          "url": "https://github.com/tamird/ruff/commit/9188597e94983c89c39c386cb6d8a1c603d6bad5"
        },
        {
          "label": "Native and all 532 default Markdown cases",
          "url": "https://app.buildbuddy.io/invocation/731e2166-7327-4bcb-b58b-ec72235f39d7"
        }
      ]
    },
    "nextAction": "Tamir: review this qualified contribution before upstream submission."
  },
  {
    "id": "receiver-union-overload-selection",
    "ref": "upstream/unify-bound-method-receivers",
    "title": "Select method overloads across receiver unions",
    "state": "Awaiting Tamir review",
    "source": "d367097750ddf7a8cd0f1e23b543cd3a8208af56",
    "summary": "Keep internal truthiness guards while selecting the same method's overloads against its full receiver union. Fixes `(value or \"\").split()` inference.",
    "qualifiedBase": "f31dd86f222f7d978a65cfc453eaf88f11456ed7",
    "qualifiedHead": "d367097750ddf7a8cd0f1e23b543cd3a8208af56",
    "qualifiedURL": "https://github.com/tamird/ruff/compare/f31dd86f222f7d978a65cfc453eaf88f11456ed7...d367097750ddf7a8cd0f1e23b543cd3a8208af56",
    "qualification": {
      "summary": "Core, semantic and IDE suites, all 532 default Markdown cases, formatting and strict Clippy pass. A minimal extension of the existing enum fixture preserves rejection of a mixed supported/unsupported receiver union. Current Dulwich and SymPy diagnostic multisets are unchanged from the frozen original baseline: 688 and 16,588 existing diagnostics, respectively. The original baseline was reused with an exact environment fingerprint.",
      "evidence": [
        {
          "label": "Review the qualified commit",
          "url": "https://github.com/tamird/ruff/commit/d367097750ddf7a8cd0f1e23b543cd3a8208af56"
        },
        {
          "label": "Guard-preserving fix: native and all 532 default Markdown cases",
          "url": "https://app.buildbuddy.io/invocation/5fd38933-656b-48ca-9496-4bb62970bd88"
        },
        {
          "label": "Existing enum fixture and final canonical hooks",
          "url": "https://app.buildbuddy.io/invocation/68523e7a-4661-400e-9e87-cbf65205f4f2"
        },
        {
          "label": "Current Dulwich and SymPy: unchanged diagnostics",
          "url": "https://app.buildbuddy.io/invocation/2ad7d8d4-5061-4c34-a4ea-64a11df3bb10"
        }
      ]
    },
    "nextAction": "Tamir: approve this qualified contribution before upstream submission."
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
    "state": "Awaiting Tamir review",
    "source": "5678a81398ae87c721118445dd539e568f940c10",
    "summary": "Unrelated project edits can collect interned call keys and rerun an unchanged file's semantic index. Track these keys as outputs of that index. One isolated commit; not submitted upstream.",
    "qualifiedBase": "7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc",
    "qualifiedHead": "5678a81398ae87c721118445dd539e568f940c10",
    "qualifiedURL": "https://github.com/tamird/ruff/compare/7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc...5678a81398ae87c721118445dd539e568f940c10",
    "qualification": {
      "summary": "Current 7d1 refresh: core, semantic and IDE suites and canonical hooks pass. Affected source files and Cargo authorities are unchanged. Earlier e905 qualification: The maintained regression fails three times on the baseline and passes three times with the fix. Core, semantic and IDE suites, all 533 default native Markdown/inventory actions, hooks, formatting and strict Clippy pass. The smaller test uses the existing query-event helpers and a LOW-durability project root. All five original repeated-call benchmarks ran four times per phase; comparisons within CPU models found no material regression. Mixed hardware and small per-model samples limit the performance conclusion; network-backed Markdown cases were not enabled.",
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
        }
      ]
    },
    "nextAction": "Tamir: approve this qualified contribution before upstream submission."
  },
  {
    "id": "destructured-list-elements",
    "ref": "upstream/destructured-list-elements",
    "title": "Preserve literals in loop unpacking",
    "state": "Awaiting Tamir review",
    "source": "bf95f29c54153597cd59bfb602fe5e56aa965e75",
    "summary": "Preserve literal element types when unpacking immediately consumed lists. Single and destructured loop targets share tuple widening policy. Qualified on 7d1b1355; not submitted upstream.",
    "qualifiedBase": "7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc",
    "qualifiedHead": "bf95f29c54153597cd59bfb602fe5e56aa965e75",
    "qualifiedURL": "https://github.com/tamird/ruff/compare/7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc...bf95f29c54153597cd59bfb602fe5e56aa965e75",
    "qualification": {
      "summary": "Current 7d1 refresh: semantic suite, all five maintained Markdown fixtures and canonical hooks pass. Affected source files and Cargo authorities are unchanged. Earlier e905 qualification: Five complete Markdown fixtures pass: unpacking, comprehensions/basic, loops/for, async_for and iterators. Core and semantic unit suites, required hooks, formatting and strict Clippy pass. Tests cover tuple aliases, names, calls and the 65-element widening boundary for both loop-target forms. No full Markdown or ecosystem qualification is claimed.",
      "evidence": [
        {
          "label": "Current-base refresh: independent guarded phases",
          "url": "https://app.buildbuddy.io/invocation/4076d5be-7ee1-4e87-a1ed-5a6f5a0e0520"
        },
        {
          "label": "Review the single upstream commit",
          "url": "https://github.com/tamird/ruff/commit/bf95f29c54153597cd59bfb602fe5e56aa965e75"
        },
        {
          "label": "Matched baseline and revised qualification",
          "url": "https://app.buildbuddy.io/invocation/3e27961a-71f9-4e9f-abd3-526529ae6c41"
        }
      ]
    },
    "nextAction": "Tamir: approve this qualified contribution before upstream submission."
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
const reviewedTyWork = [
  {
    "id": "ty-inplace-notimplemented",
    "title": "Fall back when an in-place operator returns NotImplemented",
    "state": "Python bugfix candidate",
    "summary": "Exclude NotImplemented from the assigned result and try ordinary or reflected binary dispatch. Preserve aliases and any ordinary return alternatives. Extraction and runtime qualification remain incomplete.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Treat NotImplemented from in-place operations as binary fallback",
        "paths": [
          "crates/ty_python_semantic/src/types/infer/builder.rs"
        ]
      }
    ],
    "nextAction": "Reproduce on upstream; qualify reflected overloads, mixed returns, conditional in-place methods and unsupported operands.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/infer/builder.rs#L5354"
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
    "state": "Python bugfix candidate",
    "summary": "Group keys that share value types and requiredness, retaining large literal-key groups instead of merging incompatible get overloads. Source reviewed at dfe98a7d; extraction and runtime qualification remain incomplete.",
    "sources": [
      {
        "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
        "detail": "Preserve precise get results for unions of equivalent literal keys",
        "paths": [
          "crates/ty_python_semantic/src/types/class/typed_dict.rs"
        ]
      }
    ],
    "nextAction": "Reproduce on upstream; cover required and optional keys, key unions, missing keys, defaults and large schemas.",
    "evidence": [
      {
        "label": "Reviewed implementation",
        "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/class/typed_dict.rs#L391"
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
    "nextAction": "Review the qualified bounded/unbounded callback contribution before upstream submission. Finish fork backport qualification and retain the separate stored-collection overlap with #27665.",
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
    "summary": "Qualified Sty 14d05b98 pins Ruff 07a4f30c on official 75fabee2. Eight native targets, the optimized build and all 148 unchanged corpus cases pass. All 20 community checks execute with unchanged outcomes: 11 strict passes, six advisory completions and three known failures. All eight qualified workflow refreshes are published. Full Ruff Markdown retains 507 passing and 31 unchanged failing fixtures.",
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
        "label": "Frozen source receipt and historical coverage",
        "url": "https://tamird.github.io/sty/ruff-fork-audit.json"
      }
    ],
    "nextAction": "Continue reconciling remaining fork changes and the known Apple/LLVM contract gaps. Five isolated ty proposals await Tamir review before upstream submission."
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
