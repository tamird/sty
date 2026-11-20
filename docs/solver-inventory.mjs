// Source review and qualification are recorded separately for each immutable revision.
export const solverInventory = {
  "schemaVersion": 1,
  "frozen": {
    "revision": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
    "base": "6b5b5eca948c05261a3909e78133884cd9e61c9e",
    "hunkRevision": "7120f37ed86689328b61ec7a00f2fe8d4d378ccd",
    "indexDigest": "3079cbd8391602919f08654ec210ad9dbad6a6c1eba3e0b4ef6c8ec21a33ac8b",
    "url": "https://github.com/tamird/ruff/commit/dfe98a7daef8d3e8076f20e55ece2f4a98769331",
    "baseUrl": "https://github.com/astral-sh/ruff/commit/6b5b5eca948c05261a3909e78133884cd9e61c9e"
  },
  "coverage": {
    "runtimeOrMixedHunks": 939,
    "reviewedRuntimeOrMixedHunks": 939,
    "reviewUnits": 169,
    "reviewedSourceFiles": 18,
    "sourceHunkAttributionComplete": true,
    "runtimeQualified": false,
    "upstreamReady": false,
    "isPullRequestCount": false,
    "detail": "939 runtime or mixed hunks have source attribution across 169 review units. Regression assertion review is partial; runtime qualification and contribution approval remain open."
  },
  "forward": {
    "upstreamBase": "c8ba04dc06caf4370d494870145c4f92356f1222",
    "rebasedRevision": "44e6017913460afab49cca5ce0fc6468ccccb410",
    "apiCorrectionRevision": "9e0685ba54a37b374b62477ca3f65c821f983a22",
    "qualified": false,
    "upstream": {
      "title": "Memoize more argument assignability checks",
      "pullRequest": 30483,
      "url": "https://github.com/astral-sh/ruff/pull/30483",
      "commitUrl": "https://github.com/astral-sh/ruff/commit/c8ba04dc06caf4370d494870145c4f92356f1222",
      "detail": "Upstream owns the cached assignability APIs, consumer migrations and LiteralString comparison correction. The fork retains its supplied-instance field guard."
    },
    "units": [
      {
        "id": "fork-provisional-arity-inference",
        "title": "Read inferable variables before provisional arity checking",
        "owner": "fork",
        "detail": "Read inferable TypeVars from source signature before provisional arity mismatch binding has inference results.",
        "evidence": [
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L4385"
          },
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L4420"
          }
        ],
        "qualified": false
      },
      {
        "id": "upstream-30483",
        "title": "Upstream memoized assignability APIs",
        "owner": "upstream",
        "detail": "Upstream memoized argument assignability/provenance migration; not fork improvement.",
        "evidence": [
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L4851"
          },
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L7752"
          },
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L8645"
          },
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L8761"
          },
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L8953"
          },
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L8985"
          },
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L9174"
          },
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L9195"
          },
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L9210"
          },
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L9281"
          },
          {
            "label": "generics.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/generics.rs#L3127"
          },
          {
            "label": "generics.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/generics.rs#L5008"
          },
          {
            "label": "builder.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/infer/builder.rs#L6402"
          },
          {
            "label": "literal.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/literal.rs#L92"
          },
          {
            "label": "literal.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/literal.rs#L560"
          },
          {
            "label": "relation.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/relation.rs#L317"
          },
          {
            "label": "relation.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/relation.rs#L650"
          },
          {
            "label": "relation.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/relation.rs#L756"
          },
          {
            "label": "relation.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/relation.rs#L865"
          }
        ],
        "qualified": false
      },
      {
        "id": "fork-expected-return-context-fallback",
        "title": "Preserve expected-result context when argument evidence is missing",
        "owner": "fork",
        "detail": "Missing argument evidence preserves chosen expected-result solution instead of replacing it with unsolved marker.",
        "evidence": [
          {
            "label": "bind.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/call/bind.rs#L6871"
          }
        ],
        "qualified": false
      },
      {
        "id": "fork-ordinary-terminal-budget-fast-path",
        "title": "Avoid an extra terminal traversal without pending relations",
        "owner": "fork",
        "detail": "No pending whole relation invokes terminal continuation directly; only pending relation enters shared true-node traversal.",
        "evidence": [
          {
            "label": "solutions.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1657"
          }
        ],
        "qualified": false
      },
      {
        "id": "fork-fixed-caller-bound-lazy-proof",
        "title": "Retain fixed caller variable constraints in upper-bound proof",
        "owner": "fork",
        "detail": "A fixed lower/upper comparison uses Lazy constraint relation to retain caller variable obligations, rather than eager compatibility.",
        "evidence": [
          {
            "label": "solutions.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1801"
          }
        ],
        "qualified": false
      },
      {
        "id": "fork-newtype-identity-noop",
        "title": "Preserve NewType identity after an unchanged base mapping",
        "owner": "fork",
        "detail": "No-op base mapping returns original NewType chain identity without reconstructing wrappers.",
        "evidence": [
          {
            "label": "newtype.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/newtype.rs#L152"
          }
        ],
        "qualified": false
      },
      {
        "id": "fork-canonical-diagnostic-id-fixture",
        "title": "Use canonical nullable-member diagnostic IDs",
        "owner": "fork",
        "detail": "Update expected missing-union-attribute IDs for existing nullable member cases.",
        "evidence": [
          {
            "label": "tests.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/provided/tests.rs#L3733"
          }
        ],
        "qualified": false
      },
      {
        "id": "fork-finite-generic-callback-lazy-gate",
        "title": "Keep one specialization across a finite generic callback",
        "owner": "fork",
        "detail": "Ordinary assignability for supported declared-domain generic source to finite nongeneric target keeps one complete specialization scoped across all parameters/result.",
        "evidence": [
          {
            "label": "signatures.rs",
            "url": "https://github.com/tamird/ruff/blob/44e6017913460afab49cca5ce0fc6468ccccb410/crates/ty_python_semantic/src/types/signatures.rs#L3809"
          }
        ],
        "qualified": false
      }
    ],
    "apiCorrection": {
      "title": "Adapt observed keyword checking to the updated helper API",
      "detail": "Remove the obsolete constraint-builder argument from observed-keyword variadic checking. The 44→9e diff contains this one deletion.",
      "classification": "API migration",
      "url": "https://github.com/tamird/ruff/commit/9e0685ba54a37b374b62477ca3f65c821f983a22",
      "evidence": [
        {
          "label": "Observed keyword dispatch",
          "url": "https://github.com/tamird/ruff/blob/9e0685ba54a37b374b62477ca3f65c821f983a22/crates/ty_python_semantic/src/types/call/bind.rs#L9248"
        }
      ],
      "qualified": false
    }
  },
  "qualification": {
    "qualified": false,
    "upstreamContributionApproved": false,
    "isPullRequestCommitment": false,
    "gates": [
      "Reproduce each Python candidate against clean upstream.",
      "Qualify native behavior, diagnostics and performance on the exact proposed source.",
      "Resolve related upstream proposals before preparing overlapping contributions.",
      "Present qualified contributions to the user for approval."
    ],
    "correction": {
      "title": "Broader implementation returns are allowed",
      "detail": "The nullable implementation return assertion is invalid evidence for declaration inconsistency. Per-overload body return checking remains separate.",
      "url": "https://typing.python.org/en/latest/spec/overload.html#implementation-consistency"
    }
  },
  "limits": [
    "Hunk IDs refer to the frozen 7120 review ledger; source anchors are translated to the frozen dfe revision.",
    "Source review covers runtime and mixed solver hunks; complete test and snapshot review remains open.",
    "Upstream #29553 still needs remaining per-type migration and fixture review.",
    "The 44 and 9e forward records identify source ownership and API changes; they do not establish runtime qualification.",
    "Existing tracker parents retain ownership. The eleven task records subdivide reviewed mechanisms without committing to a PR count."
  ],
  "sourceFiles": [
    {
      "path": "crates/ty_python_semantic/src/types/call/arguments.rs",
      "blob": "31cbe56db4186e0576c5c07e3517b4bfa1f7054d"
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/bind.rs",
      "blob": "4b30c10649898e6da2e4aa6d21d657e97445ca70"
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/bind/constructor.rs",
      "blob": "e07fed8e27c681db87069a378a9374a108b2fd38"
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/checked.rs",
      "blob": "b42dde99528a07060835e6270a2313215c1f139e"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints.rs",
      "blob": "11f6a491566c2a173e406335771077d11e860642"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/owned.rs",
      "blob": "5cf7b29bec63d9f526eb8872b6529053ce823811"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/paths.rs",
      "blob": "4f1e911fd08eecd67b98126d6c902b4c0f85ee2b"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/projection.rs",
      "blob": "4b4e873f266a6f3ff70801d3822da5f0bdc8ad50"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/resolution.rs",
      "blob": "283d0aafba0db582aa46d5322d7256b514a8d0ed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/sequents.rs",
      "blob": "b91bb530e2271c5a0925e78af7297b9e46027595"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/solutions.rs",
      "blob": "b01cb32c984e3e7d26859ba40175272d82aa1205"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/support.rs",
      "blob": "bbc05fec532d793df602ee522706c6ba14aa79ef"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/variables.rs",
      "blob": "f0f976decdfdea59036db1a10d2967b6319887cb"
    },
    {
      "path": "crates/ty_python_semantic/src/types/cyclic.rs",
      "blob": "91c64a7e54f8a5384dbcb21fd3fe2bdc93ba6433"
    },
    {
      "path": "crates/ty_python_semantic/src/types/generics.rs",
      "blob": "80b2f191604416923364bd9f06057eaa70f3c304"
    },
    {
      "path": "crates/ty_python_semantic/src/types/relation.rs",
      "blob": "03be8b5f5934675efda21f315256418c32484ce9"
    },
    {
      "path": "crates/ty_python_semantic/src/types/signatures.rs",
      "blob": "4b382b0634f778a020e15ea686dac73375fc46c1"
    },
    {
      "path": "crates/ty_python_semantic/src/types/typevar.rs",
      "blob": "d069471d59c66cf057d9a1f7e812da971553d2bd"
    }
  ],
  "overlaps": [
    {
      "number": 27665,
      "url": "https://github.com/astral-sh/ruff/pull/27665",
      "head": "e344ca697426b84a66f341423019854cc8700885",
      "base": "a9130f3381fe137626d22288c0d45f996541ca7e",
      "source": "https://github.com/astral-sh/ruff/pull/27665/commits/e344ca697426b84a66f341423019854cc8700885",
      "review": "Shared collection replay producer",
      "detail": "The proposal shares single-collection contextual replay, matching-overload filtering and feedback avoidance. The fork also retains projection evidence and provisional state.",
      "nextAction": "Reconcile the existing single-collection contextual replay proposal.",
      "completeSourceReview": true,
      "qualified": false
    },
    {
      "number": 29681,
      "url": "https://github.com/astral-sh/ruff/pull/29681",
      "head": "d0fbf86ec4023f25087d664299b45504d5c1698e",
      "base": "ea1865842b8443c7ccecd143dfc55384abc1d794",
      "source": "https://github.com/astral-sh/ruff/pull/29681/commits/d0fbf86ec4023f25087d664299b45504d5c1698e",
      "review": "Related dictionary declaration policy",
      "detail": "The proposal preserves declared dictionary value policy while narrowing observed keys. Its declaration snapshots and mutual-assignability rule cover a different scope from the fork dictionary observation stack.",
      "nextAction": "Compare declared-versus-observed value policy before extracting dictionary flow changes.",
      "completeSourceReview": true,
      "qualified": false
    },
    {
      "number": 23937,
      "url": "https://github.com/astral-sh/ruff/pull/23937",
      "head": "76cb30bb20f4496453a47377f1817c6699a06262",
      "base": "5da0719e77837ab95e436dae64e3c3fc3f79f623",
      "source": "https://github.com/astral-sh/ruff/pull/23937/commits/76cb30bb20f4496453a47377f1817c6699a06262",
      "review": "Related saved-alias goal; different producer",
      "detail": "The proposal adds cross-scope and chained saved aliases with reassignment guards. The fork retains original expression ownership and adds restricted member, key and call histories.",
      "nextAction": "Compare scope, reassignment and chained-alias ownership before proposing extensions.",
      "completeSourceReview": true,
      "qualified": false
    },
    {
      "number": 29553,
      "url": "https://github.com/astral-sh/ruff/pull/29553",
      "head": "3f6fa8d8d8f43e6093d7488a645494c60345a7d8",
      "base": "3e4c0c40eb9181635a04d3c037b208231d881346",
      "source": "https://github.com/astral-sh/ruff/pull/29553/commits/3f6fa8d8d8f43e6093d7488a645494c60345a7d8",
      "review": "Central producer reviewed; remaining source open",
      "detail": "Stable lambda keys retain source context instead of inferred results; deferred mappings and normalization inside signature inference bound recursion. Central producers were reviewed; remaining per-type migrations and fixtures are open.",
      "nextAction": "Read remaining per-type migrations and fixtures before claiming exact lambda overlap.",
      "completeSourceReview": false,
      "qualified": false
    },
    {
      "number": 29555,
      "url": "https://github.com/astral-sh/ruff/pull/29555",
      "head": "3e74ab44f965832b1acb617b97a7b4bdbce2990c",
      "base": "29c3a12911f10c0eee9f4627bfb7578a2ee83779",
      "source": "https://github.com/astral-sh/ruff/pull/29555/commits/3e74ab44f965832b1acb617b97a7b4bdbce2990c",
      "review": "Related generic FunctionType model",
      "detail": "The proposal adds generic nominal FunctionType and MethodType promotion with receiver constraints. The fork also removes redundant nominal FunctionType evidence beside explicit callable signatures.",
      "nextAction": "Coordinate callable promotion and receiver constraints with the existing proposal.",
      "completeSourceReview": true,
      "qualified": false
    },
    {
      "number": 27661,
      "url": "https://github.com/astral-sh/ruff/pull/27661",
      "head": "97e102d5063613df517ac9a115dc478bb4042d6c",
      "base": "93901e647859b7f5a15622d8f486da78a5e4f588",
      "source": "https://github.com/astral-sh/ruff/pull/27661/commits/97e102d5063613df517ac9a115dc478bb4042d6c",
      "review": "Related deferred-reference proposal",
      "detail": "The proposal combines current deferred bindings with future definition order. String annotations and generic scopes have unresolved review limitations; host annotation identity remains a separate mechanism.",
      "nextAction": "Keep future-definition ordering separate from host annotation identity.",
      "completeSourceReview": true,
      "qualified": false
    }
  ],
  "tasks": [
    {
      "id": "ty-typevar-domain-identity",
      "title": "Keep specialized TypeVar domains distinct",
      "state": "Python enhancement candidate",
      "summary": "Track specialized bounds in TypeVar identity while preserving materialized views and exact ParamSpec components.",
      "sources": [
        {
          "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
          "detail": "Keep specialized TypeVar domains distinct",
          "paths": [
            "crates/ty_python_semantic/src/types/constraints.rs",
            "crates/ty_python_semantic/src/types/constraints/solutions.rs",
            "crates/ty_python_semantic/src/types/generics.rs",
            "crates/ty_python_semantic/src/types/typevar.rs"
          ]
        }
      ],
      "nextAction": "Reduce domain identity and substitution cases; qualify captured binders and compare upstream #29555.",
      "evidence": [
        {
          "label": "types/typevar.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/typevar.rs#L1068"
        },
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L586"
        },
        {
          "label": "types/typevar.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/typevar.rs#L1672"
        }
      ],
      "qualified": false,
      "isPullRequestCommitment": false,
      "overlapPullRequests": [
        29555
      ]
    },
    {
      "id": "ty-scoped-witness-proofs",
      "title": "Preserve scoped generic witnesses through inference",
      "state": "Python solver design",
      "summary": "Keep local binders, declared domains and correlated witnesses together through inference, replay and bounded proof. Unknown proofs remain incomplete.",
      "sources": [
        {
          "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
          "detail": "Preserve scoped generic witnesses through inference",
          "paths": [
            "crates/ty_python_semantic/src/types/call/arguments.rs",
            "crates/ty_python_semantic/src/types/constraints.rs",
            "crates/ty_python_semantic/src/types/constraints/owned.rs",
            "crates/ty_python_semantic/src/types/constraints/paths.rs",
            "crates/ty_python_semantic/src/types/constraints/projection.rs",
            "crates/ty_python_semantic/src/types/constraints/resolution.rs",
            "crates/ty_python_semantic/src/types/constraints/sequents.rs",
            "crates/ty_python_semantic/src/types/constraints/solutions.rs",
            "crates/ty_python_semantic/src/types/constraints/support.rs",
            "crates/ty_python_semantic/src/types/constraints/variables.rs",
            "crates/ty_python_semantic/src/types/cyclic.rs",
            "crates/ty_python_semantic/src/types/generics.rs",
            "crates/ty_python_semantic/src/types/relation.rs",
            "crates/ty_python_semantic/src/types/typevar.rs"
          ]
        }
      ],
      "nextAction": "Reduce quantified-domain, witness-correlation and budget cases for upstream design review.",
      "evidence": [
        {
          "label": "types/constraints/variables.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/variables.rs#L123"
        },
        {
          "label": "types/constraints/variables.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/variables.rs#L222"
        },
        {
          "label": "types/constraints/variables.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/variables.rs#L301"
        }
      ],
      "qualified": false,
      "isPullRequestCommitment": false,
      "overlapPullRequests": []
    },
    {
      "id": "ty-cached-implication-conflicts",
      "title": "Recheck cached implications after branch rollback",
      "state": "Python bugfix candidate",
      "summary": "A sibling branch can negate a rolled-back consequence while its antecedents still hold. Retriggering cached rules detects the conflict.",
      "sources": [
        {
          "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
          "detail": "Recheck cached implications after branch rollback",
          "paths": [
            "crates/ty_python_semantic/src/types/constraints/paths.rs"
          ]
        }
      ],
      "nextAction": "Reproduce against clean upstream and qualify both single and pair implication regressions.",
      "evidence": [
        {
          "label": "types/constraints/paths.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/paths.rs#L615"
        }
      ],
      "qualified": false,
      "isPullRequestCommitment": false,
      "overlapPullRequests": []
    },
    {
      "id": "ty-incomplete-proof-diagnostics",
      "title": "Avoid violations from incomplete upper-bound proofs",
      "state": "Python bugfix candidate",
      "summary": "Exhausted generic witness proof must remain unknown instead of producing an upper-bound violation.",
      "sources": [
        {
          "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
          "detail": "Avoid violations from incomplete upper-bound proofs",
          "paths": [
            "crates/ty_python_semantic/src/types/constraints/solutions.rs"
          ]
        }
      ],
      "nextAction": "Qualify the native exhausted-witness regression and reduce a Python diagnostic example.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1737"
        }
      ],
      "qualified": false,
      "isPullRequestCommitment": false,
      "overlapPullRequests": []
    },
    {
      "id": "ty-bounded-callable-relations",
      "title": "Check complete generic callable specializations",
      "state": "Python enhancement candidate",
      "summary": "Preserve strict callable relations while solving finite source domains, covering union inputs and comparing nested protocol receivers.",
      "sources": [
        {
          "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
          "detail": "Check complete generic callable specializations",
          "paths": [
            "crates/ty_python_semantic/src/types/signatures.rs"
          ]
        }
      ],
      "nextAction": "Reduce strict callable cases; qualify domain replay and receiver progress against upstream #29555.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L961"
        },
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L1588"
        },
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L3342"
        }
      ],
      "qualified": false,
      "isPullRequestCommitment": false,
      "overlapPullRequests": [
        29555
      ]
    },
    {
      "id": "ty-generic-overload-consistency",
      "title": "Infer implementation types from overload inputs",
      "state": "Python enhancement candidate",
      "summary": "Specialize generic implementation inputs before declaration coverage checks. Broader implementation return annotations are permitted; body checking has a separate owner.",
      "sources": [
        {
          "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
          "detail": "Infer implementation types from overload inputs",
          "paths": [
            "crates/ty_python_semantic/src/types/signatures.rs"
          ]
        }
      ],
      "nextAction": "Correct the invalid nullable-return assertion, then qualify generic declaration consistency.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L787"
        },
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L2868"
        }
      ],
      "qualified": false,
      "isPullRequestCommitment": false,
      "overlapPullRequests": []
    },
    {
      "id": "ty-returned-callable-binders",
      "title": "Keep returned callable variables bound",
      "state": "Python enhancement candidate",
      "summary": "Preserve callable-local binders under outer substitution and project captured callback variables before they reach ordinary results.",
      "sources": [
        {
          "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
          "detail": "Keep returned callable variables bound",
          "paths": [
            "crates/ty_python_semantic/src/types/call/bind.rs",
            "crates/ty_python_semantic/src/types/signatures.rs"
          ]
        }
      ],
      "nextAction": "Reconcile binder ownership with upstream #29553 and #29555; qualify partial and captured-return cases.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L7392"
        },
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L468"
        },
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L1858"
        }
      ],
      "qualified": false,
      "isPullRequestCommitment": false,
      "overlapPullRequests": [
        29553,
        29555
      ]
    },
    {
      "id": "ty-generic-call-expansion",
      "title": "Preserve viable generic argument expansion",
      "state": "Python bugfix candidate",
      "summary": "Keep overload expansion available when some generic specialization accepts an argument, including provisional arity mismatches.",
      "sources": [
        {
          "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
          "detail": "Preserve viable generic argument expansion",
          "paths": [
            "crates/ty_python_semantic/src/types/call/bind.rs"
          ]
        }
      ],
      "nextAction": "Qualify the bound-method starred-union fixture and reduce the generic expansion precheck.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L4411"
        }
      ],
      "qualified": false,
      "isPullRequestCommitment": false,
      "overlapPullRequests": []
    },
    {
      "id": "ty-native-getattr-context",
      "title": "Infer finite getattr results and empty defaults",
      "state": "Python enhancement candidate",
      "summary": "Use finite member facts for getattr results and fresh empty defaults. Immutable storage guarantees have a separate host contract.",
      "sources": [
        {
          "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
          "detail": "Infer finite getattr results and empty defaults",
          "paths": [
            "crates/ty_python_semantic/src/types/call/bind.rs",
            "crates/ty_python_semantic/src/types/call/checked.rs"
          ]
        }
      ],
      "nextAction": "Reduce ordinary Python lookup cases; compare collection context with upstream #27665.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L2852"
        },
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L9769"
        },
        {
          "label": "types/call/checked.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/checked.rs#L1"
        }
      ],
      "qualified": false,
      "isPullRequestCommitment": false,
      "overlapPullRequests": [
        27665
      ]
    },
    {
      "id": "ty-keyword-paramspec-host",
      "title": "Define keyword-only ParamSpec host contracts",
      "state": "Host API design",
      "summary": "Distinguish accepted keyword parameters from received keyword dictionaries, then verify complete ParamSpec witnesses against the original call relation.",
      "sources": [
        {
          "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
          "detail": "Define keyword-only ParamSpec host contracts",
          "paths": [
            "crates/ty_python_semantic/src/types/call/arguments.rs",
            "crates/ty_python_semantic/src/types/call/bind.rs",
            "crates/ty_python_semantic/src/types/signatures.rs",
            "crates/ty_python_semantic/src/types/typevar.rs"
          ]
        }
      ],
      "nextAction": "Specify host annotation and capture semantics before proposing shared solver APIs.",
      "evidence": [
        {
          "label": "types/typevar.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/typevar.rs#L1100"
        },
        {
          "label": "types/call/arguments.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/arguments.rs#L201"
        },
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L6496"
        }
      ],
      "qualified": false,
      "isPullRequestCommitment": false,
      "overlapPullRequests": []
    },
    {
      "id": "ty-parameter-source-provenance",
      "title": "Preserve synthesized parameter source locations",
      "state": "Host API design",
      "summary": "Keep source definitions or ranges through parameter specialization, default presentation and hidden internal keyword handling.",
      "sources": [
        {
          "commit": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
          "detail": "Preserve synthesized parameter source locations",
          "paths": [
            "crates/ty_python_semantic/src/types/signatures.rs"
          ]
        }
      ],
      "nextAction": "Review the public source-location contract and qualify navigation and signature presentation.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L7183"
        },
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L7383"
        },
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L7531"
        }
      ],
      "qualified": false,
      "isPullRequestCommitment": false,
      "overlapPullRequests": []
    }
  ],
  "units": [
    {
      "id": "solver-existential-binder-node",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Retain quantified local binders in the constraint graph",
      "detail": "An existential constraint stores local support, provenance, body and source ordering. Mapping substitutes the body and remaining local TypeVars, then re-quantifies; vacuous quantification is removed when body support has no overlap. Atomic type enumeration intentionally excludes quantified bodies.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract with quantified/free-variable counterexamples and owned round trips.",
      "evidence": [
        {
          "label": "types/constraints/variables.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/variables.rs#L123"
        }
      ],
      "hunkIds": [
        "H0623",
        "H0624",
        "H0625",
        "H0626",
        "H0627",
        "H0628",
        "H0668"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-mapped-atom-root-proof",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Inspect mapped atomic roots without loading an entire relation",
      "detail": "MappedAtomicConstraint represents mapped lower/upper/equivalence bounds or a borrowed/owned relation. Root-only truth queries inspect cached relation roots without graph traversal; ordinary mapping subsequently loads the atom. Mapping concrete bounds to non-TypeVars produces ordinary assignability relations.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Reduce mapped-root proof support against the rebased upstream relation API.",
      "evidence": [
        {
          "label": "types/constraints/variables.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/variables.rs#L222"
        }
      ],
      "hunkIds": [
        "H0629",
        "H0633",
        "H0634",
        "H0635",
        "H0636",
        "H0637",
        "H0638",
        "H0639",
        "H0640",
        "H0641",
        "H0642",
        "H0643",
        "H0644",
        "H0645",
        "H0646",
        "H0647",
        "H0648",
        "H0649",
        "H0650",
        "H0651",
        "H0652",
        "H0653",
        "H0654",
        "H0655",
        "H0656",
        "H0657",
        "H0658",
        "H0659",
        "H0660",
        "H0661",
        "H0662",
        "H0663",
        "H0664",
        "H0665",
        "H0666",
        "H0667"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-provisional-bound-admission",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Exclude unspecialized context slots from solver evidence",
      "detail": "Lower, upper and equivalence constraints reject UnspecializedTypeVar; generic mapping and inference also skip that exact placeholder. This preserves missing evidence rather than defaulting it into a fixed point.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Reduce native recursive/contextual-call examples and compare #29553 deferred lambda inputs before proposing a general fix.",
      "evidence": [
        {
          "label": "types/constraints/variables.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/variables.rs#L301"
        },
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L4050"
        }
      ],
      "hunkIds": [
        "H0630",
        "H0631",
        "H0632",
        "H0727",
        "H0729"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-module-support",
      "trackerParent": "ty-solver-inference",
      "title": "Imports, storage size derivation and shared helper plumbing",
      "detail": "Imports and storage-size derives support the identified graph and solver mechanisms; no independently claimed Python behavior.",
      "classification": "mechanical",
      "nextAction": "Carry only with the owning mechanism.",
      "evidence": [
        {
          "label": "types/constraints/variables.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/variables.rs#L4"
        },
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L14"
        }
      ],
      "hunkIds": [
        "H0617",
        "H0618",
        "H0619",
        "H0620",
        "H0621",
        "H0622",
        "H0684",
        "H0685",
        "H0728",
        "H0736"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-context-progress-guard",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Permit repeated relation keys only when context makes bounded progress",
      "detail": "ActiveRecursionDetector stores the nearest active context per key. A caller-supplied well-founded progress test may permit re-entry. The entry borrow is released before evaluating progress; unwind restores the previous context rather than deleting an enclosing visit.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Review each progress relation for termination and retain re-entrant/unwind regression.",
      "evidence": [
        {
          "label": "types/cyclic.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/cyclic.rs#L1224"
        }
      ],
      "hunkIds": [
        "H0670",
        "H0671",
        "H0672",
        "H0673",
        "H0674",
        "H0675",
        "H0676",
        "H0677",
        "H0678",
        "H0679",
        "H0680",
        "H0681"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-paramspec-base-migration",
      "trackerParent": "ty-solver-inference",
      "title": "Rename attribute stripping to projection-family base",
      "detail": "Calls formerly stripping P.args/P.kwargs now recover the ParamSpec base, covering newly added keyword projections as well.",
      "classification": "mechanical",
      "nextAction": "Include the migration with keyword projection design.",
      "evidence": [
        {
          "label": "types/cyclic.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/cyclic.rs#L333"
        },
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L582"
        },
        {
          "label": "types/typevar.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/typevar.rs#L1325"
        }
      ],
      "hunkIds": [
        "H0669",
        "H0687",
        "H0689",
        "H0690",
        "H0730",
        "H0972",
        "H0973",
        "H0974",
        "H0975",
        "H0976",
        "H0977",
        "H1006",
        "H1007",
        "H1008",
        "H1009"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-indeterminate-proof-admission",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Distinguish finite gradual types from unresolved inference",
      "detail": "has_indeterminate_inference delegates to the alias-aware visitor: contextual/divergent placeholders and expanding alias states prevent finite proof; stable Any/Unknown remain admissible.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Use finite/recursive alias regressions and no body-forcing benchmark before upstream design review.",
      "evidence": [
        {
          "label": "types/typevar.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/typevar.rs#L153"
        }
      ],
      "hunkIds": [
        "H0955"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-typevar-domain-identity",
      "trackerParent": "ty-typevar-domain-identity",
      "title": "Include specialized canonical domains in bound TypeVar identity",
      "detail": "Retain an original declaration and derive canonical identity from its specialized domain, separately from materialized/transposed visible views. No-op/restored mappings preserve identity; staged and direct substitutions agree. Synthetic Self records its original domain to distinguish binders.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract domain-identity invariants together with retained-domain mapping. Native tests exist.",
      "evidence": [
        {
          "label": "types/typevar.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/typevar.rs#L1068"
        }
      ],
      "hunkIds": [
        "H0957",
        "H0958",
        "H0960",
        "H0961",
        "H0963",
        "H0964",
        "H0965",
        "H0978",
        "H0979",
        "H0980",
        "H0986",
        "H0987",
        "H0988",
        "H0989",
        "H0990",
        "H0991",
        "H0992",
        "H0995",
        "H0996",
        "H0997",
        "H0998",
        "H1000",
        "H1002",
        "H1003",
        "H1004",
        "H1005"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-paramspec-keyword-projections",
      "trackerParent": "ty-keyword-paramspec-host",
      "title": "Distinguish accepted keyword parameters from received keyword dictionaries",
      "detail": "ParamSpecProjection distinguishes ordinary attributes, keyword-parameter surface and captured keyword arguments. Accepted parameters have Mapping[str, object] bounds; runtime captured dictionaries and P.kwargs have dict bounds. Exact component mappings precede base substitution; a base replacement carries its projection onward.",
      "classification": "host-api-design-with-general-python-core",
      "nextAction": "Specify KeywordParamSpec host contracts and general ParamSpec component rules separately.",
      "evidence": [
        {
          "label": "types/typevar.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/typevar.rs#L1100"
        }
      ],
      "hunkIds": [
        "H0959",
        "H0962",
        "H0966",
        "H0967",
        "H0968",
        "H0969",
        "H0970",
        "H0971",
        "H0981",
        "H0982",
        "H0983",
        "H0984",
        "H0985",
        "H0999",
        "H1001"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-projection-exact-freshening",
      "trackerParent": "ty-typevar-domain-identity",
      "title": "Freshen exact projection scopes without capturing sibling components",
      "detail": "Freshening admits either an exact component scope or its base-family scope, updates the specialized domain after freshening, and preserves original/canonical identity when materializing.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Include base/args/kwargs/keyword projection independence and captured lazy-domain tests.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L586"
        },
        {
          "label": "types/typevar.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/typevar.rs#L1672"
        }
      ],
      "hunkIds": [
        "H0688",
        "H0993",
        "H0994"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-typevar-api-support",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Expose nonce increment and remove unused specialization import",
      "detail": "Visibility/import adjustments support freshening and domain ownership; they do not independently fix behavior.",
      "classification": "mechanical",
      "nextAction": "Carry with owning change.",
      "evidence": [
        {
          "label": "types/typevar.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/typevar.rs#L20"
        }
      ],
      "hunkIds": [
        "H0954",
        "H0956"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-host-generic-context-composition",
      "trackerParent": "ty-host-contracts",
      "title": "Compose generic contexts across semantic namespaces",
      "detail": "Generic context merge compares resolver/platform programs with semantic namespaces cleared. Individual TypeVars retain definition/binding identity.",
      "classification": "host-api-design",
      "nextAction": "Review shared-support-file identity with host API design.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L498"
        }
      ],
      "hunkIds": [
        "H0686"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-public-specialization-api",
      "trackerParent": "ty-host-contracts",
      "title": "Expose specialization construction to embedded consumers",
      "detail": "GenericContext.specialize and Specialization.types become public. Documentation removes references to absent helpers.",
      "classification": "host-api-design",
      "nextAction": "Minimize supported public constructor/accessor contract during host API review.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L1007"
        }
      ],
      "hunkIds": [
        "H0691",
        "H0692",
        "H0693"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-retained-domain-specialization",
      "trackerParent": "ty-typevar-domain-identity",
      "title": "Specialize retained TypeVar domains by default",
      "detail": "Specialization composition maps retained domains by default. PreserveTypeVarDomains is an explicit opt-out; Partial and Single retain their bounded/dependency-resolution roles. WithBoundVariables forward deltas shadow substitutions inside retained callable binders.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Review domain identity and capture-avoiding substitution together, including retained callable binders.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L1440"
        }
      ],
      "hunkIds": [
        "H0694",
        "H0695",
        "H0696",
        "H0697",
        "H0700",
        "H0701",
        "H0702",
        "H0703",
        "H0704",
        "H0705",
        "H0706"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-specialization-materialization-order",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Sequence source and target argument materialization explicitly",
      "detail": "Refactor check_specialization_pair into separate source/target materialization bindings before check_type_pair; evaluation order is explicit with no new predicate.",
      "classification": "mechanical",
      "nextAction": "Carry only if needed by owner borrow/context refactor.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L1860"
        }
      ],
      "hunkIds": [
        "H0698",
        "H0699"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-deferred-recursive-return",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Defer only return variables whose arguments are unresolved",
      "detail": "A bare divergent actual for a structured formal supplies no argument evidence. If an uninferred ordinary TypeVar occurs in both formal and return, preserve one shared divergent marker. Different markers, materialized fallback, bare-TypeVar formal and independent return variables do not trigger deferral.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Compare #29553 finite-lambda foundation, then isolate a native recursive ordinary-call reproducer without host hooks.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L2681"
        }
      ],
      "hunkIds": [
        "H0708"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-merged-projection-dependency-resolution",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Resolve dependencies after selecting merged solver evidence",
      "detail": "Projection hook distinguishes inferred, override and retained generic variables. Chosen/default types resolve jointly, retaining explicit generic binders and recovering unresolved dependency cycles to unknown. Partial projection substitutes UnspecializedTypeVar for missing/provisional evidence. Original correlated alternatives are unchanged.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract selected-dependency and retained-binder proof with cycle/outer-scope tests.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L2659"
        }
      ],
      "hunkIds": [
        "H0707",
        "H0709",
        "H0710",
        "H0711",
        "H0712",
        "H0713",
        "H0714"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-shared-projection-budget",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Share proof resources across native solving and signature completion",
      "detail": "One ProjectionBudget is passed into native solution collection and all keyword-completion witnesses. Exhaustion does not restart searches; verified siblings survive as incomplete alternatives.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Include calibrated two-witness exhaustion regression.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L3217"
        }
      ],
      "hunkIds": [
        "H0717",
        "H0718"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-keyword-witness-completion",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Verify whole ParamSpec signatures inferred from keyword-only evidence",
      "detail": "A keyword surface cannot determine positional behavior. Build complete candidate witnesses, verify them against the original joint relation and retain T/P path correlations. Charge TypedDict items. Top/no-call signature is a fallback candidate requiring verification. Unverified families widen merged mappings, rather than narrowing to visited witnesses.",
      "classification": "host-api-design-with-general-python-solver",
      "nextAction": "Review extension semantics separately from proof infrastructure.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L2885"
        }
      ],
      "hunkIds": [
        "H0715",
        "H0720",
        "H0721"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-artifact-cleanup-before-resolution",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Remove solver artifacts before dependency closure",
      "detail": "Clean inferable-variable artifacts from projected candidate solutions before dependency resolution so transitive terms cannot manufacture cycles.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Reduce with native inference_cleans_merged_types and expanding-cycle cases.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L3052"
        }
      ],
      "hunkIds": [
        "H0716",
        "H0719",
        "H0726"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-equal-alternative-collapse",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Collapse complete equivalent solver alternatives",
      "detail": "When every complete nonempty alternative equals the merged mapping, expose Single rather than retaining a redundant alternative family. Incomplete/empty families cannot use this shortcut.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Retain native equal-fallback/complete-sibling tests and confirm no loss of caller-visible correlation.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L3684"
        }
      ],
      "hunkIds": [
        "H0722",
        "H0723",
        "H0724",
        "H0725"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-bounded-typevar-protocol-inference",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Infer structural constraints from fixed bounded TypeVars",
      "detail": "For covariant protocol/union formal compared with non-inferable bounded actual TypeVar, use a relation constraint when admissible; unions involving inferable packs retain legacy handling.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Produce ordinary Python protocol/bounded-TypeVar regression and confirm free-domain policy.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L4848"
        }
      ],
      "hunkIds": [
        "H0732"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-correlated-union-inference",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Retain correlated alternatives when inferring nominal and generic unions",
      "detail": "Use a single constraint relation for multiple generic union elements and nominal actual unions so later arguments/discriminators constrain one solution. Preserve gradual, Self and pack rules; divergent unmaterialized arms may participate without discarding concrete peers.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Check #27665 contextual collection overlap and upstream #30483 relation composition before proposing reduced ordinary Python cases.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L4774"
        }
      ],
      "hunkIds": [
        "H0731",
        "H0733",
        "H0734",
        "H0735",
        "H0741",
        "H0742"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-callable-intersection-nominal-evidence",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Ignore redundant nominal FunctionType evidence beside callable signatures",
      "detail": "When a callable intersection contains an explicit signature component, skip the nominal FunctionType component whose __call__ is only generic function binding evidence.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Coordinate #29555 generic FunctionType producer.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L5251"
        }
      ],
      "hunkIds": [
        "H0738",
        "H0739"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-anonymous-protocol-constraints",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Collect structural constraints from synthesized protocols",
      "detail": "Protocols without a nominal class origin contribute member constraints even in covariant positions; named protocols preserve the prior variance rule.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Use ordinary synthesized-callback/protocol regression and inspect #29555 callable owner interactions.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L5428"
        }
      ],
      "hunkIds": [
        "H0740"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-host-and-typeddict-relation-dispatch",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Route provided instances and dictionary schemas through relation inference",
      "detail": "Provided nominal instances use relation solving; nominal-formal/TypedDict-actual is explicitly admitted, and TypedDict formal dispatch moves before a broad legacy branch.",
      "classification": "host-api-and-general-python-consumer",
      "nextAction": "Split host nominal admission from ordinary TypedDict dispatch regression when reducing contributions.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L5578"
        }
      ],
      "hunkIds": [
        "H0743",
        "H0744",
        "H0745"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-incomplete-path-tag-migration",
      "trackerParent": "ty-solver-inference",
      "title": "Rename budget-exceeded paths to incomplete paths",
      "detail": "Consumer matches the broader Incomplete path state rather than a budget-only label.",
      "classification": "mechanical",
      "nextAction": "Include the migration with incomplete-projection behavior.",
      "evidence": [
        {
          "label": "types/generics.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/generics.rs#L5237"
        }
      ],
      "hunkIds": [
        "H0737"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-keyword-source-collision-evidence",
      "trackerParent": "ty-dictionary-flow",
      "title": "Combine successful keyword sources without dictionary overlay semantics",
      "detail": "collect_keyword_items combines observed keyword sources. Named-key collisions decline metadata and leave diagnostics to ordinary matching; required named entries constrain residual collisions on successful paths. Optional entries combine residual value types. The combined synthetic evidence cannot claim runtime first-entry order.",
      "classification": "general-python-dictionary-flow-enhancement",
      "nextAction": "Extract with duplicate explicit/unpacked/optional/open keyword source cases and negative diagnostic preservation.",
      "evidence": [
        {
          "label": "types/call/arguments.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/arguments.rs#L36"
        }
      ],
      "hunkIds": [
        "H0004"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-observed-keyword-surface",
      "trackerParent": "ty-keyword-paramspec-host",
      "title": "Retain optional keys and residual exclusions during argument binding",
      "detail": "Observed keyword arguments keep source expression types plus exact snapshot entries and residual tail. Required names, expansion, key lookup and synthetic TypedDict conversion consume this metadata; ordinary source types remain available.",
      "classification": "general-python-dictionary-flow-enhancement",
      "nextAction": "Include call-time mutation snapshots and optional/missing/residual examples.",
      "evidence": [
        {
          "label": "types/call/arguments.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/arguments.rs#L201"
        }
      ],
      "hunkIds": [
        "H0005",
        "H0006",
        "H0007",
        "H0008",
        "H0009",
        "H0010",
        "H0011",
        "H0012",
        "H0013",
        "H0017"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-residual-paramspec-prefix",
      "trackerParent": "ty-solver-inference",
      "title": "Exclude consumed prefix names from forwarded ParamSpec tails",
      "detail": "Prefix projection removes known entries consumed by prefix parameters and separately records their names so an open/residual tail cannot supply them again. P.kwargs and captured keyword argument components share the appropriate consumer.",
      "classification": "general-python-paramspec-correctness",
      "nextAction": "Native residual_keywords_follow_paramspec_projection assertion body read.",
      "evidence": [
        {
          "label": "types/call/arguments.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/arguments.rs#L674"
        }
      ],
      "hunkIds": [
        "H0014",
        "H0018"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-unspecialized-nominal-context",
      "trackerParent": "ty-contextual-callbacks",
      "title": "Request final argument context for unspecialized nominal union arms",
      "detail": "Top-level aliases/unions are inspected for nominal instances containing UnspecializedTypeVar; gradual Any/Unknown and callable alternatives preserve their distinct contextual behavior.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Reconcile single-collection contextual replay with existing #27665 and native nominal_union_arguments_need_final_context fixture.",
      "evidence": [
        {
          "label": "types/call/arguments.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/arguments.rs#L750"
        }
      ],
      "hunkIds": [
        "H0015"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-dictionary-item-kind-migration",
      "trackerParent": "ty-solver-inference",
      "title": "Use shared dictionary presence enum",
      "detail": "Required key booleans become DictionaryItemKind::Required, matching shared observed keyword presence semantics.",
      "classification": "mechanical",
      "nextAction": "Carry with keyword observation implementation.",
      "evidence": [
        {
          "label": "types/call/arguments.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/arguments.rs#L916"
        }
      ],
      "hunkIds": [
        "H0016"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-native-evidence-regressions",
      "trackerParent": "ty-solver-inference",
      "title": "Exercise operand preservation, context admission and residual forwarding",
      "detail": "The mixed module-boundary hunk adds complete assertion bodies for unspecialized nominal context; literal children retain fixed tuple slots even when source operand is Unknown/Divergent/missing; residual prefix exclusion preserves forwarding type checks.",
      "classification": "tests",
      "nextAction": "Run the native argument evidence regressions on the proposed source.",
      "evidence": [
        {
          "label": "types/call/arguments.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/arguments.rs#L1410"
        }
      ],
      "hunkIds": [
        "H0019"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-evidence-import-support",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Import shared observation and quantified proof support",
      "detail": "Imports only; behavioral ownership belongs to separately identified units.",
      "classification": "mechanical",
      "nextAction": "Carry only with owning mechanism.",
      "evidence": [
        {
          "label": "types/call/arguments.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/arguments.rs#L2"
        },
        {
          "label": "types/constraints/owned.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/owned.rs#L4"
        },
        {
          "label": "types/constraints/resolution.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/resolution.rs#L5"
        },
        {
          "label": "types/constraints/support.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/support.rs#L8"
        }
      ],
      "hunkIds": [
        "H0001",
        "H0002",
        "H0003",
        "H0344",
        "H0345",
        "H0346",
        "H0452",
        "H0453",
        "H0612",
        "H0613",
        "H0614",
        "H0615"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-quantified-owned-source-order",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Preserve quantified bodies and scoped evidence ordering in owned graphs",
      "detail": "Owned graph compaction traverses existential bodies, remaps nested source orders, and visits constraints once per source-order scope rather than globally. Ordering-only constraints sharing live variables remain present. Iterative traversal avoids recursive order-tree growth.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Require quantified owned round trips and shared-body ordering tests before extraction.",
      "evidence": [
        {
          "label": "types/constraints/owned.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/owned.rs#L20"
        }
      ],
      "hunkIds": [
        "H0347",
        "H0349",
        "H0351",
        "H0354",
        "H0356",
        "H0357",
        "H0358",
        "H0359",
        "H0360",
        "H0361",
        "H0362"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-root-reachable-snapshot",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Snapshot one reachable proof graph without builder memo tables",
      "detail": "A shared-storage snapshot marks reachable nodes/support/constraints, reads compacted overlays and retains the original complete TypeVar ID table. Shared finish_parts trims rank maps and remaps existential source-order IDs.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract snapshot and quantifier support against the upstream cache API.",
      "evidence": [
        {
          "label": "types/constraints/owned.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/owned.rs#L44"
        }
      ],
      "hunkIds": [
        "H0352",
        "H0363",
        "H0364",
        "H0365",
        "H0366",
        "H0367",
        "H0368",
        "H0369",
        "H0370"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-owned-readonly-plumbing",
      "trackerParent": "ty-solver-inference",
      "title": "Read owned graph source immutably",
      "detail": "Marking helpers accept immutable storage after the source-order/snapshot refactor.",
      "classification": "mechanical",
      "nextAction": "Keep with ownership refactor.",
      "evidence": [
        {
          "label": "types/constraints/owned.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/owned.rs#L25"
        }
      ],
      "hunkIds": [
        "H0348",
        "H0350",
        "H0353",
        "H0355"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-merged-positive-union-cycle-resolution",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Close anchored positive-union dependency cycles symmetrically",
      "detail": "Selected merged mappings resolve ordinary dependencies, then flat positive-union cycles collect every reachable closed anchor. X=Y|int,Y=X|str closes both to int|str; X=Y|int,Y=Y stays unresolved because a dependent anchor does not close its unanchored dependency. Structured dependents are retried only after replacement proposals close their dependencies.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Retain native merged_union_cycles_collect_every_anchor and require_closed_anchors cases.",
      "evidence": [
        {
          "label": "types/constraints/resolution.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/resolution.rs#L40"
        }
      ],
      "hunkIds": [
        "H0454",
        "H0455",
        "H0456",
        "H0457",
        "H0458",
        "H0459"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-free-support-through-binders",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Exclude quantified locals while retaining declaration dependencies",
      "detail": "Free-variable collection traverses quantified body and local declaration validation constraints, subtracts locals, then includes outgoing branch support. Memoization is per node and traversal charges shared solution limits.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract with local-bound dependencies and false ambient-assumption regressions, alongside quantified solver design.",
      "evidence": [
        {
          "label": "types/constraints/support.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/support.rs#L34"
        }
      ],
      "hunkIds": [
        "H0616"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-strict-static-callable-inference",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Infer only supported static source-signature variables in strict relations",
      "detail": "LazyStatic relation mode admits static unbounded ordinary TypeVars for strict callable comparisons. Non-static operands, bounded/constraint domains and nonordinary TypeVar domains decline rather than using gradual assignability as proof.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Compare finite caller admission with upstream #29555.",
      "evidence": [
        {
          "label": "types/relation.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/relation.rs#L213"
        }
      ],
      "hunkIds": [
        "H0757",
        "H0775"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-public-relation-contracts",
      "trackerParent": "ty-host-contracts",
      "title": "Expose strict subtype, equivalence, disjointness and pure redundancy queries",
      "detail": "Public subtype API documents all-materializations semantics; pure redundancy preserves both materialization bounds and explicitly does not certify inference completeness. Equivalence/disjointness visibility changes expose existing relations.",
      "classification": "host-api-design",
      "nextAction": "Agree minimal public relation surface and avoid treating reflexive unresolved redundancy as a proof of completeness.",
      "evidence": [
        {
          "label": "types/relation.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/relation.rs#L406"
        }
      ],
      "hunkIds": [
        "H0758",
        "H0761",
        "H0762",
        "H0764",
        "H0765"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-cached-assignability-consumer",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Use owned relation results for assignability queries",
      "detail": "when_assignable consumer queries the owned constraint relation instead of constructing a private local builder. Prior contextual constructor is removed.",
      "classification": "upstream-overlap-gate",
      "nextAction": "Keep upstream #30483 cache changes attributed to upstream while extracting residual consumers.",
      "evidence": [
        {
          "label": "types/relation.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/relation.rs#L589"
        }
      ],
      "hunkIds": [
        "H0760",
        "H0768"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-protocol-comparison-context",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Track the full protocol receiver comparison",
      "detail": "Checker stores optional source/target protocol comparison identity; constructors initialize none. Producer and member-level consumers are covered separately in instance-schema inventory.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Review together with instance-schema full receiver comparison and recursive protocol tests.",
      "evidence": [
        {
          "label": "types/relation.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/relation.rs#L574"
        }
      ],
      "hunkIds": [
        "H0759",
        "H0763",
        "H0766",
        "H0767",
        "H0769",
        "H0785",
        "H0786"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-bounded-typevar-protocol-target",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Preserve fixed bounded TypeVars in protocol and protocol-union checks",
      "detail": "Protocol targets can compare original bounded TypeVar receivers directly; all-protocol union targets reuse union error-context selection. Assignability through an upper bound first suppresses failed bound diagnostics and retries original receiver only when target refers to that TypeVar through aliases, preserving Self binding.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract ordinary Python recursive protocol/bounded Self fixtures.",
      "evidence": [
        {
          "label": "types/relation.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/relation.rs#L1510"
        }
      ],
      "hunkIds": [
        "H0770",
        "H0771",
        "H0772",
        "H0781"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-relation-callable-intersection",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Skip redundant FunctionType runtime evidence in callable intersections",
      "detail": "Relation intersection dispatch uses the same redundant nominal FunctionType rule as generic inference.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Unify with generic consumer extraction.",
      "evidence": [
        {
          "label": "types/relation.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/relation.rs#L1867"
        }
      ],
      "hunkIds": [
        "H0773",
        "H0774"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-whole-provided-receiver-relation",
      "trackerParent": "ty-host-contracts",
      "title": "Check supplied storage on the complete receiver before splitting intersections",
      "detail": "Provided-instance targets first check nominal base and supplied field contracts on the entire source receiver. A constituent may provide immutable storage and another may narrow it. Bound TypeVars remain on their specialized bound/constraint path.",
      "classification": "host-api-design",
      "nextAction": "Require host contract tests for intersection storage plus value narrowing.",
      "evidence": [
        {
          "label": "types/relation.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/relation.rs#L2741"
        }
      ],
      "hunkIds": [
        "H0780"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-relation-nominal-dispatch-order",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Move existing nominal wrapper rules after supplied-instance admission",
      "detail": "GenericAlias, method-wrapper __func__ signature comparison and functools.partial nominal conversion rules move unchanged across the new provided-instance branch. This is dispatch ordering support, not newly implemented wrapper precision.",
      "classification": "host-api-integration",
      "nextAction": "Preserve original wrapper tests and verify the changed ordering.",
      "evidence": [
        {
          "label": "types/relation.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/relation.rs#L2360"
        }
      ],
      "hunkIds": [
        "H0776",
        "H0777",
        "H0782"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-string-sequence-host-policy",
      "trackerParent": "ty-host-runtime",
      "title": "Apply the host string sequence policy during literal relations",
      "detail": "String literal relations first test whether the configured str class has its character Sequence base; unsupported direct sequence fast paths delegate to actual fallback-instance relation rather than unconditionally rejecting.",
      "classification": "host-semantics",
      "nextAction": "Keep Python default behavior and separately test hosts excluding str from Sequence[str].",
      "evidence": [
        {
          "label": "types/relation.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/relation.rs#L3145"
        }
      ],
      "hunkIds": [
        "H0783",
        "H0784"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-relation-support-formatting",
      "trackerParent": "ty-solver-inference",
      "title": "Imports and unchanged redundancy-match formatting",
      "detail": "Imports support protocol unions and supplied receivers; redundancy match is only reformatted.",
      "classification": "mechanical",
      "nextAction": "Carry with owning change.",
      "evidence": [
        {
          "label": "types/relation.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/relation.rs#L6"
        }
      ],
      "hunkIds": [
        "H0754",
        "H0755",
        "H0756",
        "H0778",
        "H0779"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-provenance-equivalence",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Keep logically equivalent declaration and inferred atoms distinct as evidence",
      "detail": "PairEquivalence marks same predicate with distinct provenance as truth-equivalent. Opposite assignments conflict, but neither atom derives call-site inference evidence from a declaration.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Include declaration-only vs inferred-solution regression.",
      "evidence": [
        {
          "label": "types/constraints/sequents.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/sequents.rs#L129"
        }
      ],
      "hunkIds": [
        "H0469",
        "H0476"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-scoped-derived-relation",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Retain shared quantified witnesses in derived consequences",
      "detail": "PairRelation retains a complete owned relation plus provenance as a sequent consequence when existential nodes occur; splitting the body into independent atom implications would lose the common witness and its binder scope.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract with correlated local-witness consequences and negative witness-reuse cases.",
      "evidence": [
        {
          "label": "types/constraints/sequents.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/sequents.rs#L162"
        }
      ],
      "hunkIds": [
        "H0470",
        "H0479"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-sequent-payload-support",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Carry owned consequences and provenance through cached sequents",
      "detail": "Sequent becomes generic over relation payload; grouped and pending storage uses the cached payload alias and cloned iteration; display renders equivalence and quantified consequences.",
      "classification": "mechanical",
      "nextAction": "Keep only with proof semantics.",
      "evidence": [
        {
          "label": "types/constraints/sequents.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/sequents.rs#L17"
        }
      ],
      "hunkIds": [
        "H0463",
        "H0464",
        "H0465",
        "H0466",
        "H0467",
        "H0468",
        "H0471",
        "H0472",
        "H0473",
        "H0474",
        "H0475"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-intrinsic-tautology-admission",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Recognize reflexive TypeVar and extremal-bound truths centrally",
      "detail": "Central intrinsic truth test admits bottom lower bounds, top upper bounds, and same-TypeVar range/equivalence. Concrete equivalence stays nonintrinsic. Existing lower/upper checks move to this shared admission.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Use native provenance/domain-policy cases.",
      "evidence": [
        {
          "label": "types/constraints/sequents.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/sequents.rs#L585"
        }
      ],
      "hunkIds": [
        "H0477",
        "H0478",
        "H0480",
        "H0481"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-shared-proof-resource-api",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Charge witness validation against the same path and type budgets",
      "detail": "ProjectionBudget owns one BoundedSolutionLimits and ProjectionTypeBudget; dictionary item counts charge explicitly. Native collection, witness discovery, solving and final validation share remaining resources. Diagnostic evidence and exported types are charged; incomplete witness families cannot certify validated projection.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Qualify exhaustion during preprocessing, terminal traversal, witness completion and exported-type accounting.",
      "evidence": [
        {
          "label": "types/constraints/projection.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/projection.rs#L23"
        }
      ],
      "hunkIds": [
        "H0424",
        "H0425",
        "H0426",
        "H0427",
        "H0429",
        "H0430",
        "H0431",
        "H0432",
        "H0433",
        "H0434",
        "H0435",
        "H0436",
        "H0437",
        "H0438",
        "H0439",
        "H0440",
        "H0441"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-complete-specialization-verification",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Verify projected candidates against the original joint relation",
      "detail": "Fixed caller bindings constrain path discovery and final proof. Full candidate paths must be complete and valid; projection callbacks charge constructed types. Each proposed specialization is checked on the original graph, with rigid unspecialized variables; incomplete/failed fallback proof remains unknown rather than declaring unsatisfiable. Root-only atom proofs do not expand unresolved correlations or quantified nodes.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Add minimal ordinary solver proof examples and inspect all candidate validity/quantifier dependencies before upstream design review.",
      "evidence": [
        {
          "label": "types/constraints/projection.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/projection.rs#L172"
        }
      ],
      "hunkIds": [
        "H0428"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-projection-import-support",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Imports for bounded proof and mapping support",
      "detail": "Shared budget/proof types and mapping helpers are imported for the identified mechanisms.",
      "classification": "mechanical",
      "nextAction": "Carry with owning changes.",
      "evidence": [
        {
          "label": "types/constraints/projection.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/projection.rs#L3"
        }
      ],
      "hunkIds": [
        "H0421",
        "H0422",
        "H0423"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-negated-cached-consequence",
      "trackerParent": "ty-cached-implication-conflicts",
      "title": "Recheck cached implications when a sibling negates their consequence",
      "detail": "Single/pair implications register a trigger on false consequences as well as true antecedents. After a sibling branch rolls back a derived assignment, cached rules are rechecked when the consequence is negated, detecting conflict while antecedents remain true. This does not derive inference evidence from provenance-equivalent declarations.",
      "classification": "general-python-bugfix-candidate",
      "nextAction": "Candidate for a reduced independent solver fix. Both complete native assertion bodies were read: single implication T=object⇒str≤T and synthetic pair.",
      "evidence": [
        {
          "label": "types/constraints/paths.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/paths.rs#L615"
        }
      ],
      "hunkIds": [
        "H0402",
        "H0403",
        "H0411",
        "H0412",
        "H0413",
        "H0414"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-derived-relation-fuel-context",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Carry quantified consequences as whole path continuations",
      "detail": "Path state retains activated whole relations, visiting relation guards and originating assignment fuel. Antecedent fuel minima and whole-proof budget pay relation activation cost; consequent atoms continue that chain. Pending relations cannot share plain atomic path cache keys because proof/fuel context is absent.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Review with complete witness scope and source-order semantics.",
      "evidence": [
        {
          "label": "types/constraints/paths.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/paths.rs#L64"
        }
      ],
      "hunkIds": [
        "H0377",
        "H0380",
        "H0381",
        "H0382",
        "H0386",
        "H0390",
        "H0391",
        "H0392",
        "H0393",
        "H0397",
        "H0416"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-quantified-path-support",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Scope path-local quantified TypeVars",
      "detail": "PathAssignments stores quantified support initialized empty; with_quantified_typevars temporarily unions local binders then restores enclosing support. The same source hunk also supplies relation/fuel restoration helpers.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Include nested binder/ambient-domain regressions.",
      "evidence": [
        {
          "label": "types/constraints/paths.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/paths.rs#L77"
        }
      ],
      "hunkIds": [
        "H0378",
        "H0383",
        "H0387"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-provenance-equivalence-path-conflict",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Detect contradictory truth assignments across provenance-equivalent atoms",
      "detail": "Equivalent atoms are triggered by either truth value on both sides. PairEquivalence checks conflicts only and does not assign one atom from the other, preserving inference evidence provenance.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract with provenance-equivalence producer and native equivalent_provenance_conflicts_preserve_evidence fixture.",
      "evidence": [
        {
          "label": "types/constraints/paths.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/paths.rs#L572"
        }
      ],
      "hunkIds": [
        "H0399"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-scoped-walker-migration",
      "trackerParent": "ty-solver-inference",
      "title": "Move atomic-only traversal out of PathAssignments",
      "detail": "The prior recursive three-edge visitor panicked on non-atomic nodes. It is removed as quantified-aware traversal moves to solution/walker owners, which remain to be semantically attributed. Removal itself is not proof of equivalent callback/fuel/terminal behavior.",
      "classification": "mechanical-with-owner-review-gate",
      "nextAction": "Keep unresolved compatibility gate until replacement traversal and ordinary terminal budget behavior are read and qualified.",
      "evidence": [
        {
          "label": "types/constraints/paths.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/paths.rs#L254"
        }
      ],
      "hunkIds": [
        "H0389"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-source-order-replay-retirement",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Remove atomic-only projection consequence replay",
      "detail": "Atomic projection_source_order replay and per-discovery consequent maps are removed. Replacement quantified graph/source-order ownership is attributed to owned compaction and scoped traversal; no user-facing obsolete policy is established merely by removing the helper.",
      "classification": "superseded-internal-algorithm",
      "nextAction": "Review replacement convergence/source-order guarantees with owned graph and walker extraction.",
      "evidence": [
        {
          "label": "types/constraints/paths.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/paths.rs#L94"
        }
      ],
      "hunkIds": [
        "H0379",
        "H0384",
        "H0385",
        "H0388",
        "H0394",
        "H0404",
        "H0408",
        "H0409",
        "H0410"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-path-sequent-plumbing",
      "trackerParent": "ty-solver-inference",
      "title": "Use relation-capable sequent aliases and trigger tables",
      "detail": "Alias/field names, cached relation payload types and return signatures migrate to shared PathSequent. Trigger naming now covers both antecedents and negated consequences.",
      "classification": "mechanical",
      "nextAction": "Carry with corresponding proof changes.",
      "evidence": [
        {
          "label": "types/constraints/paths.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/paths.rs#L6"
        }
      ],
      "hunkIds": [
        "H0371",
        "H0372",
        "H0373",
        "H0374",
        "H0375",
        "H0376",
        "H0395",
        "H0396",
        "H0398",
        "H0400",
        "H0401",
        "H0405",
        "H0406",
        "H0407",
        "H0415"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-parametric-quantification",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Quantify domains and ParamSpec families rather than erasing atoms",
      "detail": "reduce_inferable constructs a scoped existential with ordinary locals, P.args/P.kwargs and referenced keyword projections. Universal quantification is its negation dual and ranges over declared upper bounds/constraints. A bounded proof collapses established parametric truths to stop equivalent recursive quantifiers growing each iteration.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract quantified free/local domain examples together.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L875"
        }
      ],
      "hunkIds": [
        "H0209",
        "H0210",
        "H0217",
        "H0218"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-capture-avoiding-quantifier-construction",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Give independent quantified bodies private binder occurrences",
      "detail": "Track maximum freshness across local/overlaid tables. Quantify freshens bound locals and all occurrences in body/domain through shared mappings while free identities remain fixed; vacuous binders disappear. Moving storage into the existing builder preserves arenas/memo tables before rebuilt IDs escape.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Review freshness arithmetic/overflow and empty-scope invariants with independent copies, lazy domain and nested ParamSpec tests.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L1172"
        }
      ],
      "hunkIds": [
        "H0220",
        "H0222",
        "H0223",
        "H0224",
        "H0225"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-scoped-constraint-mapping-order",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Rebuild immediate mapped constraints without flattening quantified scopes",
      "detail": "Source-order traversal records quantified constraints as units, sorts immediate graph constraints stably and maps each once. Source order is rebuilt from mapped immediate entries, preventing body locals escaping into a parent order.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Retain direct/staged mapping and recursive convergence tests.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L976"
        }
      ],
      "hunkIds": [
        "H0211",
        "H0212",
        "H0213",
        "H0214",
        "H0215",
        "H0216"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-referenced-typevar-query",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Query graph support with a consumer predicate",
      "detail": "referenced_typevars collects stored supported TypeVars filtered by caller predicate, used to find missing keyword-surface components.",
      "classification": "host-api-and-solver-support",
      "nextAction": "Keep internal unless an external caller requires a stable public API.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L537"
        }
      ],
      "hunkIds": [
        "H0208"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-quantified-source-order-storage",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Store quantified source-order scopes alongside atomic entries",
      "detail": "SourceOrder::QuantifiedConstraint preserves a body owner; flattened atomic order queries may traverse its body, while immediate mapping keeps the scope unit. Constraint-to-atomic accessors explicitly reject existential variants.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Test nested body order and shared atoms.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L1569"
        }
      ],
      "hunkIds": [
        "H0226",
        "H0227",
        "H0228",
        "H0229",
        "H0240",
        "H0241",
        "H0243"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-owned-binder-collision-loading",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Freshen imported binders only when they collide with destination identities",
      "detail": "Loader lazily rebuilds existential nodes after bodies and source-order dependencies. Imported noncolliding local names remain stable through repeated owned round trips; any local colliding with preexisting destination table re-enters capture-avoiding quantify. Provenance can be remapped for the complete imported relation.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Require existing quantified owned-loading/copy-independence regressions plus source-order stability. Upstream cached-relation substrate is a separate owner gate.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L1768"
        }
      ],
      "hunkIds": [
        "H0231",
        "H0232",
        "H0233",
        "H0234",
        "H0235",
        "H0236",
        "H0237",
        "H0238",
        "H0239"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-root-truth-sufficient-proof",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Prove constants from an intrinsically true root only",
      "detail": "A root proves a constant when terminal, or its true branch has the expected constant, uncertain branch is false and its atom is intrinsically true. This is sufficient-only and avoids unbounded traversal of mapped relations.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract with positive and negative root truth cases.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L2702"
        }
      ],
      "hunkIds": [
        "H0245"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-scoped-walker-source-context",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Pass original relation and order into scoped solution traversal",
      "detail": "Walker receives original node together with source order in ordinary and fast-path satisfiability/candidate collection. Atomic path order initialization also traverses nested existential bodies, deduplicating shared atoms.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Replacement walker remains a separate semantic audit gate.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L2739"
        }
      ],
      "hunkIds": [
        "H0246",
        "H0248",
        "H0259",
        "H0301",
        "H0302",
        "H0303",
        "H0304"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-old-atomic-abstraction-removal",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Retire atom-erasing existential projection and its visitor",
      "detail": "Old exists_cache, exists/exists_inner/abstract_inner, generic PathVisitor and individual satisfied-constraint rebuild helper are removed. Their atomic erasure/replay model is replaced by explicit binder-scoped quantification, not an obsolete user-facing host policy.",
      "classification": "superseded-internal-algorithm",
      "nextAction": "Review replacement semantics and benchmarks.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L1127"
        }
      ],
      "hunkIds": [
        "H0219",
        "H0221",
        "H0230",
        "H0244",
        "H0249",
        "H0300",
        "H0311"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-provisional-evidence-query",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Inspect both lower and upper evidence for provisional context",
      "detail": "has_provisional_inference checks evidence_lower and all upper evidence because preliminary lower solving can discard a placeholder still retained above.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Reduce with upper-only provisional context cases and compare lambda/collection upstream overlap.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L3705"
        }
      ],
      "hunkIds": [
        "H0250"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-scoped-residual-candidate",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Retain signed path obligations with private positive witnesses",
      "detail": "CandidateResidual stores original signed relation, positive local witnesses, original caller inferables and contextual evidence policy. CandidateSolutions records inferables and whether discovery omitted branches. Ordinary simple conjunction candidates explicitly have no residual.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Review negative-scope obligation and local witness closure with source producer before design proposal.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L3927"
        }
      ],
      "hunkIds": [
        "H0251",
        "H0252",
        "H0253",
        "H0266",
        "H0267"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-close-local-witness-domains",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Resolve witness dependencies and revalidate each declared domain",
      "detail": "Before replay, resolve selected mappings; anchored union closure may propose local witnesses but cannot certify them. Conjoin complete local domain constraints, specialize jointly and refuse unresolved locals still present in support. Charge hidden local types before export.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Native existential domain/captured alias tests are prerequisites.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L3994"
        }
      ],
      "hunkIds": [
        "H0254",
        "H0255"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-selected-caller-replay",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Certify selected caller outputs by refuting the original residual obligation",
      "detail": "Replay resolves caller bindings, constructs ambient assumptions from free support, quantifies local witness scopes before caller substitution and proves the negative replay unsatisfiable under the originating placeholder policy. Closed caller values can succeed via existence without choosing every local endpoint.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Qualify signed obligation replay with rigid outer variables and scoped witnesses.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L4088"
        }
      ],
      "hunkIds": [
        "H0257"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-context-choice-retry",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Retry local witness inference without a rejected contextual choice",
      "detail": "When contextual fixed caller evidence cannot extend to a witness, retry original joint relation without fixing that choice. Require a single complete residual candidate family; do not combine unrelated path endpoints. Negative-only obligations validate callers but cannot infer existential locals.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Add reduced context-rejected-but-valid-native-witness example and unrelated-family negative case.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L4088"
        }
      ],
      "hunkIds": [
        "H0257"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-witness-replay-export-boundary",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Export caller bindings only after complete scoped witness replay",
      "detail": "Only complete, valid joint solution with closed declared-domain witness and successful ambient implication replay exports bindings; locals are filtered out. Unknown witness, rejected provisional choice or incomplete family clears caller bindings and returns explicit incomplete.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Check no private local leaks into exported call return/context types.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L4088"
        }
      ],
      "hunkIds": [
        "H0257",
        "H0286",
        "H0287"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-shared-limits-forwarding",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Reuse limits across preprocessing, solving and witness validation",
      "detail": "SolutionLimits is forwarded through &mut L so nested discovery/replay uses caller counters. The former compute_bounded wrapper is replaced by ProjectionBudget owners; solve/collect receive shared limits and type budget.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Qualify bounded witness work and the later ordinary terminal fast path separately.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L4086"
        }
      ],
      "hunkIds": [
        "H0256",
        "H0257",
        "H0258",
        "H0268",
        "H0269",
        "H0270",
        "H0274",
        "H0275",
        "H0276",
        "H0277",
        "H0278",
        "H0288",
        "H0289",
        "H0290",
        "H0298"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-complete-and-incomplete-family-collection",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Retain complete siblings without treating unvisited witnesses as exhaustive",
      "detail": "Collector propagates discovery/solution incompleteness separately for valid and invalid families. A verified residual with no remaining caller bindings is unconstrained. Empty-but-incomplete families remain constrained/incomplete rather than unsatisfiable. Scoped paths discard unvalidated selections; ordinary paths may retain fallback evidence.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Test no-valid-path+incomplete, complete sibling and invalid-only cases against call context consumers.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L4744"
        }
      ],
      "hunkIds": [
        "H0273",
        "H0279",
        "H0280",
        "H0281",
        "H0282",
        "H0283",
        "H0284",
        "H0285",
        "H0305",
        "H0306",
        "H0307",
        "H0308",
        "H0309"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-captured-paramspec-upper-bound-validation",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Validate chosen fixed TypeVar outputs with captured callable locals in scope",
      "detail": "Selected output types, not only original evidence, are checked against declared upper bounds. Complete captured ParamSpecs contribute callable-local generic variables existentially; still-inferable dependencies remain for joint solving. Incomplete ParamSpec inference skips upper validation because ownership is unknown and path already incomplete; deduplicate upper-bound violations.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Reduce native callable P/R capture and invalid fixed outer variable regressions.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L4891"
        }
      ],
      "hunkIds": [
        "H0291",
        "H0292",
        "H0293",
        "H0294",
        "H0295",
        "H0296",
        "H0297"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-provisional-and-literal-range-selection",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Use static inferred upper context without discarding explicit literal evidence",
      "detail": "A structured lower containing only UnspecializedTypeVar placeholders may select one complete static inferred upper as context; genuine gradual/divergent data is excluded. Equivalent static inferred upper bounds carrying explicit literal annotations are retained with the lower to prevent accidental later promotion.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Reduce placeholder filling and explicit literal preservation separately; compare upstream #27665 and #30483.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L5161"
        }
      ],
      "hunkIds": [
        "H0299"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-atomic-id-grouping",
      "trackerParent": "ty-typevar-domain-identity",
      "title": "Group simple conjunction bounds by canonical stored TypeVar IDs",
      "detail": "Fast-path bound maps key by storage TypeVarId rather than possibly distinct bound-view instances, then recover canonical stored data when solving.",
      "classification": "general-python-solver-correctness",
      "nextAction": "Test materialized/transposed views of same identity share one bound solver while distinct specialized domains remain distinct.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L4546"
        }
      ],
      "hunkIds": [
        "H0260",
        "H0261",
        "H0262",
        "H0263",
        "H0264",
        "H0265"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-context-promotion-witness-gate",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Skip unchecked contextual promotion for residual witness paths",
      "detail": "Argument-context promotion skips candidates with residual obligations because their proposed specialization requires complete witness replay.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Retain a native no-premature-promotion example and compare upstream collection replay proposal.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L4680"
        }
      ],
      "hunkIds": [
        "H0271",
        "H0272"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-constraint-module-mechanical",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Imports, derives and display storage plumbing",
      "detail": "Imports support named mechanisms, redundant exhaustive-pattern attributes disappear and display gets storage for quantified nodes.",
      "classification": "mechanical",
      "nextAction": "Carry only with corresponding semantic change.",
      "evidence": [
        {
          "label": "types/constraints.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints.rs#L92"
        }
      ],
      "hunkIds": [
        "H0200",
        "H0201",
        "H0202",
        "H0203",
        "H0204",
        "H0205",
        "H0206",
        "H0207",
        "H0242",
        "H0247",
        "H0310"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-three-state-satisfiability",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Distinguish certified, refuted and unresolved paths",
      "detail": "Satisfiability and PathIs explicitly represent incomplete proofs. A certified witness settles local existence even if siblings were incomplete; the outer candidate family still records missing coverage. Failed negative-witness search is not automatically unsatisfiable.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract three-state behavior with real exhausted witness fixtures.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L57"
        }
      ],
      "hunkIds": [
        "H0487",
        "H0488",
        "H0493",
        "H0498",
        "H0502",
        "H0509",
        "H0519",
        "H0521",
        "H0538",
        "H0600",
        "H0601",
        "H0602"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-proof-context-cache",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Memoize ordinary satisfiability only under equivalent declaration context",
      "detail": "Proof cache key includes placeholder policy, validation support and actual validation constraints alongside explored node/path. Disable ordinary proof memoization for positive/negative binders, quantified path support, declared constraint selections and relation continuations. False results are cached only when complete; true certified existence may be cached.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Review cache eligibility and source-edit lifetime separately from upstream cached type relations #30483. Existing semantic-index tracked-key fix is a different producer.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L221"
        }
      ],
      "hunkIds": [
        "H0492",
        "H0497",
        "H0522",
        "H0523",
        "H0524",
        "H0525",
        "H0530",
        "H0531",
        "H0532",
        "H0536",
        "H0537",
        "H0539",
        "H0603",
        "H0604",
        "H0605",
        "H0606"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-derived-relation-continuation",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Visit whole relation consequences before terminal success or pruning",
      "detail": "Pending derived relations run positively with their fuel context and retain witness scopes through original continuation under either outer polarity. They bypass plain path memo/prune callbacks and restore original edge fuel before continuing.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Require correlated witness and fuel regression.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L616"
        }
      ],
      "hunkIds": [
        "H0507"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-candidate-subtree-pruning",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Prune irrelevant subtrees only after a three-state existence proof",
      "detail": "Visible inferable support closes over active path and declaration-validation constraints. Irrelevant subtrees are skipped only when certified satisfiable, rejected only when refuted, and mark family incomplete otherwise. Root terminal validation still attributes failures only after no certified path.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Review optimization against quantified cross-variable dependencies and ordinary no-quantifier performance.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L384"
        }
      ],
      "hunkIds": [
        "H0503",
        "H0504"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-scoped-visitor-callbacks",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Share traversal with explicit memo, prune and terminal callbacks",
      "detail": "Atomic traversal separates reusable cache/prune/process callbacks, parameterizes polarity and passes original relation/source-order to the walker. Never-cache/never-prune callbacks serve scopes whose continuations carry extra ownership. Atomic negative traversal delays edge union construction.",
      "classification": "mechanical-with-semantic-owner",
      "nextAction": "Verify terminal budgeting and callback ownership through scoped traversal.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L32"
        }
      ],
      "hunkIds": [
        "H0486",
        "H0489",
        "H0490",
        "H0494",
        "H0495",
        "H0499",
        "H0500",
        "H0505",
        "H0506",
        "H0508",
        "H0510",
        "H0511",
        "H0512",
        "H0513",
        "H0514",
        "H0515",
        "H0516",
        "H0517",
        "H0518",
        "H0520",
        "H0526",
        "H0527",
        "H0528",
        "H0529",
        "H0533",
        "H0534",
        "H0535",
        "H0538",
        "H0540"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-positive-existential-continuation",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Keep positive witnesses live through the outgoing continuation",
      "detail": "Existential holding edge visits outgoing continuation then body positively under private locals and their declarations. Even negated outer nodes do not negate existential body. New derived locals get validations beyond root support; Boolean proof walks logical domains, while candidate inference preserves family/preference selection for later validation. Uncertain positive branch needs no body proof.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Use independent and nested quantifier regressions.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L206"
        }
      ],
      "hunkIds": [
        "H0491",
        "H0496",
        "H0541",
        "H0542"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-negative-existential-refinement",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Reject existential existence only after a whole-scope proof",
      "detail": "The not-holding branch records a negative scope only when the body is refuted under current outer assumptions. Conditional witness coverage cannot settle Boolean proof. Candidate inference may once exclude known covered witnesses, then must reprove original scope impossible; a second conditional proof stays incomplete.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Include conditional Free/Local examples where one witness covers only part of caller domain.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1246"
        }
      ],
      "hunkIds": [
        "H0543",
        "H0544",
        "H0545"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-free-and-local-domain-proof",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Distinguish closed quantifiers from ones depending on outer variables",
      "detail": "Existential proof computes body-plus-local-declaration support minus locals. With no free support, ordinary domain/existence proof may settle scope. Otherwise collect complete candidate witness families while retaining free variables rigid and tracking new nested locals.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Check outer-bound dependency policy and nested witness declarations together.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1338"
        }
      ],
      "hunkIds": [
        "H0546",
        "H0547"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-whole-witness-coverage",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Cover an outer path with complete witness conditions",
      "detail": "For each candidate, select logical local endpoints where permitted, resolve and validate a whole witness against its full signed relation, then union sufficient witness conditions. Refuting the complement of accumulated coverage proves existence; failing selected choices only returns incomplete, not nonexistence. ParamSpec/tuple packs require witnesses in their own domains.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Need reduced multi-witness coverage and rigid-free-variable cases before upstream solver design review.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1456"
        }
      ],
      "hunkIds": [
        "H0548",
        "H0549",
        "H0550",
        "H0551"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-alias-cycle-proof-alternative",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Try bounded logical endpoints for local alias cycles",
      "detail": "If selected local alias dependencies do not close, try effective lower endpoints only for ordinary local variables with matching selected peers and no chosen finite-domain constraint. The alternate still undergoes full relation/domain replay.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Qualify alternate witness replay while preserving ordinary inference defaults.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1564"
        }
      ],
      "hunkIds": [
        "H0552",
        "H0553",
        "H0554"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-domain-vs-inference-policy",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Apply logical binder domains separately from inference preferences",
      "detail": "Validations.as_constraint_set combines upper bounds conjunctively and finite declared domains disjunctively. from_locals checks only declarations owned by binder; external dependencies remain free under outer validation policy. from_support excludes caller-inferable variables where requested.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Review inferred vs declared constraint provenance and free declaration policy tests.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1623"
        }
      ],
      "hunkIds": [
        "H0555",
        "H0607",
        "H0608",
        "H0609",
        "H0610"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-terminal-validation-dispatch",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Route empty validation continuations through the ordinary terminal visitor",
      "detail": "Empty constraint lists call visit_node_and_then on ALWAYS_TRUE with callbacks, preserving common terminal behavior instead of directly invoking continuation. Limit errors retain their distinct control-flow wrapper.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Reconcile later 44 terminal-budget fix.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1657"
        }
      ],
      "hunkIds": [
        "H0556",
        "H0557",
        "H0569",
        "H0570",
        "H0594",
        "H0595",
        "H0599"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-incomplete-upper-bound-diagnostics",
      "trackerParent": "ty-incomplete-proof-diagnostics",
      "title": "Do not report an upper-bound violation from an incomplete proof",
      "detail": "inferred_lower_satisfies_upper_bound returns Option<bool>: Some true/false are proved; None marks unknown. Validation requires Some(true), while failure attribution stops on None to avoid fabricating a diagnostic violation. The real generic callable witness test exhausts temporary-type work and asserts no pending candidate/violation.",
      "classification": "general-python-bugfix-candidate",
      "nextAction": "Qualify the exhausted-witness regression and reduce a Python upper-bound diagnostic example.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1737"
        }
      ],
      "hunkIds": [
        "H0558",
        "H0559",
        "H0560",
        "H0561",
        "H0562",
        "H0563",
        "H0564",
        "H0565",
        "H0566",
        "H0567",
        "H0568",
        "H0571",
        "H0596"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-canonical-path-bound-grouping",
      "trackerParent": "ty-typevar-domain-identity",
      "title": "Group candidate bounds by stored logical TypeVar identity",
      "detail": "Pending maps use TypeVarId so materialized views of one logical variable share bounds and validity constraints. Solver resolves canonical stored bound data before finishing.",
      "classification": "general-python-solver-correctness",
      "nextAction": "Extract with materialized/transposed view identity and distinct specialized domain tests.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L2519"
        }
      ],
      "hunkIds": [
        "H0576",
        "H0578",
        "H0580",
        "H0582",
        "H0584",
        "H0585",
        "H0587",
        "H0588",
        "H0589"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-hidden-local-candidate-exclusion",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Do not export independent bounds mentioning quantified-away locals",
      "detail": "Candidate construction takes explicit inferable and hidden support. Constraints overlapping hidden local support are excluded from independently exported mappings; actual private witness obligations survive in a separate residual.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Verify excluded metadata does not remove the full residual relation.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L346"
        }
      ],
      "hunkIds": [
        "H0501",
        "H0572",
        "H0573",
        "H0574",
        "H0575",
        "H0577",
        "H0579",
        "H0581",
        "H0583",
        "H0586",
        "H0590",
        "H0592",
        "H0597",
        "H0598"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-signed-residual-snapshot",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Preserve signed path and negative scopes for final witness replay",
      "detail": "Signed path rebuilds ordered positive/negative atom facts and explicit negative existential scopes. Positive local candidates snapshot that signed path; negative-only candidates retain original logical relation plus negative obligations, avoiding accidental caller restriction from refinement splits. Residual records private locals, caller inferables and evidence policy.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Include split-refinement cases where callers satisfy both sides.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L2664"
        }
      ],
      "hunkIds": [
        "H0591",
        "H0593"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-native-witness-budget-regressions",
      "trackerParent": "ty-scoped-witness-proofs",
      "title": "Exercise real incomplete upper proofs and cumulative witness work",
      "detail": "Two complete assertion bodies: fixed upper generic callable comparison reaches real witness exhaustion and produces incomplete empty candidates with no violation; repeated existential proof consumes one temporary-type budget cumulatively, yet an independent true terminal remains certified.",
      "classification": "tests",
      "nextAction": "Assertions read from source.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L3290"
        }
      ],
      "hunkIds": [
        "H0611"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "solver-walker-imports",
      "trackerParent": "ty-solver-inference",
      "title": "Imports for scoped proof and residual ownership",
      "detail": "Imports only; mechanism ownership is documented separately.",
      "classification": "mechanical",
      "nextAction": "Carry with owning implementation.",
      "evidence": [
        {
          "label": "types/constraints/solutions.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1"
        }
      ],
      "hunkIds": [
        "H0482",
        "H0483",
        "H0484",
        "H0485"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-function-intersection-pruning",
      "trackerParent": "ty-solver-inference",
      "title": "Do not let nominal FunctionType.__call__ bypass precise callable inputs",
      "detail": "Remove a generic gradual FunctionType.__call__ binding when another callable constituent supplies the same function signature. Recognition checks actual known class method and gradual return/parameter surface.",
      "classification": "general-python-correctness",
      "nextAction": "Coordinate the generic nominal FunctionType proposal.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L868"
        }
      ],
      "hunkIds": [
        "H0035",
        "H0041"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-complete-input-evidence",
      "trackerParent": "ty-host-contracts",
      "title": "Expose per-source checked argument/formal pairs conservatively",
      "detail": "input_types specializes/rematches selected overloads, retains alternatives separately and includes downstream constructors. Decline expansion snapshots, incomplete/gradual/ParamSpec signatures, failed matching or unmapped inputs. Actual type uses same expected-type key as contextual inference.",
      "classification": "host-api-and-general-python-consumer",
      "nextAction": "API review and native positive/decline cases before host consumers rely on full coverage.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L1094"
        }
      ],
      "hunkIds": [
        "H0036",
        "H0130",
        "H0141",
        "H0142",
        "H0143"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-provided-getter-presence-storage",
      "trackerParent": "ty-host-contracts",
      "title": "Combine supplied getter presence and immutable storage across all viable domains",
      "detail": "Supplied getter return/presence contracts refine selected overloads with ordinary error recovery. Immutable storage requires agreement of every matching domain before equal-result pruning; expansion/recovery cannot certify it. Absent yields KNOWN_ABSENT, partial presence remains possibly undefined.",
      "classification": "host-api-design",
      "nextAction": "Review whole-overload-family proof including ambiguous gradual arguments and expansion.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L1299"
        }
      ],
      "hunkIds": [
        "H0037"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-builtin-finite-getattr-hasattr",
      "trackerParent": "ty-native-getattr-context",
      "title": "Infer finite runtime getattr results without hiding descriptor failure",
      "detail": "Known getattr resolves literal names/unions through runtime attribute policy, preserves missing alternatives, declines dynamic/indeterminate results and joins explicit default unless immutable storage proves it unreachable. Known hasattr returns true only on error-free immutable stored paths.",
      "classification": "general-python-enhancement-with-host-storage-hook",
      "nextAction": "Split general finite-getattr precision from host immutable-storage default elision. Add descriptors that raise AttributeError and union receiver negative cases.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L2852"
        }
      ],
      "hunkIds": [
        "H0038",
        "H0139",
        "H0140"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-empty-getattr-default-context",
      "trackerParent": "ty-native-getattr-context",
      "title": "Contextualize a fresh empty getattr default from finite member facts",
      "detail": "Only matched builtin getattr third parameter with complete static finite member facts and compatible nominal/protocol collection domains supplies preference context. TypedDict domains are excluded because empty literals may omit required keys. Actual default is still joined after inference.",
      "classification": "general-python-contextual-inference-enhancement",
      "nextAction": "Separate from ordinary lookup precision when reducing.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L9769"
        }
      ],
      "hunkIds": [
        "H0140"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-result-refinement-snapshot-admission",
      "trackerParent": "ty-host-contracts",
      "title": "Refine only overload bindings whose snapshots remain complete",
      "detail": "Single signatures retain error-recovery bindings. Multiple expansion cases are eligible only with one unique selected overload per successful case; reused overload specializations or limit-reached expansion decline. Recompute expanded/ambiguous returns after application refinement. Equal supplied results collapse only when complete static nonpredicate and all matching declarations agree.",
      "classification": "host-api-and-general-python-correctness",
      "nextAction": "Need selected-overload reuse, recovery, gradual ambiguity and every-case result fixtures. Distinguish precise native results from host hook admission.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L4991"
        }
      ],
      "hunkIds": [
        "H0047",
        "H0050",
        "H0054"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-typeguard-source-target",
      "trackerParent": "ty-guard-call-mapping",
      "title": "Match predicate target arguments using actual selected overload bindings",
      "detail": "Record Unmapped, NoTarget and exact source argument index. Include implicit receiver offsets, omission/disagreement and all argument-expansion cases. A target parameter omitted or mapped differently cannot use a default source argument fallback.",
      "classification": "general-python-correctness",
      "nextAction": "Extract native keyword/receiver/overload/omitted-target cases.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L3792"
        }
      ],
      "hunkIds": [
        "H0039",
        "H0045",
        "H0052",
        "H0055"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-common-typeis-certification",
      "trackerParent": "ty-guard-call-mapping",
      "title": "Retain TypeIs only if every surviving declaration proves the same predicate",
      "detail": "Require one unbound complete non-bottom TypeIs return and a common mapped target. Every TypeIs arm must agree; constant Boolean arms must strictly exclude the opposite target outcome over their top-materialized parameter domain.",
      "classification": "general-python-enhancement",
      "nextAction": "Reduce mixed Literal[True/False]/TypeIs overload examples.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L5231"
        }
      ],
      "hunkIds": [
        "H0052"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-source-implementation-diagnostics",
      "trackerParent": "ty-host-parser",
      "title": "Use executed source implementation for deprecation and runtime diagnostics",
      "detail": "When callable source identity differs from external signature owner, find the source implementation for deprecation and implementation-related diagnostics instead of donor declaration.",
      "classification": "host-api-integration",
      "nextAction": "Keep donor public signature separate from executed defaults/body and source diagnostic locations.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L3817"
        }
      ],
      "hunkIds": [
        "H0040",
        "H0048",
        "H0049",
        "H0053",
        "H0138"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-expansion-satisfiability-precheck",
      "trackerParent": "ty-generic-call-expansion",
      "title": "Attempt argument expansion when some generic specialization can accept an argument",
      "detail": "Expansion precheck changes forall-compatible to not-never-compatible under inferable TypeVars. A nonconstant relation need not be always true to have viable argument expansion; only proven impossibility permits skipping.",
      "classification": "general-python-bugfix-candidate",
      "nextAction": "Reduce ordinary generic-overload union input case and compare upstream baseline.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L4411"
        }
      ],
      "hunkIds": [
        "H0042",
        "H0043"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-divergent-overload-filter-admission",
      "trackerParent": "ty-solver-inference",
      "title": "Do not eliminate overloads using unresolved parameter domains",
      "detail": "Top-materialized argument overload filtering requires parameter types contain no Divergent before proving assignability.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Compare finite-signature lambda foundation and native recursive overload tests before extraction.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L4846"
        }
      ],
      "hunkIds": [
        "H0046"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-keyword-presence-matching",
      "trackerParent": "ty-dictionary-flow",
      "title": "Keep optional observed keys from suppressing later possible pack values",
      "detail": "Parameter metadata distinguishes may-be-matched from skip_unknown_keywords. Required/optional/unspecified presence is carried through assignment and MatchedParameter. Later unknown packs still check parameters previously touched only by optional keys; matching_keyword centralizes named/variadic resolution.",
      "classification": "general-python-dictionary-flow-enhancement",
      "nextAction": "Use optional key followed by differently typed residual pack, required slot and duplicate source cases.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L5680"
        }
      ],
      "hunkIds": [
        "H0056",
        "H0057",
        "H0058",
        "H0059",
        "H0060",
        "H0061",
        "H0062",
        "H0064",
        "H0065",
        "H0066",
        "H0069",
        "H0070",
        "H0072",
        "H0073",
        "H0074",
        "H0075",
        "H0081",
        "H0082",
        "H0083",
        "H0084",
        "H0085",
        "H0090",
        "H0169"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-explicit-typeddict-extra-policy",
      "trackerParent": "ty-solver-inference",
      "title": "Preserve explicit TypedDict extra-item call rules after observation",
      "detail": "Observed contents refine keys but explicit TypedDict extras remain stricter than ordinary mapping: unknown names require **kwargs and cannot fill required named parameters. Excluded forwarded prefixes are represented as Never residual entries; source field definition locations survive.",
      "classification": "general-python-correctness",
      "nextAction": "Separate declared-schema call policy from observed runtime precision.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L6124"
        }
      ],
      "hunkIds": [
        "H0067",
        "H0068",
        "H0071",
        "H0076",
        "H0077",
        "H0078",
        "H0079",
        "H0080"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-partial-keyword-provenance",
      "trackerParent": "ty-dictionary-flow",
      "title": "Report independently replaceable partial keywords by name",
      "detail": "Known keyword sources in partial application carry UnpackedKeyword(name) provenance so separate stored keys can be independently overridden even when matching one **kwargs formal.",
      "classification": "general-python-correctness",
      "nextAction": "Reduce multiple stored keyword keys with one replacement.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L5913"
        }
      ],
      "hunkIds": [
        "H0063"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-keyword-capture-empty-vs-required",
      "trackerParent": "ty-keyword-paramspec-host",
      "title": "Distinguish fixed keyword ParamSpecs from inferable empty captures",
      "detail": "Caller-fixed ParamSpec keyword captures may require arguments even with no visible slots. Callee-inferable captures may resolve to empty complete signatures. Missing capture diagnostics keep correct base parameter ownership.",
      "classification": "host-extension-semantics",
      "nextAction": "Review extension semantics separately from ordinary Python P.args/P.kwargs forwarding.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L6496"
        }
      ],
      "hunkIds": [
        "H0086",
        "H0087",
        "H0088",
        "H0089",
        "H0091",
        "H0092",
        "H0093",
        "H0170"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-paramspec-projection-consumers",
      "trackerParent": "ty-solver-inference",
      "title": "Use domain-aware ParamSpec projections consistently",
      "detail": "Domain checks distinguish parameter-signature variables from keyword dictionaries; unpack/type checking/context forwarding accepts P.kwargs or captured argument projections as appropriate. Preserve provisional/final mode through forwarded signature inference.",
      "classification": "mechanical-with-host-extension-owner",
      "nextAction": "Carry with projection producer.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L275"
        }
      ],
      "hunkIds": [
        "H0028",
        "H0029",
        "H0094",
        "H0125",
        "H0127",
        "H0128",
        "H0136",
        "H0144",
        "H0145",
        "H0146",
        "H0147",
        "H0158",
        "H0159",
        "H0160"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-deferred-recursive-return-admission",
      "trackerParent": "ty-solver-inference",
      "title": "Defer recursive generic return inference only on otherwise valid argument evidence",
      "detail": "CallInference retains binding error state and permits shared-placeholder return deferral only without binding/specialization/constraint failures; alternate complete solution path explicitly disables deferral.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Coordinate #29553 finite lambda source identity and isolate non-host recursive call reproducer.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L7002"
        }
      ],
      "hunkIds": [
        "H0097",
        "H0098",
        "H0099",
        "H0100",
        "H0102",
        "H0103",
        "H0104",
        "H0111",
        "H0112",
        "H0113",
        "H0114"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-captured-local-return-projection",
      "trackerParent": "ty-returned-callable-binders",
      "title": "Do not leak callback-local TypeVars into ordinary call results",
      "detail": "After applying merged specialization, captured ParamSpec signatures upper-specialize their local binders in ordinary results while returned callable binders remain owned. Callback-local defaults must not choose escaped value types.",
      "classification": "general-python-correctness",
      "nextAction": "Native captured callback output/default cases required.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L7392"
        }
      ],
      "hunkIds": [
        "H0101"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-result-context-choice-retry",
      "trackerParent": "ty-contextual-callbacks",
      "title": "Retry argument solving after rejected expected-result preferences",
      "detail": "Provisional expected context contributes concrete remainder covariantly, permitting unresolved parts to widen. On failure, clear preferred mappings, rebuild argument constraints with empty preferences and reset errors, then solve again; resulting type may still fail outer assignment.",
      "classification": "general-python-contextual-inference-correctness",
      "nextAction": "Separate native invariant input/result preference regression from host callback policy.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L7845"
        }
      ],
      "hunkIds": [
        "H0105",
        "H0106",
        "H0107",
        "H0108",
        "H0109",
        "H0110",
        "H0118",
        "H0119",
        "H0120",
        "H0121",
        "H0122"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-anonymous-protocol-return-variance",
      "trackerParent": "ty-solver-inference",
      "title": "Include synthesized protocol fields in inferred return variance",
      "detail": "Return variance traversal explicitly handles protocols without nominal origin by composing structural field variance; named nominal protocols retain specialization traversal.",
      "classification": "general-python-enhancement",
      "nextAction": "Use a structural callback/interface returned through generic inference.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L8088"
        }
      ],
      "hunkIds": [
        "H0115",
        "H0116",
        "H0117"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-caller-bound-domain-preservation",
      "trackerParent": "ty-solver-inference",
      "title": "Keep caller receiver and argument domains fixed during callee substitution",
      "detail": "Ordinary synthetic bound-method receivers are caller values and are not rewritten by callee inference. Explicit argument substitution preserves retained caller TypeVar domains; constructor receiver templates retain their own inference path. TypeVarTuple evidence uses the same argument-specific mapping.",
      "classification": "general-python-correctness",
      "nextAction": "Native bounded caller TypeVar and ordinary receiver vs constructor regressions.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L8430"
        }
      ],
      "hunkIds": [
        "H0123",
        "H0124"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-unverified-keyword-witness-error",
      "trackerParent": "ty-dictionary-flow",
      "title": "Reject unchecked callback keyword surfaces explicitly",
      "detail": "If otherwise error-free inference cannot verify a complete keyword ParamSpec witness, add UnverifiedKeywordProjection and report invalid argument type; participates in overload resolution and partial-application filtering.",
      "classification": "host-extension-and-solver-consumer",
      "nextAction": "Check budget exhaustion remains an explicit verification failure and ordinary valid calls avoid false errors.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L8996"
        }
      ],
      "hunkIds": [
        "H0126",
        "H0172",
        "H0173",
        "H0174",
        "H0175",
        "H0176"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-context-cache-evidence-mode",
      "trackerParent": "ty-contextual-callbacks",
      "title": "Separate argument context caches by evidence source and inference phase",
      "detail": "Cache has all-evidence/without-prior-arguments crossed with provisional/final slots. WithoutArguments excludes this call prior specialization but does not claim independence from enclosing inference queries. Final mode replaces unspecialized/provisional values with upper bound or Unknown and skips provisional selected bindings.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Qualify finite caller admission and expected-result fallback separately.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L676"
        }
      ],
      "hunkIds": [
        "H0031",
        "H0032",
        "H0033",
        "H0095",
        "H0096",
        "H0131",
        "H0132",
        "H0133",
        "H0134",
        "H0135",
        "H0150",
        "H0155",
        "H0156",
        "H0157",
        "H0161",
        "H0162",
        "H0163",
        "H0164",
        "H0165",
        "H0166",
        "H0167",
        "H0171"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-alias-argument-occurrence-visitor",
      "trackerParent": "ty-contextual-callbacks",
      "title": "Visit stored alias arguments without forcing alias bodies",
      "detail": "Inferable occurrence collection traverses explicit TypeAlias/Recursive argument specializations even when lazy definitions are not visited, preventing skipped contextual replay.",
      "classification": "general-python-correctness",
      "nextAction": "Reduce generic alias argument-only occurrence and ensure no unrelated lazy body evaluation.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L9672"
        }
      ],
      "hunkIds": [
        "H0137"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-keyword-field-factory-context",
      "trackerParent": "ty-host-contracts",
      "title": "Derive fresh factory keyword context from expected immutable fields",
      "detail": "One-signature host-marked keyword factory can derive per-field expected types from readonly protocol properties or guaranteed immutable nominal fields instead of one shared generic value formal.",
      "classification": "host-api-design",
      "nextAction": "Require host API proof of storage/readonly contracts and independent fields with different types.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L10249"
        }
      ],
      "hunkIds": [
        "H0152"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-local-bound-context-precedence",
      "trackerParent": "ty-contextual-callbacks",
      "title": "Let sibling evidence refine locally inferable bounded variables",
      "detail": "Use upper-bound context immediately only for Self, caller-fixed variables or WithoutArguments source. Locally inferable ordinary bounded variables use provisional specialization so sibling arguments can provide narrower empty-container context first.",
      "classification": "general-python-contextual-inference-correctness",
      "nextAction": "Coordinate existing proposal and native empty bounded collection cases.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L10283"
        }
      ],
      "hunkIds": [
        "H0153",
        "H0154"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-binding-api-plumbing",
      "trackerParent": "ty-solver-inference",
      "title": "Expose source-overload and match mapping helpers",
      "detail": "Return methods receive db/env arguments; inferable constructor class context records matching owner; selected source overload index and bound receiver match offsets support checked input/editor consumers.",
      "classification": "mechanical",
      "nextAction": "Carry with owner contracts.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L346"
        }
      ],
      "hunkIds": [
        "H0030",
        "H0034",
        "H0044",
        "H0051",
        "H0148",
        "H0149",
        "H0151",
        "H0168"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-binding-imports",
      "trackerParent": "ty-solver-inference",
      "title": "Imports for actual call mechanisms",
      "detail": "Imports only; no independent semantic claim.",
      "classification": "mechanical",
      "nextAction": "Carry with owning units.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L31"
        }
      ],
      "hunkIds": [
        "H0020",
        "H0021",
        "H0022",
        "H0023",
        "H0024",
        "H0025",
        "H0026",
        "H0027"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "call-observed-keyword-typecheck",
      "trackerParent": "ty-dictionary-flow",
      "title": "Check observed pack entries through matched variadic evidence",
      "detail": "Observed keyword packs use already matched per-entry argument evidence during variadic type checking instead of re-deriving one homogeneous mapping value type.",
      "classification": "general-python-dictionary-flow-consumer",
      "nextAction": "Retain mixed per-key value and residual keyword tests.",
      "evidence": [
        {
          "label": "types/call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind.rs#L9250"
        }
      ],
      "hunkIds": [
        "H0129"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-annotation-region-ownership",
      "trackerParent": "ty-host-parser",
      "title": "Resolve native and detached signature annotations from their actual owner",
      "detail": "Signature annotation lookup selects PEP695 parameter scope or deferred function inference using function definition, avoiding detached-node index lookup. SourceAnnotation supplies return/parameter type and flags; external generic contexts retain donor ownership when native PEP695 context is absent.",
      "classification": "host-api-integration",
      "nextAction": "Reuse parser/consumer design ownership and native-over-donor precedence tests.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L80"
        }
      ],
      "hunkIds": [
        "H0796",
        "H0797",
        "H0798",
        "H0799",
        "H0800",
        "H0814",
        "H0815",
        "H0816",
        "H0817",
        "H0880",
        "H0881",
        "H0882",
        "H0883",
        "H0884",
        "H0885",
        "H0927",
        "H0928",
        "H0929",
        "H0931"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-keyword-projection-substitution",
      "trackerParent": "ty-keyword-paramspec-host",
      "title": "Substitute captured keyword surfaces without importing positional parameters",
      "detail": "ParamSpec mappings project a keyword capture into accepted keyword-only inputs, preserve source receiver contracts and enclosing generic context, and decline unavailable projection. Forwarded ParamSpec helper unifies ordinary args/kwargs and host keyword capture paths.",
      "classification": "host-extension-semantics",
      "nextAction": "Review KeywordParamSpec host extension independently of ordinary Python ParamSpec fixes.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L332"
        }
      ],
      "hunkIds": [
        "H0802",
        "H0803",
        "H0804",
        "H0805",
        "H0806",
        "H0807",
        "H0847",
        "H0864",
        "H0873",
        "H0890",
        "H0895",
        "H0896",
        "H0897",
        "H0898",
        "H0930"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-retained-callable-binder-shadow",
      "trackerParent": "ty-returned-callable-binders",
      "title": "Preserve returned callable binders under outer projection",
      "detail": "When preserve_callable_binders is set, locally quantified signature variables shadow an outer specialization including nested types, and mapping uses a fresh visitor root to avoid reusing transformation cache entries from the outer mapping. dfe forward changes replace this implementation with WithBoundVariables and must remain attributed.",
      "classification": "general-python-correctness",
      "nextAction": "Coordinate generic FunctionType #29555 and finite lambda #29553 binder ownership before extracting capture-avoiding substitution cases.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L468"
        }
      ],
      "hunkIds": [
        "H0808"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-self-call-receiver-contract",
      "trackerParent": "ty-solver-inference",
      "title": "Capture callee Self while retaining the original receiver parameter contract",
      "detail": "apply_self_for_call maps exactly the signature-owned Self binder and keeps caller-introduced receiver domains intact. Only remaining parameters/result use captured Self; first parameter remains original for ordinary call checking. Shared apply_self_mapping helper accepts either explicit binder substitution or binding-context mapping.",
      "classification": "general-python-correctness",
      "nextAction": "Reduce explicit self annotation, inherited generic receiver and caller Self cases.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L656"
        }
      ],
      "hunkIds": [
        "H0809",
        "H0810",
        "H0830",
        "H0831",
        "H0832",
        "H0833",
        "H0834",
        "H0835",
        "H0836"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-protocol-recursion-progress",
      "trackerParent": "ty-bounded-callable-relations",
      "title": "Continue repeated declarations when finite receiver structure decreases",
      "detail": "Recursion context tracks full protocol receiver pair. Explicit argument traversal includes finite aliases, generic arguments, union/intersection components but excludes recursive bodies/bounds/member expansion. Progress requires componentwise containment and at least one strict decrease, or same-origin target protocol requirement count decrease; unrecognized/growing contexts retain declaration approximation.",
      "classification": "general-python-correctness",
      "nextAction": "Validate well-foundedness for each progress branch and native nested iterable/protocol mismatch cases.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L961"
        }
      ],
      "hunkIds": [
        "H0812",
        "H0857",
        "H0859",
        "H0860"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-layout-cycle-convergence",
      "trackerParent": "ty-contextual-callbacks",
      "title": "Normalize parameter and return types only within compatible signature contexts",
      "detail": "Cycle normalization keeps generic context/definition/extras together. Initial placeholder permits first real layout; resolved Unpack TypedDict rows can replace unresolved final kwargs in either direction. Incompatible layouts widen entire signature to no-call/top-return after taint; previously widened top absorbs later changes. Positional-only/variadic names retain previous presentation after taint.",
      "classification": "fork-stabilization-with-general-python-repro-gate",
      "nextAction": "Compare upstream #29553 and verify that open keyword rows cannot grow without bound.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L204"
        }
      ],
      "hunkIds": [
        "H0801",
        "H0818",
        "H0819",
        "H0820",
        "H0821",
        "H0822",
        "H0823",
        "H0824",
        "H0825",
        "H0871",
        "H0905",
        "H0947",
        "H0948",
        "H0949",
        "H0950"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-supported-static-source-domains",
      "trackerParent": "ty-bounded-callable-relations",
      "title": "Admit only finite complete callable shapes for specialization",
      "detail": "Specialization requires standard complete parameters, ordinary generic domains and no receiver constraints/ParamSpec-value shape. Static inference excludes declared domains; bounded/finite-domain path admits fully static or constrained Any forms with explicit domain checks, excluding Self.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Qualify finite caller admission for supported and unsupported signature shapes.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L1588"
        }
      ],
      "hunkIds": [
        "H0826"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-upper-return-projection",
      "trackerParent": "ty-returned-callable-binders",
      "title": "Expose declared/defaulted and upper-projected result views separately",
      "detail": "Public APIs distinguish declared return, default-specialized return and signature-owned upper projection. Upper projection ignores defaults, preserves captured outer variables and protects binders in returned callable signatures.",
      "classification": "host-api-and-general-python-enhancement",
      "nextAction": "Native source/default/captured binder examples before public API design review.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L1858"
        }
      ],
      "hunkIds": [
        "H0829"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-checked-call-specialization",
      "trackerParent": "ty-solver-inference",
      "title": "Expand resolved ParamSpec rows before checked argument rematching",
      "detail": "specialize_for_call applies selected mapping then expands ordinary or keyword-capture variadics into final slots for exact checked input mapping.",
      "classification": "host-api-and-general-python-consumer",
      "nextAction": "Keep unsupported/incomplete decline behavior and source argument offsets tested.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L2637"
        }
      ],
      "hunkIds": [
        "H0837"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-partial-retained-variable-projection",
      "trackerParent": "ty-returned-callable-binders",
      "title": "Retain unsolved generic binders in partial callable returns",
      "detail": "Promoted partial variables select retained binder when unsolved, promoted override when inferred; other variables use inferred projection. This replaces overloading None/Some with explicit Retain semantics.",
      "classification": "general-python-correctness",
      "nextAction": "Extract partial return generic capture examples with unresolved dependencies and defaults.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L2813"
        }
      ],
      "hunkIds": [
        "H0838"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-input-specialized-overload-consistency",
      "trackerParent": "ty-generic-overload-consistency",
      "title": "Check generic implementation consistency using complete input-only inference",
      "detail": "PrepareOverloadImplementation specializes implementation variables from rigid overload parameter inputs, never promised return/defaults. Generic methods, positional varargs, Self, missing input occurrences, indeterminate replacements, incomplete inference or unresolved remaining binders decline. Nongeneric implementation may compare rigid generic overload inputs within supported shapes.",
      "classification": "general-python-enhancement",
      "nextAction": "Qualify generic declaration consistency independently of body checking, including fixed inputs and open keyword tails.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L787"
        }
      ],
      "hunkIds": [
        "H0811",
        "H0839",
        "H0840",
        "H0841",
        "H0842",
        "H0843"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-overload-keyword-evidence-admission",
      "trackerParent": "ty-generic-overload-consistency",
      "title": "Reject implementation inference that silently drops relevant open keyword evidence",
      "detail": "Only paired KeywordParamSpec captures infer tail evidence jointly. Otherwise implementation variables in skipped kwargs or named slots absent from overload fixed surface decline. Coverage then erases overload generic context to keep its variables rigid after implementation specialization.",
      "classification": "host-extension-and-general-python-consumer",
      "nextAction": "Use fixed-input+open-keyword positive cases and hidden evidence negative cases.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L2868"
        }
      ],
      "hunkIds": [
        "H0841"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-contextual-parameter-view",
      "trackerParent": "ty-host-contracts",
      "title": "Supply contextual unannotated parameter views without changing declarations",
      "detail": "with_inferred_parameter_context maps only ordinary inferred parameters with canonical source definitions. Authored/native/external annotations, variadics, defaults and return remain; resulting view does not certify that callers inhabit that domain.",
      "classification": "host-api-design",
      "nextAction": "Require explicit host domain guarantee at consumer.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L3257"
        }
      ],
      "hunkIds": [
        "H0845"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-generic-unary-overload-coverage",
      "trackerParent": "ty-bounded-callable-relations",
      "title": "Cover each explicit union input with a valid source specialization",
      "detail": "Unary overload aggregation expands target aliases, excludes generic target signatures, allows each target union member its own source specialization and verifies all overlapping source returns remain safe. This is limited to one required positional input, not arbitrary overload-set combination.",
      "classification": "general-python-enhancement",
      "nextAction": "Reduce differing source specializations per discriminated input and unsafe overlapping return counterexample.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L3342"
        }
      ],
      "hunkIds": [
        "H0848",
        "H0849",
        "H0850",
        "H0851",
        "H0852",
        "H0854"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-strict-callable-static-inference",
      "trackerParent": "ty-bounded-callable-relations",
      "title": "Infer unbounded static source binders while preserving strict relation semantics",
      "detail": "Eager subtype/pure-redundancy comparison may enter LazyStatic for supported generic source and nongeneric target. Nested target generics or unsupported signatures decline. Existing LazyStatic is preserved through checker setup.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Compare finite caller admission and upstream #29555 nominal generic binding.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L3492"
        }
      ],
      "hunkIds": [
        "H0853",
        "H0856"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-declared-domain-strict-replay",
      "trackerParent": "ty-bounded-callable-relations",
      "title": "Replay complete bounded source specialization under the original strict relation",
      "detail": "With no ambient inferable variables, source domain solving may propose bindings. Target variables stay rigid; incomplete paths/dependencies decline. Missing optional source slots may retain rigid source variables. Remove generic source context only after specialization, then replay original strict relation after search recursion entry is gone. Only complete rejected family can return false.",
      "classification": "general-python-solver-enhancement",
      "nextAction": "Extract bounded/finite domain strict callable counterexamples, gradual declarations and incomplete search gates together.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L3775"
        }
      ],
      "hunkIds": [
        "H0855",
        "H0858"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-keyword-surface-constraints",
      "trackerParent": "ty-keyword-paramspec-host",
      "title": "Relate finite and symbolic callback keyword remainders",
      "detail": "Lazy callable relation captures finite source remainder into readonly accepted-keyword shape, or relates symbolic tails only with equal fixed key sets. Add upper constraints on target keyword-parameter projection; positional behavior remains outside this evidence.",
      "classification": "host-extension-semantics",
      "nextAction": "Separate host annotation design from general solver support.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L4151"
        }
      ],
      "hunkIds": [
        "H0861",
        "H0862",
        "H0863"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-incomplete-input-domain",
      "trackerParent": "ty-host-contracts",
      "title": "Represent incomplete parameter descriptions separately from gradual types",
      "detail": "Incomplete rows admit ordinary per-row call checks but cannot prove unseen required input domains in strict callable relations. Incomplete survives prefix/transformation/ParamSpec expansion, and materialization uses conservative global bounds rather than erasing unknown shape through value mapping.",
      "classification": "host-api-and-general-python-core",
      "nextAction": "Public constructor requires normalized standard rows. Test missing unseen required inputs, bottom/top and mixed gradual parameters before API proposal.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L4530"
        }
      ],
      "hunkIds": [
        "H0865",
        "H0869",
        "H0875",
        "H0876",
        "H0877",
        "H0878",
        "H0886",
        "H0887",
        "H0888",
        "H0897"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-positional-capture-tuple-helper",
      "trackerParent": "ty-solver-inference",
      "title": "Share existing positional parameter tuple construction",
      "detail": "Move tuple/TypeVarTuple segment construction from callable ParamSpec relation to helper reused by lambda variadic context.",
      "classification": "mechanical",
      "nextAction": "Carry with lambda context behavior.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L5454"
        }
      ],
      "hunkIds": [
        "H0866",
        "H0867",
        "H0868"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-keyword-dictionary-shape",
      "trackerParent": "ty-solver-inference",
      "title": "Build keyword dictionary shapes from normalized parameter rows",
      "detail": "keyword_arguments_type maps defaults to optional key presence, not inserted default values; empty complete rows make a closed empty dictionary. Ordinary open tails become extra items. A symbolic keyword component is a whole dictionary and cannot silently combine with fixed fields; readonly accepted surface and writable captured arguments are distinct.",
      "classification": "host-api-and-general-python-enhancement",
      "nextAction": "Specify supplied host shape API separately.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L5936"
        }
      ],
      "hunkIds": [
        "H0870",
        "H0871"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-keyword-projection-witness-shape",
      "trackerParent": "ty-keyword-paramspec-host",
      "title": "Construct complete callable witnesses for keyword-only parameter evidence",
      "detail": "Keyword projection handles positional-only prefixes and symbolic tails, gradual tails become incomplete keyword descriptions, top projects to Never. Closed TypedDict schema can propose a keyword-only ParamSpec witness; open schema declines. Fixed source names are excluded from remainders.",
      "classification": "host-extension-semantics",
      "nextAction": "Only a candidate constructor: verify the complete original call relation before exporting inferred ParamSpec.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L6502"
        }
      ],
      "hunkIds": [
        "H0879"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-lambda-variadic-context",
      "trackerParent": "ty-contextual-callbacks",
      "title": "Give lambda fixed inputs and args one consistent positional context",
      "detail": "Normalize starred annotations then partition fixed prefix/captured positional segment/keyword tail. Direct homogeneous vararg can pass through. Synthesized starred tuple context requires nondefault positional-only slots, at most one ordinary variadic and complete suffix coverage; keyword-routable/optional ambiguous shapes decline.",
      "classification": "general-python-contextual-inference-enhancement",
      "nextAction": "Coordinate existing finite lambda proposal and compare full variadic contextual fixture cases.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L7035"
        }
      ],
      "hunkIds": [
        "H0891"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-parameter-source-range",
      "trackerParent": "ty-parameter-source-provenance",
      "title": "Preserve synthesized parameter provenance through mappings and expansion",
      "detail": "ParameterSource stores canonical Definition inline or shared FileRange for synthesized donor slots. Expansion, specialization, recursive normalization preserve source; definition accessor excludes raw-range sources. This supports navigation without inventing semantic definitions.",
      "classification": "host-api-design",
      "nextAction": "API design with source-location tests and normal parameter clone/size behavior.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L7183"
        }
      ],
      "hunkIds": [
        "H0893",
        "H0894",
        "H0900",
        "H0903",
        "H0907",
        "H0916",
        "H0917",
        "H0918",
        "H0920",
        "H0922",
        "H0925",
        "H0935"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-implicit-keyword-presentation",
      "trackerParent": "ty-parameter-source-provenance",
      "title": "Accept internal optional keywords while hiding them from presented signatures",
      "detail": "Implicit keyword-only constructor adds optional Unknown default and implicit flag. Call checking and relations still include the parameter; display/index mapping consumes the flag separately. Mapping/cycle normalization preserve flag.",
      "classification": "host-api-design",
      "nextAction": "Keep internal inputs out of user-visible presentation without changing runtime acceptance.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L7383"
        }
      ],
      "hunkIds": [
        "H0902",
        "H0908",
        "H0912",
        "H0919",
        "H0921",
        "H0923",
        "H0926",
        "H0932",
        "H0933"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-source-backed-defaults",
      "trackerParent": "ty-parameter-source-provenance",
      "title": "Keep inferred default type with its original source expression",
      "detail": "ParameterDefault::Source retains FileRange alongside inferred type, participates in direct/eager/mapped type access and recursive normalization, and public default setter accepts inferred/source-backed values. Named parameter raw default inference is split from existing signature cycle-breaking replace-default operation.",
      "classification": "host-api-design",
      "nextAction": "Preserve actual runtime source defaults vs donor optionality.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L7531"
        }
      ],
      "hunkIds": [
        "H0914",
        "H0915",
        "H0924",
        "H0939",
        "H0940",
        "H0941",
        "H0942",
        "H0943",
        "H0944",
        "H0945",
        "H0946"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-public-construction-accessors",
      "trackerParent": "ty-host-contracts",
      "title": "Expose minimal signature and parameter constructors/accessors",
      "detail": "Visibility and must_use changes expose normalized signature creation, parameter rows, kinds/names/default presence, generic flag, and immutable return/parameter transformations. Constructors share one initialization helper.",
      "classification": "host-api-design",
      "nextAction": "Review minimal stable surface rather than mechanically exposing every internal.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L1199"
        }
      ],
      "hunkIds": [
        "H0813",
        "H0827",
        "H0828",
        "H0844",
        "H0846",
        "H0872",
        "H0874",
        "H0889",
        "H0899",
        "H0901",
        "H0904",
        "H0906",
        "H0909",
        "H0910",
        "H0911",
        "H0913",
        "H0934",
        "H0936",
        "H0937",
        "H0938"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-keyword-match-helper",
      "trackerParent": "ty-solver-inference",
      "title": "Share named-or-variadic keyword parameter lookup",
      "detail": "matching_keyword factors existing keyword_by_name or keyword_variadic sequence for argument matcher.",
      "classification": "mechanical",
      "nextAction": "Carry with matching behavior.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L7106"
        }
      ],
      "hunkIds": [
        "H0892"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "signature-import-support",
      "trackerParent": "ty-solver-inference",
      "title": "Imports for signature source ownership and solver mechanisms",
      "detail": "Imports only; no standalone semantic claim.",
      "classification": "mechanical",
      "nextAction": "Carry with corresponding changes.",
      "evidence": [
        {
          "label": "types/signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/signatures.rs#L14"
        }
      ],
      "hunkIds": [
        "H0787",
        "H0788",
        "H0789",
        "H0790",
        "H0791",
        "H0792",
        "H0793",
        "H0794",
        "H0795"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "constructor-explicit-class-arguments-fixed",
      "trackerParent": "ty-constructor-class-arguments",
      "title": "Infer only class arguments owned by this constructor call",
      "detail": "ConstructorBinding tracks inferable class context separately from result type. Explicit class arguments remain fixed even when caller TypeVars occur in them; overriding instance with fixed TypeVar/intersection clears stale inferable class context. Partial specialization only produces placeholders for actually inferable class binders.",
      "classification": "general-python-correctness",
      "nextAction": "Already attributed in class-call-context dfe inventory. Retain explicit generic constructor and caller-bound-TypeVar tests before extraction.",
      "evidence": [
        {
          "label": "types/call/bind/constructor.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind/constructor.rs#L55"
        }
      ],
      "hunkIds": [
        "H0186",
        "H0188",
        "H0190",
        "H0191",
        "H0195",
        "H0196",
        "H0197"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "constructor-omitted-stage-evidence",
      "trackerParent": "ty-constructor-class-arguments",
      "title": "Record constructor stages discarded before requirements were retained",
      "detail": "has_omitted_stage records lost downstream stages when mapping bindings. Checked input evidence cannot claim complete argument requirements if a constructor stage was omitted.",
      "classification": "host-api-and-general-python-correctness",
      "nextAction": "Verify two-stage new/init negative evidence cases.",
      "evidence": [
        {
          "label": "types/call/bind/constructor.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind/constructor.rs#L62"
        }
      ],
      "hunkIds": [
        "H0187",
        "H0189",
        "H0192",
        "H0193",
        "H0194"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "constructor-projection-support",
      "trackerParent": "ty-constructor-class-arguments",
      "title": "Projection enum import and instance-type visibility",
      "detail": "Support APIs for explicit inferable constructor context and argument projection.",
      "classification": "mechanical",
      "nextAction": "Carry with owning behavior.",
      "evidence": [
        {
          "label": "types/call/bind/constructor.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/bind/constructor.rs#L8"
        }
      ],
      "hunkIds": [
        "H0185",
        "H0198"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "checked-call-readonly-query-contract",
      "trackerParent": "ty-host-contracts",
      "title": "Expose matched call facts without requesting enclosing completed inference",
      "detail": "CheckedCall holds original AST/source file, current argument and child type facts, binding errors and return. Context providers may receive provisional checks; final result providers receive completed call checks. Applications inspect read-only; native refinements alone mutate result.",
      "classification": "host-api-design",
      "nextAction": "Full file already reviewed in class-call-context inventory.",
      "evidence": [
        {
          "label": "types/call/checked.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/checked.rs#L1"
        }
      ],
      "hunkIds": [
        "H0199"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "checked-call-argument-presence",
      "trackerParent": "ty-host-contracts",
      "title": "Distinguish omitted, definitely supplied and indeterminate matched parameters",
      "detail": "Parameter lookup uses exact matcher mapping including synthetic receiver offset. Multiple source suppliers, starred positional unpacking, optional unpacked keys or missing types are indeterminate. Definite unpacked keyword values have no individual AST expression.",
      "classification": "host-api-design",
      "nextAction": "Keep optional pack, duplicate supplier, synthetic receiver and omitted default negative cases.",
      "evidence": [
        {
          "label": "types/call/checked.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/checked.rs#L1"
        }
      ],
      "hunkIds": [
        "H0199"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "checked-call-dictionary-observation-time",
      "trackerParent": "ty-host-contracts",
      "title": "Distinguish dictionary child evaluation from call-time argument observation",
      "detail": "dictionary_items observes when a child was evaluated; dictionary_argument observes after all arguments evaluate, selecting actual/unpacked keyword access. Optional/residual entries do not prove key presence; receiver dictionaries and ambiguous variadic key names decline. TypedDict fallback preserves source range.",
      "classification": "host-api-design",
      "nextAction": "Tests must demonstrate later argument mutation changes call-time snapshot without rewriting child-time observation.",
      "evidence": [
        {
          "label": "types/call/checked.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/checked.rs#L1"
        }
      ],
      "hunkIds": [
        "H0199"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "checked-call-detached-annotation-anchor",
      "trackerParent": "ty-host-contracts",
      "title": "Infer one anchored detached annotation only during final refinement",
      "detail": "infer_annotation_at delegates an optional provider with a canonical child expression owner and at most one same-file detached range. Provisional checks have no provider and return None.",
      "classification": "host-api-design",
      "nextAction": "Retain anchor identity, diagnostics and provisional absence tests.",
      "evidence": [
        {
          "label": "types/call/checked.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/checked.rs#L1"
        }
      ],
      "hunkIds": [
        "H0199"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "checked-call-native-getattr-boundary",
      "trackerParent": "ty-native-getattr-context",
      "title": "Require applications to establish native getattr operation identity",
      "detail": "getattr_return_type declines binding errors/bound receivers and uses already matched object/name/default operands; host chooses actual native operation declaration and contract.",
      "classification": "host-api-design",
      "nextAction": "Verify the actual native operation declaration in every host caller.",
      "evidence": [
        {
          "label": "types/call/checked.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/checked.rs#L1"
        }
      ],
      "hunkIds": [
        "H0199"
      ],
      "sourceReviewed": true,
      "qualified": false
    },
    {
      "id": "checked-call-source-diagnostic-node",
      "trackerParent": "ty-host-contracts",
      "title": "Retain complete original keyword node for native diagnostics",
      "detail": "argument_node returns complete keyword including its name, not only value expression. Native static_assert keyword fixture checks secondary annotation range over condition=False.",
      "classification": "general-python-correctness",
      "nextAction": "Run the native keyword diagnostic regression and check upstream source-range behavior.",
      "evidence": [
        {
          "label": "types/call/checked.rs",
          "url": "https://github.com/tamird/ruff/blob/dfe98a7daef8d3e8076f20e55ece2f4a98769331/crates/ty_python_semantic/src/types/call/checked.rs#L1"
        }
      ],
      "hunkIds": [
        "H0199"
      ],
      "sourceReviewed": true,
      "qualified": false
    }
  ]
};
