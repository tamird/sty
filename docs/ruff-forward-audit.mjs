// Immutable source inventory; runtime qualification is tracked separately.
export const ruffForwardAudit = {
  "schema": 1,
  "frozenBase": "6b5b5eca948c05261a3909e78133884cd9e61c9e",
  "frozenCandidate": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
  "currentBase": "7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc",
  "currentCandidate": "521014044d2578c786fe05ff3a5bf2e1425a2cba",
  "rawManifestSHA256": "190d94298b7963f72e169c1780ac081df4d380bfe0a5412d44ad4c009145da68",
  "forwardPatchSHA256": "e7c07b965eb648cfe7795055f7686049834a33e5b326ee04e96b4758478543ba",
  "upstreamPatchSHA256": "9e0b40df903d6fe2ffcdbcd544f0a38d97e3024fbaa16efb5cfeac9e729d25a2",
  "counts": {
    "netPaths": 316,
    "rustSourcePaths": 155,
    "exactFrozenBlobPairs": 163,
    "exactFrozenRustSourceBlobPairs": 105,
    "changedRustSourcePaths": 50,
    "forwardHunks": 360,
    "forwardProducerFamilies": 19
  },
  "files": [
    {
      "path": "crates/ruff_python_ast/src/lib.rs",
      "baseBlob": "dd00135d8adfd226733a8d098d21de0feece19bb",
      "candidateBlob": "2c2e477d7a448e4046df2f753c42849fb3755a41",
      "frozenCandidateBlob": "f8f359765f2ff44c31455b27cd4bc25b47ec8ae0",
      "classification": "upstream-api-migration",
      "detail": "Upstream removed parenthesize module export; no additional fork behavior.",
      "hunks": [
        {
          "anchor": "@@ -22,7 +22,6 @@ mod node;",
          "oldStart": 22,
          "newStart": 22,
          "sha256": "e6ff571500b4168726129ba454de8a99051b7b1e6f82e52f5699823432e2e980",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ruff_python_ast/src/lib.rs#L22"
        }
      ]
    },
    {
      "path": "crates/ty_ide/src/inlay_hints.rs",
      "baseBlob": "9747917dbd1a7475de307b87fa11828416143332",
      "candidateBlob": "3a291cb84ab726c16f0b758866f2ce797f8d4bdd",
      "frozenCandidateBlob": "8535ee2e8ff9f0c7db0231b87ffd7271eb7a5fff",
      "classification": "mechanical",
      "detail": "Remove needless reference to model; unchanged call target.",
      "hunks": [
        {
          "anchor": "@@ -605,7 +605,7 @@ impl<'a> SourceOrderVisitor<'a> for InlayHintVisitor<'a, '_> {",
          "oldStart": 605,
          "newStart": 605,
          "sha256": "6a80022fcab2c237246d02f27e8f34c765e188220259635dd8b3d30fefca06a8",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_ide/src/inlay_hints.rs#L605"
        }
      ]
    },
    {
      "path": "crates/ty_python_core/src/ast_ids.rs",
      "baseBlob": "6632d57251e2398fdc25d61f910cb6ed93913ac6",
      "candidateBlob": "d7e0de581a5c6b95ef0891312324854cb482a0ff",
      "frozenCandidateBlob": "8814840dd42c607e6ae6d40f367ea6064479e056",
      "classification": "mechanical",
      "detail": "Read already-indexed root node through as_u32; preserves node+offset calculation.",
      "hunks": [
        {
          "anchor": "@@ -262,7 +262,11 @@ impl AstIds {",
          "oldStart": 262,
          "newStart": 262,
          "sha256": "adc8992998148ae1f001df6183836c5e2c910f251d56bd3dbc183a5abe4fdc90",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/ast_ids.rs#L262"
        }
      ]
    },
    {
      "path": "crates/ty_python_core/src/builder.rs",
      "baseBlob": "e2e7e11f15a92b43cb527186b96930736e26ebf9",
      "candidateBlob": "2d9d2abf20c5439f3fca6f64b7675827db21de7a",
      "frozenCandidateBlob": "e94c3578c96d5a9c903cd5dec1ca966625b8f9b8",
      "classification": "mechanical",
      "detail": "Replace predicate match with equivalent let-else. Final checkpoint explicitly reviewed changes: upstream-nested-place-scalar-guard. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -2137,6 +2137,13 @@ impl<'db, 'ast> SemanticIndexBuilder<'db, 'ast> {",
          "oldStart": 2137,
          "newStart": 2137,
          "sha256": "e40028c8928bd7ecc7b1612b60c334432619ca62173e87ccaa79bfdae31f0ccd",
          "classification": "upstream-nested-place-scalar-guard",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30647 owns skipping scalar sequence items during nested-key indexing; exact added guard is present in official7d1.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/builder.rs#L2137"
        },
        {
          "anchor": "@@ -2632,9 +2639,8 @@ impl<'db, 'ast> SemanticIndexBuilder<'db, 'ast> {",
          "oldStart": 2632,
          "newStart": 2639,
          "sha256": "185e7d541cdaacf0d01609383a874afaba5efc3e9686c5c85f56086dc0a81ea7",
          "classification": "mechanical",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/builder.rs#L2639"
        }
      ]
    },
    {
      "path": "crates/ty_python_core/src/builder/dictionary_contents.rs",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "9bf157bf4d035a9b7b886f07235ba2fa7dbc100c",
      "frozenCandidateBlob": "6a7737589365246bad6d6b7a835df63f9e50effe",
      "classification": "tracked-mapping-after-arguments-snapshot",
      "detail": "Record tracked ordinary positional and named mapping arguments after every argument has evaluated and before call exposure. Reuses original-binding, tracked-place, identity/order and dedup guards; retains unpack-copy and get-receiver snapshots. Removes the retained-call-only named-argument special case.",
      "hunks": [
        {
          "anchor": "@@ -469,10 +469,21 @@ impl<'db, 'ast> SemanticIndexBuilder<'db, 'ast> {",
          "oldStart": 469,
          "newStart": 469,
          "sha256": "540651369da3cfcaf69d0f30680fb5f8ee489f40ee88cfa3110c1b9c8c34ff70",
          "classification": "tracked-mapping-after-arguments-snapshot",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/builder/dictionary_contents.rs#L469"
        },
        {
          "anchor": "@@ -480,23 +491,6 @@ impl<'db, 'ast> SemanticIndexBuilder<'db, 'ast> {",
          "oldStart": 480,
          "newStart": 491,
          "sha256": "168ef282c0bd3d36c9a20de30dc02f7b258ac4462e08a4906211981b00bc50ab",
          "classification": "tracked-mapping-after-arguments-snapshot",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/builder/dictionary_contents.rs#L491"
        }
      ]
    },
    {
      "path": "crates/ty_python_core/src/definition.rs",
      "baseBlob": "b58798bcbd397382962bef09b78685540f34bf84",
      "candidateBlob": "d706b6b84cd72cc76b7dcd2fb7a3709dc672cd49",
      "frozenCandidateBlob": "e8390beaca852c71b060b1b405d15da48c2e5e8b",
      "classification": "upstream-api-migration",
      "detail": "The visibility change exactly matches upstream; it is not a new fork API contribution.",
      "hunks": [
        {
          "anchor": "@@ -1074,7 +1074,7 @@ impl<'db> DefinitionKind<'db> {",
          "oldStart": 1074,
          "newStart": 1074,
          "sha256": "39808df832fd2e3de7bd5bad79e74e35f72f2030a9be2c2e7c38ac3cf3d9cb05",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/definition.rs#L1074"
        }
      ]
    },
    {
      "path": "crates/ty_python_core/src/place.rs",
      "baseBlob": "75b261e99815375444c2686be7fa313171e7730c",
      "candidateBlob": "9e590c0c792580a2efc26da9ac737cd4bdfe2a58",
      "frozenCandidateBlob": "578d5e4db94e7a853938f8b309b0bb7aa670f1bd",
      "classification": "upstream-parent-place-index-refactor",
      "detail": "Official #30633 parent indexing migration beside retained fork supplied-place APIs; no new fork parent-iterator contribution. Final checkpoint explicitly reviewed changes: upstream-parent-place-index-refactor. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -170,6 +170,31 @@ pub enum PlaceExprRef<'a> {",
          "oldStart": 170,
          "newStart": 170,
          "sha256": "52e5386e8745ae4d675e1aa43e98df240fc2df16b42cf6582efd2e6549196a3d",
          "classification": "upstream-parent-place-index-refactor",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30633 owns parent_place_ids iterator/refactor; official base contains the same implementation. Existing fork supplied-place hooks remain separately attributed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/place.rs#L170"
        },
        {
          "anchor": "@@ -279,13 +304,14 @@ impl PlaceTable {",
          "oldStart": 279,
          "newStart": 304,
          "sha256": "dd27355b499e072b81bd2706383af5959626b2d046d33beeccdfb6a7eff034e5",
          "classification": "upstream-parent-place-index-refactor",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30633 owns parent_place_ids iterator/refactor; official base contains the same implementation. Existing fork supplied-place hooks remain separately attributed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/place.rs#L304"
        },
        {
          "anchor": "@@ -517,10 +543,10 @@ impl PlaceTableBuilder {",
          "oldStart": 517,
          "newStart": 543,
          "sha256": "50cfe7e25c2a6558bb11381689a49176596aeeacfed5c03aeab5064f44399b46",
          "classification": "upstream-parent-place-index-refactor",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30633 owns parent_place_ids iterator/refactor; official base contains the same implementation. Existing fork supplied-place hooks remain separately attributed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/place.rs#L543"
        },
        {
          "anchor": "@@ -637,98 +663,6 @@ impl From<ScopedSymbolId> for ScopedPlaceId {",
          "oldStart": 637,
          "newStart": 663,
          "sha256": "62da31e40aeab0d096d8836eb2c6caf3d6c150bccffb9bdaad6446b401f2b913",
          "classification": "upstream-parent-place-index-refactor",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30633 owns parent_place_ids iterator/refactor; official base contains the same implementation. Existing fork supplied-place hooks remain separately attributed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/place.rs#L663"
        }
      ]
    },
    {
      "path": "crates/ty_python_core/src/reachability_constraints.rs",
      "baseBlob": "89dadb68a68e9f86fe0f6a813e99830d356b26a9",
      "candidateBlob": "d188c7469ea0acdec530bcd45497977cfd4f3da9",
      "frozenCandidateBlob": "4a52a5e1e4a3062476d78eefd1d49d14c75c3092",
      "classification": "mechanical",
      "detail": "Move local Edge declaration before statements; no changed transitions.",
      "hunks": [
        {
          "anchor": "@@ -593,6 +593,13 @@ impl ReachabilityConstraintsBuilder {",
          "oldStart": 593,
          "newStart": 593,
          "sha256": "ca10fc833227c2e4993abe3dbcf697ffa9dcbc513739c7a3920a0b34274bc1ec",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/reachability_constraints.rs#L593"
        },
        {
          "anchor": "@@ -621,12 +628,6 @@ impl ReachabilityConstraintsBuilder {",
          "oldStart": 621,
          "newStart": 628,
          "sha256": "756d5f3a5140eb619bdb534181a88e9a7e520fdfe0d6733a543f623bbf99345b",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/reachability_constraints.rs#L628"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/lib.rs",
      "baseBlob": "f4f2edc360ebb5b6dd83b220101c729fa613b8cf",
      "candidateBlob": "374687cfee992a7f8d5c906669d3bd43f1f1fb6f",
      "frozenCandidateBlob": "959c45bf7c23665cffb59d5006008689a4c5812b",
      "classification": "lint-policy",
      "detail": "Document independent boolean analysis settings for Clippy.",
      "hunks": [
        {
          "anchor": "@@ -102,6 +102,10 @@ pub fn register_lints(registry: &mut LintRegistryBuilder) {",
          "oldStart": 102,
          "newStart": 102,
          "sha256": "cebf2c452aac869fd995ef36a83db4ff9b7087578791afc3b89dce1e1cddb155",
          "classification": "lint-policy",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/lib.rs#L102"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/reachability.rs",
      "baseBlob": "7e393e2dd00031305c9af916e293a9b537bf9a16",
      "candidateBlob": "5cee94701c3a2d6ba041310aa9862f24d7a98fe9",
      "frozenCandidateBlob": "539f5c7f8f33118e3015ca0834f54fb98d51904d",
      "classification": "upstream-checkpoints-with-fork-domains",
      "detail": "CheckpointBoundary, masks, continuation loop and sparse-path/invalidation tests are upstream-owned (#30561). Residual fork composition carries FunctionBodyDomain in query keys/range warming and preserves whole-root symbolic correlation by disabling continuations for assumptions or uninhabited splits. This belongs to existing overload-body, saved-guard and initial-binding owners. Current forward hunks additionally cover: dictionary-comprehension-body-domain-propagation. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -598,9 +598,11 @@ fn accumulate_constraint<'db>(",
          "oldStart": 598,
          "newStart": 598,
          "sha256": "bc6784a5773bbaf075615e8719c8346c206882eac7164591e14fe8c2458bed42",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L598"
        },
        {
          "anchor": "@@ -643,7 +645,7 @@ fn analyze_non_terminal_calls_up_to_predicate<'db>(",
          "oldStart": 643,
          "newStart": 645,
          "sha256": "df40ff2b90be5fe5c8376d4c7b7b24135b6dfb6366f166deb97a3685b7de9d49",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L645"
        },
        {
          "anchor": "@@ -654,7 +656,7 @@ fn analyze_non_terminal_calls_up_to_predicate<'db>(",
          "oldStart": 654,
          "newStart": 656,
          "sha256": "0432118eecb4b61b48bd1c440796657515c06daaed245856d6a72048133cd65f",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L656"
        },
        {
          "anchor": "@@ -664,7 +666,7 @@ fn analyze_non_terminal_calls_up_to_predicate<'db>(",
          "oldStart": 664,
          "newStart": 666,
          "sha256": "ccd08b858f615fd1ef02bdb53ed8779ef4ebd3c5d197a3c437bfae1051118358",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L666"
        },
        {
          "anchor": "@@ -680,8 +682,6 @@ fn analyze_non_terminal_calls_up_to_predicate<'db>(",
          "oldStart": 680,
          "newStart": 682,
          "sha256": "7ff09c6fefcdcc1e240566b8f490ceb8d3121ff136f46f54dd8e0afcd4558b53",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L682"
        },
        {
          "anchor": "@@ -750,7 +750,7 @@ fn analyze_body_non_terminal_call_range<'db>(",
          "oldStart": 750,
          "newStart": 750,
          "sha256": "9c783f70b013c305f99f44b58f06b8277a523ddd43f1d52688137cdb8a9c03d8",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L750"
        },
        {
          "anchor": "@@ -813,10 +813,9 @@ fn evaluate_reachability_constraint<'db>(",
          "oldStart": 813,
          "newStart": 813,
          "sha256": "85ce19b1b2466b5c24518d4e0f8b5793bae31feb7dc34558afa0480ff4e4b1b1",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L813"
        },
        {
          "anchor": "@@ -826,11 +825,11 @@ fn evaluate_reachability_constraint<'db>(",
          "oldStart": 826,
          "newStart": 825,
          "sha256": "99ca9ada06e91e881e3f5051e7e6c26ceeb3bdc43b7fd5b812f551908938ecd1",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L825"
        },
        {
          "anchor": "@@ -875,26 +874,59 @@ fn terminal_reachability(id: ScopedReachabilityConstraintId) -> Option<Truthines",
          "oldStart": 875,
          "newStart": 874,
          "sha256": "cc96ed1f2b9ae786c962a23d8ac764218b74275463627652f6062b7ebb831e5a",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L874"
        },
        {
          "anchor": "@@ -931,7 +963,7 @@ impl<'a, 'db> PredicateEvaluator<'a, 'db> {",
          "oldStart": 931,
          "newStart": 963,
          "sha256": "146d6be835d4212a65deeb55b90dd0356ad7dfcff1227452f7ce52263a601fdc",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L963"
        },
        {
          "anchor": "@@ -939,31 +971,20 @@ impl<'a, 'db> PredicateEvaluator<'a, 'db> {",
          "oldStart": 939,
          "newStart": 971,
          "sha256": "505d4a8730c4f051dff66e9881630357fe3fa96a4651f54b2915bc84a6031c2c",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L971"
        },
        {
          "anchor": "@@ -973,7 +994,7 @@ fn evaluate_reachability_path<'db>(",
          "oldStart": 973,
          "newStart": 994,
          "sha256": "ee6b03fc016c8af1df848b3b81a25571d935c2f0d3c50143f7337e75374f94ad",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L994"
        },
        {
          "anchor": "@@ -986,112 +1007,101 @@ fn evaluate_reachability_path<'db>(",
          "oldStart": 986,
          "newStart": 1007,
          "sha256": "11ebce2cf27661e3d1aaf2407ab5d61df677a361f4304cad336c695592340375",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L1007"
        },
        {
          "anchor": "@@ -1120,16 +1130,17 @@ impl<'db> ReachabilityConstraintsExtension<'db> for ReachabilityConstraints {",
          "oldStart": 1120,
          "newStart": 1130,
          "sha256": "e3a57253698db6b8c79479909c6213aeb796d15f91e9637b6dda0504dc7a3042",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L1130"
        },
        {
          "anchor": "@@ -1312,7 +1323,7 @@ fn evaluate_body_projected_narrowing_checkpoint<'db>(",
          "oldStart": 1312,
          "newStart": 1323,
          "sha256": "514e1a6934659216717761c01de19ab83ad2f592356238f7bf0ecaab167f7515",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L1323"
        },
        {
          "anchor": "@@ -1691,7 +1702,7 @@ impl<'a, 'db> NarrowingProjector<'a, 'db> {",
          "oldStart": 1691,
          "newStart": 1702,
          "sha256": "cf68cb486fc0fea0180e9e6ba5babe7933c97570f64dfb9960ba08d5c57dea7c",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L1702"
        },
        {
          "anchor": "@@ -2126,7 +2137,7 @@ fn analyze_body_non_terminal_call<'db>(",
          "oldStart": 2126,
          "newStart": 2137,
          "sha256": "8ecfc7c79aedd8e251b0d48e397c20e14850e214b28e809a7ab282bfc5a385f2",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L2137"
        },
        {
          "anchor": "@@ -2341,7 +2352,7 @@ fn analyze_single_in_domain<'db>(",
          "oldStart": 2341,
          "newStart": 2352,
          "sha256": "ef0fe5443c26d100879427543f330652838fbf0aa5647a684c4ed7430792dbd7",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L2352"
        },
        {
          "anchor": "@@ -2452,10 +2463,11 @@ pub(crate) fn is_range_reachable_in_domain<'db>(",
          "oldStart": 2452,
          "newStart": 2463,
          "sha256": "2cac325dbb4c99601f75af9cb7621e58dafbe295ed5b36804056ec915addee57",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L2463"
        },
        {
          "anchor": "@@ -2482,17 +2494,12 @@ pub(crate) fn is_end_of_scope_reachable_in_domain<'db>(",
          "oldStart": 2482,
          "newStart": 2494,
          "sha256": "ce2b88c176020c0a2db4981125514bccb8f2f163901ecf802f56d396f6317371",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L2494"
        },
        {
          "anchor": "@@ -2744,11 +2751,11 @@ pub(crate) fn refine_initial_binding_reachability<'db>(",
          "oldStart": 2744,
          "newStart": 2751,
          "sha256": "b5ee3cd3497a49d112f1d1085a9b98675ffe78aa1d3b7fa86cd83ba1e45624c8",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L2751"
        },
        {
          "anchor": "@@ -2964,6 +2971,42 @@ mod tests {",
          "oldStart": 2964,
          "newStart": 2971,
          "sha256": "d0de960ac142a86ba8d89e26659b434ad5db2805765c3049dae4ea4d2b0dd435",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L2971"
        },
        {
          "anchor": "@@ -3069,9 +3112,11 @@ class TargetB:",
          "oldStart": 3069,
          "newStart": 3112,
          "sha256": "df033ce560ade4a29bb015cf65c74248ad1f2aef0d1976ae601cc393b3f6c63b",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/reachability.rs#L3112"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types.rs",
      "baseBlob": "f8f05dd3b39ce7e2ac9023498344efafa305f2c4",
      "candidateBlob": "f83b3e77ca50cb46f18d2af42c11307415a59587",
      "frozenCandidateBlob": "fef134e5e3b47804756cc83a184ce55c85be64cc",
      "classification": "upstream-api-migration",
      "detail": "Adds upstream factory_name_argument, cycle-initial None factory_name_literal query, and outer-alias literal resolution. Final checkpoint explicitly reviewed changes: upstream-mapping-value-cache, upstream-type-pair-doc-migration. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -525,6 +525,34 @@ fn definition_expression_type<'db>(",
          "oldStart": 525,
          "newStart": 525,
          "sha256": "3628c18a19d8e4f83287e5cd9787f1f0966d862b2effb9d2fedfa10381fecf76",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types.rs#L525"
        },
        {
          "anchor": "@@ -2542,8 +2570,7 @@ impl<T> InstanceProjection<T> {",
          "oldStart": 2542,
          "newStart": 2570,
          "sha256": "59014d3d6aa29b4bc49eb15fe9e0b07b507b3bb0cdbfb99df9d77fbafaa158fe",
          "classification": "upstream-type-pair-doc-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30638 updates TypePair documentation; no new fork behavior.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types.rs#L2570"
        },
        {
          "anchor": "@@ -3569,6 +3596,11 @@ impl<'db> Type<'db> {",
          "oldStart": 3569,
          "newStart": 3596,
          "sha256": "a3192cbe5037a43196f102c574a9c3b607c8ad1d0b59e9dd467dfae5b331c4a9",
          "classification": "upstream-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types.rs#L3596"
        },
        {
          "anchor": "@@ -7452,19 +7484,41 @@ impl<'db> Type<'db> {",
          "oldStart": 7452,
          "newStart": 7484,
          "sha256": "2e5ee98ce69cb7443ac460532c2cd641e85c4711d6d929e3e95e322230b48081",
          "classification": "upstream-mapping-value-cache",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30638 owns unpacked_value_type cache and recursive fallback; implementation is in official base, not a new fork contribution.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types.rs#L7484"
        },
        {
          "anchor": "@@ -7480,10 +7534,12 @@ impl<'db> Type<'db> {",
          "oldStart": 7480,
          "newStart": 7534,
          "sha256": "f1706a2ab0cd6426cda16a7b8a5526d90aa1d5992abda4f698fdbfaebd88e357",
          "classification": "upstream-mapping-value-cache",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30638 makes failed getitem calls return Unknown in shared unpacking owner.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types.rs#L7534"
        },
        {
          "anchor": "@@ -7518,11 +7574,7 @@ impl<'db> Type<'db> {",
          "oldStart": 7518,
          "newStart": 7574,
          "sha256": "7b106d2eb1fb89abe82e9df626459a3241f42d081066f53a4cb3059199a9f336",
          "classification": "upstream-mapping-value-cache",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30638 routes mapping tuple extraction through the shared cached value owner.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types.rs#L7574"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/call.rs",
      "baseBlob": "0cba126aed629aa505d16ac0bf0c3411fb932b57",
      "candidateBlob": "364974b2a0c17c6c91513eb407d343b37643f8ac",
      "frozenCandidateBlob": "99f1afda81c4aaad25930d7ed3724c4562ee0ac4",
      "classification": "exact-runtime-class-proof-documentation",
      "detail": "Shared exact-runtime-class proof documentation; original source was frozen-identical, now prose illustrates literal versus open builtin identity. Final checkpoint explicitly reviewed changes: exact-runtime-class-proof-documentation. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -72,9 +72,9 @@ pub(crate) enum BinaryOperatorMethod {",
          "oldStart": 72,
          "newStart": 72,
          "sha256": "7b05cd198741d82d99fa37e116c38a4303a29af34b445c65ed2936c25b252270",
          "classification": "exact-runtime-class-proof-documentation",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Existing shared exact-runtime-class proof; updated documentation illustrates Literal versus open builtin identity. No widened class admission.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call.rs#L72"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/ambiguous.rs",
      "baseBlob": "ce19092e333f95725dd4b89b4dd1e4557a4e0c84",
      "candidateBlob": "36154f80fcd011cc7d5d8e9b0649f475b6546770",
      "frozenCandidateBlob": "ce19092e333f95725dd4b89b4dd1e4557a4e0c84",
      "classification": "provisional-return-structure",
      "detail": "Keep genuine concrete return structure beside unmaterialized recursive alternatives; bare pending/materialized markers and settled ambiguity retain old policy.",
      "hunks": [
        {
          "anchor": "@@ -6,6 +6,7 @@ use crate::types::tuple::{TupleSpec, TupleType, VariableSegment};",
          "oldStart": 6,
          "newStart": 6,
          "sha256": "2d2d4fa3b6ec4a3538ce2fc6a4429e2c7490f3989e0580b029a9bcb7cdf2b777",
          "classification": "provisional-return-structure",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/ambiguous.rs#L6"
        },
        {
          "anchor": "@@ -71,6 +72,36 @@ impl<'db> AmbiguousReturnMerger<'_, 'db> {",
          "oldStart": 71,
          "newStart": 72,
          "sha256": "a839e0273798ffb279c8f7eb36da7b2084cef5d6bffe3d437975e8b085d7ecef",
          "classification": "provisional-return-structure",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/ambiguous.rs#L72"
        },
        {
          "anchor": "@@ -283,3 +314,69 @@ impl<'db> AmbiguousReturnMerger<'_, 'db> {",
          "oldStart": 283,
          "newStart": 314,
          "sha256": "39ec2b8e17010caa7098f413f891b6317b4d5883c37acbf5e7d54d3c0b00145f",
          "classification": "provisional-return-structure",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/ambiguous.rs#L314"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/arguments.rs",
      "baseBlob": "d35b633f97cf9485ff0a6869024e05cc7472a83e",
      "candidateBlob": "fb68ab5c18565ce7ab3cc09921cb8d4956e52a5f",
      "frozenCandidateBlob": "31cbe56db4186e0576c5c07e3517b4bfa1f7054d",
      "classification": "upstream-paramspec-selector-with-observed-keyword-policy",
      "detail": "Upstream #30594 supplies positional-unpack suffix slicing and the shared ParamSpec sub-call selector. The fork preserves Observed keyword-prefix exclusions through remove_prefix_keywords, including residual names even when another argument supplied the fixed prefix; the obsolete select_for_paramspec projection is removed. Final checkpoint explicitly reviewed changes: upstream-keyword-cache-fork-paramspec-composition. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -23,7 +23,7 @@ use crate::types::typed_dict::{",
          "oldStart": 23,
          "newStart": 23,
          "sha256": "3187596da326572e2ee340a9121d8b61fe24fd6155a3986ddb0ed81662599a4d",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/arguments.rs#L23"
        },
        {
          "anchor": "@@ -303,6 +303,43 @@ impl<'db> VariadicArgument<'db> {",
          "oldStart": 303,
          "newStart": 303,
          "sha256": "93e32e3430ca126ad79d520ef02f15343944fd836bfad64bdd470753db6b2e88",
          "classification": "upstream-paramspec-suffix-selector",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/arguments.rs#L303"
        },
        {
          "anchor": "@@ -510,6 +547,34 @@ pub(crate) struct UnpackedKeywords<'db> {",
          "oldStart": 510,
          "newStart": 547,
          "sha256": "ed85f784e4dad9f2579ff3c412ff889f35243488b6c33f5a243823de71b33ae5",
          "classification": "observed-keyword-prefix-exclusions",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/arguments.rs#L547"
        },
        {
          "anchor": "@@ -669,12 +734,11 @@ impl<'db> KeywordArgument<'db> {",
          "oldStart": 669,
          "newStart": 734,
          "sha256": "4a1b19fa8ef3de545c5929d3d6d25a42e5d7a41d919a68231e0caa07b49a0bfb",
          "classification": "upstream-keyword-cache-fork-paramspec-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30638 owns unpacked-value caching. Fork keeps its distinct ParamSpec keyword-component projection before the shared owner; neither mechanism is inferred from similar names.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/arguments.rs#L734"
        },
        {
          "anchor": "@@ -997,10 +1061,18 @@ impl<'a, 'db> CallArguments<'a, 'db> {",
          "oldStart": 997,
          "newStart": 1061,
          "sha256": "f17598787611a18d0dcec0a68234200ed9fb34906308872a501ed02774a612c5",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/arguments.rs#L1061"
        },
        {
          "anchor": "@@ -1072,69 +1144,6 @@ impl<'a, 'db> CallArguments<'a, 'db> {",
          "oldStart": 1072,
          "newStart": 1144,
          "sha256": "606942539d333ead2d411a210b50367423c0dbb03b63830f302d5ae0bd8bbb63",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/arguments.rs#L1144"
        },
        {
          "anchor": "@@ -1417,7 +1426,7 @@ mod tests {",
          "oldStart": 1417,
          "newStart": 1426,
          "sha256": "197be20189f1bf1377bca518587382d919ac5c36e0a4294d48d5c6e7966e80a8",
          "classification": "mechanical-native-test-import",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/arguments.rs#L1426"
        },
        {
          "anchor": "@@ -1553,7 +1562,11 @@ mod tests {",
          "oldStart": 1553,
          "newStart": 1562,
          "sha256": "7b10520b833974c1a3e3fae2a78cd61e6c14c4a1fd39300170ec82e6781f701f",
          "classification": "observed-keyword-prefix-exclusions",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/arguments.rs#L1562"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/bind.rs",
      "baseBlob": "dff010501a88819d315559c3d34a17fb6d41675e",
      "candidateBlob": "2c666f0fe15ffe4b8653f7157d44675e39b62785",
      "frozenCandidateBlob": "4b30c10649898e6da2e4aa6d21d657e97445ca70",
      "classification": "mixed-call-owner",
      "detail": "Preserves the bounded Lazy expansion precheck, constant TypeIs certification and contextual ParamSpec projection. Upstream #30594 owns shared suffix selection and diagnostic source remapping; fork integration runs the same selector for contextual inference and final checking, removes consumed Observed keyword names and records residual exclusions even when another argument bound the prefix. Independently, keyword mapping keys are validated before Observed.unpack can return early; the unreachable later Observed branch is removed. Current forward hunks additionally cover: sibling-dependent-empty-getattr-context-replay. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim. Final checkpoint explicitly reviewed changes: upstream-keyword-cache-fork-paramspec-composition, upstream-overload-prefix-cache, upstream-overload-prefix-cache-fork-provisional-guard. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -74,7 +74,6 @@ use crate::types::infer::{TypeContextKind, original_class_type};",
          "oldStart": 74,
          "newStart": 74,
          "sha256": "59cf32b7586173f7baa5bb55c38f717aad825cab855da1e2ff655c3f5fd0aa66",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L74"
        },
        {
          "anchor": "@@ -96,12 +95,12 @@ use crate::types::visitor::{",
          "oldStart": 96,
          "newStart": 95,
          "sha256": "5368d187e149cc49af5475dc860e28ae12538a5fcaa16701095c5d194cc8e882",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L95"
        },
        {
          "anchor": "@@ -2045,6 +2044,7 @@ impl<'db> Bindings<'db> {",
          "oldStart": 2045,
          "newStart": 2044,
          "sha256": "4e86e4d90a107c941e5adbedcd8ea066357028a7200fbe8b84f28039bb8e8d80",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L2044"
        },
        {
          "anchor": "@@ -2057,19 +2057,40 @@ impl<'db> Bindings<'db> {",
          "oldStart": 2057,
          "newStart": 2057,
          "sha256": "41bcaa6765ebf4a592d1a4ab4b81be42519b304a763f750db1bfd9b95502ff06",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L2057"
        },
        {
          "anchor": "@@ -2094,6 +2115,7 @@ impl<'db> Bindings<'db> {",
          "oldStart": 2094,
          "newStart": 2115,
          "sha256": "12368d2ff3a2a30fc7b9d27a6f92d2eb677e4f41b8f220e5125c8b1dca43f250",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L2115"
        },
        {
          "anchor": "@@ -2104,6 +2126,7 @@ impl<'db> Bindings<'db> {",
          "oldStart": 2104,
          "newStart": 2126,
          "sha256": "abda90d433bccfb17b6ef3fc838ea50f9e23ff78d1db04da9b2eb43e1f45c313",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L2126"
        },
        {
          "anchor": "@@ -2111,6 +2134,7 @@ impl<'db> Bindings<'db> {",
          "oldStart": 2111,
          "newStart": 2134,
          "sha256": "b54a0262e93db4210e69b2395ab898dda9a66480ec0bbbcfa49b9a7121d72e65",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L2134"
        },
        {
          "anchor": "@@ -3885,6 +3909,121 @@ impl FailingOverloadSelection {",
          "oldStart": 3885,
          "newStart": 3909,
          "sha256": "a11271906ac1809a93b8dc0d81f7a5be2516f31ccb740f6b4197cd8e64b32571",
          "classification": "upstream-overload-prefix-cache-fork-provisional-guard",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30640 owns interned candidate/slot prefix cache. Fork retains explicit Divergent refusal before the owned relation query; this mixed hunk is not a new cache PR.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L3909"
        },
        {
          "anchor": "@@ -4385,6 +4524,12 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4385,
          "newStart": 4524,
          "sha256": "181f9a10051baf4b2c54bcb2afea6061626490f6492d4650febdaba70a1334cb",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L4524"
        },
        {
          "anchor": "@@ -4408,15 +4553,18 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4408,
          "newStart": 4553,
          "sha256": "b4d8d6c31e9b265105665738dcd0d89db2634bf089335ed8cdfd351f0ff5d68c",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L4553"
        },
        {
          "anchor": "@@ -4708,12 +4856,6 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4708,
          "newStart": 4856,
          "sha256": "8c5ddcffdde1724e087d1cdc47b915c0cebca70819480ed9d2d99e04bef7bfa1",
          "classification": "upstream-overload-prefix-cache",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30640 moves slot representation to cached owner.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L4856"
        },
        {
          "anchor": "@@ -4753,7 +4895,7 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4753,
          "newStart": 4895,
          "sha256": "f78a0658dd6f1af90babe5327279d684f67d8bc3dc1cbe3ab7ef14329f468fb2",
          "classification": "upstream-overload-prefix-cache",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30640 keeps participating slots in deterministic vector order.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L4895"
        },
        {
          "anchor": "@@ -4765,12 +4907,12 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4765,
          "newStart": 4907,
          "sha256": "a4fdcc4f6ab1aecda15a449744793eefcc29da042f88050ae629bab3ca13ac54",
          "classification": "upstream-overload-prefix-cache",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30640 records each participating slot once in vector order.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L4907"
        },
        {
          "anchor": "@@ -4781,78 +4923,22 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4781,
          "newStart": 4923,
          "sha256": "2e42c65d252b492554a7b06099f41c96d1722a43e422426791febb8483df4bc3",
          "classification": "upstream-overload-prefix-cache",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30640 projects matching candidates into the shared covering-prefix query; previous fork provisional guard is retained in the moved owner.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L4923"
        },
        {
          "anchor": "@@ -4893,7 +4979,13 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4893,
          "newStart": 4979,
          "sha256": "7058aa68b50cc38b2c7235d86c03ca002a0c3ac1d2484bf7da5145ff0cef6c3d",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L4979"
        },
        {
          "anchor": "@@ -5316,7 +5408,10 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 5316,
          "newStart": 5408,
          "sha256": "e18d3cfe8df083f22133b653a790a0077852a1319507e6d609bd6dfc8e0612e3",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L5408"
        },
        {
          "anchor": "@@ -5326,10 +5421,9 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 5326,
          "newStart": 5421,
          "sha256": "72b24b964200a787120af6b10c3c168cb3838f11f89d43cc948ca9ff9289d374",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L5421"
        },
        {
          "anchor": "@@ -5338,19 +5432,47 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 5338,
          "newStart": 5432,
          "sha256": "1465e0044e306b70008de234de4f5cbb6d3fe6656fa1ef4116ee9f50a20d8306",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L5432"
        },
        {
          "anchor": "@@ -6235,8 +6357,9 @@ impl<'a, 'db> ArgumentMatcher<'a, 'db> {",
          "oldStart": 6235,
          "newStart": 6357,
          "sha256": "4fb8a3fafe8606818101557dd9ee65324a39ffbf90b3809f6671e244f8346e6e",
          "classification": "upstream-keyword-cache-fork-paramspec-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30638 shared cached mapping value owner retains fork keyword-component projection before fallback.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L6357"
        },
        {
          "anchor": "@@ -6865,7 +6988,13 @@ fn inferred_parameter_specialization<'db>(",
          "oldStart": 6865,
          "newStart": 6988,
          "sha256": "99af99f2bd861be21ed423aaab643778744c90f8f5fa77da08491e346eab5179",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L6988"
        },
        {
          "anchor": "@@ -7073,29 +7202,6 @@ impl<'a, 'db> CallInference<'a, 'db> {",
          "oldStart": 7073,
          "newStart": 7202,
          "sha256": "2993d3a5c5119359f36c7a64f8e90221dd0ff34c6c597046fb3af60f27e218fe",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L7202"
        },
        {
          "anchor": "@@ -7139,8 +7245,11 @@ impl<'db> ArgumentTypeChecker<'_, 'db> {",
          "oldStart": 7139,
          "newStart": 7245,
          "sha256": "45d25638c27b2e12039985bac4fabe78e5b091b3ae5303a287b04160153b805a",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L7245"
        },
        {
          "anchor": "@@ -7740,14 +7849,11 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 7740,
          "newStart": 7849,
          "sha256": "f6f9c75ead32c8879b2dfd95f576e7e59f6d08aacb336daf531d47c6df908fe2",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L7849"
        },
        {
          "anchor": "@@ -8011,7 +8117,6 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 8011,
          "newStart": 8117,
          "sha256": "e638f1117be88d2825c2bd0d37b5eebc1aeef3eeabef9c5e75a10319f8f34880",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L8117"
        },
        {
          "anchor": "@@ -8177,7 +8282,6 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 8177,
          "newStart": 8282,
          "sha256": "1e4f7970717c360e57c8279361e83e041cb46246d32f4159aeade2b203b9ee7a",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L8282"
        },
        {
          "anchor": "@@ -8185,6 +8289,10 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 8185,
          "newStart": 8289,
          "sha256": "a976b561cfb53d3c23c2e704777701a6c315b495957c12eabf1ce97ec8902b69",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L8289"
        },
        {
          "anchor": "@@ -8636,12 +8744,7 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 8636,
          "newStart": 8744,
          "sha256": "54a5909cd03390f178358fa93d8ff2bf84d3ff8ae72ff3b4ced8c8ff895a6945",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L8744"
        },
        {
          "anchor": "@@ -8757,14 +8860,8 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 8757,
          "newStart": 8860,
          "sha256": "f663653103ba1f5da65b05039971d174e51deb21ad7141e3d0d831dbbc558c3d",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L8860"
        },
        {
          "anchor": "@@ -8891,50 +8988,8 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 8891,
          "newStart": 8988,
          "sha256": "1b12415ccf08e145cbc9313357c6225a75f1d3aefd003ab771bde33a8d487225",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L8988"
        },
        {
          "anchor": "@@ -8955,7 +9010,6 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 8955,
          "newStart": 9010,
          "sha256": "2d7918fc45d8d71da07447de1cc36f81efcab13db11230a88a364b8118d6365b",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9010"
        },
        {
          "anchor": "@@ -8988,7 +9042,7 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 8988,
          "newStart": 9042,
          "sha256": "52a61f90519ab511cdf112a659f65ea22314b35c2af0ff038f937d496f5057c8",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9042"
        },
        {
          "anchor": "@@ -9010,8 +9064,7 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9010,
          "newStart": 9064,
          "sha256": "b6bd20bc3a6783ba79c0d216d339a52036b1ebf1245f6ff442b14316d5b03624",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9064"
        },
        {
          "anchor": "@@ -9022,13 +9075,11 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9022,
          "newStart": 9075,
          "sha256": "9913b34dbbf32fcc2a68ba72e735fb1d80ba9af452e025bb3675724cf131cc28",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9075"
        },
        {
          "anchor": "@@ -9050,23 +9101,8 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9050,
          "newStart": 9101,
          "sha256": "c2aeefb18f7d23baafa997883ca139e87ba56fef4c04c1dc1be4dd999e36f454",
          "classification": "upstream-selector-with-observed-keyword-exclusions",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9101"
        },
        {
          "anchor": "@@ -9091,7 +9127,6 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9091,
          "newStart": 9127,
          "sha256": "562a207937f6b66fff039a49a67185f586bd48e3ef496d5f9ea8f686598b28ab",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9127"
        },
        {
          "anchor": "@@ -9109,21 +9144,15 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9109,
          "newStart": 9144,
          "sha256": "9267a79e9d52593a5367f56ccb08b299a29e410882570cb4bd5a302e39623a47",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9144"
        },
        {
          "anchor": "@@ -9172,12 +9201,11 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9172,
          "newStart": 9201,
          "sha256": "4a4ce56d3cb209b1f6c31a568681a892ff83206ccc6d9052b81b8ee1dc716449",
          "classification": "mixed-upstream-selector-and-key-validation-plumbing",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9201"
        },
        {
          "anchor": "@@ -9199,7 +9227,7 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9199,
          "newStart": 9227,
          "sha256": "08a603be139b6b37a5d326ba2ba27cd930312840dd9b41280871b1d8cd85b230",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9227"
        },
        {
          "anchor": "@@ -9212,9 +9240,23 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9212,
          "newStart": 9240,
          "sha256": "3f9797fcf41bd62a02928ae38abf995c22ad822aee2e8be77bc73203d4b2e312",
          "classification": "observed-keyword-key-validation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9240"
        },
        {
          "anchor": "@@ -9223,42 +9265,10 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9223,
          "newStart": 9265,
          "sha256": "b506cf26ded76d6d09e4288442fc6187f267a919d0fdb45fd1ae8c78b0e11566",
          "classification": "observed-keyword-key-validation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9265"
        },
        {
          "anchor": "@@ -9286,7 +9296,7 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9286,
          "newStart": 9296,
          "sha256": "b8eacabfaffbd9eb1816fab75bda275b5a13a71fb259569e5bf20357c3c9dba8",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9296"
        },
        {
          "anchor": "@@ -9594,6 +9604,81 @@ impl<'db> ArgumentTypeContext<'db> {",
          "oldStart": 9594,
          "newStart": 9604,
          "sha256": "89269a0eee77c29db7e1a381a36e38230784dee660e32a5ef29d641b89fb3a07",
          "classification": "upstream-selector-with-observed-keyword-exclusions",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9604"
        },
        {
          "anchor": "@@ -9843,15 +9928,13 @@ impl<'db> Binding<'db> {",
          "oldStart": 9843,
          "newStart": 9928,
          "sha256": "f3655c007b86d9cc8e55520cbf5c63a497abdf8e74655bf24c1ac4dcdefbf79a",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9928"
        },
        {
          "anchor": "@@ -9862,9 +9945,19 @@ impl<'db> Binding<'db> {",
          "oldStart": 9862,
          "newStart": 9945,
          "sha256": "f1ef657d804273b3e166ede0e7ffa8deb760e779fb929f9c2afb72598f350565",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9945"
        },
        {
          "anchor": "@@ -9892,7 +9985,7 @@ impl<'db> Binding<'db> {",
          "oldStart": 9892,
          "newStart": 9985,
          "sha256": "f1c372585ce09ca88645a1a20463a5dfa9896f417bd9c333793537f3ab48165f",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9985"
        },
        {
          "anchor": "@@ -9989,40 +10082,6 @@ impl<'db> Binding<'db> {",
          "oldStart": 9989,
          "newStart": 10082,
          "sha256": "ee24fe34167d2ef2c066cfcd5c8a1ceb952cf3d5ea5a6350f51c139466975f52",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L10082"
        },
        {
          "anchor": "@@ -10062,17 +10121,17 @@ impl<'db> Binding<'db> {",
          "oldStart": 10062,
          "newStart": 10121,
          "sha256": "46e2d4d9500e8a9179de24319b5e9cd498861d477863fb17ea59a279a90b3fc8",
          "classification": "upstream-selector-with-observed-keyword-exclusions",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L10121"
        },
        {
          "anchor": "@@ -10108,11 +10167,10 @@ impl<'db> Binding<'db> {",
          "oldStart": 10108,
          "newStart": 10167,
          "sha256": "31393b0e8f9e4e84edb8c66c629d72958f13907718079e1227f96781bf24a0f3",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L10167"
        },
        {
          "anchor": "@@ -10304,7 +10362,7 @@ impl<'db> Binding<'db> {",
          "oldStart": 10304,
          "newStart": 10362,
          "sha256": "01f0931cbcc819330755960ed2d1e613f62f97794da349b0191490f5e54efbd8",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L10362"
        },
        {
          "anchor": "@@ -10315,7 +10373,6 @@ impl<'db> Binding<'db> {",
          "oldStart": 10315,
          "newStart": 10373,
          "sha256": "ecb73955a8580c8596474f70314ade8152d4c17e89b039679682d40a743768b1",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L10373"
        },
        {
          "anchor": "@@ -10459,7 +10516,7 @@ impl<'db> Binding<'db> {",
          "oldStart": 10459,
          "newStart": 10516,
          "sha256": "26dff5578241021b450400bc809436da3bc2971717343461c13f25b5422fb979",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L10516"
        },
        {
          "anchor": "@@ -10524,7 +10581,6 @@ impl<'db> Binding<'db> {",
          "oldStart": 10524,
          "newStart": 10581,
          "sha256": "adcce661eb5b3399952e062aeb4332c4820aea095c264a90406044c5dd3b5ae6",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L10581"
        },
        {
          "anchor": "@@ -10540,22 +10596,26 @@ impl<'db> Binding<'db> {",
          "oldStart": 10540,
          "newStart": 10596,
          "sha256": "48d4537341c28bbd9ddbd75f46504c840331f235319cda3ad16b94c0449e7015",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L10596"
        },
        {
          "anchor": "@@ -11774,23 +11834,8 @@ impl BindingError<'_> {",
          "oldStart": 11774,
          "newStart": 11834,
          "sha256": "95e0778eb2145bf057043d1cf37168148755944ac6fb552c691ff5639946c8f7",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L11834"
        },
        {
          "anchor": "@@ -13037,9 +13082,191 @@ mod tests {",
          "oldStart": 13037,
          "newStart": 13082,
          "sha256": "35af0bba1d05152bdfaa0fa08d66cd001e243b90a499a43b9b73642b94ab9df4",
          "classification": "observed-keyword-prefix-and-existing-typeis-regressions",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L13082"
        },
        {
          "anchor": "@@ -13104,7 +13331,6 @@ mod tests {",
          "oldStart": 13104,
          "newStart": 13331,
          "sha256": "29a743d9989577eceb51249baf4751c9e7dcb6bb449329da6ac35b85001174ae",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L13331"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/checked.rs",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "df775fef36ad6e02496aa7b225996d7e7f4c34dc",
      "frozenCandidateBlob": "b42dde99528a07060835e6270a2313215c1f139e",
      "classification": "mechanical",
      "detail": "Name existing annotation callback type; same signature.",
      "hunks": [
        {
          "anchor": "@@ -42,6 +42,8 @@ enum ArgumentAbsence {",
          "oldStart": 42,
          "newStart": 42,
          "sha256": "97dfa36b98b6dfa21d0598aea5051844aff2046c5b0db2a224fc90bafe5b7312",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/checked.rs#L42"
        },
        {
          "anchor": "@@ -58,7 +60,7 @@ pub struct CheckedCall<'a, 'db> {",
          "oldStart": 58,
          "newStart": 60,
          "sha256": "a82194dfef854ebc47c3b16a3e6a73b97e3ccd11ff24f5f9809e2448295a02a5",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/checked.rs#L60"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/class/known.rs",
      "baseBlob": "027a99994525fe77c1a278ababd8c81ab74a13fb",
      "candidateBlob": "9a8cfa890cc1a6489288418208a86ae7a4ffcd29",
      "frozenCandidateBlob": "da0c93f2a063d833fa113a3494afbba32db12d35",
      "classification": "exact-immutable-builtin-truthiness",
      "detail": "Names immutable builtin families whose truth value is stable. Callers must separately prove exact runtime identity; final custom subclasses are not included. Current forward hunks additionally cover: exact-immutable-builtin-truthiness. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim. Final checkpoint explicitly reviewed changes: exact-immutable-builtin-truthiness. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -315,6 +315,24 @@ impl KnownClass {",
          "oldStart": 315,
          "newStart": 315,
          "sha256": "9b49a7dc29858339a862b6353cdb6bb5f9a01b54bd5c4c844d9fe2e7f66a4f79",
          "classification": "exact-immutable-builtin-truthiness",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Existing fork stable-builtin taxonomy, documentation refined. Requires separate exact-runtime proof; no custom-final subclass admission.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/class/known.rs#L315"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints.rs",
      "baseBlob": "141efda0892de5c47f5f7932307217534789bdc4",
      "candidateBlob": "74b945bcfc0e304eff35ccb3fc82656e432f44dd",
      "frozenCandidateBlob": "11f6a491566c2a173e406335771077d11e860642",
      "classification": "receiver-obligation-lifecycle",
      "detail": "Remove owned receiver BDD inspection/remapping helpers after storing raw receiver pairs; test capture scope rewritten without assert_matches binding. Final checkpoint explicitly reviewed changes: candidate-search-runtime-api-migration, candidate-search-test-api-migration, constrained-callback-original-equality-witness, constrained-callback-test-initialization, upstream-first-valid-overlap-fork-shared-budget, upstream-first-valid-search-api. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -97,7 +97,6 @@ use std::marker::PhantomData;",
          "oldStart": 97,
          "newStart": 97,
          "sha256": "ef1283ddafde204e9ae65b23d9ec4f15fc2f8e1ac34c7535130c0d8e5d088267",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L97"
        },
        {
          "anchor": "@@ -306,21 +305,6 @@ impl<'db> OwnedConstraintSet<'db> {",
          "oldStart": 306,
          "newStart": 305,
          "sha256": "75708f3cef0573aab7e3c0c163215e6cde426d4d073dae9bee8c9d0140f6aa46",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L305"
        },
        {
          "anchor": "@@ -340,24 +324,6 @@ impl<'db> OwnedConstraintSet<'db> {",
          "oldStart": 340,
          "newStart": 324,
          "sha256": "0815748085890f36044a8e93030e7f379d9d0909f3cc7e0594d8a0659e36885c",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L324"
        },
        {
          "anchor": "@@ -620,10 +586,45 @@ impl<'db, 'c> ConstraintSet<'db, 'c> {",
          "oldStart": 620,
          "newStart": 586,
          "sha256": "5009e6d188cb7972a56547da0cf14b98be68e8553f56c8c3fec0cf73a1a3379e",
          "classification": "upstream-first-valid-overlap-fork-shared-budget",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30653 first-valid invariant overlap search composed with fork shared path/visit/type resources and explicit incomplete result. Official source uses a different bounded solve API; this is migration/composition, not a new independent overlap feature.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L586"
        },
        {
          "anchor": "@@ -1332,19 +1333,6 @@ impl<'db> ConstraintSetBuilder<'db> {",
          "oldStart": 1332,
          "newStart": 1333,
          "sha256": "d788ace6de2ba9e31380d617016044a51dc5310db7da282ccda2baf475a99787",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L1333"
        },
        {
          "anchor": "@@ -3439,6 +3427,23 @@ impl<'db> CandidateTypeVarSolver<'db> {",
          "oldStart": 3439,
          "newStart": 3427,
          "sha256": "ae4e7ecd9b593a71a71592f59b1188f0ee43b099360877eecc8e35a751483719",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Original non-validity lower and upper evidence must exclusively equal one caller TypeVar before retaining a constrained parametric family.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L3427"
        },
        {
          "anchor": "@@ -3475,6 +3480,7 @@ impl<'db> CandidateTypeVarSolver<'db> {",
          "oldStart": 3475,
          "newStart": 3480,
          "sha256": "2a66920e8e62a1d3213cb535c2bbf9fda4bc94a0ffb66158d24217a55b31e83e",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Completed evidence stores the original bidirectional caller equality certificate.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L3480"
        },
        {
          "anchor": "@@ -3573,6 +3579,8 @@ pub(crate) struct CandidateTypeVarSolution<'db> {",
          "oldStart": 3573,
          "newStart": 3579,
          "sha256": "88998cb04329fcb97db51248ced3f761a044bf96db7672c98f04cac2b51bcd8e",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Certificate is explicit optional bound-TypeVar identity, distinct from aggregate effective evidence.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L3579"
        },
        {
          "anchor": "@@ -3593,6 +3601,7 @@ impl<'db> CandidateTypeVarSolution<'db> {",
          "oldStart": 3593,
          "newStart": 3601,
          "sha256": "70ed9b8cf76cdaab10e7bac797fc79b94ea4fde1e57ba35a582262fe612e4ef5",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Legacy aggregate-equivalence constructor does not invent original two-direction provenance.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L3601"
        },
        {
          "anchor": "@@ -4238,7 +4247,7 @@ impl<'db> CandidateResidual<'db> {",
          "oldStart": 4238,
          "newStart": 4247,
          "sha256": "280c074df5f90d273219da8554a196b94fbc60091c4546ca2d3a2e89de65ecda",
          "classification": "candidate-search-runtime-api-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Residual fixed-relation complete-family collection explicitly chooses All(No); required compiling migration after upstream #30653.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L4247"
        },
        {
          "anchor": "@@ -4385,6 +4394,14 @@ impl SolutionLimits for BoundedSolutionLimits {",
          "oldStart": 4385,
          "newStart": 4394,
          "sha256": "f7ed6e211caf5a1483cb671effee1c6e47739144d743b396fc22ea3093248da7",
          "classification": "upstream-first-valid-search-api",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30653 owns CandidateSearch All/FirstValid policy.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L4394"
        },
        {
          "anchor": "@@ -4408,7 +4425,7 @@ impl<'db> CandidateSolutions<'db> {",
          "oldStart": 4408,
          "newStart": 4425,
          "sha256": "04f68dad70e2dc8da138e8c0b6995b39dcd60ac321701584a2aa6c90b21cc6fc",
          "classification": "upstream-first-valid-search-api",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30653 ordinary collector retains complete diagnostics-enabled search.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L4425"
        },
        {
          "anchor": "@@ -4423,7 +4440,7 @@ impl<'db> CandidateSolutions<'db> {",
          "oldStart": 4423,
          "newStart": 4440,
          "sha256": "79940ae0b5297b9bb6a3e3abe3dd3ff04d2f465ab354fbd793421872785858cd",
          "classification": "upstream-first-valid-search-api",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30653 threads explicit search policy through collector API.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L4440"
        },
        {
          "anchor": "@@ -4435,7 +4452,10 @@ impl<'db> CandidateSolutions<'db> {",
          "oldStart": 4435,
          "newStart": 4452,
          "sha256": "f3c98049bc22dc7967eb5af146689f1cb375038d3430fd70dcb01cbf862111b8",
          "classification": "upstream-first-valid-search-api",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30653 preserves diagnostics while choosing the concrete conjunction fast path.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L4452"
        },
        {
          "anchor": "@@ -4448,7 +4468,8 @@ impl<'db> CandidateSolutions<'db> {",
          "oldStart": 4448,
          "newStart": 4468,
          "sha256": "8670bd9fb4bce4318b98e66e5a89e0290627975bd70a1aa338d0c79078e7797f",
          "classification": "upstream-first-valid-search-api",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30653 threads search into existing ordered SolutionWalker.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L4468"
        },
        {
          "anchor": "@@ -5761,6 +5782,7 @@ mod tests {",
          "oldStart": 5761,
          "newStart": 5782,
          "sha256": "2223da926adcf62fbc288a133f7ea1e1c7c804dea89b91906df46eda2492cfae",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L5782"
        },
        {
          "anchor": "@@ -6774,7 +6796,12 @@ mod tests {",
          "oldStart": 6774,
          "newStart": 6796,
          "sha256": "18899e7d458168ae03ebfa23cd600d3d3da681888b69858f61aa082798a4b827",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L6796"
        },
        {
          "anchor": "@@ -6825,7 +6852,7 @@ mod tests {",
          "oldStart": 6825,
          "newStart": 6852,
          "sha256": "a192694210616a40adf844a32e7055db4063b497f21303e4400147d4a7893f5c",
          "classification": "candidate-search-test-api-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Existing bounded test helper explicitly requests full diagnostic collection.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L6852"
        },
        {
          "anchor": "@@ -7391,7 +7418,7 @@ mod tests {",
          "oldStart": 7391,
          "newStart": 7418,
          "sha256": "4a7e486c511143ae55c19b99977da55bf43f831dbc8d686540b52617365c9e6f",
          "classification": "candidate-search-test-api-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Existing solver test uses complete-family API, not first-valid truncation.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L7418"
        },
        {
          "anchor": "@@ -7750,7 +7777,7 @@ mod tests {",
          "oldStart": 7750,
          "newStart": 7777,
          "sha256": "ef0998dbee8f467592e250b9c689112f2876c5c172bc0a693f2d7efa7279a7f6",
          "classification": "candidate-search-test-api-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Existing solver test uses complete-family API, not first-valid truncation.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L7777"
        },
        {
          "anchor": "@@ -7833,7 +7860,7 @@ mod tests {",
          "oldStart": 7833,
          "newStart": 7860,
          "sha256": "a3f28863b39ef1fe2187fd7bf745cbf146d1849c32f02778f7e6810bf7a15452",
          "classification": "candidate-search-test-api-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Existing solver test uses complete-family API, not first-valid truncation.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L7860"
        },
        {
          "anchor": "@@ -8661,6 +8688,7 @@ mod tests {",
          "oldStart": 8661,
          "newStart": 8688,
          "sha256": "849cb9ebca631aae64807b28ebeedb317b8b309f46b8f2b1307a8412adef68a1",
          "classification": "constrained-callback-test-initialization",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Existing direct candidate test construction has no original equality certificate.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L8688"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/paths.rs",
      "baseBlob": "3c2d1b37c5c869977927bbcca9858531252062e4",
      "candidateBlob": "ff25ad08db44c88c2421c21ae0e59aea54b48954",
      "frozenCandidateBlob": "4f1e911fd08eecd67b98126d6c902b4c0f85ee2b",
      "classification": "native-test-mechanical",
      "detail": "Construct SequentMap directly rather than field reassignment; same constraints.",
      "hunks": [
        {
          "anchor": "@@ -1430,16 +1430,20 @@ mod tests {",
          "oldStart": 1430,
          "newStart": 1430,
          "sha256": "73f76fe154364f4a6ba377e593e15f4988291ca7258031d4176cd2f79e9782f3",
          "classification": "native-test-mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/paths.rs#L1430"
        },
        {
          "anchor": "@@ -1583,13 +1587,20 @@ mod tests {",
          "oldStart": 1583,
          "newStart": 1587,
          "sha256": "6bc3194ac20c28383684a07f9ae55add87e1e7a73c71d01a7ca91f187f08b717",
          "classification": "native-test-mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/paths.rs#L1587"
        },
        {
          "anchor": "@@ -1731,20 +1742,22 @@ mod tests {",
          "oldStart": 1731,
          "newStart": 1742,
          "sha256": "4960cb036bcbc488b597833b7d93eee393830682cf3f0989d94a68ea1bfbec7d",
          "classification": "native-test-mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/paths.rs#L1742"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/projection.rs",
      "baseBlob": "abb53138550dde2b929e906b21a4a1f6fc9ecd7f",
      "candidateBlob": "0bc057aeee30521cc08f999a9eef2968d125e885",
      "frozenCandidateBlob": "4b4e873f266a6f3ff70801d3822da5f0bdc8ad50",
      "classification": "mechanical",
      "detail": "Group unchanged inferable/fixed/fallback specialization-search arguments. Final checkpoint explicitly reviewed changes: candidate-search-projection-import-migration, candidate-search-runtime-api-migration, candidate-search-shared-budget-migration, upstream-solve-extraction-fork-resource-composition. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -4,9 +4,9 @@ use rustc_hash::{FxHashMap, FxHashSet};",
          "oldStart": 4,
          "newStart": 4,
          "sha256": "704ba1a8b84b35822306181c8315bde49bb2bdd3ece7b7df4001b6396ff5b610",
          "classification": "candidate-search-projection-import-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Import existing new upstream search policy into fork shared-budget projection owner.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/projection.rs#L4"
        },
        {
          "anchor": "@@ -149,6 +149,52 @@ impl ProjectionTypeBudget {",
          "oldStart": 149,
          "newStart": 149,
          "sha256": "da9491b8435b3dbaa26faa06348a90cd97f5d4dcdfdf1ac7b59b21d61c4a5c51",
          "classification": "upstream-solve-extraction-fork-resource-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30653 extracts candidate solving; fork retains shared mutable limits, type charging and SpecializationCandidates scope data, rather than upstream independent budget resets.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/projection.rs#L149"
        },
        {
          "anchor": "@@ -175,14 +221,13 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 175,
          "newStart": 221,
          "sha256": "ea39c8944b56bf9e72a5b6ca8837c5915946ca1ab17aeafefd9b14c1ac4bbbe7",
          "classification": "candidate-search-shared-budget-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Bounded path collection receives explicit upstream search policy while returning remaining fork resources.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/projection.rs#L221"
        },
        {
          "anchor": "@@ -192,7 +237,7 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 192,
          "newStart": 237,
          "sha256": "99ebaeef2fb378d9f8444b3be140aaf5a09ded17f99058553c75de6a425dc1ce",
          "classification": "candidate-search-shared-budget-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Existing mutable-budget path owner accepts explicit search policy.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/projection.rs#L237"
        },
        {
          "anchor": "@@ -203,7 +248,7 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 203,
          "newStart": 248,
          "sha256": "545279438923e3f516c9c3d34112dcde4be6a7164a16083ddb09ddf6d6d27b10",
          "classification": "candidate-search-shared-budget-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Thread search choice into existing limited collector.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/projection.rs#L248"
        },
        {
          "anchor": "@@ -220,15 +265,18 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 220,
          "newStart": 265,
          "sha256": "db1bf400fce10e379c62d5c2f40d53552967f43dce0c201654bfb2a188e272ee",
          "classification": "mechanical",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/projection.rs#L265"
        },
        {
          "anchor": "@@ -260,8 +308,13 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 260,
          "newStart": 308,
          "sha256": "5bdb7d929f4e1509faf7b74ad60b8a898cd32561f736fcb5c5272ce25f94c6ac",
          "classification": "candidate-search-runtime-api-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Fixed-candidate validation explicitly requests full collection without diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/projection.rs#L308"
        },
        {
          "anchor": "@@ -450,35 +503,14 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 450,
          "newStart": 503,
          "sha256": "6b27f00554dd4af064f9d5c579b79719712d9cc4ae04c320c6b85e59c4e38f0f",
          "classification": "upstream-solve-extraction-fork-resource-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Projection calls the extracted solving owner with the same shared path/visit/type resources and All policy.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/projection.rs#L503"
        },
        {
          "anchor": "@@ -510,8 +542,13 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 510,
          "newStart": 542,
          "sha256": "5ddd459e84e1d16942ffc194a71e1244ea340f47feb6fe012a30b7ebd7de6f1e",
          "classification": "candidate-search-runtime-api-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Correlated solution fold explicitly requests All(Yes); no incomplete family accepted.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/projection.rs#L542"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/projection/tests.rs",
      "baseBlob": "44d97fe3efdc5564ddb0fd5458362aa27d1f6ce4",
      "candidateBlob": "69d6b99227ba34cab46490c1e6d141bef86bd573",
      "frozenCandidateBlob": "575b0a4997932702c8d6a3121cf1fcd0cc825ca2",
      "classification": "candidate-search-test-api-migration",
      "detail": "Maintained projection tests explicitly select complete candidate collection after official #30653; test code, not an independent runtime feature. Final checkpoint explicitly reviewed changes: candidate-search-test-api-migration. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -11,10 +11,10 @@ use super::{ProjectionError, ProjectionTypeBudget, SolutionBudget, SolutionProje",
          "oldStart": 11,
          "newStart": 11,
          "sha256": "cefd08cfdfb5784b90eb8d2c0f29754f43962df832c338f9c3fb4d234c85fa7c",
          "classification": "candidate-search-test-api-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Existing projection tests import explicit CandidateSearch policy.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/projection/tests.rs#L11"
        },
        {
          "anchor": "@@ -1266,7 +1266,13 @@ fn validation_shares_the_projection_visit_budget() {",
          "oldStart": 1266,
          "newStart": 1266,
          "sha256": "5dc7b6572aa296c75eadbb4a995d01b975d8edf92d0aa9ed4384835cc2d44a8f",
          "classification": "candidate-search-test-api-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Existing shared-visit-budget regression requests complete All(Yes) collection.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/projection/tests.rs#L1266"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/resolution.rs",
      "baseBlob": "d4f7bbfade36d6883f51486a13d87911f0313bb3",
      "candidateBlob": "1692aa7e20f3b53295b3e6036a472ba3439cc748",
      "frozenCandidateBlob": "283d0aafba0db582aa46d5322d7256b514a8d0ed",
      "classification": "closed-filter-union-resolution",
      "detail": "Follow positive union cycles through one dependent intersection factor while retaining closed positive/negative filters; reject inferable complements/multiple dependent factors and fail closed on shared projection budget exhaustion. New native controls require assertion-by-assertion current receipt reconciliation.",
      "hunks": [
        {
          "anchor": "@@ -4,7 +4,7 @@ use std::cell::{Cell, RefCell};",
          "oldStart": 4,
          "newStart": 4,
          "sha256": "2ea06e1e81fc0e69d1509bb265dac2350ca8f858ced6bcad00e9e1a5d692de69",
          "classification": "closed-filter-union-resolution",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/resolution.rs#L4"
        },
        {
          "anchor": "@@ -13,8 +13,8 @@ use crate::types::signatures::{Signature, walk_signature};",
          "oldStart": 13,
          "newStart": 13,
          "sha256": "b153ff4f95b78bbfe73f3157276b8704f96eb83d4be85a3c178b639943f2a02c",
          "classification": "closed-filter-union-resolution",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/resolution.rs#L13"
        },
        {
          "anchor": "@@ -58,12 +58,13 @@ pub(crate) fn resolve_merged_solution<'db>(",
          "oldStart": 58,
          "newStart": 58,
          "sha256": "3787bfc3242c0488ef1cc779d0cc2caa4e399355f8ca909c8a26ee700f3b7c42",
          "classification": "closed-filter-union-resolution",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/resolution.rs#L58"
        },
        {
          "anchor": "@@ -190,29 +191,118 @@ impl<'a, 'db> Resolver<'a, 'db> {",
          "oldStart": 190,
          "newStart": 191,
          "sha256": "dadc47186a8899863e85a756feead2c0be9111a13b7cfb1a88cfa19b90162420",
          "classification": "closed-filter-union-resolution",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/resolution.rs#L191"
        },
        {
          "anchor": "@@ -344,14 +434,15 @@ mod tests {",
          "oldStart": 344,
          "newStart": 434,
          "sha256": "e2f72fe84163bbf70dbf266d13723a2fd4565cee4462daac9873735bff776a5e",
          "classification": "closed-filter-union-resolution",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/resolution.rs#L434"
        },
        {
          "anchor": "@@ -425,6 +516,467 @@ mod tests {",
          "oldStart": 425,
          "newStart": 516,
          "sha256": "6bbee995eb384691bda99db3a590e12087972d59fb035ae8f09960955315e931",
          "classification": "closed-filter-union-resolution",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/resolution.rs#L516"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/solutions.rs",
      "baseBlob": "5e58e5a8988ee4f6cf30ec640d900bc0796285db",
      "candidateBlob": "cb3fe895d3b3e73b3cfa14713357c71162f75510",
      "frozenCandidateBlob": "b01cb32c984e3e7d26859ba40175272d82aa1205",
      "classification": "fixed-variable-lazy-proof",
      "detail": "Ordinary terminal path avoids a redundant bounded visit; fixed caller bounds use Lazy constraint-set relation rather than eager assignment. Final checkpoint explicitly reviewed changes: candidate-search-import-migration, constrained-callback-original-equality-witness, upstream-first-valid-walker, upstream-first-valid-walker-fork-validation-composition. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -18,10 +18,10 @@ use crate::types::constraints::variables::{",
          "oldStart": 18,
          "newStart": 18,
          "sha256": "f87a0cc400ddb7055d363c6d9671e315f12314085d6197c4d60f900cc44cfad1",
          "classification": "candidate-search-import-migration",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Import upstream search mode alongside retained fork residual/source-order owners.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/solutions.rs#L18"
        },
        {
          "anchor": "@@ -200,6 +200,7 @@ pub(super) struct SolutionWalker<'db, L> {",
          "oldStart": 200,
          "newStart": 200,
          "sha256": "91f5f021c3bfdf9a796d64d52e9871db8950eb91e4df747b40da9ed6841522a7",
          "classification": "upstream-first-valid-walker",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30653 stores walker first-valid policy.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/solutions.rs#L200"
        },
        {
          "anchor": "@@ -270,6 +271,7 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 270,
          "newStart": 271,
          "sha256": "928bae3cdfbd64ba080e453fb7a0a8ba238d8ce1230478523c9b2a5a84736fa4",
          "classification": "upstream-first-valid-walker",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30653 defaults to complete candidate search.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/solutions.rs#L271"
        },
        {
          "anchor": "@@ -287,6 +289,11 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 287,
          "newStart": 289,
          "sha256": "474ccc171ff9eec88fdb45f39e5b8d766081b0f88c6fbd579fbcc255776829fd",
          "classification": "upstream-first-valid-walker",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30653 opts into first-valid through explicit search mode.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/solutions.rs#L289"
        },
        {
          "anchor": "@@ -606,6 +613,15 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 606,
          "newStart": 613,
          "sha256": "2b75553b9673887fae404b3c294f1e084d8ae6dd55aed1bb56e4c50ff3a0d531",
          "classification": "upstream-first-valid-walker-fork-validation-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30653 stops only between nodes after a whole valid terminal; fork preserves existing sequent, residual, domain and budget paths.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/solutions.rs#L613"
        },
        {
          "anchor": "@@ -1657,6 +1673,9 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 1657,
          "newStart": 1673,
          "sha256": "3e5f8fa2fc86873f1c93da0d221d32bd6d277b2978e17e1b01c9503f037cbe2e",
          "classification": "fixed-variable-lazy-proof",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1673"
        },
        {
          "anchor": "@@ -1798,7 +1817,9 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 1798,
          "newStart": 1817,
          "sha256": "ff617f767b8c99256a07c17966f797025b34eae1e15c150e0c4b7f871ce4ad2a",
          "classification": "fixed-variable-lazy-proof",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1817"
        },
        {
          "anchor": "@@ -2164,6 +2185,10 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 2164,
          "newStart": 2185,
          "sha256": "9548a0ccc892ea27c5529aeef21a36176c8ebad2b5ce3fd31db272fe02491636",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "explicit-current-source-review",
          "reviewNote": "A caller equality is preservable only when existing caller-domain specialization proof accepts the bound variable.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/solutions.rs#L2185"
        },
        {
          "anchor": "@@ -2199,7 +2224,9 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 2199,
          "newStart": 2224,
          "sha256": "ec904d8e3aa143a75b08053da7b1fe98c8756d11d71b3cd63293c63d77baf545",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Exactly one currently compatible alternative may still retain a certified caller family; ordinary one-alternative evidence remains on old path.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/solutions.rs#L2224"
        },
        {
          "anchor": "@@ -2270,13 +2297,15 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 2270,
          "newStart": 2297,
          "sha256": "e665223e280cf6b2178d6c066b2914db90c00e2b7751b00727386f12eb57a49d",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Single-alternative certified family still runs full path processing; no concrete arm is promoted as a universal witness.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/solutions.rs#L2297"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/variables.rs",
      "baseBlob": "3a3d4f26dc836b3699d1e4b5e94159cb554a17ef",
      "candidateBlob": "25af26226bbc72350a9c38c49979268012ac1ed0",
      "frozenCandidateBlob": "f0f976decdfdea59036db1a10d2967b6319887cb",
      "classification": "alias-typevar-bound",
      "detail": "Resolve type aliases whose target is a TypeVar before storing atomic concrete bounds.",
      "hunks": [
        {
          "anchor": "@@ -537,6 +537,13 @@ impl<'db> AtomicConstraint<'db> {",
          "oldStart": 537,
          "newStart": 537,
          "sha256": "c3b6f36ccccbe7014beccccebf931f4a5ac20b989db491b08e078caddfa291b7",
          "classification": "alias-typevar-bound",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/variables.rs#L537"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/diagnostic.rs",
      "baseBlob": "c0ef04a38e4bb4aeb1775ccda61517fa12e00f5d",
      "candidateBlob": "b8c02bae987e705bf213d13815ceaa6e27f4da74",
      "frozenCandidateBlob": "73a0014c34015f2788e5925d647a0874dcfa2393",
      "classification": "lint-policy",
      "detail": "Document SourceFile Eq/Hash cache behavior for diagnostic keys. Constructor-specific name diagnostics and their reporting API are upstream migrations. The diagnostic-position map also retains a fork Clippy annotation for SourceFile hashing. Upstream #30630 locates an invalid type-parameter-order diagnostic through expanded class-base entries rather than indexing the original bases.",
      "hunks": [
        {
          "anchor": "@@ -142,6 +142,14 @@ pub(crate) fn register_lints(registry: &mut LintRegistryBuilder) {",
          "oldStart": 142,
          "newStart": 142,
          "sha256": "fa2570bbf9fb204b89f82dfa85fd62af7f1b3ef0d5922133dcd74eac6afa1805",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/diagnostic.rs#L142"
        },
        {
          "anchor": "@@ -751,10 +759,87 @@ declare_lint! {",
          "oldStart": 751,
          "newStart": 759,
          "sha256": "031bd955ed94cb32a25e30a135839799cebe6584e9e6f3e11c7f4c0dc5872882",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/diagnostic.rs#L759"
        },
        {
          "anchor": "@@ -1692,14 +1777,15 @@ enum SharedBodyDiagnostic {",
          "oldStart": 1692,
          "newStart": 1777,
          "sha256": "2432a98aa5c98eeefe4aa669ad62233fa9f332ed310585a91d03265c1cbf65d4",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/diagnostic.rs#L1777"
        },
        {
          "anchor": "@@ -1710,7 +1796,7 @@ pub(crate) fn report_mismatched_type_name<'db>(",
          "oldStart": 1710,
          "newStart": 1796,
          "sha256": "5fd15a2736d61407df2b9188fb8356cc56815f1fd02f991920792a23a1708c84",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/diagnostic.rs#L1796"
        },
        {
          "anchor": "@@ -1776,6 +1862,10 @@ impl TypeCheckDiagnostics {",
          "oldStart": 1776,
          "newStart": 1862,
          "sha256": "aec8db5a460b9a5f588ceaf827c4d3fb2d3042b47c19c5d4b35f6091cad4180b",
          "classification": "mechanical-clippy-qualification",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/diagnostic.rs#L1862"
        },
        {
          "anchor": "@@ -5236,19 +5326,17 @@ pub(crate) fn report_cannot_delete_typed_dict_key<'db>(",
          "oldStart": 5236,
          "newStart": 5326,
          "sha256": "820acd9f69097338c5e5000d0525cf2ba2ca489179f41e5d425b10a29f679435",
          "classification": "upstream-expanded-class-base-diagnostic",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/diagnostic.rs#L5326"
        },
        {
          "anchor": "@@ -5259,9 +5347,8 @@ pub(crate) fn report_invalid_type_param_order<'db>(",
          "oldStart": 5259,
          "newStart": 5347,
          "sha256": "06f6c481f6c6b04d6392acad28041c2b02a43b53ecaa811112d84847ab9c7384",
          "classification": "upstream-expanded-class-base-diagnostic",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/diagnostic.rs#L5347"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/dictionary/contents.rs",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "f2dae47eace1122d52e881e45d37c4a1e6bb2fb2",
      "frozenCandidateBlob": "ac931070ff697e48567e61c3c541844c51b62d75",
      "classification": "captured-keyword-key-iteration",
      "detail": "Keep captured keyword dictionary identity when all direct uses only iterate immutable keys; other argument/callee mentions retain exposure. Adds Salsa lint justification. Fresh argument and frozen exported-field recovery admit Add only when both cached operand types have exact builtin-string runtime classes. Existing has_exact_runtime_class excludes open str and custom subclasses; child traversal still rejects calls, assignment expressions and other operators. Class finality is a semantic query, not a query-free purity assertion. Current forward hunks additionally cover: dictionary-comprehension-body-domain-propagation. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -26,7 +26,7 @@ use crate::Db;",
          "oldStart": 26,
          "newStart": 26,
          "sha256": "7a385a17b3c59417752ff72e3b07e9f4cbca1c4f6fac2eadb439d6ae6cf06f1e",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L26"
        },
        {
          "anchor": "@@ -607,7 +607,7 @@ fn definition_contents_in_domain<'db>(",
          "oldStart": 607,
          "newStart": 607,
          "sha256": "c41457bb644e5e07e57eab4401ac1a9f4cd76a9243e412de03bc0ca9da79b119",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L607"
        },
        {
          "anchor": "@@ -624,7 +624,7 @@ fn infer_definition_contents<'db>(",
          "oldStart": 624,
          "newStart": 624,
          "sha256": "7a3ceca40c51538a51327bb607bb19c1d4441ba53a66e9cecfcdc75a64ffa1e3",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L624"
        },
        {
          "anchor": "@@ -994,7 +994,7 @@ fn initial_contents<'db>(",
          "oldStart": 994,
          "newStart": 994,
          "sha256": "695fe91c9b059d8b373205f77850a4a98687b0bbaefd8c50295af1b58db7d42b",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L994"
        },
        {
          "anchor": "@@ -1137,6 +1137,10 @@ fn frozen_export_contents<'db>(",
          "oldStart": 1137,
          "newStart": 1137,
          "sha256": "7bef3b65afd1b4538edf0eedac5dfb649b3d2c9b111c03db30c0bba63a048c7f",
          "classification": "captured-keyword-key-iteration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1137"
        },
        {
          "anchor": "@@ -1188,15 +1192,18 @@ fn frozen_exported_field_contents<'db>(",
          "oldStart": 1188,
          "newStart": 1192,
          "sha256": "6de8edff886557560a6b9cb3bef39366d9286eac96cc17c0b9e93d805320d9da",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1192"
        },
        {
          "anchor": "@@ -1246,7 +1253,12 @@ fn frozen_exported_field_contents<'db>(",
          "oldStart": 1246,
          "newStart": 1253,
          "sha256": "0d414ce91b5bbd8c55267a672f9ed538658189aebc5bb991fcceda0205cd897e",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1253"
        },
        {
          "anchor": "@@ -1255,10 +1267,39 @@ fn inert_field_argument(expression: &ast::Expr) -> bool {",
          "oldStart": 1255,
          "newStart": 1267,
          "sha256": "e56340a93871570f15e05c406bb87122ed12dde527ffeb72de6708da60bc55e0",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1267"
        },
        {
          "anchor": "@@ -1583,7 +1624,7 @@ fn operation_contents<'db>(",
          "oldStart": 1583,
          "newStart": 1624,
          "sha256": "a5996912b9286944413ff937a68c9a84bfe10ef2b3e146dd3a28c323c5d24e90",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1624"
        },
        {
          "anchor": "@@ -1594,6 +1635,37 @@ fn operation_contents<'db>(",
          "oldStart": 1594,
          "newStart": 1635,
          "sha256": "63fdb6721fdc7b0691ccf5f7a28e74d649c0b59789735921469d628b22c75975",
          "classification": "captured-keyword-key-iteration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1635"
        },
        {
          "anchor": "@@ -1755,7 +1827,7 @@ fn mapping_transfer<'db>(",
          "oldStart": 1755,
          "newStart": 1827,
          "sha256": "51a6ac9c23c3cfb150fdded3eaeb42aaa236137a98db917d35e6f2ce8d5da12f",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1827"
        },
        {
          "anchor": "@@ -1913,18 +1985,12 @@ fn mapping_transfer<'db>(",
          "oldStart": 1913,
          "newStart": 1985,
          "sha256": "3817639a8f6d9e809b6e6120f30df408f2e661c40f2c24d931fd209a626831bd",
          "classification": "captured-keyword-key-iteration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1985"
        },
        {
          "anchor": "@@ -2603,8 +2669,11 @@ pub(crate) fn needs_call_snapshot<'db>(",
          "oldStart": 2603,
          "newStart": 2669,
          "sha256": "ce2c08bccfd015331318bedee065b8dd43846008ceddb3aca71f645964a5dfc0",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L2669"
        },
        {
          "anchor": "@@ -2619,7 +2688,6 @@ pub(crate) fn needs_call_snapshot<'db>(",
          "oldStart": 2619,
          "newStart": 2688,
          "sha256": "9b3eb4e80d7bb855faf2ca0edd9be549dad57c0c0090879d873be8b73aad91ef",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L2688"
        },
        {
          "anchor": "@@ -2922,13 +2990,15 @@ pub(crate) fn fresh_argument_items<'db>(",
          "oldStart": 2922,
          "newStart": 2990,
          "sha256": "0aa16d81e7eea46c4d250e5b613786d46d2f84f4a0a21c093178eacba8eadadf",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L2990"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/dictionary/records.rs",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "a1b50679b74a22592f35d50fd81071a308f7e7f3",
      "frozenCandidateBlob": "af23074d6467561da6bbd4325055bde8f6e16a65",
      "classification": "mechanical",
      "detail": "Equivalent predicate let-else.",
      "hunks": [
        {
          "anchor": "@@ -177,9 +177,8 @@ fn producers<'db, 'ast>(",
          "oldStart": 177,
          "newStart": 177,
          "sha256": "48b7610e3b03d16ffdc56713c9f4103dff8fc95e34271fee33086e3833ccd562",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/records.rs#L177"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/display.rs",
      "baseBlob": "7a1ab4668c8ed230dd77d19cf5af9b351bca6ce2",
      "candidateBlob": "b8790939d87f1f15f96b987ad7f12555e4a2743d",
      "frozenCandidateBlob": "372e5531b14fc9e1f364d77d5b1145ac77ee5148",
      "classification": "lint-policy",
      "detail": "Document independent boolean rendering settings.",
      "hunks": [
        {
          "anchor": "@@ -131,6 +131,10 @@ enum NumericTowerDisplay {",
          "oldStart": 131,
          "newStart": 131,
          "sha256": "1f5554e7dd27cd79b50135b6877ca1c318d1c15379cb50d998e43f93c3bffd71",
          "classification": "lint-policy",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/display.rs#L131"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/enums.rs",
      "baseBlob": "197dd3b736cd76bb5a1dfbd870e9327820c71f43",
      "candidateBlob": "787e6dad46e4d425afd4419eb3a5e506b9559431",
      "frozenCandidateBlob": "356e7606b91b91413cbe346deda486ed7bbb0ceb",
      "classification": "upstream-enum-name-index",
      "detail": "Official #30634 ordered member-name indexing; fork enum/provided integrations remain separately attributed, not a new enum cache PR. Final checkpoint explicitly reviewed changes: upstream-enum-name-index. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -1,3 +1,5 @@",
          "oldStart": 1,
          "newStart": 1,
          "sha256": "0ab6e3d3a25f018d7c3276b7efd94d8c57cddd67b589b804674e8aa1f2f0f872",
          "classification": "upstream-enum-name-index",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30634 owns ordered name-to-member map and canonical alias lookup; no fork enum enhancement.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/enums.rs#L1"
        },
        {
          "anchor": "@@ -7,7 +9,7 @@ use smallvec::SmallVec;",
          "oldStart": 7,
          "newStart": 9,
          "sha256": "e8a87c912757ceca80378ebbbff8e030192db4bbc5fed510ee2352eab9e4b1a3",
          "classification": "upstream-enum-name-index",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30634 owns ordered name-to-member map and canonical alias lookup; no fork enum enhancement.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/enums.rs#L9"
        },
        {
          "anchor": "@@ -304,7 +306,7 @@ pub struct EnumClassLiteral<'db> {",
          "oldStart": 304,
          "newStart": 306,
          "sha256": "1c43edd8c7bd210f7aacbd7e3ca6eb4836fc500773f1e9228c947449fb8b5262",
          "classification": "upstream-enum-name-index",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30634 owns ordered name-to-member map and canonical alias lookup; no fork enum enhancement.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/enums.rs#L306"
        },
        {
          "anchor": "@@ -334,15 +336,11 @@ fn enum_class_literal<'db>(",
          "oldStart": 334,
          "newStart": 336,
          "sha256": "76a7ab946c0301bdd41d12d7320de14507c9bf6c0af191abaaec2782196dc17e",
          "classification": "upstream-enum-name-index",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30634 owns ordered name-to-member map and canonical alias lookup; no fork enum enhancement.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/enums.rs#L336"
        },
        {
          "anchor": "@@ -372,12 +370,16 @@ impl<'db> EnumClassLiteral<'db> {",
          "oldStart": 372,
          "newStart": 370,
          "sha256": "1bf11966f3fc3923f861adee5f54a7040508e1276970de74f8d21a1fe877eb4a",
          "classification": "upstream-enum-name-index",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30634 owns ordered name-to-member map and canonical alias lookup; no fork enum enhancement.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/enums.rs#L370"
        },
        {
          "anchor": "@@ -386,7 +388,7 @@ impl<'db> EnumClassLiteral<'db> {",
          "oldStart": 386,
          "newStart": 388,
          "sha256": "80e216405c5778af30f61834ef35cb876e33e46b581eb62dea9a28bed6a5929f",
          "classification": "upstream-enum-name-index",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30634 owns ordered name-to-member map and canonical alias lookup; no fork enum enhancement.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/enums.rs#L388"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/generics.rs",
      "baseBlob": "799b913d06d2de4b1d3b16f3d399c2bf11d69e02",
      "candidateBlob": "578607a4caeb29ed188afa47288577a9ef809ea9",
      "frozenCandidateBlob": "80b2f191604416923364bd9f06057eaa70f3c304",
      "classification": "mixed-existing-solver-and-upstream-api",
      "detail": "Preserve solver relation-owner handling; cached API migration; group unchanged specialization-search arguments.",
      "hunks": [
        {
          "anchor": "@@ -12,7 +12,7 @@ use crate::types::callable::walk_callable_type;",
          "oldStart": 12,
          "newStart": 12,
          "sha256": "6615fe3f27b62e1a505f2750fc4f9bc870db55c8fd9e202e6d5642f1620ce902",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/generics.rs#L12"
        },
        {
          "anchor": "@@ -3127,8 +3127,7 @@ impl<'db, 'c> SpecializationBuilder<'db, 'c> {",
          "oldStart": 3127,
          "newStart": 3127,
          "sha256": "1577bd513a2b3ea143714d262284b08ce1931bb9bb9aa4222cd5f01277964594",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/generics.rs#L3127"
        },
        {
          "anchor": "@@ -3535,7 +3534,7 @@ impl<'db, 'c> SpecializationBuilder<'db, 'c> {",
          "oldStart": 3535,
          "newStart": 3534,
          "sha256": "a1a117c10a3441d9106d8f6f2b565d355771b24d49dd6dea0a20bb47e07e8f7a",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/generics.rs#L3534"
        },
        {
          "anchor": "@@ -3608,9 +3607,12 @@ impl<'db, 'c> SpecializationBuilder<'db, 'c> {",
          "oldStart": 3608,
          "newStart": 3607,
          "sha256": "17b4fddb9e5fb12bf5420adf20e3650453a916c8df559d73d85311117885953b",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/generics.rs#L3607"
        },
        {
          "anchor": "@@ -3648,7 +3650,6 @@ impl<'db, 'c> SpecializationBuilder<'db, 'c> {",
          "oldStart": 3648,
          "newStart": 3650,
          "sha256": "58845bf1e1f2133fd564e26ab86d7986967564d15ac8fc65f12967c63bb62675",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/generics.rs#L3650"
        },
        {
          "anchor": "@@ -5009,14 +5010,8 @@ impl<'db, 'c> SpecializationBuilder<'db, 'c> {",
          "oldStart": 5009,
          "newStart": 5010,
          "sha256": "6ad43c32e497e9adc605d8d58e39ec62968d6e9ce65965d97853d8861192a09a",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/generics.rs#L5010"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/ide_support/unreachable_code.rs",
      "baseBlob": "c58081a08aeb6a73974991df3d07e3954267f50c",
      "candidateBlob": "d96a5916088327b9f683ce1fe5cc5794e73e1718",
      "frozenCandidateBlob": "34686158de1d27a3ca40395676ca6c58a44fb029",
      "classification": "checked-write-controls",
      "detail": "Use actual SemanticModel/check_file with fresh DB and expression/reachability query orders; flat contextual writes, declared nested RHS exact types, callable diagnostics and invalid writes. Rename canonical missing-attribute ID. A four-query-order incremental regression preserves caller K/V through aliases and reordered unions in later dictionary contexts.",
      "hunks": [
        {
          "anchor": "@@ -265,6 +265,115 @@ mod tests {",
          "oldStart": 265,
          "newStart": 265,
          "sha256": "7d1c5b32e8c5025c69303de00e29cd58e7a3d219f3845f333c304cce433c4ebc",
          "classification": "collection-context-query-order-regression",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/ide_support/unreachable_code.rs#L265"
        },
        {
          "anchor": "@@ -356,13 +465,27 @@ mod tests {",
          "oldStart": 356,
          "newStart": 465,
          "sha256": "65faa5a5461aa9c29c9c4c2a3231c8c3a7fc64a1dc4b73035c81f42856975c07",
          "classification": "checked-write-controls",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/ide_support/unreachable_code.rs#L465"
        },
        {
          "anchor": "@@ -380,8 +503,157 @@ mod tests {",
          "oldStart": 380,
          "newStart": 503,
          "sha256": "72b6ac59b0dfbdc2457225d1fa7d0c5888bbd30bd3f370543edfa98ef3de2281",
          "classification": "checked-write-controls",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/ide_support/unreachable_code.rs#L503"
        },
        {
          "anchor": "@@ -433,10 +705,7 @@ mod tests {",
          "oldStart": 433,
          "newStart": 705,
          "sha256": "ebcf2e4cb0b21cf581c6bd658e9d7e0e420908b66c094171506cf8019a6e04cf",
          "classification": "checked-write-controls",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/ide_support/unreachable_code.rs#L705"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer.rs",
      "baseBlob": "e89d3937c3778b94e6aba663e84b7cdc92e26c9e",
      "candidateBlob": "5c0f11102d29947d81b58786d0e335164a042721",
      "frozenCandidateBlob": "7017a7ac52794c398805f43b180bf50e21c58bca",
      "classification": "dictionary-comprehension-body-domain-propagation",
      "detail": "Routes scope, definition, expression, statement and unpack inference through a domain-keyed owner only for lexically contained dictionary comprehensions. Ordinary inference remains the fallback outside that domain. Current forward hunks additionally cover: dictionary-comprehension-body-domain-propagation. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -653,7 +653,7 @@ pub(crate) fn infer_predicate_truthiness<'db>(",
          "oldStart": 653,
          "newStart": 653,
          "sha256": "82923418ceffdecce006c84ad7e028cf9c0c40f84999befbd38bed04091597c1",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer.rs#L653"
        },
        {
          "anchor": "@@ -831,13 +831,39 @@ pub(super) fn infer_statement_types<'db>(",
          "oldStart": 831,
          "newStart": 831,
          "sha256": "01c91c7bf3c4fb81abdb54520bbd86b44167116af677680d4d8a9dd835bcf6d5",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer.rs#L831"
        },
        {
          "anchor": "@@ -850,7 +876,7 @@ pub(crate) fn infer_expression_with_body_domain<'db>(",
          "oldStart": 850,
          "newStart": 876,
          "sha256": "d412e8e341f7f65e2cb9d549f2bd5c345f8a366ca10f38e00d89480c4008cc20",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer.rs#L876"
        },
        {
          "anchor": "@@ -872,7 +898,7 @@ pub(crate) fn infer_statement_with_body_domain<'db>(",
          "oldStart": 872,
          "newStart": 898,
          "sha256": "7ae404b671b2bb36461548c14da069ad22f158f1bf5d08eda4661eb92cb8c302",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer.rs#L898"
        },
        {
          "anchor": "@@ -977,7 +1003,7 @@ impl<'db> InferExpression<'db> {",
          "oldStart": 977,
          "newStart": 1003,
          "sha256": "1bdd4c3c698278c208d06b90083ce7585a1051ee6dd054ccca7399687ed4d176",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer.rs#L1003"
        },
        {
          "anchor": "@@ -1026,6 +1052,14 @@ impl<'db> InferScope<'db> {",
          "oldStart": 1026,
          "newStart": 1052,
          "sha256": "6f9f6a565f648848aa7bf6e5faa95b3600060f68b479e10b4f7d46704e35ad83",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer.rs#L1052"
        },
        {
          "anchor": "@@ -1037,7 +1071,8 @@ pub(super) fn infer_unpack_types<'db>(db: &'db dyn Db, unpack: Unpack<'db>) -> U",
          "oldStart": 1037,
          "newStart": 1071,
          "sha256": "5e4ad76053702fce1bfae261bc7a38747dc7b1c76f3097e9273a53ece434fed3",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer.rs#L1071"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/body_domain.rs",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "d6e9bbb074e893cf0586ada96f668dce38f60cc8",
      "frozenCandidateBlob": "78adfbd099d048a14a51e6c7dd58cdc9bc01ae12",
      "classification": "body-domain-checkpoint-regression",
      "detail": "Retain prior mechanical cleanups and strengthen the terminal-call domain test with a saved Boolean and 32 calls; assert that a body-domain reachability checkpoint actually executes. Current forward hunks additionally cover: dictionary-comprehension-body-domain-propagation. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim. Final checkpoint explicitly reviewed changes: dictionary-comprehension-body-domain-propagation, dictionary-comprehension-domain-regression, dictionary-method-evidence-domain-composition, dictionary-method-evidence-mutation-boundary, dictionary-method-override-refusal-regression. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -1,16 +1,16 @@",
          "oldStart": 1,
          "newStart": 1,
          "sha256": "17b42a637412ca5c1c348e991cd744fa224db5bc616c394f056c6b08bd5f6220",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1"
        },
        {
          "anchor": "@@ -175,11 +175,31 @@ impl<'db> OverloadBodyView<'db> {",
          "oldStart": 175,
          "newStart": 175,
          "sha256": "42c68baa9a8afb4a04bbcf6fa824297d24baa90642ad890188e0287108eba120",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L175"
        },
        {
          "anchor": "@@ -187,7 +207,10 @@ impl<'db> OverloadBodyView<'db> {",
          "oldStart": 187,
          "newStart": 207,
          "sha256": "c00991a74dbec1fbab3b4034c3c98f1d65150c88b6a11c0c79d46a4b0dc35d58",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L207"
        },
        {
          "anchor": "@@ -201,10 +224,16 @@ impl<'db> OverloadBodyView<'db> {",
          "oldStart": 201,
          "newStart": 224,
          "sha256": "2ac95a05d0c7de8f3d5cc960454cc06eea9d25e1c72910ee69e7eff13eb53ebc",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L224"
        },
        {
          "anchor": "@@ -269,6 +298,25 @@ impl<'db> FunctionBodyDomain<'db> {",
          "oldStart": 269,
          "newStart": 298,
          "sha256": "24759674dd40a52d0c7389a34111a622773478fc1092ceebf32e128ef3a11884",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L298"
        },
        {
          "anchor": "@@ -412,7 +460,10 @@ fn prepare_body_domain<'db>(",
          "oldStart": 412,
          "newStart": 460,
          "sha256": "193c13f62446636bece7054094040c636f4250bf12c529743a28d2573fec4fec",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L460"
        },
        {
          "anchor": "@@ -421,10 +472,18 @@ fn prepare_body_domain<'db>(",
          "oldStart": 421,
          "newStart": 472,
          "sha256": "27b565bae215921acfd2b8c5a6914ce394f1307ac0ad78ea7a3c8ed9e0177dbc",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L472"
        },
        {
          "anchor": "@@ -432,7 +491,24 @@ fn prepare_body_domain<'db>(",
          "oldStart": 432,
          "newStart": 491,
          "sha256": "ab711adc4939fcfa4ed2d49c58a08244f7e464063cb90f796a6cc1774a06fd34",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L491"
        },
        {
          "anchor": "@@ -444,13 +520,7 @@ fn project_body_parameters<'db>(",
          "oldStart": 444,
          "newStart": 520,
          "sha256": "57d6a2b6efbda825cb3824b16c877b80dbbc39cae1d9633837dcadf772c3b2f4",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L520"
        },
        {
          "anchor": "@@ -635,7 +705,10 @@ fn project_body_parameters<'db>(",
          "oldStart": 635,
          "newStart": 705,
          "sha256": "2f3e05abdc8d3978a87365ed0d8edf210c34ef26539c9cc6ecf272e07c84f402",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L705"
        },
        {
          "anchor": "@@ -644,6 +717,7 @@ fn supported_body(",
          "oldStart": 644,
          "newStart": 717,
          "sha256": "03d23c2d0ceee5d586e28cbe1e910105f43e01818c6d6899ee5ba36cf5ee3adc",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L717"
        },
        {
          "anchor": "@@ -653,7 +727,7 @@ fn supported_body(",
          "oldStart": 653,
          "newStart": 727,
          "sha256": "ec3532abf506196a15728bcb8241c5aed9dc63c7e6eaa75758e1506abf30204e",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L727"
        },
        {
          "anchor": "@@ -796,14 +870,113 @@ fn supported_body(",
          "oldStart": 796,
          "newStart": 870,
          "sha256": "fcff8f34f98e5beda9d388cef749bb445dca0608cc380b6b32df1c850779b70c",
          "classification": "dictionary-method-evidence-domain-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Read-only get/items admission proves every union arm and every present intersection member canonical builtin identity or actual TypedDict synthesis. Domain-specific unreachable calls keep ordinary preflight responsibility.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L870"
        },
        {
          "anchor": "@@ -815,24 +988,25 @@ fn supported_body(",
          "oldStart": 815,
          "newStart": 988,
          "sha256": "eae3ea5085bb4f8b82c4a28cd728b2d19604b15469a512aa556ead00f70037ca",
          "classification": "dictionary-method-evidence-mutation-boundary",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Read-only items admitted; mutation still requires original function scope plus fresh receiver, not comprehension-local alias mutation.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L988"
        },
        {
          "anchor": "@@ -846,15 +1020,113 @@ fn supported_body(",
          "oldStart": 846,
          "newStart": 1020,
          "sha256": "89384813b8de643c8da2e9815cbf50ae93695e77018b980addc0c9e0bf53cc05",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Shared method proof checks receiver components; lexical comprehension target/callee shadowing, outer first iterator and scoped later iterators retain per-domain inference.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1020"
        },
        {
          "anchor": "@@ -868,46 +1140,49 @@ fn supported_body(",
          "oldStart": 868,
          "newStart": 1140,
          "sha256": "86450d89e65886530f40ea4e2421f96a5ad562391662d8903c76c3b33184c2e3",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1140"
        },
        {
          "anchor": "@@ -928,8 +1203,8 @@ fn supported_body(",
          "oldStart": 928,
          "newStart": 1203,
          "sha256": "9523e6ea8b712dde7de49b4c41e2e5c2f178a5f4eedae9749efe2442781dabbb",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1203"
        },
        {
          "anchor": "@@ -941,12 +1216,10 @@ fn supported_body(",
          "oldStart": 941,
          "newStart": 1216,
          "sha256": "6eef430af2eb448a691e762b18c76171132206972438b4bd8f6506414c0bacb8",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1216"
        },
        {
          "anchor": "@@ -954,19 +1227,21 @@ fn supported_body(",
          "oldStart": 954,
          "newStart": 1227,
          "sha256": "fd528fe4f1b3990a2845ffcfd13964d951615d9cee554e75b7beececb233c33d",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1227"
        },
        {
          "anchor": "@@ -1052,7 +1327,7 @@ fn supported_body(",
          "oldStart": 1052,
          "newStart": 1327,
          "sha256": "611d9153fe9ee0e0f47957640a9345a590609cbb4c1cbc7b6f015a20d95d69ed",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1327"
        },
        {
          "anchor": "@@ -1061,15 +1336,50 @@ fn supported_body(",
          "oldStart": 1061,
          "newStart": 1336,
          "sha256": "88a427e3d1418849542e0091b090cc63e740ae948d80844f73be5701577295ce",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1336"
        },
        {
          "anchor": "@@ -1161,6 +1471,84 @@ mod tests {",
          "oldStart": 1161,
          "newStart": 1471,
          "sha256": "c0a084cade3dec409a9c11adcb4942dbdfe15e22acf0c629f670c3bf7141c27c",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1471"
        },
        {
          "anchor": "@@ -1711,6 +2099,93 @@ mod tests {",
          "oldStart": 1711,
          "newStart": 2099,
          "sha256": "e5ceb6a9892c9c96a9bdb2bb51dd7a1df1cfb79410255397ceacb18927c39a7d",
          "classification": "dictionary-comprehension-domain-regression",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Maintained positive/wrong-key/wrong-value tests check repeated overload-domain order, nested comprehensions and mixed nominal/TypedDict receiver methods.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L2099"
        },
        {
          "anchor": "@@ -1741,6 +2216,28 @@ mod tests {",
          "oldStart": 1741,
          "newStart": 2216,
          "sha256": "1a58c4141f2ddffb7d9fdbf215d0098e8a125a9c91c0264408396ae454e32722",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L2216"
        },
        {
          "anchor": "@@ -1852,6 +2349,44 @@ mod tests {",
          "oldStart": 1852,
          "newStart": 2349,
          "sha256": "6ef49dcd0294aa754d4fa6006078146e75a213d425f87c73d5c59b22dcdff9d1",
          "classification": "dictionary-method-override-refusal-regression",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Maintained controls reject overridden get/items, including any unsupported union arm; ordinary builtin domain stays checked.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L2349"
        },
        {
          "anchor": "@@ -2412,7 +2947,10 @@ mod tests {",
          "oldStart": 2412,
          "newStart": 2947,
          "sha256": "8ecfa733bde5a81f5c31f03bb48b7b072a529c053a71580d67a1490ae218a5ef",
          "classification": "mechanical",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L2947"
        },
        {
          "anchor": "@@ -2750,20 +3288,12 @@ mod tests {",
          "oldStart": 2750,
          "newStart": 3288,
          "sha256": "6d42729311e7132e60ce9509cd43dd3bba6e668fd20c514311d40180702e1f21",
          "classification": "body-domain-checkpoint-regression",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L3288"
        },
        {
          "anchor": "@@ -2774,6 +3304,17 @@ mod tests {",
          "oldStart": 2774,
          "newStart": 3304,
          "sha256": "0314355f8cdf3d157dec9df3e47e83cbc016bf4f7e1e809af6329e3810913a87",
          "classification": "body-domain-checkpoint-regression",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L3304"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder.rs",
      "baseBlob": "32dea63315b3e56f71b7630c37d323edbfd5a16e",
      "candidateBlob": "fbd17433ac43b904172d5ddc25298b9fc1bd2524",
      "frozenCandidateBlob": "c92d970edcc3aea8a3b2fd02fd2b6c4b8376b9ad",
      "classification": "mixed-inference-context-owners",
      "detail": "Commit one lambda inference when all actual TypeContexts including kind agree; retain default plus every raw/ParamSpec key. Separate cached API and lint-policy migration hunks. Upstream factory-name inference and constructor-specific diagnostics are composed with the existing shared-argument-context change. Empty collections prefer complete, static invariant contexts agreed by their later consumers; conditional specializations of caller variables are not substitutes for those contexts. Comparison inference also consults the native type-tag impossibility owner for either operand order before ordinary comparison inference; it reuses already inferred operand types. Fresh mapping recovery receives cached expression types for exact builtin-string operand checks; no new operand inference is performed. Current forward hunks additionally cover: dictionary-comprehension-body-domain-propagation, sibling-dependent-empty-getattr-context-replay. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -34,7 +34,8 @@ use super::{",
          "oldStart": 34,
          "newStart": 34,
          "sha256": "6bbea1cc490173b63ded3834d6f4bff81fbaf197f8b7538739e7c75a13973716",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L34"
        },
        {
          "anchor": "@@ -80,10 +81,11 @@ use crate::types::diagnostic::{",
          "oldStart": 80,
          "newStart": 81,
          "sha256": "945f7e4b1f4b0a9e4eec2e30b85e576038ecfd0587b281a08274c51135b958e7",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L81"
        },
        {
          "anchor": "@@ -3895,6 +3897,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 3895,
          "newStart": 3897,
          "sha256": "31a993ed868e339a600b5d10fa3d1b7253abd85c00d005d264790f4bbd34c5c8",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L3897"
        },
        {
          "anchor": "@@ -3926,13 +3929,19 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 3926,
          "newStart": 3929,
          "sha256": "a5c522b4422a255d1aab70e102333a49b2e26b31e79f4a00dfef0d0f7a2ba4ad",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L3929"
        },
        {
          "anchor": "@@ -3945,13 +3954,14 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 3945,
          "newStart": 3954,
          "sha256": "6fe1a118e4ba5835547435e7c256b12d0f0c7202fdf9305aebe0e6f981bd9428",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L3954"
        },
        {
          "anchor": "@@ -3960,7 +3970,10 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 3960,
          "newStart": 3970,
          "sha256": "78912cae92add3ff14c63bae301d667d26a16f38be609ef1da6226b0d87aa62e",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L3970"
        },
        {
          "anchor": "@@ -4312,6 +4325,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 4312,
          "newStart": 4325,
          "sha256": "958bc0ae9b19f10f49fde26e306d668614cc26860713e7adadc30c105270dbd5",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L4325"
        },
        {
          "anchor": "@@ -4343,13 +4357,19 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 4343,
          "newStart": 4357,
          "sha256": "aee3abef28008d49c361265f06cac7bda5d0f992e24f1eaa38541cf399269f89",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L4357"
        },
        {
          "anchor": "@@ -4362,13 +4382,14 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 4362,
          "newStart": 4382,
          "sha256": "d22d414fabbe87070e332071494bb1e285763c1eb1d5448c5477b98d3bdf2e86",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L4382"
        },
        {
          "anchor": "@@ -4379,7 +4400,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 4379,
          "newStart": 4400,
          "sha256": "463e5025224ccb2419c8d7f703cd49012f5ebf8038f15d10deef69134bf57a5e",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L4400"
        },
        {
          "anchor": "@@ -6293,12 +6314,36 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6293,
          "newStart": 6314,
          "sha256": "a4e64f3ce26e5b9485b8534a43489c2e4b2941b960c901b887b52bc7d4e792db",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L6314"
        },
        {
          "anchor": "@@ -6365,6 +6410,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6365,
          "newStart": 6410,
          "sha256": "1400b8aed877a015aa87c15bfc1b3e2f4e3eecccf111dbcb8f76e3b2eff8cb70",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L6410"
        },
        {
          "anchor": "@@ -6402,10 +6448,10 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6402,
          "newStart": 6448,
          "sha256": "114f4b01f1b630db5b1ec8dcbb378258fbb727a240052e6e5e38d3b3971e2c41",
          "classification": "shared-actual-argument-context",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L6448"
        },
        {
          "anchor": "@@ -6637,6 +6683,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6637,
          "newStart": 6683,
          "sha256": "962dfe51846559e0da63efd775a27774967f475c21e1e93c605e21d4e0ef409a",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L6683"
        },
        {
          "anchor": "@@ -6691,7 +6738,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6691,
          "newStart": 6738,
          "sha256": "3f56b2cf1bf7d47c4ebfc2014b25a18a89f9c9e4a3d1ea10a7dc613e718c7f62",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L6738"
        },
        {
          "anchor": "@@ -6707,9 +6754,9 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6707,
          "newStart": 6754,
          "sha256": "5b356d37cc687270722c76390ad900a9758ece4613b84151877c677ec20fd8b0",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L6754"
        },
        {
          "anchor": "@@ -6851,6 +6898,14 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6851,
          "newStart": 6898,
          "sha256": "d54749efe02666cb0d8c6f9b84b46204f41bf4cf5b3745e9ff4e2bb684d27f0b",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L6898"
        },
        {
          "anchor": "@@ -6906,11 +6961,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6906,
          "newStart": 6961,
          "sha256": "ca1bd20a57c5a20ec06fdf40cd0fb0d86810c63153fd5a0d912d800946802f10",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L6961"
        },
        {
          "anchor": "@@ -7011,6 +7062,38 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 7011,
          "newStart": 7062,
          "sha256": "99970cd2659b96081061e356feb5bfefe815e2605e7e9c5b9e54f52fd53956cf",
          "classification": "shared-actual-argument-context",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L7062"
        },
        {
          "anchor": "@@ -8736,6 +8819,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 8736,
          "newStart": 8819,
          "sha256": "8dd81d82fc25eb97d8439931962f71eb43987eb1f092d6baa919b13821eebcea",
          "classification": "complete-later-collection-context",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L8819"
        },
        {
          "anchor": "@@ -8748,6 +8832,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 8748,
          "newStart": 8832,
          "sha256": "034b329e571f0e3f5937a8a225a498bcf9afbd9bf8ecca8abd6e63bfb46c2f3e",
          "classification": "complete-later-collection-context",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L8832"
        },
        {
          "anchor": "@@ -8756,6 +8841,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 8756,
          "newStart": 8841,
          "sha256": "a46089a2c7c67a96142de26a7faf37141f054dd9193de256d5168b5f30d99afa",
          "classification": "complete-later-collection-context",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L8841"
        },
        {
          "anchor": "@@ -8764,6 +8850,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 8764,
          "newStart": 8850,
          "sha256": "185b15334dd970ea02b1934bb04f4a75c9021658c10abfead1435868f320bb1e",
          "classification": "complete-later-collection-context",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L8850"
        },
        {
          "anchor": "@@ -8859,9 +8946,9 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 8859,
          "newStart": 8946,
          "sha256": "53aa88a0a59c0132c54d9b4463798b7566cb2d740d7b3453546409e2e741d539",
          "classification": "complete-later-collection-context",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L8946"
        },
        {
          "anchor": "@@ -9000,6 +9087,8 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9000,
          "newStart": 9087,
          "sha256": "3b02a3608fd0ad5ab197a3729b5d18649a9bb82cfd8609359472df9b538a9cb9",
          "classification": "complete-later-collection-context",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L9087"
        },
        {
          "anchor": "@@ -9065,8 +9154,69 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9065,
          "newStart": 9154,
          "sha256": "b412eeba9e7b7186bcf2553da2ce423a40961b44877d33c05ea3269af8966234",
          "classification": "complete-later-collection-context",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L9154"
        },
        {
          "anchor": "@@ -9100,6 +9250,15 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9100,
          "newStart": 9250,
          "sha256": "c296a239a46da7ce1411759bc90ff77c7f92e119dd3397edeef0fff7a3f1363f",
          "classification": "complete-later-collection-context",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L9250"
        },
        {
          "anchor": "@@ -9407,7 +9566,12 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9407,
          "newStart": 9566,
          "sha256": "77468a6964e6b0b494195f51428e96b8cc1d5266e413ee9fa7f6537b78617d46",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L9566"
        },
        {
          "anchor": "@@ -9687,8 +9851,12 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9687,
          "newStart": 9851,
          "sha256": "eef2f4c579ca2af77c26c0cf7122fa3b97694e75e081ec6ac0c19d36c472227f",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L9851"
        },
        {
          "anchor": "@@ -9737,7 +9905,12 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9737,
          "newStart": 9905,
          "sha256": "16c4ac2c03080299dbec6c6132db1eb2fd8c4ac4b9fefc02323c995ed553aef9",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L9905"
        },
        {
          "anchor": "@@ -9760,7 +9933,8 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9760,
          "newStart": 9933,
          "sha256": "28a0b3da7a75d2a63247826a5596a7bd4b7ceed18e839e92365c58e69e5ad4e4",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L9933"
        },
        {
          "anchor": "@@ -10235,6 +10409,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 10235,
          "newStart": 10409,
          "sha256": "9892454d9e38c5c0075be9c52595be2af276a19303cc1a1a3fc1ab58aba5b8a6",
          "classification": "cached-string-operands-for-fresh-mapping-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L10409"
        },
        {
          "anchor": "@@ -11739,6 +11914,10 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 11739,
          "newStart": 11914,
          "sha256": "54bb202fec2462471e124cd80fbd3d7590c853c5240e6ca5bd9763591faa604b",
          "classification": "mechanical-clippy-qualification",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L11914"
        },
        {
          "anchor": "@@ -13574,7 +13753,34 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 13574,
          "newStart": 13753,
          "sha256": "7a6bd33aeca34568398d303904b1a90954b54595bc7ff4dc5760a15b4a144289",
          "classification": "native-type-tag-impossibility-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L13753"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/enum_call.rs",
      "baseBlob": "576216e6838070e2c0d47aec3d837289cff881bb",
      "candidateBlob": "8c0ae9001a89a73bf6ae5f18cd58011d70f5a044",
      "frozenCandidateBlob": "d9a475e1930fd5d7e894f0dcfb4c152c5d96bb78",
      "classification": "upstream-api-migration",
      "detail": "Reuses upstream argument inference ordering, alias-resolved names and constructor-specific MISMATCHED_ENUM_NAME diagnostic.",
      "hunks": [
        {
          "anchor": "@@ -13,8 +13,9 @@ use crate::{",
          "oldStart": 13,
          "newStart": 13,
          "sha256": "2c0a4526aa02164ef8dcce5d24648f7d75e083fc9cefebbfc5bf76b5722c661c",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L13"
        },
        {
          "anchor": "@@ -361,15 +362,17 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 361,
          "newStart": 362,
          "sha256": "76ebba6405f741fd18943dcce43cab49dc23d2457d7995e166aafc3b168e3889",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L362"
        },
        {
          "anchor": "@@ -388,13 +391,6 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 388,
          "newStart": 391,
          "sha256": "d9ae9341b7329879faea336e27afd8052612be296417f9452e1e1d6597f3cdea",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L391"
        },
        {
          "anchor": "@@ -417,24 +413,19 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 417,
          "newStart": 413,
          "sha256": "9604af10deda2b8cb1f411bd915a70115883da164d80aa203d4aa7e6cd5d604b",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L413"
        },
        {
          "anchor": "@@ -448,7 +439,7 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 448,
          "newStart": 439,
          "sha256": "f6044baa7b200ddbb6a34d79a528bd43b93ed63895d17680f418c57c298da36c",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L439"
        },
        {
          "anchor": "@@ -468,14 +459,14 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 468,
          "newStart": 459,
          "sha256": "ca2f5c9a6f32bd4371559663ea02e4c4f157ced1b7ec238928f49f814c55d0ae",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L459"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/function.rs",
      "baseBlob": "832f2b9e9f16d6a2dbff9fbe6a9c127fe83e6169",
      "candidateBlob": "4dde2a1402c596511e3431169f402ec7352666b4",
      "frozenCandidateBlob": "77c3d5c0fcbbf22ffb9df3612cf0675e65c8493f",
      "classification": "mechanical",
      "detail": "Equivalent predicate let-else.",
      "hunks": [
        {
          "anchor": "@@ -321,9 +321,8 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 321,
          "newStart": 321,
          "sha256": "90ca043ef47cece793da5c1a54004bfe7028d2106d6a15b65339078f42d658e9",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/function.rs#L321"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/paramspec_validation.rs",
      "baseBlob": "9033daa3cb53131c9899e75293705a6ca84503cf",
      "candidateBlob": "421e165a0d5c199cde20cbfcfedf4a30cd9d9085",
      "frozenCandidateBlob": "233f6b6b3e4d054262fb62ebbb4694b951baf9dc",
      "classification": "upstream-api-migration",
      "detail": "Removes upstream erroneous fallback when report_lint declines an ignored diagnostic; missing companion validation remains in the surrounding branch.",
      "hunks": [
        {
          "anchor": "@@ -168,14 +168,6 @@ pub(super) fn validate_paramspec_components<'db>(",
          "oldStart": 168,
          "newStart": 168,
          "sha256": "16b9f1942d576b4d0fe19df08b860a2b8d119b5ea7f1c1ad69bde2dd2b22e37e",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/paramspec_validation.rs#L168"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/subscript.rs",
      "baseBlob": "45f6de62fd77d14ff010c7c545c8a282e6cddecf",
      "candidateBlob": "7d83cf9a1fc9141ba992ced7baca5fa170fcda48",
      "frozenCandidateBlob": "9ba87ace04d0105a7b42f244ff77e4f0862475fa",
      "classification": "checked-write-evidence",
      "detail": "Use already-checked key and filtered RHS in synthesized two-argument identity __setitem__ call; do not restore removed cycle markers by reinference.",
      "hunks": [
        {
          "anchor": "@@ -172,8 +172,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 172,
          "newStart": 172,
          "sha256": "ee501454085f8011877bc2865331231869d2251e05c3b08471a90abc1541361e",
          "classification": "checked-write-evidence",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/subscript.rs#L172"
        },
        {
          "anchor": "@@ -1894,14 +1893,14 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 1894,
          "newStart": 1893,
          "sha256": "c62f25a5b51b7a10c6d17397852fb598ace597a0d645ce7543bf49926de8dfb2",
          "classification": "checked-write-evidence",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/subscript.rs#L1893"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/typed_dict.rs",
      "baseBlob": "0692f9f1a00d8d704bcc0bc08a393b061974373b",
      "candidateBlob": "3f3cad13b02f1641be0acd0a427faebcbfd5f24f",
      "frozenCandidateBlob": "ed4a44301b10c4cfb3bac65510f7df690dd50e41",
      "classification": "upstream-api-migration",
      "detail": "Reuses upstream alias-resolved literal names, separate valid-name-type check and MISMATCHED_TYPEDDICT_NAME diagnostic.",
      "hunks": [
        {
          "anchor": "@@ -9,8 +9,8 @@ use crate::TypeQualifiers;",
          "oldStart": 9,
          "newStart": 9,
          "sha256": "15952774f2f97de47bed86e00123055b81bbe3569856fa256ee6ee8c631b71ac",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/typed_dict.rs#L9"
        },
        {
          "anchor": "@@ -267,11 +267,13 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 267,
          "newStart": 267,
          "sha256": "35e447fed33be9b21d3c6b00c5775d0f03b32a4b131220f96a9d4c524bd5c559",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/typed_dict.rs#L267"
        },
        {
          "anchor": "@@ -281,12 +283,16 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 281,
          "newStart": 283,
          "sha256": "48d9e71b89b63d3233ac958582887b3ad1f7c0f6b04e26b23d739649ac8ecffc",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/typed_dict.rs#L283"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/loop_bindings.rs",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "a50e1deec4a1fa3a7a3c8d387ee3512e409a0e2d",
      "frozenCandidateBlob": "b766c9c3aedd7c85f247662c5db272361a0bb2c4",
      "classification": "mechanical",
      "detail": "Equivalent predicate let-else in producer and control.",
      "hunks": [
        {
          "anchor": "@@ -23,9 +23,8 @@ pub(crate) fn certifies_predicate<'db>(",
          "oldStart": 23,
          "newStart": 23,
          "sha256": "6a05be00e39ff1f589b2ddbd466a15148e1da07b2d982301b6382f3d4994ec36",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/loop_bindings.rs#L23"
        },
        {
          "anchor": "@@ -393,9 +392,8 @@ def select(rows: list[tuple[bool, list[str], str]]) -> str:",
          "oldStart": 393,
          "newStart": 392,
          "sha256": "505698a91a28d3cceb33591241d5c88ab0fa679b637dfa8671929efe1429f98c",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/loop_bindings.rs#L392"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/narrow.rs",
      "baseBlob": "3dd831e5e7b940678f33a4d575a049dbe925e1e6",
      "candidateBlob": "f08f563acd3b82a1f0bc238ad8df1f4bd2d9d9a4",
      "frozenCandidateBlob": "13df5517f618d3a15adac07c05f2755cac9742cb",
      "classification": "native-type-tag-impossibility-proof",
      "detail": "A registered native type-tag test can prove only impossible Eq/NotEq comparisons: cached operand evidence must be an exact builtin string, the subject static and determinate, and disjointness must be completely proved within the existing bound. Overlapping, opaque, growing or unsupported cases retain ordinary comparison behavior. Starred type-test subjects are declined; exact Python class comparisons are not folded. Current forward hunks additionally cover: dictionary-comprehension-body-domain-propagation. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -52,7 +52,7 @@ use ruff_python_ast::helpers::any_over_expr;",
          "oldStart": 52,
          "newStart": 52,
          "sha256": "3a0a8fbc1a97cd1b2812b39b36965fa62fc2dfd5da9b2f5c1fb1b5a772155fd2",
          "classification": "native-type-tag-impossibility-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/narrow.rs#L52"
        },
        {
          "anchor": "@@ -60,6 +60,7 @@ use super::equality::{",
          "oldStart": 60,
          "newStart": 60,
          "sha256": "ad4cc16b9c12cdb5ff17998b6ee4f370d49a2a884d479cfacde18a75b8bb9ae4",
          "classification": "native-type-tag-impossibility-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/narrow.rs#L60"
        },
        {
          "anchor": "@@ -100,7 +101,7 @@ pub(crate) fn infer_narrowing_constraints<'db>(",
          "oldStart": 100,
          "newStart": 101,
          "sha256": "82df0c775bb2d8cfa3313a247e89f7293d209179d317c3183bbe8c71a78c04c5",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/narrow.rs#L101"
        },
        {
          "anchor": "@@ -125,7 +126,7 @@ pub(crate) fn infer_narrowing_constraints<'db>(",
          "oldStart": 125,
          "newStart": 126,
          "sha256": "2de5e3ba06adb1b9d86d6a62d4035bde670d7c2911fe661b09ea87cd91bc4786",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/narrow.rs#L126"
        },
        {
          "anchor": "@@ -181,6 +182,9 @@ impl<'db, 'ast> RuntimeTypeTest<'db, 'ast> {",
          "oldStart": 181,
          "newStart": 182,
          "sha256": "9ea99589f93b60d4739f9c28aca06029f6dbf2552cc6c624710df2595d523abe",
          "classification": "native-type-tag-impossibility-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/narrow.rs#L182"
        },
        {
          "anchor": "@@ -263,6 +267,75 @@ impl<'db, 'ast> RuntimeTypeTest<'db, 'ast> {",
          "oldStart": 263,
          "newStart": 267,
          "sha256": "339b7968445207909994414a5939c8a852bbfeb51e96319f7542b44c56d1e870",
          "classification": "native-type-tag-impossibility-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/narrow.rs#L267"
        },
        {
          "anchor": "@@ -4367,7 +4440,12 @@ impl<'db> NarrowingConstraintsBuilder<'db, '_> {",
          "oldStart": 4367,
          "newStart": 4440,
          "sha256": "771ec0e79b04f2898887ab4d4a104c9a5b4473832d3fa499d39c79f538981f37",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/narrow.rs#L4440"
        },
        {
          "anchor": "@@ -4377,6 +4455,7 @@ impl<'db> NarrowingConstraintsBuilder<'db, '_> {",
          "oldStart": 4377,
          "newStart": 4455,
          "sha256": "b632980cb05d2c183497766e6695f6bedeba874bf521dbfd75cd5d911aed5d54",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/narrow.rs#L4455"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/newtype.rs",
      "baseBlob": "ab00e1d3f64e1c45ef94d4d8a6820214dfdbc9f0",
      "candidateBlob": "0989e093a9af23718a603a2e9107d133eeb40893",
      "frozenCandidateBlob": "ab00e1d3f64e1c45ef94d4d8a6820214dfdbc9f0",
      "classification": "identity-preserving-noop",
      "detail": "Return original NewType if mapped underlying class is unchanged; avoids identity rebuild.",
      "hunks": [
        {
          "anchor": "@@ -152,7 +152,11 @@ impl<'db> NewType<'db> {",
          "oldStart": 152,
          "newStart": 152,
          "sha256": "c9cfa74fc8fcbf52dcb3b657beaa42e964d652dea70f07628d6985468c8fd44c",
          "classification": "identity-preserving-noop",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/newtype.rs#L152"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/provided/source_tests.rs",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "15c642e25dbd409b64441ea608a1c9424a50b261",
      "frozenCandidateBlob": "94af0ecf2e44d6abf00321f3f6bd16a050f96fbe",
      "classification": "native-test-mechanical",
      "detail": "Formatting only; same supplied/native controls and expectations.",
      "hunks": [
        {
          "anchor": "@@ -3255,18 +3255,39 @@ Scalar(None)",
          "oldStart": 3255,
          "newStart": 3255,
          "sha256": "a299a12ecbbb4fcbfe877e4cdc8ccc7298a98f7f73f3f8146d2497134ec1877a",
          "classification": "native-test-mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/source_tests.rs#L3255"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/provided/tests.rs",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "92d24415701b0c5d89140ad2a4d4864b570c4440",
      "frozenCandidateBlob": "34235a35f2d1f7217e031c07f8da8c1db5328b40",
      "classification": "mixed-regression-and-diagnostic-fixtures",
      "detail": "Adds the finite nested provided-storage receiver regression, alongside formatting and canonical diagnostic IDs. Captured nonlocal reset retains the conservative union and missing-member diagnostic. Native type-tag controls cover aliases, final generic domains, overlapping bounds, opaque and unconstrained inputs, shadowed/unregistered category functions, open string results, reflected string equality, starred subjects and Python metaclass equality. Dictionary snapshot controls cover ordinary/named arguments, mutation, aliases, rebinding, reflected/custom-final subclasses and LiteralString-returning nested calls. Two existing observations become precise after all arguments: clear is empty, update retains Literal[2]; unavailable is not changed globally.",
      "hunks": [
        {
          "anchor": "@@ -70,14 +70,20 @@ Literal[float]",
          "oldStart": 70,
          "newStart": 70,
          "sha256": "3476a3ec023e2205f72b98f9e3040e2d237d9d3d29870ae83ac1e9dfb46eb88b",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L70"
        },
        {
          "anchor": "@@ -88,31 +94,63 @@ Literal[float]",
          "oldStart": 88,
          "newStart": 94,
          "sha256": "1c495e5e819404b940e741eab1459b51e13ff4b6f4a9df9e842e0e65ce148aea",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L94"
        },
        {
          "anchor": "@@ -121,8 +159,14 @@ Literal[float]",
          "oldStart": 121,
          "newStart": 159,
          "sha256": "d64441e58dd7f64adaded3dd5d2af0a26b4b3dc4c8401a4be262e54da356745c",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L159"
        },
        {
          "anchor": "@@ -509,6 +553,68 @@ fn supplied_instance_refinement_preserves_storage_and_nominal_behavior() -> anyh",
          "oldStart": 509,
          "newStart": 553,
          "sha256": "ded38a283c13509550eaf92c5e9490b654760e8ebc8eafcec523f43a04c42e54",
          "classification": "finite-provided-storage-receiver-regression",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L553"
        },
        {
          "anchor": "@@ -1844,7 +1950,7 @@ consume(target, consumed=1, required=1)",
          "oldStart": 1844,
          "newStart": 1950,
          "sha256": "36409e6ff52818ab9d0914b8ce38bb7e833b0a41f88b0843edabc7f2ef65bb63",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L1950"
        },
        {
          "anchor": "@@ -2610,7 +2716,7 @@ if False:",
          "oldStart": 2610,
          "newStart": 2716,
          "sha256": "5de4392bdeabb121d85a360382f290f084bff3fc8bef0bdaedee50a5caa0f45d",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L2716"
        },
        {
          "anchor": "@@ -3087,6 +3193,115 @@ fn runtime_type_test<'db>(",
          "oldStart": 3087,
          "newStart": 3193,
          "sha256": "422fbef5a849f9b89f27293aa866445d56b965ba73a243b907d49dbd15b0b17f",
          "classification": "native-type-tag-regression-controls",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L3193"
        },
        {
          "anchor": "@@ -3733,25 +3948,25 @@ target: Target | None",
          "oldStart": 3733,
          "newStart": 3948,
          "sha256": "44da6ec9247f2481dc68f8be8568ba89603a3fe477477f9180c006e5c0ea0179",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L3948"
        },
        {
          "anchor": "@@ -3763,13 +3978,14 @@ target: Target | None",
          "oldStart": 3763,
          "newStart": 3978,
          "sha256": "300c0c9b9809b0aaf5eb2df4acee6ddfa562ff0d2a1ffb344916926e42485a41",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L3978"
        },
        {
          "anchor": "@@ -3817,7 +4033,7 @@ def use() -> str:",
          "oldStart": 3817,
          "newStart": 4033,
          "sha256": "2e1cfe87ad416febdd0ecbea79e4023f5e700e2392ad4eae124aea3f50989e22",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L4033"
        },
        {
          "anchor": "@@ -4101,6 +4317,82 @@ def use() -> None:",
          "oldStart": 4101,
          "newStart": 4317,
          "sha256": "038dd968c8a9f9a4a630faa5bd7da2402726a480141854e8721b43055fc1e7a7",
          "classification": "dictionary-after-arguments-snapshot-regressions",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L4317"
        },
        {
          "anchor": "@@ -4168,7 +4460,7 @@ fn dictionary_observations_preserve_first_entries() -> anyhow::Result<()> {",
          "oldStart": 4168,
          "newStart": 4460,
          "sha256": "8fde72d9d288f30f00dc233c667fbc759cc13e6f5960924654521cc4e73b2166",
          "classification": "dictionary-after-arguments-snapshot-regressions",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L4460"
        },
        {
          "anchor": "@@ -4208,7 +4500,7 @@ fn dictionary_observations_preserve_first_entries() -> anyhow::Result<()> {",
          "oldStart": 4208,
          "newStart": 4500,
          "sha256": "21234f70dfa3e4e3d33e7c8bef01893189314bb7cfa8522475a1027c795514be",
          "classification": "dictionary-after-arguments-snapshot-regressions",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L4500"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/relation.rs",
      "baseBlob": "7b0773bb27de3b603075eca98dd34b688a125407",
      "candidateBlob": "e196b18383822751b55db00f9a7d775254b1eca8",
      "frozenCandidateBlob": "03be8b5f5934675efda21f315256418c32484ce9",
      "classification": "upstream-cached-relation-migration",
      "detail": "Upstream owns memoized relation/provenance APIs and literal-class shortcut. Fork supplied-instance field guard remains explicit; not an independent upstream feature.",
      "hunks": [
        {
          "anchor": "@@ -317,6 +317,11 @@ fn nominal_union_index<'db>(",
          "oldStart": 317,
          "newStart": 317,
          "sha256": "92fce7ca77ac0e1b6a0e0a545e6f7de066d57c07a62550091cf4f44473fdc4bc",
          "classification": "upstream-cached-relation-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/relation.rs#L317"
        },
        {
          "anchor": "@@ -645,76 +650,89 @@ impl<'db> Type<'db> {",
          "oldStart": 645,
          "newStart": 650,
          "sha256": "e3924291c5751f4f5e42d9d31e0fdc260184443e7d6d4572a9cc4ee9f14b6bc4",
          "classification": "upstream-cached-relation-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/relation.rs#L650"
        },
        {
          "anchor": "@@ -738,69 +756,106 @@ impl<'db> Type<'db> {",
          "oldStart": 738,
          "newStart": 756,
          "sha256": "516de38f8f4e977a4ca6e96d01fd640bb539648c3f5c09367eebb183e242a789",
          "classification": "upstream-cached-relation-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/relation.rs#L756"
        },
        {
          "anchor": "@@ -810,7 +865,7 @@ impl<'db> Type<'db> {",
          "oldStart": 810,
          "newStart": 865,
          "sha256": "2f542b985cf795dadaeb18c1dee78d1742e2b6ea6d80056662108d49072309bf",
          "classification": "upstream-cached-relation-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/relation.rs#L865"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/set_theoretic/builder.rs",
      "baseBlob": "3adcb7f8a9c268cd439bac92c6ab309a3d9c9cc5",
      "candidateBlob": "266e74ad286ef5052ed6dded90be18870faef551",
      "frozenCandidateBlob": "a00edc198ff679577ffd262656569c997c242705",
      "classification": "exact-immutable-builtin-truthiness",
      "detail": "Simplifies both AlwaysTruthy and AlwaysFalsy exclusions to Never only with a positive stable builtin and existing exact-runtime-class proof. Mutable/stateful and open classes are retained. Current forward hunks additionally cover: exact-immutable-builtin-truthiness. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim. Final checkpoint explicitly reviewed changes: exact-immutable-builtin-truthiness, upstream-class-guard-union-fastpath. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -45,6 +45,7 @@ use std::ops::ControlFlow;",
          "oldStart": 45,
          "newStart": 45,
          "sha256": "7e7e364f9bc189ea10bad777bc19ef4db1b473ee32f6a0e4d52f2de36eaa3a9d",
          "classification": "exact-immutable-builtin-truthiness",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L45"
        },
        {
          "anchor": "@@ -54,6 +55,7 @@ use crate::types::{",
          "oldStart": 54,
          "newStart": 55,
          "sha256": "ff8fbcd92f41bcf6886f495284a782ea4d1898d510e8b5dd2f3d4ec792621859",
          "classification": "upstream-class-guard-union-fastpath",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30636 owns Itertools import for exactly-one class guard extraction.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L55"
        },
        {
          "anchor": "@@ -1152,7 +1154,8 @@ impl<'db> UnionBuilder<'db> {",
          "oldStart": 1152,
          "newStart": 1154,
          "sha256": "1cb90f4f0160c7f5fa48e505e453c1875192c633a1959edab2fed71af0cc35c2",
          "classification": "upstream-class-guard-union-fastpath",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30636 documents singleton class guard union shortcut.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L1154"
        },
        {
          "anchor": "@@ -1176,6 +1179,18 @@ impl<'db> UnionBuilder<'db> {",
          "oldStart": 1176,
          "newStart": 1179,
          "sha256": "2e8a5b69a7abab93d3355d784aa480f60e20d113ed5e7b9ab19cb313b00a4583",
          "classification": "upstream-class-guard-union-fastpath",
          "attribution": "explicit-current-source-review",
          "reviewNote": "#30636 skips redundant class literal comparisons only for equal sole truthiness guards.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L1179"
        },
        {
          "anchor": "@@ -2656,6 +2671,31 @@ impl<'db> InnerIntersectionBuilder<'db> {",
          "oldStart": 2656,
          "newStart": 2671,
          "sha256": "0a2aa239dc9530c332460741b086f84e3403ef74d4bdd698ab44a561706a3ce2",
          "classification": "exact-immutable-builtin-truthiness",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Guard-preserving replacement retains original exact known immutable builtin plus exact-runtime-class contradiction proof and only improves its concrete range explanation. Global residual guard stripping and associated changed display expectations from rejecteda0 are absent; no mutable/open/custom-final admission.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L2671"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/signatures.rs",
      "baseBlob": "7ffbdc48729bed2b557565b1c834a56dd739f3b8",
      "candidateBlob": "5d19725f68178456e30b4637a117f00c5238de79",
      "frozenCandidateBlob": "4b382b0634f778a020e15ea686dac73375fc46c1",
      "classification": "receiver-and-callback-proof",
      "detail": "Evaluate mapped raw receiver obligations under active shared relation guards; generic finite source callback to nongeneric static target uses one Lazy witness. Correct overload implementation return-consistency assertions; nullable broader implementation returns are valid. Native regression qualification also covers strict descent through already attached immutable instance fields; no class declarations or bounds are expanded. Final checkpoint explicitly reviewed changes: strict-callback-source-witness-replay. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -142,37 +142,27 @@ pub struct CallableSignature<'db> {",
          "oldStart": 142,
          "newStart": 142,
          "sha256": "b27709ba0ea5646ea3516e75cccd2588dab5ab363cb96029b809ceee68749d9c",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L142"
        },
        {
          "anchor": "@@ -388,7 +378,6 @@ impl<'db> CallableSignature<'db> {",
          "oldStart": 388,
          "newStart": 378,
          "sha256": "4c9e8e4fe8b96e1bb1df4330189ca341b6dbd3caf06c48c6272715cdce8d7369",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L378"
        },
        {
          "anchor": "@@ -420,8 +409,6 @@ impl<'db> CallableSignature<'db> {",
          "oldStart": 420,
          "newStart": 409,
          "sha256": "88a20c8eff7ef3eb57c5a47f00d86d777168e9db3dd76cac806e767ea47191d5",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L409"
        },
        {
          "anchor": "@@ -833,17 +820,15 @@ impl<'db> SignatureExtras<'db> {",
          "oldStart": 833,
          "newStart": 820,
          "sha256": "5941307c81c6ca761668925fbbb25bf27b0414ca92f6f62b8a89df9240267a5e",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L820"
        },
        {
          "anchor": "@@ -856,7 +841,7 @@ impl<'db> ReceiverConstraints<'db> {",
          "oldStart": 856,
          "newStart": 841,
          "sha256": "25349d39bec04ee01434b9e26414686d9ffa19b06a45bf62d5505dee585e9c2f",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L841"
        },
        {
          "anchor": "@@ -865,19 +850,11 @@ impl<'db> ReceiverConstraints<'db> {",
          "oldStart": 865,
          "newStart": 850,
          "sha256": "4243e74a219cec719428e3e89795bec7c8c96bd1087d3006b8473961f45c0174",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L850"
        },
        {
          "anchor": "@@ -888,29 +865,64 @@ impl<'db> ReceiverConstraints<'db> {",
          "oldStart": 888,
          "newStart": 865,
          "sha256": "8bf23904f23036c913f2b2c710a00c82e9af8a3d827c042e5b4acc7f5aeefe83",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L865"
        },
        {
          "anchor": "@@ -961,8 +973,8 @@ impl<'db> SignatureRelationKey<'db> {",
          "oldStart": 961,
          "newStart": 973,
          "sha256": "5d8aa6503ddd0f519e60d95f8dc1eb6cf0692a05c4dc7423e88636b441322e3f",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L973"
        },
        {
          "anchor": "@@ -976,6 +988,9 @@ fn visit_type_arguments<'db>(",
          "oldStart": 976,
          "newStart": 988,
          "sha256": "2cf950b7d34bb49287d15c30c230e0c24f953b9cb78cbcf72a0ca054e25785cc",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L988"
        },
        {
          "anchor": "@@ -1088,6 +1103,12 @@ fn receiver_arguments_decrease<'db>(",
          "oldStart": 1088,
          "newStart": 1103,
          "sha256": "7226c4dd60022b3bd8286b5e18df18711b0380ac9da03fc8d668697c6f027d8a",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L1103"
        },
        {
          "anchor": "@@ -2041,7 +2062,7 @@ impl<'db> Signature<'db> {",
          "oldStart": 2041,
          "newStart": 2062,
          "sha256": "7854d10232011e2c8e2dd369c316173ae00bae67e17884d0c6f2f9d12f5e7997",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L2062"
        },
        {
          "anchor": "@@ -2071,24 +2092,14 @@ impl<'db> Signature<'db> {",
          "oldStart": 2071,
          "newStart": 2092,
          "sha256": "be8e04b509d055b69ac138c7fdfeec5c400945c42612cbe6ee2687fab21437a4",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L2092"
        },
        {
          "anchor": "@@ -2173,7 +2184,8 @@ impl<'db> Signature<'db> {",
          "oldStart": 2173,
          "newStart": 2184,
          "sha256": "f5df4078c677b4bfcf27301a1bd45c61db1942354e2fe1188756ab74d44d7e99",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L2184"
        },
        {
          "anchor": "@@ -2499,7 +2511,6 @@ impl<'db> Signature<'db> {",
          "oldStart": 2499,
          "newStart": 2511,
          "sha256": "e026bb5d1571d649f23d418c8af7582cfc5d680edd1f0895073a38ee3ff7483a",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L2511"
        },
        {
          "anchor": "@@ -2510,10 +2521,9 @@ impl<'db> Signature<'db> {",
          "oldStart": 2510,
          "newStart": 2521,
          "sha256": "e019c35ce439025706a2798d25fa1f8365f3de0d5b4aa7153b78ddfc9c8108af",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L2521"
        },
        {
          "anchor": "@@ -2560,12 +2570,7 @@ impl<'db> Signature<'db> {",
          "oldStart": 2560,
          "newStart": 2570,
          "sha256": "c57631004a029570f3d81821201bdcc10bd8d69ae16044ee86d17d1b42077a73",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L2570"
        },
        {
          "anchor": "@@ -2585,34 +2590,8 @@ impl<'db> Signature<'db> {",
          "oldStart": 2585,
          "newStart": 2590,
          "sha256": "903604317bb2bb896058f06bcc6793e638e3ed035544c3e19ece3e16a307b308",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L2590"
        },
        {
          "anchor": "@@ -3711,7 +3690,7 @@ impl<'c, 'db> TypeRelationChecker<'_, 'c, 'db> {",
          "oldStart": 3711,
          "newStart": 3690,
          "sha256": "7cad0ca4b027337ba1525da1b5629f6a7835bab45c4c753b397677c9753ebb70",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L3690"
        },
        {
          "anchor": "@@ -3783,7 +3762,7 @@ impl<'c, 'db> TypeRelationChecker<'_, 'c, 'db> {",
          "oldStart": 3783,
          "newStart": 3762,
          "sha256": "41233ccf7b4a7cc49b968f26d4ec6b77b64568020f193e4c1c508bb04dab7114",
          "classification": "strict-callback-source-witness-replay",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Rename existing source specialization helper; declaration-domain caller remains unchanged.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L3762"
        },
        {
          "anchor": "@@ -3809,6 +3788,15 @@ impl<'c, 'db> TypeRelationChecker<'_, 'c, 'db> {",
          "oldStart": 3809,
          "newStart": 3788,
          "sha256": "0ab2de4024a5c478da542d5dc7be6bfa72f0e674fe1a127dafca40d2581cfb23",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L3788"
        },
        {
          "anchor": "@@ -3877,6 +3865,18 @@ impl<'c, 'db> TypeRelationChecker<'_, 'c, 'db> {",
          "oldStart": 3877,
          "newStart": 3865,
          "sha256": "38765ddf7115d5f7ab2f5fa398a9097e791e0248d5a71db5493e1aa93970a398",
          "classification": "strict-callback-source-witness-replay",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Only original Eager/no-caller-inferables comparison that selected LazyStatic and constant false retries a complete source-only witness with whole-signature strict replay. Target caller variables remain rigid; incomplete refuses.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L3865"
        },
        {
          "anchor": "@@ -3886,7 +3886,7 @@ impl<'c, 'db> TypeRelationChecker<'_, 'c, 'db> {",
          "oldStart": 3886,
          "newStart": 3886,
          "sha256": "5b3344312d754479f58603b48610cb7c602ee433f351920a18d78db37d3cf9d9",
          "classification": "strict-callback-source-witness-replay",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Existing bounded full-source helper renamed; no replacement solver or quantifier shortcut.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L3886"
        },
        {
          "anchor": "@@ -8392,7 +8392,8 @@ mod tests {",
          "oldStart": 8392,
          "newStart": 8392,
          "sha256": "7f0e012ec1a92174cd570a36f13d8e4148271ceaf6cfd0ed82197c6fdc7b469f",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L8392"
        },
        {
          "anchor": "@@ -8449,16 +8450,38 @@ mod tests {",
          "oldStart": 8449,
          "newStart": 8450,
          "sha256": "ceca924859c0ae7267049043618029127a020220efe5467294a0c100efea8331",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L8450"
        },
        {
          "anchor": "@@ -9065,28 +9088,21 @@ mod tests {",
          "oldStart": 9065,
          "newStart": 9088,
          "sha256": "0f36684877b119d36db1c936e85f6e65b5c5f91f02e8a03e880c6917fff37157",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L9088"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/type_alias.rs",
      "baseBlob": "ae864d61d994ae4f45f5dde9338be6033e51dc07",
      "candidateBlob": "672537c3e27525b5d5c5fa7bdd2193e7f00e12fe",
      "frozenCandidateBlob": "2064de26ff966f5a29252bbfac8ca4f96552b1a4",
      "classification": "upstream-api-migration",
      "detail": "Reuses shared upstream name lookup while retaining existing positional-value/keyword-value recovery.",
      "hunks": [
        {
          "anchor": "@@ -11,6 +11,7 @@ use crate::{",
          "oldStart": 11,
          "newStart": 11,
          "sha256": "5fd9a29e7aa4491db85b8f37b5f278ee1fcd5650cfa146db08cd21b312e57bf0",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/type_alias.rs#L11"
        },
        {
          "anchor": "@@ -311,9 +312,12 @@ impl<'db> PEP695TypeAliasType<'db> {",
          "oldStart": 311,
          "newStart": 312,
          "sha256": "4ed9875145ac2b7b640f086e5c2776ef314d5ee1cfa8eac4e45cbb1810a14632",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/type_alias.rs#L312"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/unpacker.rs",
      "baseBlob": "1f02d1f51258ed2aa6aae4af06fd3d29c6640f08",
      "candidateBlob": "6367fdeb22350d7ca89748569b214d300f0f833a",
      "frozenCandidateBlob": "85f71d7657b716228248734eacce1bbc5b5365a0",
      "classification": "reviewed-comment-only",
      "detail": "Anchor explanation at list/dict precision guard; tuples retain inferred widening above64 entries. Current forward hunks additionally cover: dictionary-comprehension-body-domain-propagation, recursive-unpack-indeterminate-marker-classification. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -11,16 +11,16 @@ use ruff_python_ast::{self as ast, AnyNodeRef};",
          "oldStart": 11,
          "newStart": 11,
          "sha256": "6b74fc4c05dc0ba090e12e8b464b6e39f0a767a0c1abc3b8547d2f7fee460551",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/unpacker.rs#L11"
        },
        {
          "anchor": "@@ -74,6 +74,12 @@ impl<'db, 'ast> Unpacker<'db, 'ast> {",
          "oldStart": 74,
          "newStart": 74,
          "sha256": "1a07a9fb53e903c2b05b67d284ca210bc2a8a9dbcb2cbb4b7c259d990c3ab36e",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/unpacker.rs#L74"
        },
        {
          "anchor": "@@ -90,10 +96,11 @@ impl<'db, 'ast> Unpacker<'db, 'ast> {",
          "oldStart": 90,
          "newStart": 96,
          "sha256": "2ea97f818b873077258c5c135dbe0ab7fbbb217f3c2aad9bc015d14a7695c254",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/unpacker.rs#L96"
        },
        {
          "anchor": "@@ -137,10 +144,9 @@ impl<'db, 'ast> Unpacker<'db, 'ast> {",
          "oldStart": 137,
          "newStart": 144,
          "sha256": "edfb4cf2deab216df0502ecc03cdca44def47a9b24be1c15d368a3f8d6486bdc",
          "classification": "reviewed-comment-only",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/unpacker.rs#L144"
        },
        {
          "anchor": "@@ -325,11 +331,8 @@ impl<'db, 'ast> Unpacker<'db, 'ast> {",
          "oldStart": 325,
          "newStart": 331,
          "sha256": "228989346db73b872936f4e88abe2840e79d87659abc1d7d77fb5a48b20241aa",
          "classification": "recursive-unpack-indeterminate-marker-classification",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/unpacker.rs#L331"
        }
      ]
    },
    {
      "path": "crates/ty_test/src/db.rs",
      "baseBlob": "cea37db4470980bc3021c2558b1d4022dafc0642",
      "candidateBlob": "66f3461877eef7132a2076c7b7d530f53acda757",
      "frozenCandidateBlob": "d081bc9ed8275a16313d24adcd7e0e9ab0ef6a2f",
      "classification": "test-settings-layout",
      "detail": "Box analysis settings in file variant, explicit destructuring; same analysis values.",
      "hunks": [
        {
          "anchor": "@@ -184,8 +184,9 @@ impl SemanticDb for Db {",
          "oldStart": 184,
          "newStart": 184,
          "sha256": "039df67fd905b1e0424cb5c35bc319d1e21512c5802c09afc4bc8f4fb8cf20ad",
          "classification": "test-settings-layout",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_test/src/db.rs#L184"
        },
        {
          "anchor": "@@ -226,7 +227,7 @@ fn file_settings(db: &dyn SemanticDb, file: File) -> FileSettings {",
          "oldStart": 226,
          "newStart": 227,
          "sha256": "eaf664f1b9d1415a612b01d60828742791d38bc03a58913d901c9b2249817c2b",
          "classification": "test-settings-layout",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_test/src/db.rs#L227"
        },
        {
          "anchor": "@@ -238,7 +239,7 @@ enum FileSettings {",
          "oldStart": 238,
          "newStart": 239,
          "sha256": "7589d334c3d323949f573b96f9b48a7fcceb0e0a72c1625534c826b7e9d149ce",
          "classification": "test-settings-layout",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_test/src/db.rs#L239"
        },
        {
          "anchor": "@@ -247,14 +248,22 @@ impl FileSettings {",
          "oldStart": 247,
          "newStart": 248,
          "sha256": "f192398e34790ef520584ac754f621d3c2f4c8126f4382813f3f5cd1e252c1bf",
          "classification": "test-settings-layout",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_test/src/db.rs#L248"
        }
      ]
    }
  ],
  "runtimeQualifiedByThisAudit": false,
  "upstreamReady": false,
  "limits": [
    "Frozen historical inventories, including the 169-unit/939-hunk solver record, remain unchanged. Exact blob-pair reuse is source evidence, not runtime proof; an absent base file is a stable input, not a nonzero blob match.",
    "These 50 forward Rust source paths include mixed runtime/API, documentation, migration and existing test owners; source hunk accounting is not an independent PR count.",
    "Only exact reviewed whole/body hunk content is reused. Every other hunk has explicit current SHA review; no path or old-start fallback.",
    "Official cache/index/search migrations are upstream-owned; residual fork guards, ParamSpec projection and shared-resource plumbing are identified separately.",
    "Sty now pins this source-audited checkpoint. Runtime evidence remains separate from source audit; this audit grants no upstream submission approval.",
    "Separate exact writer receipts cover semantic904+35ignored, IDE1979, hooks/format/Clippy and a fresh full native Markdown census:507fixturesPASS/31baselineFAIL plus inventoryPASS. Network-backed inner cases retain default exclusion. This source audit itself runs no tests.",
    "Actual with_cfg root strict passes in a separate exact-source overlay with callback family, canonical receiver and strict replay repairs. It does not imply every host configuration is qualified.",
    "Existing upstream overlap gates remain, including #27106 truthiness composition and #29027 scoped existential binder prerequisites; generic-target universal quantification is not part of this candidate.",
    "No upstream submission approval, independent PR count or full-fork completion claim is asserted. Historical frozen inventories and runtime receipts retain their exact recorded inputs.",
    "The a0 global guard-stripping policy caused new full-native and fresh ecosystem regressions and was reversed. This replacement retains original exact immutable contradiction semantics; separate final writer receipts qualify native source composition with31baselineMarkdownfailures retained. Historical a0 results do not qualify this replacement, and no default promotion is asserted."
  ],
  "forwardReviewUnits": [
    {
      "id": "provisional-overload-return-structure",
      "title": "Preserve concrete structure while overload returns are provisional",
      "classification": "General Python candidate; built on existing divergent/cycle representation.",
      "nextAction": "Extract minimal upstream reproducer and retain settled ambiguity, bare pending/materialized marker and foreign-cycle controls.",
      "evidence": [
        {
          "label": "call/ambiguous.rs",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/ambiguous.rs#L18",
          "blob": "36154f80fcd011cc7d5d8e9b0649f475b6546770"
        }
      ],
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false,
      "trackerParent": "ty-solver-inference"
    },
    {
      "id": "checked-collection-write-evidence",
      "title": "Reuse checked collection-write argument types",
      "classification": "General Python inference correction; integrates fork identity-write path.",
      "nextAction": "Keep the two synthesized argument invariant explicit; qualify fresh/nested/callable RHS and invalid-write diagnostics alongside query-order cycles.",
      "evidence": [
        {
          "label": "infer/builder/subscript.rs",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder/subscript.rs#L1896",
          "blob": "7d83cf9a1fc9141ba992ced7baca5fa170fcda48"
        }
      ],
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false,
      "trackerParent": "ty-collection-use-inference"
    },
    {
      "id": "filtered-union-cycle-resolution",
      "title": "Retain closed filters during recursive union resolution",
      "classification": "Solver enhancement dependent on fork merged-solution owner.",
      "nextAction": "Separate positive closed filters, negative closed filters and shared resource accounting; preserve rejection of inferable complements, unsupported dependencies and growing container cycles.",
      "evidence": [
        {
          "label": "constraints/resolution.rs",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/resolution.rs#L190",
          "blob": "1692aa7e20f3b53295b3e6036a472ba3439cc748"
        }
      ],
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false,
      "trackerParent": "ty-solver-inference"
    },
    {
      "id": "shared-overload-argument-context",
      "title": "Commit shared overload argument context once",
      "classification": "General Python contextual inference candidate; known overlap gates remain open.",
      "nextAction": "Compare complete diffs of upstream PR27665 and29553, then retain raw-key/ParamSpec-key, reverse-order, differing/absent-context and exactly-once diagnostic controls.",
      "evidence": [
        {
          "label": "infer/builder.rs",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L7065",
          "blob": "fbd17433ac43b904172d5ddc25298b9fc1bd2524"
        }
      ],
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false,
      "trackerParent": "ty-contextual-callbacks"
    },
    {
      "id": "captured-keyword-key-iteration",
      "title": "Preserve captured keyword identity through key iteration",
      "classification": "Fork dictionary observation policy with ordinary Python ParamSpec behavior.",
      "nextAction": "Retain callee/other-argument/alias/closure-mutation exposure controls and establish upstream owner boundary before proposing extraction. Reconcile the preserved Observed keyword-prefix exclusions with upstream #30594 shared argument selection; this migration is not another independent contribution.",
      "evidence": [
        {
          "label": "dictionary/contents.rs",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1639",
          "blob": "f2dae47eace1122d52e881e45d37c4a1e6bb2fb2"
        },
        {
          "label": "Observed keyword-prefix exclusions",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/arguments.rs#L551",
          "blob": "fb68ab5c18565ce7ab3cc09921cb8d4956e52a5f"
        },
        {
          "label": "Shared selector integrated with observed keywords",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9621",
          "blob": "2c666f0fe15ffe4b8653f7157d44675e39b62785"
        }
      ],
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false,
      "trackerParent": "ty-dictionary-flow"
    },
    {
      "id": "deferred-receiver-obligations",
      "title": "Evaluate receiver obligations within active signature relations",
      "classification": "Recursive relation correction dependent on existing receiver contract representation.",
      "nextAction": "Retain recursive factory, shared-witness, strict gradual and nested immutable/mutable storage controls. Keep the previously qualified Sty membership cases in the current-head gate. Isolate the general receiver correction and its provided-instance dependency against upstream before requesting Tamir review.",
      "evidence": [
        {
          "label": "signatures.rs",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L868",
          "blob": "5d19725f68178456e30b4637a117f00c5238de79"
        },
        {
          "label": "Nested provided storage regression",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L557",
          "blob": "92d24415701b0c5d89140ad2a4d4864b570c4440"
        }
      ],
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false,
      "trackerParent": "ty-bound-receiver"
    },
    {
      "id": "bounded-typeis-arm-certification",
      "title": "Bound proof of constant TypeIs overload arms",
      "classification": "Existing predicate-certification family stabilization.",
      "nextAction": "Extract with certified predicate preservation and fail-closed complement distribution/resource controls; inspect upstream predicate overlap before proposing a separate change.",
      "evidence": [
        {
          "label": "call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L5453",
          "blob": "2c666f0fe15ffe4b8653f7157d44675e39b62785"
        }
      ],
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false,
      "trackerParent": "ty-guard-call-mapping"
    },
    {
      "id": "lazy-overload-expansion-feasibility",
      "title": "Preserve generic candidates until full expansion",
      "classification": "General Python ParamSpec/Concatenate inference candidate.",
      "nextAction": "Preserve source-signature inferables and bounded Lazy precheck; inconclusive proof must retain full expansion and final all-overload validation.",
      "evidence": [
        {
          "label": "call/bind.rs",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L4557",
          "blob": "2c666f0fe15ffe4b8653f7157d44675e39b62785"
        }
      ],
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false,
      "trackerParent": "ty-solver-inference"
    },
    {
      "id": "complete-empty-collection-context",
      "title": "Preserve caller types in empty collection contexts",
      "classification": "General Python inference candidate within the existing collection-use owner; upstream overlap review remains open.",
      "nextAction": "Compare with upstream PR27665 at its exact head, reduce the fix on current upstream, and preserve conflicting-consumer, invalid-write, alias and query-order controls before requesting Tamir review.",
      "evidence": [
        {
          "label": "Complete later collection context",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L9159",
          "blob": "fbd17433ac43b904172d5ddc25298b9fc1bd2524"
        }
      ],
      "trackerParent": "ty-collection-use-inference",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    },
    {
      "id": "observed-keyword-key-validation",
      "title": "Validate observed keyword mapping keys before unpacking",
      "classification": "Fork dictionary-observation integration correction; upstream extraction must preserve ordinary keyword-unpack validation.",
      "nextAction": "Keep this correction with the dictionary-observation extraction; preserve non-string key, TypedDict, ParamSpec and residual-key controls before requesting Tamir review.",
      "evidence": [
        {
          "label": "Validate keys before the unpack early return",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9244",
          "blob": "2c666f0fe15ffe4b8653f7157d44675e39b62785"
        },
        {
          "label": "Existing nested non-string key rejection",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/resources/mdtest/call/local_dictionary_unpacking.md#L206",
          "blob": "0e05200de1756e67995e1e5bdde514127b60d357"
        },
        {
          "label": "Existing copied non-string key rejection",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/resources/mdtest/call/local_dictionary_unpacking.md#L328",
          "blob": "0e05200de1756e67995e1e5bdde514127b60d357"
        }
      ],
      "trackerParent": "ty-dictionary-flow",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    },
    {
      "id": "native-type-tag-impossibility-proof",
      "title": "Prove impossible native type-tag comparisons",
      "classification": "Host type-test contract enhancement within the existing saved-tag narrowing owner; ordinary Python exact-class comparisons retain their existing semantics.",
      "nextAction": "Separate the registered-host contract from generic disjointness proof, retain bounded refusal and reflected/open/overlapping-domain controls, then establish an upstream owner and overlap before requesting Tamir review.",
      "evidence": [
        {
          "label": "Bounded native tag impossibility owner",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/narrow.rs#L272",
          "blob": "f08f563acd3b82a1f0bc238ad8df1f4bd2d9d9a4"
        },
        {
          "label": "Comparison inference consumes cached operands",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L13756",
          "blob": "fbd17433ac43b904172d5ddc25298b9fc1bd2524"
        },
        {
          "label": "Positive and fail-closed native contract controls",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L3197",
          "blob": "92d24415701b0c5d89140ad2a4d4864b570c4440"
        }
      ],
      "trackerParent": "ty-saved-tag-narrowing",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    },
    {
      "id": "tracked-mapping-after-arguments-snapshot",
      "title": "Observe tracked mapping arguments after evaluation",
      "classification": "Dictionary observation integration correction using the existing snapshot recorder.",
      "nextAction": "Keep positional/named timing, alias/rebinding, mutation and identity guards together; preserve precise empty/update observations and measure snapshot retention before upstream extraction.",
      "evidence": [
        {
          "label": "Shared after-all-arguments recorder",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_core/src/builder/dictionary_contents.rs#L474",
          "blob": "9bf157bf4d035a9b7b886f07235ba2fa7dbc100c"
        },
        {
          "label": "Mutation, rebinding and ordinary/named controls",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/provided/tests.rs#L4321",
          "blob": "92d24415701b0c5d89140ad2a4d4864b570c4440"
        }
      ],
      "trackerParent": "ty-dictionary-flow",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    },
    {
      "id": "sealed-builtin-string-add-recovery",
      "title": "Preserve fresh mapping fields across exact string concatenation",
      "classification": "Literal precision and dictionary-recovery integration; existing exact-runtime-class owner supplies dispatch proof.",
      "nextAction": "Extract with dictionary recovery, retain open/custom-final/reflected/nested-call refusal and LiteralString subclass controls; identify an upstream consumer before requesting Tamir review.",
      "evidence": [
        {
          "label": "Exact builtin identity plus existing runtime-class proof",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1289",
          "blob": "f2dae47eace1122d52e881e45d37c4a1e6bb2fb2"
        },
        {
          "label": "Operand proof and recursive child traversal",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1256",
          "blob": "f2dae47eace1122d52e881e45d37c4a1e6bb2fb2"
        },
        {
          "label": "Ordinary/final subclasses do not satisfy LiteralString",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/resources/mdtest/annotations/literal_string.md#L425",
          "blob": "a9eb51fe99ae9060fc347f156842c8f2eee75d09"
        }
      ],
      "trackerParent": "ty-dictionary-flow",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    },
    {
      "id": "sibling-dependent-empty-getattr-context-replay",
      "title": "Replay fresh empty getattr defaults after sibling inference",
      "classification": "Existing builtin finite-lookup context scheduling; general Python candidate with separate host integration evidence.",
      "nextAction": "Retain fresh-empty/matched-builtin eligibility, bounded context convergence, heterogeneous defaults and final actual-call checks; qualify any extraction on its exact upstream base.",
      "evidence": [
        {
          "label": "Shared matched builtin default eligibility",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/call/bind.rs#L9932",
          "blob": "2c666f0fe15ffe4b8653f7157d44675e39b62785"
        },
        {
          "label": "Sibling-dependent replay and bounded context equality",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/builder.rs#L6319",
          "blob": "fbd17433ac43b904172d5ddc25298b9fc1bd2524"
        }
      ],
      "trackerParent": "ty-contextual-empty",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    },
    {
      "id": "recursive-unpack-indeterminate-marker-classification",
      "title": "Keep settled recursive payloads during unpack narrowing",
      "classification": "Reuses existing alias-aware indeterminate-inference owner; no new singleton-row or coinductive acceptance policy.",
      "nextAction": "Preserve settled recursive payload regression alongside correlated union rows, genuine provisional/divergent markers and growing-alias refusal.",
      "evidence": [
        {
          "label": "Existing indeterminate marker predicate",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/unpacker.rs#L335",
          "blob": "6367fdeb22350d7ca89748569b214d300f0f833a"
        },
        {
          "label": "Recursive payload remains visible after tuple unpacking",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/resources/mdtest/narrow/complex_target.md#L321",
          "blob": "aa2d371873e958cd9fc86a19e1168f546ff6bc1b"
        }
      ],
      "trackerParent": "ty-boolean-payload-tuples",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    },
    {
      "id": "dictionary-comprehension-body-domain-propagation",
      "title": "Carry checked overload domains through dictionary comprehensions",
      "classification": "Opt-in host body-domain API; lexical dictionary comprehension scope plus canonical dictionary/TypedDict receiver evidence. General Python overload inference is unchanged.",
      "nextAction": "Extract host API with per-overload identity, first-iterator scope, shadowing/freshness and every receiver component checked. Actual with_cfg root strict passes only with the separate caller-witness and strict-signature repairs; this source audit grants no runtime qualification.",
      "evidence": [
        {
          "label": "Lexical dictionary comprehension scope boundary",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L302",
          "blob": "d6e9bbb074e893cf0586ada96f668dce38f60cc8"
        },
        {
          "label": "Per-domain scope and callback-input native controls",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1475",
          "blob": "d6e9bbb074e893cf0586ada96f668dce38f60cc8"
        },
        {
          "label": "Domain-keyed scope query routing",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer.rs#L834",
          "blob": "5c0f11102d29947d81b58786d0e335164a042721"
        },
        {
          "label": "Union/intersection canonical method proof",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/infer/body_domain.rs#L893",
          "blob": "d6e9bbb074e893cf0586ada96f668dce38f60cc8"
        }
      ],
      "trackerParent": "ty-overload-bodies",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    },
    {
      "id": "exact-immutable-builtin-truthiness",
      "title": "Eliminate contradictory guards for exact immutable builtins",
      "classification": "Existing exact immutable contradiction proof retained. The rejected a0 global leftover-guard stripping policy is absent from this guard-preserving checkpoint.",
      "nextAction": "Preserve open builtin, mutable/stateful and custom-final refusals in any upstream extraction. Reconcile future #27106 proposals separately; the rejected global guard-stripping policy is absent. Host/default promotion remains separate from native source receipts.",
      "evidence": [
        {
          "label": "Stable builtin taxonomy requires exact runtime proof",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/class/known.rs#L321",
          "blob": "9a8cfa890cc1a6489288418208a86ae7a4ffcd29"
        },
        {
          "label": "Original exact immutable contradiction proof remains",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L2674",
          "blob": "266e74ad286ef5052ed6dded90be18870faef551"
        },
        {
          "label": "Open int subclass stays conservative",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/resources/mdtest/narrow/truthiness.md#L227",
          "blob": "0dcf02e94774eb1bec898029670fcb3db9ef0e88"
        }
      ],
      "trackerParent": "ty-saved-tag-narrowing",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    },
    {
      "id": "constrained-callback-original-equality-witness",
      "title": "Preserve constrained caller witnesses in callbacks",
      "classification": "General Python fork regression fix; original bidirectional evidence, caller domain proof and full correlated path validation are all required.",
      "nextAction": "Retain compatible/open/wrong callback controls and original-evidence, mixed/concrete, domain, provisional and incomplete refusals; upstream extraction must preserve the existing scoped-family solver owner.",
      "evidence": [
        {
          "label": "Original lower/upper equality certificate",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints.rs#L3432",
          "blob": "74b945bcfc0e304eff35ccb3fc82656e432f44dd"
        },
        {
          "label": "Caller domain proof before single-alternative family retention",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/constraints/solutions.rs#L2188",
          "blob": "cb3fe895d3b3e73b3cfa14713357c71162f75510"
        },
        {
          "label": "Maintained callback correlation regression",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/resources/mdtest/generics/pep695/functions.md#L6232",
          "blob": "9d4d738e4d6113ece9e533430291fb7f239010af"
        }
      ],
      "trackerParent": "ty-solver-inference",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    },
    {
      "id": "strict-callback-source-witness-replay",
      "title": "Prove strict callbacks with fixed constrained callers",
      "classification": "General Python strict callable relation; reuses bounded complete-source substitution and whole-signature replay, without changing Sty strictness or target-variable ownership.",
      "nextAction": "Preserve rigid bounded/constrained caller controls in both syntax styles, shared-witness/Any negatives and incomplete refusal; qualify extraction with actual strict host consumers and existing recursive relation controls.",
      "evidence": [
        {
          "label": "Narrow original-LazyStatic false relation fallback",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/src/types/signatures.rs#L3868",
          "blob": "5d19725f68178456e30b4637a117f00c5238de79"
        },
        {
          "label": "Legacy caller domains and invariant negatives",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/resources/mdtest/generics/legacy/callables.md#L2244",
          "blob": "e6f703efc6136a6dd2813353a2e10f480b19363e"
        },
        {
          "label": "PEP695 caller domains and invariant negatives",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_python_semantic/resources/mdtest/generics/pep695/callables.md#L2172",
          "blob": "b9ea1a0d0892980e03e6bb769645488bfd05f9ca"
        }
      ],
      "trackerParent": "ty-solver-inference",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    }
  ],
  "manifest": [
    {
      "path": ".bazelignore",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "eb5a316cbd195d26e3f768c7dd8e1b47299e17f8",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": ".bazelrc",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "e4797d4904c62e22a1c41f8afb7ee9a6bdc4090a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": ".bazelversion",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "3b74042132a683b3543766b643b14c4e8ad6d698",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": ".gitignore",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f75e68c745faa65c65e073d107224cfd32fab025",
      "candidateBlob": "685e64bdc59d59b1a12a6f81d01eab7198bf03ec",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "f75e68c745faa65c65e073d107224cfd32fab025",
      "frozenCandidateBlob": "f75e68c745faa65c65e073d107224cfd32fab025",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "db74d9dc0df1cdbb25f6a846a2cc8adbbc08c32e",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "Cargo.lock",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "98c87d371d5621d907e786b63c34a60005b077c7",
      "candidateBlob": "6fba1b35bfa0037f10e1f6a352bdd4f8bf7c318b",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-infrastructure",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "2dfa71c6702eb8d3107ddb8103e2d2f64ac270e7",
      "frozenCandidateBlob": "de94bb67e18fa420980965860b40f6d3dd14b185",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "MODULE.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "8f074e5a4f8a88f4645471981e8ad9f89449a633",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "MODULE.bazel.lock",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "80f1bd02f3a04df9e1fcb458591f27fc0b32715d",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "_typos.toml",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1eed158b68259f920b7da5e716b4649c36974855",
      "candidateBlob": "a69786813a03b86da8769800033cd73e515ff343",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "1eed158b68259f920b7da5e716b4649c36974855",
      "frozenCandidateBlob": "1eed158b68259f920b7da5e716b4649c36974855",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "bazel/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "37b6b05ba62d70a61eec8b21bcdf2865812bab61",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "bazel/README.md",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "d29b6bb2c5edc6d6cb0d63e605d4538bbeb70dab",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "bazel/buildbuddy.bazelrc",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "527d1661fb6c76b339eec9dcebe10ea071d37ef4",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "bazel/cargo-bazel.json",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "28168252e06de2d1c13ba2c90d0a74046b863950",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "bazel/cargo_metadata.bzl",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "ff0458f621c062d8c5b48e05683bc65ab60926cd",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "bazel/datatest-stable-file-symlinks.patch",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "c3a9b3738e855bd7e35a695969b840aee5c97f1b",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "bazel/datatest_file_links.sh",
      "oldMode": "000000",
      "newMode": "100755",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "41b365eb491d59aa4e5cd121faa8576ae62eb667",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure",
      "path": "bazel/mdtest.bzl",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "83078467c3449fd5e75a23ab3ae7298dfdd28719",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review"
    },
    {
      "path": "bazel/mdtest_external.sh",
      "oldMode": "000000",
      "newMode": "100755",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "871f7732b9f8c4a6371481377aaef4cd9a8b0896",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure",
      "path": "bazel/mdtest_fixture.sh",
      "oldMode": "000000",
      "newMode": "100755",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "e883d19c637303674d80d8a0709eb5347af3ff71",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review"
    },
    {
      "path": "bazel/metadata_snapshot.sh",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "9a407c9fdac401245b24152fb7a415bc9578a5b1",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "bazel/qualification_hooks.sh",
      "oldMode": "000000",
      "newMode": "100755",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "c34159c347e5023fdcf07b662192f76a3e1da74b",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "bazel/rust_crate.bzl",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "50abb82f5de28b4ef6564e549927b6e62289247b",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "bazel/test_data/datatest_symlink.md",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "5771fc8e5dd22c51c52a20db1abf666f44667e8e",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "bazel/workspace_metadata.bzl",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "217f0301306e2a89b89808e4a019827f36a92d08",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/mdtest/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "5c544ab9dd0052b61fbc233ae5aad570d5f219ca",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_annotate_snippets/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "8172b501dcf0021e66d5b4ff2246afe1e652be3d",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_benchmark/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_benchmark/benches/ty.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "5cce22b6cf4bcd9b1086b92a8036692b3420d997",
      "candidateBlob": "1a65f0ffaada09a98e8bfbb1a8ace6dd2af0bbb5",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-infrastructure",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "5cce22b6cf4bcd9b1086b92a8036692b3420d997",
      "frozenCandidateBlob": "1a65f0ffaada09a98e8bfbb1a8ace6dd2af0bbb5",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_cache/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "1786c946485eb07f43c7182bee4188a0a33b1899",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_command_line/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "f9391ad5ac39f7a40510cb8974c00ed66559856a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_db/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "d35ad23a252080c578bbecf88b606e1fcb4d6d93",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_db/src/files.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "70fa68d09ad3260914a54ab06035bc8af8de6568",
      "candidateBlob": "2912382921782a2cf884452f90441fc8e044e6db",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "70fa68d09ad3260914a54ab06035bc8af8de6568",
      "frozenCandidateBlob": "2912382921782a2cf884452f90441fc8e044e6db",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ruff_db/src/lib.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "28d52a38360fc9f75e469edefcbb5468486d4fcd",
      "candidateBlob": "3bcda94de0df6c60ab17d777b7171f7688d53513",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "28d52a38360fc9f75e469edefcbb5468486d4fcd",
      "frozenCandidateBlob": "3bcda94de0df6c60ab17d777b7171f7688d53513",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ruff_db/src/parsed.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "82488856193f38c71b31b800104fe4953bfb0321",
      "candidateBlob": "97c7482d09f6678e38544c1036ea4d806231b112",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "82488856193f38c71b31b800104fe4953bfb0321",
      "frozenCandidateBlob": "97c7482d09f6678e38544c1036ea4d806231b112",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ruff_db/src/vendored.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "d07ce52a16b15f8941038548af8b076178bcac75",
      "candidateBlob": "058bbe4dd1e2e3062263c5d39b84d55bd6c20f7c",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "d07ce52a16b15f8941038548af8b076178bcac75",
      "frozenCandidateBlob": "058bbe4dd1e2e3062263c5d39b84d55bd6c20f7c",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ruff_dev/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_diagnostics/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "eb8dcb1ba7cae1f85dd44d1364ca8502b148b7c1",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_formatter/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "1466d59c375151f85285b612353e74ef5e17b128",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_graph/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_index/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "5ef0bff7daa9a7323b542bd7718f53a1ff42deaa",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_linter/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_macros/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "9f769a5a6667ba8e2eb806d4bee67760c78ddf9a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_markdown/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_mdtest/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_memory_usage/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "01440de6035a725cd070222f44118b6cb53f3d99",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_notebook/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "856fe0af95e4dec7d3b006b81478c145818175d9",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_options_metadata/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "df9ecaf0c98e02ecad4f87e2860931b6fa1db736",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_ast/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "4e65ee17a57d3ab538a781f16b4066c570c3a4c1",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_ast/src/lib.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "dd00135d8adfd226733a8d098d21de0feece19bb",
      "candidateBlob": "2c2e477d7a448e4046df2f753c42849fb3755a41",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "7f2eae3fd693261376e3d60fd0ae0b8075c372c1",
      "frozenCandidateBlob": "f8f359765f2ff44c31455b27cd4bc25b47ec8ae0",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ruff_python_ast_integration_tests/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_codegen/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "4b522b80234e6e67b26eddeab23c48fc2e1f1955",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_edits/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "898b404b73455ed1379dcbb2787a6d6fcbd23f6b",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_formatter/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "3819b9a5bfbc7dd43443a9f4df7d096a8dbd6fbf",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_importer/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "d5a863e2b234423d1d39f0753ade620892e79785",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_index/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_literal/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "e8532d0e6b929e841f129804d403bfde3da0ba51",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_parser/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "41b210a6e1778c564386ef78ee5367136b0a6212",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_parser/src/lib.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1cd71e48240d8f3342dede6ae3c45f9c6a8beacc",
      "candidateBlob": "71a864e6c2efa0b67746c7f777d55a4ce46d0a32",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "1cd71e48240d8f3342dede6ae3c45f9c6a8beacc",
      "frozenCandidateBlob": "71a864e6c2efa0b67746c7f777d55a4ce46d0a32",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ruff_python_parser/src/parser/expression.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ef79f0c04e91808575091e530938102a993a6c75",
      "candidateBlob": "fa42d610a9f76bbd3b12e8e486fe9ded58556747",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "ef79f0c04e91808575091e530938102a993a6c75",
      "frozenCandidateBlob": "fa42d610a9f76bbd3b12e8e486fe9ded58556747",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ruff_python_parser/src/parser/mod.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "813c9ea12324a6d2084e6f9c96827a18d2eaed80",
      "candidateBlob": "943235b937c2b27d5d531e5c3647b39094e45611",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "813c9ea12324a6d2084e6f9c96827a18d2eaed80",
      "frozenCandidateBlob": "943235b937c2b27d5d531e5c3647b39094e45611",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ruff_python_parser/src/parser/options.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ec87a72d1e481972ddbdb7d84b2b04edeafe5cc3",
      "candidateBlob": "a58534c30de12260147ecde712fbcc7d552b48f2",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "ec87a72d1e481972ddbdb7d84b2b04edeafe5cc3",
      "frozenCandidateBlob": "a58534c30de12260147ecde712fbcc7d552b48f2",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ruff_python_parser/src/parser/statement.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1b441f38e18ed71dd307276a1e013cd5bcf4ae61",
      "candidateBlob": "398414cd188b9ab05300d7a7ab91d9c6b67bc021",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "1b441f38e18ed71dd307276a1e013cd5bcf4ae61",
      "frozenCandidateBlob": "398414cd188b9ab05300d7a7ab91d9c6b67bc021",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ruff_python_parser/src/string.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "cc30e59ecfc7512e8e6dbeb94bd85d68e0d139f1",
      "candidateBlob": "12802200df865f06053742f4ab20e2315f9e0028",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "cc30e59ecfc7512e8e6dbeb94bd85d68e0d139f1",
      "frozenCandidateBlob": "12802200df865f06053742f4ab20e2315f9e0028",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ruff_python_semantic/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_stdlib/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "a2bd3cf5cfc3d909d15614604dfa7b9c5861484e",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_trivia/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "dfaacd4697be9202e543d32478d138e811d46783",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_python_trivia_integration_tests/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_ranged_value/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "52ee99e8e679aff68074cc7c9e1d5337647956b1",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_server/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_source_file/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "8a15b3eee5d6e00ef50aba0cfe7943dbdfb73df0",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_text_size/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "3b486713a19fddf71e05bf4daa7777c0ee8bb065",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_unicode_names2/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "3737f6fe0ef30f6abd11e7d327f43eb70e3a6a0f",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_unicode_names2_generator/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "ca49646ea418fbf019a114eb33d85880e667d171",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_wasm/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ruff_workspace/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "d492f4cce3972fb345cc076b1c7f554689a1bafd",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_combine/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "94007036a0db3379465ad256afcaed8fc3ae9db8",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_completion_bench/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_completion_eval/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_ide/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "9a852f8e960b31e38097b5a991fb3bafe489770f",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_ide/src/completion.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f7f62ab284af26f8d3e93feb44dc8159f58ba26e",
      "candidateBlob": "751fd3167465700d4c62960d6661600fbd98dce5",
      "status": "M",
      "frozenRecord": [
        "embedded-ide-entrypoints-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "f7f62ab284af26f8d3e93feb44dc8159f58ba26e",
      "frozenCandidateBlob": "751fd3167465700d4c62960d6661600fbd98dce5",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_ide/src/folding_range.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "afcc3ea6c83092f76cbcb30ce9f1703128ae17c9",
      "candidateBlob": "80060a43a176c324a55b796b7c0db400f47d308a",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "afcc3ea6c83092f76cbcb30ce9f1703128ae17c9",
      "frozenCandidateBlob": "80060a43a176c324a55b796b7c0db400f47d308a",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_ide/src/goto.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "b17a8f19a2e30abbb87f3fc0af6b9928ea3c6b9b",
      "candidateBlob": "ef58f69288ad5ab4b8824eaa0c9bc5357697ad77",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "b17a8f19a2e30abbb87f3fc0af6b9928ea3c6b9b",
      "frozenCandidateBlob": "ef58f69288ad5ab4b8824eaa0c9bc5357697ad77",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_ide/src/inlay_hints.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "9747917dbd1a7475de307b87fa11828416143332",
      "candidateBlob": "3a291cb84ab726c16f0b758866f2ce797f8d4bdd",
      "status": "M",
      "frozenRecord": [
        "embedded-ide-entrypoints-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "9747917dbd1a7475de307b87fa11828416143332",
      "frozenCandidateBlob": "8535ee2e8ff9f0c7db0231b87ffd7271eb7a5fff",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_ide/src/lib.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1c27732b458fb119c0ff6d9992e3d84a70d3d2ec",
      "candidateBlob": "0c602d2e2cf4a5f03c775c36c958e0213e06b049",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "1c27732b458fb119c0ff6d9992e3d84a70d3d2ec",
      "frozenCandidateBlob": "0c602d2e2cf4a5f03c775c36c958e0213e06b049",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_ide/src/references.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "7bfbd3a283369de30c4b49f0dd566c327503eb9c",
      "candidateBlob": "abaf856eebb18a3325b3ff44325a877902076273",
      "status": "M",
      "frozenRecord": [
        "embedded-ide-entrypoints-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "7bfbd3a283369de30c4b49f0dd566c327503eb9c",
      "frozenCandidateBlob": "abaf856eebb18a3325b3ff44325a877902076273",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_ide/src/selection_range.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "686ec08ad16dda336628072ac1092720c5867883",
      "candidateBlob": "891d9ca5a1bf38e14a9b00a4e222135878802fbc",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "686ec08ad16dda336628072ac1092720c5867883",
      "frozenCandidateBlob": "891d9ca5a1bf38e14a9b00a4e222135878802fbc",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_ide/src/semantic_tokens.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "b1f30fd5d26df6c33dd2b1b9a128e87e27cb927a",
      "candidateBlob": "8ec5fbe176c9e39bd51e75452c43a4d89d5c8050",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "b1f30fd5d26df6c33dd2b1b9a128e87e27cb927a",
      "frozenCandidateBlob": "8ec5fbe176c9e39bd51e75452c43a4d89d5c8050",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_ide/src/signature_help.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "90e20c77e9720004ca15d51c60a1a215623b3a01",
      "candidateBlob": "7a24c3010c93a9bb039ad415f5f0f86c962069ea",
      "status": "M",
      "frozenRecord": [
        "embedded-ide-entrypoints-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "90e20c77e9720004ca15d51c60a1a215623b3a01",
      "frozenCandidateBlob": "7a24c3010c93a9bb039ad415f5f0f86c962069ea",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_ide/src/snapshots/ty_ide__signature_help__tests__signature_help_positional_argument_after_keyword.snap",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "4e134553fa85a3efa591f7271145a5b96e0e0490",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "4e134553fa85a3efa591f7271145a5b96e0e0490",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_module_resolver/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "50a11c03aa963ebcfd9d5bb42468027301b3ccf1",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_project/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "3a26c30975c2b5e17d930efa211db4011a5c1820",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_project/src/metadata/options.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "c87223ce2f5c532c48a4e24800a6d3959ee5fba6",
      "candidateBlob": "0b67aacfce62a83387d47091c62eb8ddf0925682",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "c87223ce2f5c532c48a4e24800a6d3959ee5fba6",
      "frozenCandidateBlob": "0b67aacfce62a83387d47091c62eb8ddf0925682",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "b2c313dd0c1f096c260e2a84e7a08848df486f3d",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_python_core/src/ast_ids.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "6632d57251e2398fdc25d61f910cb6ed93913ac6",
      "candidateBlob": "d7e0de581a5c6b95ef0891312324854cb482a0ff",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "6632d57251e2398fdc25d61f910cb6ed93913ac6",
      "frozenCandidateBlob": "8814840dd42c607e6ae6d40f367ea6064479e056",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_core/src/builder.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "e2e7e11f15a92b43cb527186b96930736e26ebf9",
      "candidateBlob": "2d9d2abf20c5439f3fca6f64b7675827db21de7a",
      "status": "M",
      "frozenRecord": [
        "semantic-consumer-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "46e1cd00f0d6c873d818cb6df7067b0e22b450ea",
      "frozenCandidateBlob": "e94c3578c96d5a9c903cd5dec1ca966625b8f9b8",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_core/src/builder/dictionary_contents.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "9bf157bf4d035a9b7b886f07235ba2fa7dbc100c",
      "status": "A",
      "frozenRecord": [
        "dictionary-transfer-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "6a7737589365246bad6d6b7a835df63f9e50effe",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_core/src/builder/loop_bindings_visitor.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "eb52d2b400dffda0790cc4d4c9da3f102fcb5ac7",
      "candidateBlob": "f1e435e659328f64818421e5c6173202bd724778",
      "status": "M",
      "frozenRecord": [
        "core-flow-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "eb52d2b400dffda0790cc4d4c9da3f102fcb5ac7",
      "frozenCandidateBlob": "f1e435e659328f64818421e5c6173202bd724778",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/db.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "4a8f18ae2ed016e0ea57477d2466893b46d012bc",
      "candidateBlob": "8126c835788d6fbc3ec6fcb11ae27cf71ee1871f",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "4a8f18ae2ed016e0ea57477d2466893b46d012bc",
      "frozenCandidateBlob": "8126c835788d6fbc3ec6fcb11ae27cf71ee1871f",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/definition.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "b58798bcbd397382962bef09b78685540f34bf84",
      "candidateBlob": "d706b6b84cd72cc76b7dcd2fb7a3709dc672cd49",
      "status": "M",
      "frozenRecord": [
        "semantic-consumer-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "c6cc279650873a1548d67f3011f9cf2231c3d7ba",
      "frozenCandidateBlob": "e8390beaca852c71b060b1b405d15da48c2e5e8b",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_core/src/lib.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "9e88cb61d7978258df498cd9186ab3899f44e8b0",
      "candidateBlob": "71946dec0e001c3b0e2053266800075a8592c28d",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "9e88cb61d7978258df498cd9186ab3899f44e8b0",
      "frozenCandidateBlob": "71946dec0e001c3b0e2053266800075a8592c28d",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/member.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "dbb15f9fa988ce115c4d2fa804d70f9d984c6c29",
      "candidateBlob": "59d0edd292827acdb9162296ed50671af787e2d6",
      "status": "M",
      "frozenRecord": [
        "core-flow-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "dbb15f9fa988ce115c4d2fa804d70f9d984c6c29",
      "frozenCandidateBlob": "59d0edd292827acdb9162296ed50671af787e2d6",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/narrowing_constraints.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "3f043fbc2e08dae95eb99b7803e106a992443a67",
      "candidateBlob": "009517cbf9d8029df7898a25fd30c92340c7e732",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "3f043fbc2e08dae95eb99b7803e106a992443a67",
      "frozenCandidateBlob": "009517cbf9d8029df7898a25fd30c92340c7e732",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/place.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "75b261e99815375444c2686be7fa313171e7730c",
      "candidateBlob": "9e590c0c792580a2efc26da9ac737cd4bdfe2a58",
      "status": "M",
      "frozenRecord": [
        "core-flow-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "b72312121055127710a6831eb2d66c42796f85a2",
      "frozenCandidateBlob": "578d5e4db94e7a853938f8b309b0bb7aa670f1bd",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_core/src/predicate.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "2bba71e7e90624831986756feeb7b40f53d885b8",
      "candidateBlob": "8a651f8702349f98da18d02dc27df1639f83a52e",
      "status": "M",
      "frozenRecord": [
        "core-flow-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "2bba71e7e90624831986756feeb7b40f53d885b8",
      "frozenCandidateBlob": "8a651f8702349f98da18d02dc27df1639f83a52e",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/program.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "2c8e79d0df2aaf85bc7a6cb304f1f57a9875f969",
      "candidateBlob": "d7fc9a2d0cd2d52802a15d93de4c609317f77e73",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "2c8e79d0df2aaf85bc7a6cb304f1f57a9875f969",
      "frozenCandidateBlob": "d7fc9a2d0cd2d52802a15d93de4c609317f77e73",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/program_file.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "bc6548a6d825862c6200e785282b58de8a3b5bb5",
      "candidateBlob": "aa819e2f2811aba055d1a6c5086dfc50ca639886",
      "status": "M",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "bc6548a6d825862c6200e785282b58de8a3b5bb5",
      "frozenCandidateBlob": "aa819e2f2811aba055d1a6c5086dfc50ca639886",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/re_exports.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "954e51de8cdc082d4bf048382993266083150cd3",
      "candidateBlob": "ada1d6259ff30aae266a30b47a77d67d979bc82e",
      "status": "M",
      "frozenRecord": [
        "semantic-consumer-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "954e51de8cdc082d4bf048382993266083150cd3",
      "frozenCandidateBlob": "ada1d6259ff30aae266a30b47a77d67d979bc82e",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/reachability_constraints.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "89dadb68a68e9f86fe0f6a813e99830d356b26a9",
      "candidateBlob": "d188c7469ea0acdec530bcd45497977cfd4f3da9",
      "status": "M",
      "frozenRecord": [
        "core-flow-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "89dadb68a68e9f86fe0f6a813e99830d356b26a9",
      "frozenCandidateBlob": "4a52a5e1e4a3062476d78eefd1d49d14c75c3092",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_core/src/scope.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "6ea1cbf91e13270a9faee1c9a0b337c54fec7d44",
      "candidateBlob": "6bfb89b2e0a5a659ec0529a71686f59319090a3a",
      "status": "M",
      "frozenRecord": [
        "core-flow-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "6ea1cbf91e13270a9faee1c9a0b337c54fec7d44",
      "frozenCandidateBlob": "6bfb89b2e0a5a659ec0529a71686f59319090a3a",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/source_exclusions.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "0dc294358fd78564b0a69836975b23680b2e53fc",
      "status": "A",
      "frozenRecord": [
        "parser-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0dc294358fd78564b0a69836975b23680b2e53fc",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/symbol.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "02df261f089724bb7bfa542be9366297068777fc",
      "candidateBlob": "9d96460d00ddb5f8128738007d3271bfcc35d957",
      "status": "M",
      "frozenRecord": [
        "core-flow-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "02df261f089724bb7bfa542be9366297068777fc",
      "frozenCandidateBlob": "9d96460d00ddb5f8128738007d3271bfcc35d957",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/use_def.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "e85e26d8b1d6c5679ee6141927060cdf23717c0d",
      "candidateBlob": "131871bb10239bb1d2743a6b88efef7edc08dc45",
      "status": "M",
      "frozenRecord": [
        "core-flow-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "e85e26d8b1d6c5679ee6141927060cdf23717c0d",
      "frozenCandidateBlob": "131871bb10239bb1d2743a6b88efef7edc08dc45",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_core/src/use_def/place_state.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "796639ed5f99334f4e7460b754ef929be1983479",
      "candidateBlob": "3c96563af060fff4a5b0164dd8cb188f024a0bab",
      "status": "M",
      "frozenRecord": [
        "core-flow-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "796639ed5f99334f4e7460b754ef929be1983479",
      "frozenCandidateBlob": "3c96563af060fff4a5b0164dd8cb188f024a0bab",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "022580f8d6aac6c292a56d51061817c5b181b54a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_python_semantic/Cargo.toml",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "cea2201bca596f9b7a94984bbb580d9661575017",
      "candidateBlob": "504841c7ffff654b7de3bef85b2b6fb1ac626162",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-infrastructure",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "cea2201bca596f9b7a94984bbb580d9661575017",
      "frozenCandidateBlob": "504841c7ffff654b7de3bef85b2b6fb1ac626162",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_python_semantic/resources/lint_docs/blanket-ignore-comment.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "2c5090d8ac60dead0701cac7b290d1a9822dcfbf",
      "candidateBlob": "7a0eb6124435583be4ae19de5cc18c5d2db0ab0e",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-docs",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "2c5090d8ac60dead0701cac7b290d1a9822dcfbf",
      "frozenCandidateBlob": "7a0eb6124435583be4ae19de5cc18c5d2db0ab0e",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/annotations/generic_alias.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "fd45a5cc486247bcdee206ea44d30771bb718a72",
      "candidateBlob": "afc6e9c3f90d05e9953764ff9379057b66b515b8",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "fd45a5cc486247bcdee206ea44d30771bb718a72",
      "frozenCandidateBlob": "afc6e9c3f90d05e9953764ff9379057b66b515b8",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/annotations/literal_string.md",
      "frozenBaseBlob": "726e2343c30427516b637ae9f07134712cc6c841",
      "frozenCandidateBlob": "726e2343c30427516b637ae9f07134712cc6c841",
      "frozenRecord": [],
      "frozenRole": null,
      "disposition": "supporting-test",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "726e2343c30427516b637ae9f07134712cc6c841",
      "candidateBlob": "a9eb51fe99ae9060fc347f156842c8f2eee75d09",
      "status": "M",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/annotations/self.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "2364c1fb1e09a0aab534cdfa0af5f0a63bf417ab",
      "candidateBlob": "a3547c85ecaf55a530f89627dd8ae93ac8d1f915",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "2364c1fb1e09a0aab534cdfa0af5f0a63bf417ab",
      "frozenCandidateBlob": "a3547c85ecaf55a530f89627dd8ae93ac8d1f915",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/assignment/augmented.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ab34865c0444ffb64d92aae99281daa8f3c4d801",
      "candidateBlob": "1c5d323393e4e74f365b0e37a5b523abd2d9eada",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "ab34865c0444ffb64d92aae99281daa8f3c4d801",
      "frozenCandidateBlob": "1c5d323393e4e74f365b0e37a5b523abd2d9eada",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/assignment/unbound.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "06be0b4d863eae270d054909627e9a56916b3476",
      "candidateBlob": "1d7d6cedb6d996353b02f45150edbc15f7dacf03",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "06be0b4d863eae270d054909627e9a56916b3476",
      "frozenCandidateBlob": "1d7d6cedb6d996353b02f45150edbc15f7dacf03",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/attributes.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "46f09f1146dfb01e136f02c62062dacd59fb292c",
      "candidateBlob": "3fc8188ab1b98260dd6d28682adb157c5961791c",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "46f09f1146dfb01e136f02c62062dacd59fb292c",
      "frozenCandidateBlob": "3fc8188ab1b98260dd6d28682adb157c5961791c",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/bidirectional.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "e1ba9a3a99f3d2c576ef1230f171a3e78dbe41b2",
      "candidateBlob": "85d3afe5d6ca46858cb82db790b0234a1b6e3088",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "e1ba9a3a99f3d2c576ef1230f171a3e78dbe41b2",
      "frozenCandidateBlob": "85d3afe5d6ca46858cb82db790b0234a1b6e3088",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/binary/custom.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "43311304774205287204d73ce6e41f8ae3a9a9ef",
      "candidateBlob": "b573bbc3c1caaa7d6d67128e75eaac6a14a15fad",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "43311304774205287204d73ce6e41f8ae3a9a9ef",
      "frozenCandidateBlob": "b573bbc3c1caaa7d6d67128e75eaac6a14a15fad",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/call/builtins.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "8ac398c0b095c7dc4a36197d16eb0c4c35458664",
      "candidateBlob": "16eb215ff5c5037ff4bbffc005cba822a9cd43e3",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "8ac398c0b095c7dc4a36197d16eb0c4c35458664",
      "frozenCandidateBlob": "16eb215ff5c5037ff4bbffc005cba822a9cd43e3",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/call/constructor.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "17297e7944ec401ef6698ff6c26b3bfec9f7a28b",
      "candidateBlob": "14c2a63943a4ba0ae070d5b427beecfee196d06b",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "17297e7944ec401ef6698ff6c26b3bfec9f7a28b",
      "frozenCandidateBlob": "16820e232dc72c91d8e995466352b5044955ad4f",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/call/dictionary_contents.md",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "3e55edc3af5b86cc11a8d0d6197b347298c080cb",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "3e55edc3af5b86cc11a8d0d6197b347298c080cb",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/call/function.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "c8acbfea7b4e1065ac3eff7b6109ff37770ffbb8",
      "candidateBlob": "720eb5b78cd033b28a513b08c094e559793c5162",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "c8acbfea7b4e1065ac3eff7b6109ff37770ffbb8",
      "frozenCandidateBlob": "720eb5b78cd033b28a513b08c094e559793c5162",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/call/getattr.md",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "50c4e42eb7e043f1c1f11e2f3bcefe6fcfbbd274",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "50c4e42eb7e043f1c1f11e2f3bcefe6fcfbbd274",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/call/local_dictionary_unpacking.md",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "0e05200de1756e67995e1e5bdde514127b60d357",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0e05200de1756e67995e1e5bdde514127b60d357",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/call/methods.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "77f3a66a9aa10b2d237806e0de4e621236e1572d",
      "candidateBlob": "e01a0c5aabca173a04232b5bb82b4f2df8f4d98f",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "77f3a66a9aa10b2d237806e0de4e621236e1572d",
      "frozenCandidateBlob": "1bfaccf4e0f0bafdcd543c95cf5b78052e89ab4d",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/call/overloads.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ff754e113673388152b815878351c74ecc77971f",
      "candidateBlob": "9b7e24a259990e6f88e7d6c47094bcfc600534d4",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "ff754e113673388152b815878351c74ecc77971f",
      "frozenCandidateBlob": "29db7e582da645af997fbdb4c7c452b0c7e7366e",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/comprehensions/basic.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "6d33a48edefd2c780d922b65a4137b386b733668",
      "candidateBlob": "2b001c042d665e749d6a6784f73f3e0afde0a09a",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "6d33a48edefd2c780d922b65a4137b386b733668",
      "frozenCandidateBlob": "2b001c042d665e749d6a6784f73f3e0afde0a09a",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/conditional/if_statement.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "602b8da03035f06525d57e3444e4005ae2c8ba46",
      "candidateBlob": "d2ca1507ba07ed2302926713545730490817433c",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "602b8da03035f06525d57e3444e4005ae2c8ba46",
      "frozenCandidateBlob": "d2ca1507ba07ed2302926713545730490817433c",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/cycle/basic.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "3123ce60fd66bb858e4e1d5a385e7541e1ce5e5c",
      "candidateBlob": "586432131200aed807eaed32bda6678c18897531",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "cb109776aba13cf39f82a3558fae970e0b6106d5",
      "frozenCandidateBlob": "c1a0c65c70af3d9799cf285906e1d6e99ca1545b",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/cycle/implicit_instance_attributes.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "02f0497fceb0bb6c938b68b796cbef5dca032be7",
      "candidateBlob": "3cc2e529413351730ec3275d316957b69dd411ae",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "02f0497fceb0bb6c938b68b796cbef5dca032be7",
      "frozenCandidateBlob": "3cc2e529413351730ec3275d316957b69dd411ae",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/diagnostics/attribute_assignment.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "2ac12150344160fca40608aee9af6881c253078d",
      "candidateBlob": "6ff1ae78541042c32a89f9cc028b7ece314372c1",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "2ac12150344160fca40608aee9af6881c253078d",
      "frozenCandidateBlob": "6ff1ae78541042c32a89f9cc028b7ece314372c1",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/expression/lambda.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "65d928d7be7d4332702c8e0614239f71e3b6fa73",
      "candidateBlob": "d58fc17c35bc0a17c03be163f79eac6ef42bab02",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "65d928d7be7d4332702c8e0614239f71e3b6fa73",
      "frozenCandidateBlob": "d58fc17c35bc0a17c03be163f79eac6ef42bab02",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/function/return_type_inference.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f91b5bb63eaf5da946ea569d914c8b940df98890",
      "candidateBlob": "1b0932f46eed13b3f538ea042d448916a6df8783",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "dd2e2129050aa88fc333dcc8e57ae6b21a6cf4b9",
      "frozenCandidateBlob": "576bec2bfb182d1cb86b3f6dd4eb609611b5a976",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/generics/legacy/callables.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "b0bc0aaf9c62b0fd28c26e3c521631c44af83b5b",
      "candidateBlob": "e6f703efc6136a6dd2813353a2e10f480b19363e",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "b0bc0aaf9c62b0fd28c26e3c521631c44af83b5b",
      "frozenCandidateBlob": "c9ce45782c70d5efc2ff8c9fb0235d11e94a8573",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/generics/legacy/classes.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "7f24a3d301982054378479992285d8cec0c9f271",
      "candidateBlob": "7abf8ea33a6fdc09e5e4c99f4fd82c01864d06d7",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "5e3f2adaa42033ca2fd998e74b8230dafbc1e96b",
      "frozenCandidateBlob": "ff1892c347b57fe8570d339e16b5166edfe4b904",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/generics/legacy/functions.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "d193f2a9eeafed9bff136d1cf68d11e9de79fe7d",
      "candidateBlob": "25625ded0d2dcbeb79f72fd47eb6a855a12daafd",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "852f37ebca0236230937623eb9c32fb13ec09fbd",
      "frozenCandidateBlob": "fb9edcd9b155664510293e3a4268214ac1a64176",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/generics/legacy/paramspec.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ae541ffbd8cbbde4d773f345c194eeb0e2b9e0c8",
      "candidateBlob": "1db2847f1dab4eccf20ce66131a4380b274003fe",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "18c78e2a5307c451bd74bda7af21c3ec3aed5e37",
      "frozenCandidateBlob": "d094a41d0c0726752a02e6e6a3c48a592bbe1340",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/generics/legacy/typevartuple.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f1ff7eee2d73bc50caac260a8ef41894ce983573",
      "candidateBlob": "c776ef569f8e7b812d2a0fcfcd692f970132441c",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "1ca9953b5ca18c142f0d6c5e5cb2319a6583c760",
      "frozenCandidateBlob": "45599c686a651baa38dfaccceecfabd4791358f8",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/generics/pep695/callables.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f147ba1b05cae11e6aba0d41106dc23f814c3c82",
      "candidateBlob": "b9ea1a0d0892980e03e6bb769645488bfd05f9ca",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "f147ba1b05cae11e6aba0d41106dc23f814c3c82",
      "frozenCandidateBlob": "50114af6375b1f21c787dd5e86d8cc2559dbf4ce",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/generics/pep695/classes.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "85bab367481f7c7de0b79f1ee3ad48f56d97e723",
      "candidateBlob": "06b9fb6b3d14c593cfd9a10670eeed1b9be0e6ec",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "85bab367481f7c7de0b79f1ee3ad48f56d97e723",
      "frozenCandidateBlob": "06b9fb6b3d14c593cfd9a10670eeed1b9be0e6ec",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/generics/pep695/functions.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "99df9322ca97dad26b3f3d9ec31aaa6448c876f7",
      "candidateBlob": "9d4d738e4d6113ece9e533430291fb7f239010af",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "36ee6a820791adc000ca44c174c582c7bbde6cc7",
      "frozenCandidateBlob": "588f6004f8f1f0693b7a23dc0505a7b0890b3335",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/generics/pep695/paramspec.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ff224ff7c6854c14b754fe80600b8b7b317405f2",
      "candidateBlob": "0f65883e3fa743e44ad8c0536b2fc6f77a394f53",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "efcbdd14eafdd1f7e185bb51bdde2d09b66277e9",
      "frozenCandidateBlob": "047e0217ecd6cfd29d1f7f52d6409462e73cc4e0",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/generics/pep695/quantified_callable_scopes.md",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "20294c0fdd5c8b671290351af703aebc1d547479",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "208c520a5673e58dd505b9a1054dbaeaf50ef79e",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/generics/pep695/typevartuple.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "0534e128a8e1bbce3d6d1b1cdee7cc5a8a50937a",
      "candidateBlob": "e94c1626335912859c4d997f98db3a5692f31041",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0534e128a8e1bbce3d6d1b1cdee7cc5a8a50937a",
      "frozenCandidateBlob": "e94c1626335912859c4d997f98db3a5692f31041",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/ide_support/all_members.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "7b06f0ada92172431799e0f05e6a0ffe945eda04",
      "candidateBlob": "6e428ce8d505e7f4e05e2516794473de05de668c",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "7b06f0ada92172431799e0f05e6a0ffe945eda04",
      "frozenCandidateBlob": "6e428ce8d505e7f4e05e2516794473de05de668c",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/import/module_getattr.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "9207cfd74d1f39200e4cdff3c05824ec78fa2c8c",
      "candidateBlob": "9b223a231dedf24cfd8933c5edc63aef0d65be14",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "9207cfd74d1f39200e4cdff3c05824ec78fa2c8c",
      "frozenCandidateBlob": "9b223a231dedf24cfd8933c5edc63aef0d65be14",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/intersection_types.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1d823f24e508478dd74dd437f928d70be03d8077",
      "candidateBlob": "bb7b82b99f3961d74bae71b2ff5d24ba17ac4f7a",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "1d823f24e508478dd74dd437f928d70be03d8077",
      "frozenCandidateBlob": "bb7b82b99f3961d74bae71b2ff5d24ba17ac4f7a",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/literal/collections/dictionary.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "5184a4b5a2ead3abbc53279a14244908c2082035",
      "candidateBlob": "b87da285f58f33b636e28142f00d4bed0a4188d8",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "5184a4b5a2ead3abbc53279a14244908c2082035",
      "frozenCandidateBlob": "c4deca41d27fc4caca01286b69eadc3a775b2494",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/literal/collections/list.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "c032172544661d202e4f283ed665ead0101a2070",
      "candidateBlob": "990adebe662bdde4d405ae6dc3fe8c226e230181",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "c032172544661d202e4f283ed665ead0101a2070",
      "frozenCandidateBlob": "1a3b29a715e3c8d3507e9e6e1cddd9fc67fa33b2",
      "disposition": "supporting-tests"
    },
    {
      "disposition": "supporting-tests",
      "frozenBaseBlob": "91ab447740c05229bed61f5b72447849e87cb0dd",
      "frozenCandidateBlob": "91ab447740c05229bed61f5b72447849e87cb0dd",
      "path": "crates/ty_python_semantic/resources/mdtest/literal/collections/set.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "91ab447740c05229bed61f5b72447849e87cb0dd",
      "candidateBlob": "79849133046fe5d31d5ed1ef6eeff408983f8629",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/literal/collections/singleton.md",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "31f1b6e73b853bd3a7927073f83511d8d6a1ea20",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "31f1b6e73b853bd3a7927073f83511d8d6a1ea20",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/loops/async_for.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "13a4ef25a4a1a6875f9a90d1b20862336faa6fc9",
      "candidateBlob": "376368ba8d33989b200ae155f2aa11a955c0ae71",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "13a4ef25a4a1a6875f9a90d1b20862336faa6fc9",
      "frozenCandidateBlob": "376368ba8d33989b200ae155f2aa11a955c0ae71",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/loops/for.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "83ca699545c0626d62f5fb79bc96982bd809397d",
      "candidateBlob": "501e13cd7edccf00977d574a6f4085e97180f504",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "83ca699545c0626d62f5fb79bc96982bd809397d",
      "frozenCandidateBlob": "501e13cd7edccf00977d574a6f4085e97180f504",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/metaclass.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "255f31694a033dc12be0b83ddb46d81f7167a3f3",
      "candidateBlob": "11ccceca68b7962417e43f5aca92552469bfafbe",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "255f31694a033dc12be0b83ddb46d81f7167a3f3",
      "frozenCandidateBlob": "11ccceca68b7962417e43f5aca92552469bfafbe",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/narrow/aliased_conditions.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "cba3fd5983d184975c60c1595864beeaf95effd1",
      "candidateBlob": "039b18e1aec54ad432b35f8595a141f7a4830983",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "cba3fd5983d184975c60c1595864beeaf95effd1",
      "frozenCandidateBlob": "039b18e1aec54ad432b35f8595a141f7a4830983",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/narrow/complex_target.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "e6ccb65c6311c1e95f9a1e7ff4d0b21648bdd3ca",
      "candidateBlob": "aa2d371873e958cd9fc86a19e1168f546ff6bc1b",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "e6ccb65c6311c1e95f9a1e7ff4d0b21648bdd3ca",
      "frozenCandidateBlob": "621fe37dc2eaad6f821673f7614718d874321410",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/narrow/conditionals/eq.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "387ce4b4f2493c764ce977227d1500f78fca667a",
      "candidateBlob": "c9d07ca7ab732c6fe363eef56be4604d9a726e43",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "387ce4b4f2493c764ce977227d1500f78fca667a",
      "frozenCandidateBlob": "c9d07ca7ab732c6fe363eef56be4604d9a726e43",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/narrow/conditionals/in.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ba46e44683e1361bd17efa2087260b4bc8aa0278",
      "candidateBlob": "8f5bccfcaa2c938dcbfa35440dc26ad6e4074a71",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "ba46e44683e1361bd17efa2087260b4bc8aa0278",
      "frozenCandidateBlob": "8f5bccfcaa2c938dcbfa35440dc26ad6e4074a71",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/narrow/getattr.md",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "217eb95c1d13585c013d84b653baa15d1a35c547",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "217eb95c1d13585c013d84b653baa15d1a35c547",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/narrow/hasattr.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ebc36be1c589f76c07d29066e14b8fc3167799bf",
      "candidateBlob": "1870fcab39d8ab700cab7ff1d1abe85c4fec3717",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "ebc36be1c589f76c07d29066e14b8fc3167799bf",
      "frozenCandidateBlob": "1870fcab39d8ab700cab7ff1d1abe85c4fec3717",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/narrow/truthiness.md",
      "frozenBaseBlob": "86f3835e50ff9fa88cf70f2633c49e015d1093c9",
      "frozenCandidateBlob": "86f3835e50ff9fa88cf70f2633c49e015d1093c9",
      "frozenRecord": [],
      "frozenRole": null,
      "disposition": "supporting-test",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "86f3835e50ff9fa88cf70f2633c49e015d1093c9",
      "candidateBlob": "0dcf02e94774eb1bec898029670fcb3db9ef0e88",
      "status": "M",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/narrow/type.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "aaf011c590fb613811cf3255ae5f99ea651a1913",
      "candidateBlob": "d962322f0c4d5efbd30683feb6e7b17c1c797a88",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "aaf011c590fb613811cf3255ae5f99ea651a1913",
      "frozenCandidateBlob": "d962322f0c4d5efbd30683feb6e7b17c1c797a88",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/narrow/type_guards.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "cbd91fa696f08ce2b427dcd105c2b15738fe69fa",
      "candidateBlob": "a3ba62585b1bf42b2bc25453f75e1222efab8238",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "cbd91fa696f08ce2b427dcd105c2b15738fe69fa",
      "frozenCandidateBlob": "75276be69536a4ff67f2f70c6891512d3faa8452",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/overloads.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f4023541797c817b2051bfed6ae83104405b9f88",
      "candidateBlob": "7ecd78d20d99adea8f16b3882063135483b31768",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "f4023541797c817b2051bfed6ae83104405b9f88",
      "frozenCandidateBlob": "7ecd78d20d99adea8f16b3882063135483b31768",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/protocols.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ec8a4604d54a9a5f888438c0f92abfd08230de8b",
      "candidateBlob": "4b0e554295d367043d4a5b3c1e0b9225a5afb50a",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "ec8a4604d54a9a5f888438c0f92abfd08230de8b",
      "frozenCandidateBlob": "4b0e554295d367043d4a5b3c1e0b9225a5afb50a",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/redundant_condition.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f202c64e3fb13d9313246f0ab5128d29b8cbf601",
      "candidateBlob": "d64bef2f792745bee31df705aa5c3e0cbcf5f746",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "f202c64e3fb13d9313246f0ab5128d29b8cbf601",
      "frozenCandidateBlob": "d64bef2f792745bee31df705aa5c3e0cbcf5f746",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/regression/3954_recursive_protocol_structural_relation.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "d719dd4a892b295f8c196ec965a460ec423d27bd",
      "candidateBlob": "2a438d9e6aa15e0cc28815a087f4e5bfbf5d81f3",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "d719dd4a892b295f8c196ec965a460ec423d27bd",
      "frozenCandidateBlob": "2a438d9e6aa15e0cc28815a087f4e5bfbf5d81f3",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/subscript/instance.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "fcbce1d13fbd888e939fa4e08a021ecf51e799df",
      "candidateBlob": "fcd8de1f05ce286d530eb85e577a158075a37944",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "fcbce1d13fbd888e939fa4e08a021ecf51e799df",
      "frozenCandidateBlob": "fcd8de1f05ce286d530eb85e577a158075a37944",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/subscript/typevar.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "b476616b05c6cd8f0706ea3a9101ac17b67c13ef",
      "candidateBlob": "8d6fa8d757562f4e4d304e7e8de5227ff096cf53",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "b476616b05c6cd8f0706ea3a9101ac17b67c13ef",
      "frozenCandidateBlob": "8d6fa8d757562f4e4d304e7e8de5227ff096cf53",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/type_properties/constraints.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "db507576811e4937c13c68a33f8dca5a441f32f7",
      "candidateBlob": "17cd9b9650c8eded3d05b4e0da99b96ea96bbdb8",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "db507576811e4937c13c68a33f8dca5a441f32f7",
      "frozenCandidateBlob": "17cd9b9650c8eded3d05b4e0da99b96ea96bbdb8",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/type_properties/is_assignable_to.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ac88c479986c387f251457160a20b39b3d0ca978",
      "candidateBlob": "e68c33ba65b0eed564f383305fcf3c65881bac09",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "ac88c479986c387f251457160a20b39b3d0ca978",
      "frozenCandidateBlob": "e68c33ba65b0eed564f383305fcf3c65881bac09",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/type_properties/is_subtype_of.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "9ebe2f5fc43057c1fa10b28df4e4e04c39529e5a",
      "candidateBlob": "7d869eff09575d4fc4a07c30348d18f49ecd5631",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "9ebe2f5fc43057c1fa10b28df4e4e04c39529e5a",
      "frozenCandidateBlob": "7d869eff09575d4fc4a07c30348d18f49ecd5631",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/type_properties/materialization.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "da48b54a69196ac8d1974c3dd58d4726031e00b3",
      "candidateBlob": "97049d8da32de7e32c5b0e5ba8b6f0b9685488c8",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "da48b54a69196ac8d1974c3dd58d4726031e00b3",
      "frozenCandidateBlob": "97049d8da32de7e32c5b0e5ba8b6f0b9685488c8",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/type_properties/quantification.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "8ade7de70841bd62fb766f0d66245f57b4fafbb4",
      "candidateBlob": "40467b6d8989487d9d229bbaae8c3a940aa9b568",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "8ade7de70841bd62fb766f0d66245f57b4fafbb4",
      "frozenCandidateBlob": "40467b6d8989487d9d229bbaae8c3a940aa9b568",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/type_properties/truthiness.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "21f31be852d9bd8aa34f451164988a609c91fdef",
      "candidateBlob": "a6bb817a08c21af2654bfe7e6b3c353f8fe4ceb1",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "21f31be852d9bd8aa34f451164988a609c91fdef",
      "frozenCandidateBlob": "a6bb817a08c21af2654bfe7e6b3c353f8fe4ceb1",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/type_qualifiers/final.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "6b22265376402d9dd5ff0e56e89b2a6aeb7737ef",
      "candidateBlob": "0f078e78d50ee35f9e9ab589ca06a474e2b06b0c",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "6b22265376402d9dd5ff0e56e89b2a6aeb7737ef",
      "frozenCandidateBlob": "0f078e78d50ee35f9e9ab589ca06a474e2b06b0c",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/typed_dict.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "5d2c839a2381677c1983710a3d7281564ef8b0e3",
      "candidateBlob": "c74f9a46152876c87732dd0c0c22185fc1c8d756",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "35ef072971e864e7414130a0773de992de9963b8",
      "frozenCandidateBlob": "2141e47eed2d3c62dfcb9bdb8000aec5e6ccf14c",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/resources/mdtest/unpacking.md",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1707e4877af7143df857d5bfb43c3af7136043d7",
      "candidateBlob": "4657e8a36da6cccb746a654b7dd40fc00da96929",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "1707e4877af7143df857d5bfb43c3af7136043d7",
      "frozenCandidateBlob": "4657e8a36da6cccb746a654b7dd40fc00da96929",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/src/db.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "fd7984ed7095065b73629fe9fb918bbbd56519b0",
      "candidateBlob": "e043ce2b5f6f5171353c74588d058fcd16eb3b00",
      "status": "M",
      "frozenRecord": [
        "host-db-diagnostics-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "fd7984ed7095065b73629fe9fb918bbbd56519b0",
      "frozenCandidateBlob": "e043ce2b5f6f5171353c74588d058fcd16eb3b00",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/lexical_name_path.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "737b8e4840363bee856574808d9b3f01c876f636",
      "candidateBlob": "3df35766ad723ed5532e168f56651af181da5505",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "737b8e4840363bee856574808d9b3f01c876f636",
      "frozenCandidateBlob": "3df35766ad723ed5532e168f56651af181da5505",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/lib.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f4f2edc360ebb5b6dd83b220101c729fa613b8cf",
      "candidateBlob": "374687cfee992a7f8d5c906669d3bd43f1f1fb6f",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "f4f2edc360ebb5b6dd83b220101c729fa613b8cf",
      "frozenCandidateBlob": "959c45bf7c23665cffb59d5006008689a4c5812b",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/lint.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "5d551fd097ff9c4392843aab515ddade3096a635",
      "candidateBlob": "26a9ef7a728993f027b521d70c12f5e0c9f81e7d",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "5d551fd097ff9c4392843aab515ddade3096a635",
      "frozenCandidateBlob": "26a9ef7a728993f027b521d70c12f5e0c9f81e7d",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/place.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "723b67033aa9d1ca0a3c395652f9fc2f6d85a72f",
      "candidateBlob": "67e101ff15fd2ecf2622b69dc8e010baa3ed8e54",
      "status": "M",
      "frozenRecord": [
        "semantic-flow-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "723b67033aa9d1ca0a3c395652f9fc2f6d85a72f",
      "frozenCandidateBlob": "67e101ff15fd2ecf2622b69dc8e010baa3ed8e54",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/place_load.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "76003e52c913c6cf7bc6bdd3a164ebdf86dc1ae0",
      "candidateBlob": "df4da5c5afc668612e76dcd1faaddbacfd620ffa",
      "status": "M",
      "frozenRecord": [
        "semantic-flow-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "76003e52c913c6cf7bc6bdd3a164ebdf86dc1ae0",
      "frozenCandidateBlob": "df4da5c5afc668612e76dcd1faaddbacfd620ffa",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/reachability.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "7e393e2dd00031305c9af916e293a9b537bf9a16",
      "candidateBlob": "5cee94701c3a2d6ba041310aa9862f24d7a98fe9",
      "status": "M",
      "frozenRecord": [
        "semantic-flow-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "bf4a9d22050bee1dfe1563af92a089066c3ea15c",
      "frozenCandidateBlob": "539f5c7f8f33118e3015ca0834f54fb98d51904d",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/semantic_model.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "91d75af12947eab6d3fdb2d4bd66f81a62dc69ad",
      "candidateBlob": "c3fbb3c57841128336c88a2acaf63806de245475",
      "status": "M",
      "frozenRecord": [
        "semantic-consumer-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "91d75af12947eab6d3fdb2d4bd66f81a62dc69ad",
      "frozenCandidateBlob": "c3fbb3c57841128336c88a2acaf63806de245475",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/suppression.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "73cbf95d1b7fa876fc62675b0dabaf03e18db39d",
      "candidateBlob": "a899d717e0c691ea1700ea88a8fca86bb51ce3b1",
      "status": "M",
      "frozenRecord": [
        "host-db-diagnostics-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "73cbf95d1b7fa876fc62675b0dabaf03e18db39d",
      "frozenCandidateBlob": "a899d717e0c691ea1700ea88a8fca86bb51ce3b1",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/suppression/unused.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1dd6c9676a459b6185128aface3dc31d156615bd",
      "candidateBlob": "3c6f1f78d24abb33f7ad0d134716af0c048b88de",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "1dd6c9676a459b6185128aface3dc31d156615bd",
      "frozenCandidateBlob": "3c6f1f78d24abb33f7ad0d134716af0c048b88de",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f8f05dd3b39ce7e2ac9023498344efafa305f2c4",
      "candidateBlob": "f83b3e77ca50cb46f18d2af42c11307415a59587",
      "status": "M",
      "frozenRecord": [
        "type-representation-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "1daed212a9d00b92e10f5a938f6682ef92fd0d35",
      "frozenCandidateBlob": "fef134e5e3b47804756cc83a184ce55c85be64cc",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/abstract_methods.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "2f04def51ccfa65739abae2272757655426266c7",
      "candidateBlob": "3209c12fa5a7a6cb43ed2b410ff795d82f317bbb",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "2f04def51ccfa65739abae2272757655426266c7",
      "frozenCandidateBlob": "3209c12fa5a7a6cb43ed2b410ff795d82f317bbb",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/attribute_write.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1b87e7fea1aa3d32f2798f60fa56cd661034e968",
      "candidateBlob": "f08c0a712b2eb91781b90bb94c1c1b80bc63cccb",
      "status": "M",
      "frozenRecord": [
        "member-navigation-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "1b87e7fea1aa3d32f2798f60fa56cd661034e968",
      "frozenCandidateBlob": "f08c0a712b2eb91781b90bb94c1c1b80bc63cccb",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/bool.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "3f287700dfa905d562f5a56f3af0a9b6da9ca4a4",
      "candidateBlob": "a7a9e7e20a1a92be72b8866ba6f0769c322e561c",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "3f287700dfa905d562f5a56f3af0a9b6da9ca4a4",
      "frozenCandidateBlob": "a7a9e7e20a1a92be72b8866ba6f0769c322e561c",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/bound_super.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "75ab8288197f866a1b9cdce71574c61e9af2ab8f",
      "candidateBlob": "abfb728f099e759f029657ab757da37a3ce99aa4",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "75ab8288197f866a1b9cdce71574c61e9af2ab8f",
      "frozenCandidateBlob": "abfb728f099e759f029657ab757da37a3ce99aa4",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/call.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "0cba126aed629aa505d16ac0bf0c3411fb932b57",
      "candidateBlob": "364974b2a0c17c6c91513eb407d343b37643f8ac",
      "status": "M",
      "frozenRecord": [
        "class-call-context-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0cba126aed629aa505d16ac0bf0c3411fb932b57",
      "frozenCandidateBlob": "99f1afda81c4aaad25930d7ed3724c4562ee0ac4",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/ambiguous.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ce19092e333f95725dd4b89b4dd1e4557a4e0c84",
      "candidateBlob": "36154f80fcd011cc7d5d8e9b0649f475b6546770",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "ce19092e333f95725dd4b89b4dd1e4557a4e0c84",
      "frozenCandidateBlob": "ce19092e333f95725dd4b89b4dd1e4557a4e0c84",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/arguments.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "d35b633f97cf9485ff0a6869024e05cc7472a83e",
      "candidateBlob": "fb68ab5c18565ce7ab3cc09921cb8d4956e52a5f",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "edea96f92816716984bf7cc2aa0cd4fa559649e0",
      "frozenCandidateBlob": "31cbe56db4186e0576c5c07e3517b4bfa1f7054d",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/bind.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "dff010501a88819d315559c3d34a17fb6d41675e",
      "candidateBlob": "2c666f0fe15ffe4b8653f7157d44675e39b62785",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "591dce3e27c1d04346f5f0b81b0999eaa4f472fe",
      "frozenCandidateBlob": "4b30c10649898e6da2e4aa6d21d657e97445ca70",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/bind/constructor.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1c618d9ed131319291f02bb9e3846e19acf5ce0f",
      "candidateBlob": "e07fed8e27c681db87069a378a9374a108b2fd38",
      "status": "M",
      "frozenRecord": [
        "class-call-context-hunk-inventory-dfe98a7d.json",
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "1c618d9ed131319291f02bb9e3846e19acf5ce0f",
      "frozenCandidateBlob": "e07fed8e27c681db87069a378a9374a108b2fd38",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/checked.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "df775fef36ad6e02496aa7b225996d7e7f4c34dc",
      "status": "A",
      "frozenRecord": [
        "class-call-context-hunk-inventory-dfe98a7d.json",
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "b42dde99528a07060835e6270a2313215c1f139e",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/callable.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "8193d91c3173880f803fb5c62a3869a874ac242b",
      "candidateBlob": "239d6fe020c67aa6174c5a9f58d85e6e5c09ff08",
      "status": "M",
      "frozenRecord": [
        "type-representation-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "8193d91c3173880f803fb5c62a3869a874ac242b",
      "frozenCandidateBlob": "239d6fe020c67aa6174c5a9f58d85e6e5c09ff08",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/class.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "41ebe8b231a8db6e22befe5438844a5b82b2825c",
      "candidateBlob": "1d59a9f34398bdcefce882cf604d474c181b1d9a",
      "status": "M",
      "frozenRecord": [
        "producer-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "41ebe8b231a8db6e22befe5438844a5b82b2825c",
      "frozenCandidateBlob": "1d59a9f34398bdcefce882cf604d474c181b1d9a",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/class/dynamic_literal.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1fc60260d74124e03b3f8ea51651f11a815db475",
      "candidateBlob": "6c05c699ba5d158942ab7afc38c76dc4360f5476",
      "status": "M",
      "frozenRecord": [
        "class-call-context-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "1fc60260d74124e03b3f8ea51651f11a815db475",
      "frozenCandidateBlob": "6c05c699ba5d158942ab7afc38c76dc4360f5476",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/class/known.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "027a99994525fe77c1a278ababd8c81ab74a13fb",
      "candidateBlob": "9a8cfa890cc1a6489288418208a86ae7a4ffcd29",
      "status": "M",
      "frozenRecord": [
        "class-call-context-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "027a99994525fe77c1a278ababd8c81ab74a13fb",
      "frozenCandidateBlob": "da0c93f2a063d833fa113a3494afbba32db12d35",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/class/slots.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "187d0d4b40cd9df0d89b121c793bdd748a9eec4b",
      "candidateBlob": "d6c52c2e8fc4e163ffc26417048b8c5b559bba33",
      "status": "M",
      "frozenRecord": [
        "class-call-context-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "187d0d4b40cd9df0d89b121c793bdd748a9eec4b",
      "frozenCandidateBlob": "d6c52c2e8fc4e163ffc26417048b8c5b559bba33",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/class/static_literal.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "de3296c5d09e52f8107b7e6dab90c574dbf4ee60",
      "candidateBlob": "14ca4ef54b9a2206653f64211747cc8d795ec92f",
      "status": "M",
      "frozenRecord": [
        "class-call-context-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "de3296c5d09e52f8107b7e6dab90c574dbf4ee60",
      "frozenCandidateBlob": "14ca4ef54b9a2206653f64211747cc8d795ec92f",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/class/typed_dict.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "2937d391aadd9b921737175a52d17559513ea1d1",
      "candidateBlob": "8883a77b2c52e58fb950f669260f80e6026a2be4",
      "status": "M",
      "frozenRecord": [
        "class-call-context-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "2937d391aadd9b921737175a52d17559513ea1d1",
      "frozenCandidateBlob": "8883a77b2c52e58fb950f669260f80e6026a2be4",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/class_base.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "7dcf8dc8e266b5349d144bf15c671dce21bc6b9b",
      "candidateBlob": "ac0e884af03b264bbacc179dde45bce5a1f5c70b",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "7dcf8dc8e266b5349d144bf15c671dce21bc6b9b",
      "frozenCandidateBlob": "ac0e884af03b264bbacc179dde45bce5a1f5c70b",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "141efda0892de5c47f5f7932307217534789bdc4",
      "candidateBlob": "74b945bcfc0e304eff35ccb3fc82656e432f44dd",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "c4ee7b23b9be68d795306367c248f58cd0fef644",
      "frozenCandidateBlob": "11f6a491566c2a173e406335771077d11e860642",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/owned.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "2f93d0d2a2fd2627ebdcea82e11545c13d557e09",
      "candidateBlob": "5cf7b29bec63d9f526eb8872b6529053ce823811",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "2f93d0d2a2fd2627ebdcea82e11545c13d557e09",
      "frozenCandidateBlob": "5cf7b29bec63d9f526eb8872b6529053ce823811",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/paths.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "3c2d1b37c5c869977927bbcca9858531252062e4",
      "candidateBlob": "ff25ad08db44c88c2421c21ae0e59aea54b48954",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "3c2d1b37c5c869977927bbcca9858531252062e4",
      "frozenCandidateBlob": "4f1e911fd08eecd67b98126d6c902b4c0f85ee2b",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/projection.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "abb53138550dde2b929e906b21a4a1f6fc9ecd7f",
      "candidateBlob": "0bc057aeee30521cc08f999a9eef2968d125e885",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "d65c18534b0c6a05ee5f56c316b6288b0ee0650d",
      "frozenCandidateBlob": "4b4e873f266a6f3ff70801d3822da5f0bdc8ad50",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/projection/tests.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "44d97fe3efdc5564ddb0fd5458362aa27d1f6ce4",
      "candidateBlob": "69d6b99227ba34cab46490c1e6d141bef86bd573",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "44d97fe3efdc5564ddb0fd5458362aa27d1f6ce4",
      "frozenCandidateBlob": "575b0a4997932702c8d6a3121cf1fcd0cc825ca2",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/resolution.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "d4f7bbfade36d6883f51486a13d87911f0313bb3",
      "candidateBlob": "1692aa7e20f3b53295b3e6036a472ba3439cc748",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "d4f7bbfade36d6883f51486a13d87911f0313bb3",
      "frozenCandidateBlob": "283d0aafba0db582aa46d5322d7256b514a8d0ed",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/sequents.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "7c784bd0d6a6ae558622cc726c7ad4f8c6ae8008",
      "candidateBlob": "b91bb530e2271c5a0925e78af7297b9e46027595",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "7c784bd0d6a6ae558622cc726c7ad4f8c6ae8008",
      "frozenCandidateBlob": "b91bb530e2271c5a0925e78af7297b9e46027595",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/solutions.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "5e58e5a8988ee4f6cf30ec640d900bc0796285db",
      "candidateBlob": "cb3fe895d3b3e73b3cfa14713357c71162f75510",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "40a3aa75e33cc6bdebc917f7ecbb00a20cda323c",
      "frozenCandidateBlob": "b01cb32c984e3e7d26859ba40175272d82aa1205",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/support.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "2c741f5c5401ccfc003e8fabcbb046af5e6122dd",
      "candidateBlob": "bbc05fec532d793df602ee522706c6ba14aa79ef",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "2c741f5c5401ccfc003e8fabcbb046af5e6122dd",
      "frozenCandidateBlob": "bbc05fec532d793df602ee522706c6ba14aa79ef",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/variables.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "3a3d4f26dc836b3699d1e4b5e94159cb554a17ef",
      "candidateBlob": "25af26226bbc72350a9c38c49979268012ac1ed0",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "475ed28457df642366b055a3e6faf01ea936118a",
      "frozenCandidateBlob": "f0f976decdfdea59036db1a10d2967b6319887cb",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/context.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "8a2c4a68d2587e299ac00ac2a4485c15a8aa8743",
      "candidateBlob": "0e4a3ab8572e50b3cf5a6bb8866364111134e620",
      "status": "M",
      "frozenRecord": [
        "class-call-context-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "8a2c4a68d2587e299ac00ac2a4485c15a8aa8743",
      "frozenCandidateBlob": "0e4a3ab8572e50b3cf5a6bb8866364111134e620",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/cyclic.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1b3a624e8e6351d633fe3c83c363559d4578af17",
      "candidateBlob": "91c64a7e54f8a5384dbcb21fd3fe2bdc93ba6433",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "1b3a624e8e6351d633fe3c83c363559d4578af17",
      "frozenCandidateBlob": "91c64a7e54f8a5384dbcb21fd3fe2bdc93ba6433",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/dedicated/pydantic.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "a5a563cc65731b0074d0d006517672f3025aa2c0",
      "candidateBlob": "787881cab54c6b3acdf7bc73c2692153cfd72a4f",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "a5a563cc65731b0074d0d006517672f3025aa2c0",
      "frozenCandidateBlob": "787881cab54c6b3acdf7bc73c2692153cfd72a4f",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/dedicated/pytest/fixtures.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "43b766af8c64df676ca9aa0ff8fdb57f4c08483e",
      "candidateBlob": "2e6c31c7b8f070a9a29b22b385c9770501489b96",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "43b766af8c64df676ca9aa0ff8fdb57f4c08483e",
      "frozenCandidateBlob": "2e6c31c7b8f070a9a29b22b385c9770501489b96",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/definition_resolution.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "6c7e50374fd4040f08ae591c54f926e08974bad4",
      "candidateBlob": "236e57b59c23a778f44ec86407c1740a3a015047",
      "status": "M",
      "frozenRecord": [
        "member-navigation-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "6c7e50374fd4040f08ae591c54f926e08974bad4",
      "frozenCandidateBlob": "236e57b59c23a778f44ec86407c1740a3a015047",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/diagnostic.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "c0ef04a38e4bb4aeb1775ccda61517fa12e00f5d",
      "candidateBlob": "b8c02bae987e705bf213d13815ceaa6e27f4da74",
      "status": "M",
      "frozenRecord": [
        "host-db-diagnostics-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0b8e4b7400f9852bf5d96a2f2adafb314fec9b40",
      "frozenCandidateBlob": "73a0014c34015f2788e5925d647a0874dcfa2393",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/dictionary.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "7815d04d6ed230efce17ef15603e76e0f148988c",
      "status": "A",
      "frozenRecord": [
        "dictionary-observation-records-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "7815d04d6ed230efce17ef15603e76e0f148988c",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/dictionary/contents.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "f2dae47eace1122d52e881e45d37c4a1e6bb2fb2",
      "status": "A",
      "frozenRecord": [
        "dictionary-transfer-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "ac931070ff697e48567e61c3c541844c51b62d75",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/dictionary/records.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "a1b50679b74a22592f35d50fd81071a308f7e7f3",
      "status": "A",
      "frozenRecord": [
        "dictionary-observation-records-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "af23074d6467561da6bbd4325055bde8f6e16a65",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/display.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "7a1ab4668c8ed230dd77d19cf5af9b351bca6ce2",
      "candidateBlob": "b8790939d87f1f15f96b987ad7f12555e4a2743d",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "7a1ab4668c8ed230dd77d19cf5af9b351bca6ce2",
      "frozenCandidateBlob": "372e5531b14fc9e1f364d77d5b1145ac77ee5148",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/enums.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "197dd3b736cd76bb5a1dfbd870e9327820c71f43",
      "candidateBlob": "787e6dad46e4d425afd4419eb3a5e506b9559431",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "2d376be0510f0b1948426f426618dfd7add61767",
      "frozenCandidateBlob": "356e7606b91b91413cbe346deda486ed7bbb0ceb",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/equality.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "bf7b73448b0e78a395d7295e986cf67a45b4bf06",
      "candidateBlob": "73e72ee3d7e8b5bb6b514ad3c35fb4d6aea9bd2c",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "bf7b73448b0e78a395d7295e986cf67a45b4bf06",
      "frozenCandidateBlob": "73e72ee3d7e8b5bb6b514ad3c35fb4d6aea9bd2c",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/equality/enums.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "df5d7d5968b1af85f797e6001d0d62bdb88d5c90",
      "candidateBlob": "3a2f11bd5fc7bbc9293bca8d8a369d9e4402f36e",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "df5d7d5968b1af85f797e6001d0d62bdb88d5c90",
      "frozenCandidateBlob": "3a2f11bd5fc7bbc9293bca8d8a369d9e4402f36e",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/function.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "53e980e478b647bef9bc97ad84baabfbef2035f2",
      "candidateBlob": "5f3d2eacad2dd4d83be603595d5d19f1dbfc01a1",
      "status": "M",
      "frozenRecord": [
        "type-representation-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "53e980e478b647bef9bc97ad84baabfbef2035f2",
      "frozenCandidateBlob": "5f3d2eacad2dd4d83be603595d5d19f1dbfc01a1",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/generics.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "799b913d06d2de4b1d3b16f3d399c2bf11d69e02",
      "candidateBlob": "578607a4caeb29ed188afa47288577a9ef809ea9",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "1ff65d342ca38130124a43ebbde8ec422f0f42cd",
      "frozenCandidateBlob": "80b2f191604416923364bd9f06057eaa70f3c304",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/ide_support.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "00bec833cf020779d2355ef85d4bb13b2f5a5eed",
      "candidateBlob": "7e1e0a91fe8014ffce2120715c6ba2e1d720ee64",
      "status": "M",
      "frozenRecord": [
        "inference-editor-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "00bec833cf020779d2355ef85d4bb13b2f5a5eed",
      "frozenCandidateBlob": "7e1e0a91fe8014ffce2120715c6ba2e1d720ee64",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/ide_support/unreachable_code.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "c58081a08aeb6a73974991df3d07e3954267f50c",
      "candidateBlob": "d96a5916088327b9f683ce1fe5cc5794e73e1718",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "c58081a08aeb6a73974991df3d07e3954267f50c",
      "frozenCandidateBlob": "34686158de1d27a3ca40395676ca6c58a44fb029",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/ide_support/unused_bindings.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "02a8783a2aa9ea0a17bfea6a3099ec5d334b1b08",
      "candidateBlob": "99f132b6d9cc6788626f5eb2f4166e4549725587",
      "status": "M",
      "frozenRecord": [
        "member-navigation-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "02a8783a2aa9ea0a17bfea6a3099ec5d334b1b08",
      "frozenCandidateBlob": "99f132b6d9cc6788626f5eb2f4166e4549725587",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "e89d3937c3778b94e6aba663e84b7cdc92e26c9e",
      "candidateBlob": "5c0f11102d29947d81b58786d0e335164a042721",
      "status": "M",
      "frozenRecord": [
        "inference-editor-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "e89d3937c3778b94e6aba663e84b7cdc92e26c9e",
      "frozenCandidateBlob": "7017a7ac52794c398805f43b180bf50e21c58bca",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/body_domain.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "d6e9bbb074e893cf0586ada96f668dce38f60cc8",
      "status": "A",
      "frozenRecord": [
        "overload-body-domain-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "78adfbd099d048a14a51e6c7dd58cdc9bc01ae12",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "32dea63315b3e56f71b7630c37d323edbfd5a16e",
      "candidateBlob": "fbd17433ac43b904172d5ddc25298b9fc1bd2524",
      "status": "M",
      "frozenRecord": [
        "producer-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "7f91fce28853634c3842eaec18b72abad0e33456",
      "frozenCandidateBlob": "c92d970edcc3aea8a3b2fd02fd2b6c4b8376b9ad",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/annotation_expression.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f9878cf3861dad70941438800c44caa822867109",
      "candidateBlob": "3ee4c9528ddf274fb4fc1b6669cb61bb0d96bf77",
      "status": "M",
      "frozenRecord": [
        "semantic-consumer-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "f9878cf3861dad70941438800c44caa822867109",
      "frozenCandidateBlob": "3ee4c9528ddf274fb4fc1b6669cb61bb0d96bf77",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/attribute_assignment.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "a43925a844b62c94e14f1b0fd66e6be81d624a03",
      "candidateBlob": "3121044655c66ebdda400eb0cdd526b2b83a2869",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "a43925a844b62c94e14f1b0fd66e6be81d624a03",
      "frozenCandidateBlob": "3121044655c66ebdda400eb0cdd526b2b83a2869",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/binary_expressions.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "c102dcc731e4e4af84526ef9c998b42dc8dfb1a3",
      "candidateBlob": "74f828dad2f96d76e3b9c49af854d85f760d366e",
      "status": "M",
      "frozenRecord": [
        "inference-editor-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "c102dcc731e4e4af84526ef9c998b42dc8dfb1a3",
      "frozenCandidateBlob": "74f828dad2f96d76e3b9c49af854d85f760d366e",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/dict.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "9b845b4b28e217188959f127b1dc71c9dcc87678",
      "candidateBlob": "f5428ee9ffc5675474f2a5d6bc4806784522081a",
      "status": "M",
      "frozenRecord": [
        "collection-inference-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "9b845b4b28e217188959f127b1dc71c9dcc87678",
      "frozenCandidateBlob": "f5428ee9ffc5675474f2a5d6bc4806784522081a",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/dynamic_class.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f3407d55ed3486ec4b707c2858d8c345e1122f2b",
      "candidateBlob": "dbc76b78f39acf22e5b31fbccf3906503d62ec47",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "f3407d55ed3486ec4b707c2858d8c345e1122f2b",
      "frozenCandidateBlob": "dbc76b78f39acf22e5b31fbccf3906503d62ec47",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/enum_call.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "576216e6838070e2c0d47aec3d837289cff881bb",
      "candidateBlob": "8c0ae9001a89a73bf6ae5f18cd58011d70f5a044",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "6e016404bd41da61ce4b2186216ded5507e5eca0",
      "frozenCandidateBlob": "d9a475e1930fd5d7e894f0dcfb4c152c5d96bb78",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/function.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "832f2b9e9f16d6a2dbff9fbe6a9c127fe83e6169",
      "candidateBlob": "4dde2a1402c596511e3431169f402ec7352666b4",
      "status": "M",
      "frozenRecord": [
        "semantic-consumer-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "832f2b9e9f16d6a2dbff9fbe6a9c127fe83e6169",
      "frozenCandidateBlob": "77c3d5c0fcbbf22ffb9df3612cf0675e65c8493f",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/imports.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "9b336ba7495e431348f25dc59e43bb42c3d73d00",
      "candidateBlob": "c3efe3c9fb314e577fa6b481e025a721eea828e7",
      "status": "M",
      "frozenRecord": [
        "semantic-consumer-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "9b336ba7495e431348f25dc59e43bb42c3d73d00",
      "frozenCandidateBlob": "c3efe3c9fb314e577fa6b481e025a721eea828e7",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/new_class.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "612ba6f9db0d72eeefac3ca4848da479b42ebec6",
      "candidateBlob": "0200a6357bdf13fc1785f776b716cf9d7a182160",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "612ba6f9db0d72eeefac3ca4848da479b42ebec6",
      "frozenCandidateBlob": "0200a6357bdf13fc1785f776b716cf9d7a182160",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/paramspec_validation.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "9033daa3cb53131c9899e75293705a6ca84503cf",
      "candidateBlob": "421e165a0d5c199cde20cbfcfedf4a30cd9d9085",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "7da6b708c38245c0187c449e9b81ebae19ed2d69",
      "frozenCandidateBlob": "233f6b6b3e4d054262fb62ebbb4694b951baf9dc",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/post_inference/function.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "085171bac7203174a660b1bcb8dd27c074c90d14",
      "candidateBlob": "860cac4057630e2c25b63696e8e280cf66dd9ee9",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "085171bac7203174a660b1bcb8dd27c074c90d14",
      "frozenCandidateBlob": "860cac4057630e2c25b63696e8e280cf66dd9ee9",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/post_inference/overloaded_function.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "b133ed7a3df2b5d77bb9db9f05a99c337e5c477f",
      "candidateBlob": "8062c0dcef8dfd4cf04a38c6a26ea3cc356cc002",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "b133ed7a3df2b5d77bb9db9f05a99c337e5c477f",
      "frozenCandidateBlob": "8062c0dcef8dfd4cf04a38c6a26ea3cc356cc002",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/subscript.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "45f6de62fd77d14ff010c7c545c8a282e6cddecf",
      "candidateBlob": "7d83cf9a1fc9141ba992ced7baca5fa170fcda48",
      "status": "M",
      "frozenRecord": [
        "collection-inference-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "45f6de62fd77d14ff010c7c545c8a282e6cddecf",
      "frozenCandidateBlob": "9ba87ace04d0105a7b42f244ff77e4f0862475fa",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/suspicious_conditions/diagnostic.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "e6ea78a643c31c939b02c3c7e62e6319de455bd4",
      "candidateBlob": "3d68897aad842057e4f785623c40aabc22ac64b6",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "e6ea78a643c31c939b02c3c7e62e6319de455bd4",
      "frozenCandidateBlob": "3d68897aad842057e4f785623c40aabc22ac64b6",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/suspicious_conditions/exemptions.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "b97f2bf6b4910915b7812416f27f9d530f8a1d8b",
      "candidateBlob": "17063b03ec4f9413fad1ddf5f95841b569202514",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "b97f2bf6b4910915b7812416f27f9d530f8a1d8b",
      "frozenCandidateBlob": "17063b03ec4f9413fad1ddf5f95841b569202514",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/suspicious_conditions/mod.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "32bdee133c3287d1b5c7be41bae783471af20230",
      "candidateBlob": "eb556aeaf01ffc529acbece64a12bb25fdbcbaa7",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "32bdee133c3287d1b5c7be41bae783471af20230",
      "frozenCandidateBlob": "eb556aeaf01ffc529acbece64a12bb25fdbcbaa7",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/type_call.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "b0b70027fe55841507eb2302c8eb371180512c95",
      "candidateBlob": "b90edcadce406be2a9f09c7e6a885087df48f05e",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "b0b70027fe55841507eb2302c8eb371180512c95",
      "frozenCandidateBlob": "b90edcadce406be2a9f09c7e6a885087df48f05e",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/type_expression.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "f7938408c05d784e027b413a9bbd6620a8850581",
      "candidateBlob": "0972e3a50a498fcb7676d334f6c7f3a3f060e437",
      "status": "M",
      "frozenRecord": [
        "annotation-type-expression-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "f7938408c05d784e027b413a9bbd6620a8850581",
      "frozenCandidateBlob": "0972e3a50a498fcb7676d334f6c7f3a3f060e437",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/type_form.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "4359695fb87ac2ec5491488586a9c0ed0f5a9a92",
      "candidateBlob": "f61202033f0ac6e137a5c8d2f5277a20b1c36413",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "4359695fb87ac2ec5491488586a9c0ed0f5a9a92",
      "frozenCandidateBlob": "f61202033f0ac6e137a5c8d2f5277a20b1c36413",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/typed_dict.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "0692f9f1a00d8d704bcc0bc08a393b061974373b",
      "candidateBlob": "3f3cad13b02f1641be0acd0a427faebcbfd5f24f",
      "status": "M",
      "frozenRecord": [
        "collection-inference-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "46452468b70e4c3a564707d569b1008e346b1cb0",
      "frozenCandidateBlob": "ed4a44301b10c4cfb3bac65510f7df690dd50e41",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/typeguard.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "15bed91ee72cc43c9858b19ce6ff8e6c094f0c2d",
      "candidateBlob": "2aafee345b8aaa4d011e6836c6fe0d9771516f3c",
      "status": "M",
      "frozenRecord": [
        "inference-editor-producers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "15bed91ee72cc43c9858b19ce6ff8e6c094f0c2d",
      "frozenCandidateBlob": "2aafee345b8aaa4d011e6836c6fe0d9771516f3c",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/comparisons.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "23741a40134aeedb788b26710a64a88f7674d590",
      "candidateBlob": "e72026c180b4aee7ae338c8344b7088b4f889327",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "23741a40134aeedb788b26710a64a88f7674d590",
      "frozenCandidateBlob": "e72026c180b4aee7ae338c8344b7088b4f889327",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/legacy_type_alias.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "01339279547e7aa883d109b3e85bc02c80927e83",
      "candidateBlob": "684ce13672eb88f3af56c903230170b3a541b1da",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "01339279547e7aa883d109b3e85bc02c80927e83",
      "frozenCandidateBlob": "684ce13672eb88f3af56c903230170b3a541b1da",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/snapshots/ty_python_semantic__types__infer__body_domain__tests__overload_domain_concise.snap",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "77bfdd16ff9e0c324db1d3fdd8caee57d641dce3",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "77bfdd16ff9e0c324db1d3fdd8caee57d641dce3",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/snapshots/ty_python_semantic__types__infer__body_domain__tests__overload_domain_full.snap",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "0fc66fc046f9ef6be44c1d9debf9beeacbbaa3d3",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0fc66fc046f9ef6be44c1d9debf9beeacbbaa3d3",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/tests.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "0b24fa493feb342eae89f3f32ff4bccab94ea24a",
      "candidateBlob": "be885621e1fccbb70c93489d3fbebae4dff36676",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0b24fa493feb342eae89f3f32ff4bccab94ea24a",
      "frozenCandidateBlob": "be885621e1fccbb70c93489d3fbebae4dff36676",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/instance.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "617d9fdfa5fbf7b715517266074ccc6e848c6d68",
      "candidateBlob": "890aefab04f2c500d0ef5aa3751e4ffab5628356",
      "status": "M",
      "frozenRecord": [
        "instance-schema-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "617d9fdfa5fbf7b715517266074ccc6e848c6d68",
      "frozenCandidateBlob": "890aefab04f2c500d0ef5aa3751e4ffab5628356",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/iteration.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "28322d7206e40a99bbdd6c861dd859647be5995c",
      "candidateBlob": "f50fc676044722463b9565ded0e1e7757c7b6383",
      "status": "M",
      "frozenRecord": [
        "collection-inference-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "28322d7206e40a99bbdd6c861dd859647be5995c",
      "frozenCandidateBlob": "f50fc676044722463b9565ded0e1e7757c7b6383",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/known_instance.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "d501e599c43397c95508daac3ef55376a0b67e69",
      "candidateBlob": "a69b4238b2ea15436b97985e668e35efd4c24a8f",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "d501e599c43397c95508daac3ef55376a0b67e69",
      "frozenCandidateBlob": "a69b4238b2ea15436b97985e668e35efd4c24a8f",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/list_members.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "d6c84915e76bdb7a9c79db95f3199fe7d6c55332",
      "candidateBlob": "ee483ac79af456c1f26fa7b017b9f35fc21f92d8",
      "status": "M",
      "frozenRecord": [
        "member-navigation-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "d6c84915e76bdb7a9c79db95f3199fe7d6c55332",
      "frozenCandidateBlob": "ee483ac79af456c1f26fa7b017b9f35fc21f92d8",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/loop_bindings.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "a50e1deec4a1fa3a7a3c8d387ee3512e409a0e2d",
      "status": "A",
      "frozenRecord": [
        "narrow-loop-proof-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "b766c9c3aedd7c85f247662c5db272361a0bb2c4",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/match_pattern.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "52865b6061aa76c0313f670648919810526dc745",
      "candidateBlob": "c0ce26d79e49cda006aaa862b943aac7af82de0b",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "52865b6061aa76c0313f670648919810526dc745",
      "frozenCandidateBlob": "c0ce26d79e49cda006aaa862b943aac7af82de0b",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/method.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "430e99b356d609f9788aa3f863ec523d3502d570",
      "candidateBlob": "76989376971e35f5597fa7f461ae5752c4cf1862",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "430e99b356d609f9788aa3f863ec523d3502d570",
      "frozenCandidateBlob": "76989376971e35f5597fa7f461ae5752c4cf1862",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/narrow.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "3dd831e5e7b940678f33a4d575a049dbe925e1e6",
      "candidateBlob": "f08f563acd3b82a1f0bc238ad8df1f4bd2d9d9a4",
      "status": "M",
      "frozenRecord": [
        "narrow-loop-proof-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "3dd831e5e7b940678f33a4d575a049dbe925e1e6",
      "frozenCandidateBlob": "13df5517f618d3a15adac07c05f2755cac9742cb",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/newtype.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ab00e1d3f64e1c45ef94d4d8a6820214dfdbc9f0",
      "candidateBlob": "0989e093a9af23718a603a2e9107d133eeb40893",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "ab00e1d3f64e1c45ef94d4d8a6820214dfdbc9f0",
      "frozenCandidateBlob": "ab00e1d3f64e1c45ef94d4d8a6820214dfdbc9f0",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/protocol_class.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "8552a9563882aae55f076f0cf74ef07b2103a4e3",
      "candidateBlob": "bed91fd6b7544bdeabfeba6bc4b162d8bf18a179",
      "status": "M",
      "frozenRecord": [
        "instance-schema-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "8552a9563882aae55f076f0cf74ef07b2103a4e3",
      "frozenCandidateBlob": "bed91fd6b7544bdeabfeba6bc4b162d8bf18a179",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/provided.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "9fbb8f1fe6b8e967fd62ead966b449f31d8ca1be",
      "status": "A",
      "frozenRecord": [
        "producer-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "9fbb8f1fe6b8e967fd62ead966b449f31d8ca1be",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/provided/data.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "36c915a597b7d0e912a80d8af9d29b5593df9893",
      "status": "A",
      "frozenRecord": [
        "producer-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "36c915a597b7d0e912a80d8af9d29b5593df9893",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/provided/source_tests.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "15c642e25dbd409b64441ea608a1c9424a50b261",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "94af0ecf2e44d6abf00321f3f6bd16a050f96fbe",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/provided/tests.rs",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "92d24415701b0c5d89140ad2a4d4864b570c4440",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "34235a35f2d1f7217e031c07f8da8c1db5328b40",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/relation.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "7b0773bb27de3b603075eca98dd34b688a125407",
      "candidateBlob": "e196b18383822751b55db00f9a7d775254b1eca8",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "2a7cf658aafdbf0a3f1c95b0114d4a5cd6b1efb0",
      "frozenCandidateBlob": "03be8b5f5934675efda21f315256418c32484ce9",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/set_theoretic.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "c0ccc097f4dfadcbd8601a0684a0527735e6f5c9",
      "candidateBlob": "b4fb8ff467cf7de34cd3e7a6fcb9b0b8db46a5f8",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "c0ccc097f4dfadcbd8601a0684a0527735e6f5c9",
      "frozenCandidateBlob": "b4fb8ff467cf7de34cd3e7a6fcb9b0b8db46a5f8",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/set_theoretic/builder.rs",
      "frozenBaseBlob": "a00edc198ff679577ffd262656569c997c242705",
      "frozenCandidateBlob": "a00edc198ff679577ffd262656569c997c242705",
      "frozenRecord": [],
      "frozenRole": null,
      "disposition": "forward-source-attributed",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "3adcb7f8a9c268cd439bac92c6ab309a3d9c9cc5",
      "candidateBlob": "266e74ad286ef5052ed6dded90be18870faef551",
      "status": "M",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review"
    },
    {
      "path": "crates/ty_python_semantic/src/types/signatures.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "7ffbdc48729bed2b557565b1c834a56dd739f3b8",
      "candidateBlob": "5d19725f68178456e30b4637a117f00c5238de79",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "7ffbdc48729bed2b557565b1c834a56dd739f3b8",
      "frozenCandidateBlob": "4b382b0634f778a020e15ea686dac73375fc46c1",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/snapshots/ty_python_semantic__types__ide_support__tests__call_inputs_preserve_nominal_union_arguments.snap",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "caa866ed3d9ebcf668179fd31c9ca381965d2466",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "caa866ed3d9ebcf668179fd31c9ca381965d2466",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/src/types/snapshots/ty_python_semantic__types__ide_support__tests__call_inputs_preserve_unpacked_and_forwarded_parameters.snap",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "2aaf49b0976b7ff9770ce31d90d39872c5ff2eec",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "2aaf49b0976b7ff9770ce31d90d39872c5ff2eec",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/src/types/snapshots/ty_python_semantic__types__ide_support__tests__call_inputs_report_incomplete_signatures_and_expansion.snap",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "304c5e95fe42ffa2c71e05cc368902679801824e",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "304c5e95fe42ffa2c71e05cc368902679801824e",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/src/types/snapshots/ty_python_semantic__types__ide_support__tests__call_inputs_select_supplied_parameters.snap",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "c319f9ce102f6ab31f57050783da1cab95a61691",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "c319f9ce102f6ab31f57050783da1cab95a61691",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/src/types/snapshots/ty_python_semantic__types__ide_support__tests__call_inputs_specialize_optional_generics_and_bound_methods.snap",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "5a0c57dcfc58ee4b95d46c9f262110d150d22914",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "5a0c57dcfc58ee4b95d46c9f262110d150d22914",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_python_semantic/src/types/string_annotation.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "2fb73849ea7b7a65e8f2eead704a14f4a531d1f2",
      "candidateBlob": "ada305b021f8f478216f9fab3710619fe620b2b8",
      "status": "M",
      "frozenRecord": [
        "semantic-consumer-hunk-inventory-bb3ff762.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "2fb73849ea7b7a65e8f2eead704a14f4a531d1f2",
      "frozenCandidateBlob": "ada305b021f8f478216f9fab3710619fe620b2b8",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/subclass_of.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "619e2e43270a01edc71eb788f33c46a79175c5db",
      "candidateBlob": "7d1c4a768a93ca4e18bda3205fa5b54f2c5a0f32",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "619e2e43270a01edc71eb788f33c46a79175c5db",
      "frozenCandidateBlob": "7d1c4a768a93ca4e18bda3205fa5b54f2c5a0f32",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/subscript.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "37fde7bd4162744e20f66f6b2a236eda00efe93e",
      "candidateBlob": "c183343ca3db9ca983819b5a80ca83557f1b7fa8",
      "status": "M",
      "frozenRecord": [
        "collection-inference-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "37fde7bd4162744e20f66f6b2a236eda00efe93e",
      "frozenCandidateBlob": "c183343ca3db9ca983819b5a80ca83557f1b7fa8",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/tests.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "613eb50563c671df00dd53981e3516f0d9fc2863",
      "candidateBlob": "0f9ce55e09ab3c4ab6095a2ef32de16fc9083b3b",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "613eb50563c671df00dd53981e3516f0d9fc2863",
      "frozenCandidateBlob": "0f9ce55e09ab3c4ab6095a2ef32de16fc9083b3b",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/tuple.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "5ee2f8c67308fa964997c32cf4ef3c302d7271fe",
      "candidateBlob": "44f031662a8dd8aca44acd730f6037f3436057a7",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "5ee2f8c67308fa964997c32cf4ef3c302d7271fe",
      "frozenCandidateBlob": "44f031662a8dd8aca44acd730f6037f3436057a7",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/type_alias.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "ae864d61d994ae4f45f5dde9338be6033e51dc07",
      "candidateBlob": "672537c3e27525b5d5c5fa7bdd2193e7f00e12fe",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "034526153ced9c6d70b20aea9bbc2e57e066f41a",
      "frozenCandidateBlob": "2064de26ff966f5a29252bbfac8ca4f96552b1a4",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/typed_dict.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "752b1f895dc8df13530706b2cc16302ef0be8b6c",
      "candidateBlob": "54a1d2d92aacf40fe13ea2a7b99b38421f46f49d",
      "status": "M",
      "frozenRecord": [
        "instance-schema-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "752b1f895dc8df13530706b2cc16302ef0be8b6c",
      "frozenCandidateBlob": "54a1d2d92aacf40fe13ea2a7b99b38421f46f49d",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/typevar.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "801b7e041301a9a0acf22bd63b7f09c4447359cd",
      "candidateBlob": "d069471d59c66cf057d9a1f7e812da971553d2bd",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "801b7e041301a9a0acf22bd63b7f09c4447359cd",
      "frozenCandidateBlob": "d069471d59c66cf057d9a1f7e812da971553d2bd",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/src/types/unpacker.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "1f02d1f51258ed2aa6aae4af06fd3d29c6640f08",
      "candidateBlob": "6367fdeb22350d7ca89748569b214d300f0f833a",
      "status": "M",
      "frozenRecord": [
        "collection-inference-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "1f02d1f51258ed2aa6aae4af06fd3d29c6640f08",
      "frozenCandidateBlob": "85f71d7657b716228248734eacce1bbc5b5365a0",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/visitor.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "3927a38487d863c80fe0337d385f860a1484dc13",
      "candidateBlob": "2d647d2a83696d357f8cc5f0f5065f807b69ebfa",
      "status": "M",
      "frozenRecord": [
        "type-representation-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "3927a38487d863c80fe0337d385f860a1484dc13",
      "frozenCandidateBlob": "2d647d2a83696d357f8cc5f0f5065f807b69ebfa",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_python_semantic/tests/mdtest.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "3bfeca82c603841d684bc969ebc306ac7ee813ca",
      "candidateBlob": "44c4b55e7571fa7198f4c8b2e9ba2f86dbed69f9",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "3bfeca82c603841d684bc969ebc306ac7ee813ca",
      "frozenCandidateBlob": "3bfeca82c603841d684bc969ebc306ac7ee813ca",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_server/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "80b048b74c8a1fa8efe3998e9aa7cb1153ceded0",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_server/tests/e2e/snapshots/e2e__commands__debug_command.snap",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "dd09ea79d88aee78936807007b1b18d01c5e3a8a",
      "candidateBlob": "a033f178aaddfee726b0bd193d16f885a3adbd88",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "dd09ea79d88aee78936807007b1b18d01c5e3a8a",
      "frozenCandidateBlob": "a033f178aaddfee726b0bd193d16f885a3adbd88",
      "disposition": "supporting-tests"
    },
    {
      "path": "crates/ty_site_packages/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "8470745de5c0e0d3b403e947cc46bee23daa12cd",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_static/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "e52527358c1f84dcb5f090f9f3110bee128d3eca",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_test/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "93dc44e34a78848e8a0ae7a17d9e84e71d07554c",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_test/src/config.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "5c8167ee5fc837af3f975e9d3314fa2b53c18d62",
      "candidateBlob": "0a6870d9735233f82cb21f062e90b4310d2cb5f7",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-infrastructure",
      "sameCandidateBlobAsFrozen": true,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "exact-net-hunk-inputs",
      "frozenBaseBlob": "5c8167ee5fc837af3f975e9d3314fa2b53c18d62",
      "frozenCandidateBlob": "0a6870d9735233f82cb21f062e90b4310d2cb5f7",
      "disposition": "frozen-source-reused"
    },
    {
      "path": "crates/ty_test/src/db.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "cea37db4470980bc3021c2558b1d4022dafc0642",
      "candidateBlob": "66f3461877eef7132a2076c7b7d530f53acda757",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-infrastructure",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "cea37db4470980bc3021c2558b1d4022dafc0642",
      "frozenCandidateBlob": "d081bc9ed8275a16313d24adcd7e0e9ab0ef6a2f",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_vendored/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "9ace03e9f6cfcaba74963d5434fb27d18cec0849",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "crates/ty_wasm/BUILD.bazel",
      "oldMode": "000000",
      "newMode": "100644",
      "baseBlob": "0000000000000000000000000000000000000000",
      "candidateBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "status": "A",
      "frozenRecord": [],
      "frozenRole": null,
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "0000000000000000000000000000000000000000",
      "frozenCandidateBlob": "0000000000000000000000000000000000000000",
      "disposition": "supporting-infrastructure"
    },
    {
      "path": "ty.schema.json",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "6dc96ea858a5690a75635be50be9a7716a4ce4b5",
      "candidateBlob": "5d6cf582cc1a91a0bfc711ca06b4288edee017fc",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-docs",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "c1ddbd93259b15421cc224d1ac54b4566d5b1a73",
      "frozenCandidateBlob": "4312c2659cf736a9b2ea18ea69b60ae4b43a9885",
      "disposition": "supporting-infrastructure"
    }
  ],
  "sourceCommand": "git diff --raw --no-abbrev --no-renames 7d1b1355ef43bc9169ec5743667ca2a6cdbde2dc 521014044d2578c786fe05ff3a5bf2e1425a2cba",
  "deployment": {
    "pinnedSty": "ce96423cb6707c17953ac67ef32348af0f87fc53",
    "pinnedRuff": "521014044d2578c786fe05ff3a5bf2e1425a2cba",
    "auditedCandidate": "521014044d2578c786fe05ff3a5bf2e1425a2cba",
    "candidateIsPinned": true,
    "detail": "Sty default branch pins this qualified Ruff checkpoint; community workflows and full runtime corpus have separate qualification."
  },
  "upstreamMigrationOwners": [
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30633",
      "commit": "a705d38f34912bf2358a2d8809f57f77b009df7c",
      "title": "Parent-place indexing"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30634",
      "commit": "be0f014c76841c66e9e200010dc836b864ecb498",
      "title": "Enum member indexing"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30636",
      "commit": "770b23978499b84c48f067e677b3100b1a9ed449",
      "title": "Equal class truthiness-guard union shortcut"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30638",
      "commit": "f31dd86f222f7d978a65cfc453eaf88f11456ed7",
      "title": "Cached keyword mapping value inference"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30640",
      "commit": "b09f331a3a48dcce09c88df02bf1474b6e9b20dd",
      "title": "Overload prefix cache"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30647",
      "commit": "13a28d76b96908a66578e67d8a5c8ff020b019a7",
      "title": "Nested-place scalar guard"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30653",
      "commit": "05773e0aaa4235eb1bc6871985a9668b6250f3f4",
      "title": "First-valid invariant overlap search"
    }
  ],
  "supportingChanges": [
    {
      "path": "bazel/rust_crate.bzl",
      "previousBlob": "8dff93e5b97bd024abb16d15cf8fb3f9c26fd0f9",
      "candidateBlob": "50abb82f5de28b4ef6564e549927b6e62289247b",
      "forwardDiffSHA256": "c4aa6afc134a6eace9b93a70a9f145d67d3143b7abbb3e65fee59bbde221634a",
      "classification": "bazel-native-cli-build",
      "detail": "Existing Cargo metadata/dependency macro also emits selected rust_binary targets; actual ty CLI and server/command-line library closure are build infrastructure, not type semantics or an independent ty improvement PR.",
      "evidence": [
        {
          "label": "Exact CLI build source",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/bazel/rust_crate.bzl"
        }
      ]
    },
    {
      "path": "crates/ruff_command_line/BUILD.bazel",
      "previousBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "candidateBlob": "f9391ad5ac39f7a40510cb8974c00ed66559856a",
      "forwardDiffSHA256": "799a5eb64561dde72dfb220fe4a6987ebfdf2ee6b2ed997dc4924db6b2c1dde9",
      "classification": "bazel-native-cli-build",
      "detail": "Existing Cargo metadata/dependency macro also emits selected rust_binary targets; actual ty CLI and server/command-line library closure are build infrastructure, not type semantics or an independent ty improvement PR.",
      "evidence": [
        {
          "label": "Exact CLI build source",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ruff_command_line/BUILD.bazel"
        }
      ]
    },
    {
      "path": "crates/ty/BUILD.bazel",
      "previousBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "candidateBlob": "d492f4cce3972fb345cc076b1c7f554689a1bafd",
      "forwardDiffSHA256": "9153db4eb3c0b400755fe9c14a565404c923c7b7adc1667845b09bae33b0967a",
      "classification": "bazel-native-cli-build",
      "detail": "Existing Cargo metadata/dependency macro also emits selected rust_binary targets; actual ty CLI and server/command-line library closure are build infrastructure, not type semantics or an independent ty improvement PR.",
      "evidence": [
        {
          "label": "Exact CLI build source",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty/BUILD.bazel"
        }
      ]
    },
    {
      "path": "crates/ty_server/BUILD.bazel",
      "previousBlob": "beb7874c2687b51baec181be5557cb4f551eb77a",
      "candidateBlob": "80b048b74c8a1fa8efe3998e9aa7cb1153ceded0",
      "forwardDiffSHA256": "9dcb6d469022a947e2ab9cc1c0f15b8eecb6895d69a042652d4dafb18efa8e61",
      "classification": "bazel-native-cli-build",
      "detail": "Existing Cargo metadata/dependency macro also emits selected rust_binary targets; actual ty CLI and server/command-line library closure are build infrastructure, not type semantics or an independent ty improvement PR.",
      "evidence": [
        {
          "label": "Exact CLI build source",
          "url": "https://github.com/tamird/ruff/blob/521014044d2578c786fe05ff3a5bf2e1425a2cba/crates/ty_server/BUILD.bazel"
        }
      ]
    }
  ],
  "reconciliation": {
    "previousCandidate": "ec5ee4693e7c1cf9a4ba432e3b0f4d494e89b805",
    "exactWholeHunksReused": 221,
    "exactBodiesWithShiftedAnchors": 69,
    "explicitCurrentHunkReviews": 70,
    "priorAuditSHA256": "f9c6c6042ad59f3c1f1d8954891b336c145e5345fa10e6f6194fb18ef1b357bb"
  },
  "qualificationObservation": {
    "candidate": "521014044d2578c786fe05ff3a5bf2e1425a2cba",
    "status": "Separate writer native qualification recorded; existing31Markdownfailures retained, no default promotion by this source audit.",
    "rejectedGlobalGuardStrippingCandidate": "a0e637fe72341808869ad13993a0a5acdcbbdde4",
    "rejectedCandidateForkCensus": {
      "passed": 487,
      "failed": 51,
      "priorFailures": 31,
      "newFailures": 20
    },
    "rejectedOfficialJointCensus": {
      "passed": 508,
      "failed": 24
    },
    "rejectedJointFreshEcosystemRegressions": [
      "Dulwich",
      "SymPy"
    ],
    "globalGuardStrippingPresent": false,
    "defaultPromotionApprovedByThisAudit": false,
    "separateNativeEvidence": {
      "source": "Existing writer receipts; this source audit did not execute tests.",
      "finalSource": "521014044d2578c786fe05ff3a5bf2e1425a2cba",
      "runtimeParent": "de31d23afc86395be9e24b87a487e83393fbbb9d",
      "nativeInvocation": "https://app.buildbuddy.io/invocation/93dec180-7640-4515-8bbb-f46be9c61289",
      "fullMarkdownInvocation": "https://app.buildbuddy.io/invocation/07037b10-9183-473f-8bed-576b6ffc6a83",
      "fixtureActions": 538,
      "passedFixtures": 507,
      "failedFixtures": 31,
      "freshActions": 539,
      "inventoryPassed": true,
      "newFailuresAgainstEc5": 0,
      "failureBodyEquivalence": true,
      "defaultExternalMode": "Native default skipping retained; network-backed cases remain a separate gate",
      "semanticPassed": 904,
      "semanticIgnored": 35,
      "idePassed": 1979,
      "hooksExit": 0,
      "formatChanges": {},
      "scope": "Native refresh checkpoint;31existingMarkdownfailures remain, host/default promotion and upstream review remain separate."
    }
  }
};
