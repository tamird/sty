// Immutable source inventory; runtime qualification is tracked separately.
export const ruffForwardAudit = {
  "schema": 1,
  "frozenBase": "6b5b5eca948c05261a3909e78133884cd9e61c9e",
  "frozenCandidate": "dfe98a7daef8d3e8076f20e55ece2f4a98769331",
  "currentBase": "75fabee2e0a069b6bf5a1af4226025afa0324fa5",
  "currentCandidate": "07a4f30c36d8f27455d2785f9abef566e0bf3641",
  "rawManifestSHA256": "a450f4c64eef66d5d2d20d600aa9e8fa7841280d8d9c849567ccc27c3ebd122d",
  "forwardPatchSHA256": "e6e5cf9b74f5995cd32210af46814237cff956c49079732a80d75fe8491cf673",
  "upstreamPatchSHA256": "dded2da39794e724a2d1ed21af40e1ad30533cc6478915cdaf886f2eb575966f",
  "counts": {
    "netPaths": 316,
    "rustSourcePaths": 155,
    "exactFrozenBlobPairs": 153,
    "exactFrozenRustSourceBlobPairs": 96,
    "changedRustSourcePaths": 59,
    "forwardHunks": 455,
    "forwardProducerFamilies": 20
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ruff_python_ast/src/lib.rs#L22"
        }
      ]
    },
    {
      "path": "crates/ty_ide/src/completion.rs",
      "baseBlob": "43aadad2402d30c56f8ecb9f7d4eb0437562766c",
      "candidateBlob": "7d37c907614a893849e622aba6bb3ee7d7c0fd3d",
      "frozenCandidateBlob": "751fd3167465700d4c62960d6661600fbd98dce5",
      "classification": "upstream-completion-query-before-documentation",
      "detail": "Official #30714 filters completion names before constructing documentation-bearing builders, with skip-query insertion after the same match. Final checkpoint explicitly reviewed changes: upstream-completion-query-before-documentation. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -264,7 +264,11 @@ impl<'db> Completions<'db> {",
          "oldStart": 264,
          "newStart": 264,
          "sha256": "6c32ae5f9c906e2d308113483cdf8e77643c1f4937f8ef5447a18d87123a400f",
          "classification": "upstream-completion-query-before-documentation",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30714 filters completion names before constructing documentation-bearing builders, with skip-query insertion after the same match.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_ide/src/completion.rs#L264"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_ide/src/inlay_hints.rs#L605"
        }
      ]
    },
    {
      "path": "crates/ty_ide/src/semantic_tokens.rs",
      "baseBlob": "6189d61f59fb8988a913f131d559858376df3081",
      "candidateBlob": "65ccee4697c8729f850e37dbd2082cbd3a9ca11f",
      "frozenCandidateBlob": "8ec5fbe176c9e39bd51e75452c43a4d89d5c8050",
      "classification": "upstream-semantic-token-range-pruning",
      "detail": "Official #30665 applies range-entry checks to function/class/from-import branches that bypass walk_stmt, retaining docstring eligibility behavior. Final checkpoint explicitly reviewed changes: upstream-semantic-token-range-pruning. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -853,6 +853,10 @@ impl SourceOrderVisitor<'_> for SemanticTokenVisitor<'_> {",
          "oldStart": 853,
          "newStart": 853,
          "sha256": "37342798d2868af357fa9b135512cb5c4d9cb55face406c4f970b4df46009a13",
          "classification": "upstream-semantic-token-range-pruning",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30665 applies range-entry checks to function/class/from-import branches that bypass walk_stmt, retaining docstring eligibility behavior.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_ide/src/semantic_tokens.rs#L853"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/ast_ids.rs#L262"
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
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/builder.rs#L2137"
        },
        {
          "anchor": "@@ -2632,9 +2639,8 @@ impl<'db, 'ast> SemanticIndexBuilder<'db, 'ast> {",
          "oldStart": 2632,
          "newStart": 2639,
          "sha256": "185e7d541cdaacf0d01609383a874afaba5efc3e9686c5c85f56086dc0a81ea7",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/builder.rs#L2639"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/builder/dictionary_contents.rs#L469"
        },
        {
          "anchor": "@@ -480,23 +491,6 @@ impl<'db, 'ast> SemanticIndexBuilder<'db, 'ast> {",
          "oldStart": 480,
          "newStart": 491,
          "sha256": "168ef282c0bd3d36c9a20de30dc02f7b258ac4462e08a4906211981b00bc50ab",
          "classification": "tracked-mapping-after-arguments-snapshot",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/builder/dictionary_contents.rs#L491"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/definition.rs#L1074"
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
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/place.rs#L170"
        },
        {
          "anchor": "@@ -279,13 +304,14 @@ impl PlaceTable {",
          "oldStart": 279,
          "newStart": 304,
          "sha256": "dd27355b499e072b81bd2706383af5959626b2d046d33beeccdfb6a7eff034e5",
          "classification": "upstream-parent-place-index-refactor",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/place.rs#L304"
        },
        {
          "anchor": "@@ -517,10 +543,10 @@ impl PlaceTableBuilder {",
          "oldStart": 517,
          "newStart": 543,
          "sha256": "50cfe7e25c2a6558bb11381689a49176596aeeacfed5c03aeab5064f44399b46",
          "classification": "upstream-parent-place-index-refactor",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/place.rs#L543"
        },
        {
          "anchor": "@@ -637,98 +663,6 @@ impl From<ScopedSymbolId> for ScopedPlaceId {",
          "oldStart": 637,
          "newStart": 663,
          "sha256": "62da31e40aeab0d096d8836eb2c6caf3d6c150bccffb9bdaad6446b401f2b913",
          "classification": "upstream-parent-place-index-refactor",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/place.rs#L663"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/reachability_constraints.rs#L593"
        },
        {
          "anchor": "@@ -621,12 +628,6 @@ impl ReachabilityConstraintsBuilder {",
          "oldStart": 621,
          "newStart": 628,
          "sha256": "756d5f3a5140eb619bdb534181a88e9a7e520fdfe0d6733a543f623bbf99345b",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/reachability_constraints.rs#L628"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/lib.rs#L102"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/place_load.rs",
      "baseBlob": "c207617632b443c3f503f8dfe5d28d72b6691a11",
      "candidateBlob": "f8f8242f187ddee58b26c721ae71ce6e8dab019d",
      "frozenCandidateBlob": "df4da5c5afc668612e76dcd1faaddbacfd620ffa",
      "classification": "upstream-enclosing-member-prefix-pruning",
      "detail": "Official #30700 skips outer-member prefix work only when global/lazy visibility rules rule out an enclosing member source; eager scopes and visible nonmodule ancestors remain. Final checkpoint explicitly reviewed changes: upstream-enclosing-member-prefix-pruning. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -436,6 +436,14 @@ impl<'db> Iterator for PlaceLoadResolutionProcedure<'db, '_> {",
          "oldStart": 436,
          "newStart": 436,
          "sha256": "966f85c6cb22f5e56128fb045be0b122fcc518e5732ca5a36bfd5e27911b261e",
          "classification": "upstream-enclosing-member-prefix-pruning",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30700 skips outer-member prefix work only when global/lazy visibility rules rule out an enclosing member source; eager scopes and visible nonmodule ancestors remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/place_load.rs#L436"
        },
        {
          "anchor": "@@ -1362,6 +1370,23 @@ impl<'db> PlaceLoadResolutionContext<'db, '_> {",
          "oldStart": 1362,
          "newStart": 1370,
          "sha256": "ee925ba1c1b56e0b68f80bd9bdc4449d619f26522976c881c63982b78a74b6bb",
          "classification": "upstream-enclosing-member-prefix-pruning",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30700 skips outer-member prefix work only when global/lazy visibility rules rule out an enclosing member source; eager scopes and visible nonmodule ancestors remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/place_load.rs#L1370"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L598"
        },
        {
          "anchor": "@@ -643,7 +645,7 @@ fn analyze_non_terminal_calls_up_to_predicate<'db>(",
          "oldStart": 643,
          "newStart": 645,
          "sha256": "df40ff2b90be5fe5c8376d4c7b7b24135b6dfb6366f166deb97a3685b7de9d49",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L645"
        },
        {
          "anchor": "@@ -654,7 +656,7 @@ fn analyze_non_terminal_calls_up_to_predicate<'db>(",
          "oldStart": 654,
          "newStart": 656,
          "sha256": "0432118eecb4b61b48bd1c440796657515c06daaed245856d6a72048133cd65f",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L656"
        },
        {
          "anchor": "@@ -664,7 +666,7 @@ fn analyze_non_terminal_calls_up_to_predicate<'db>(",
          "oldStart": 664,
          "newStart": 666,
          "sha256": "ccd08b858f615fd1ef02bdb53ed8779ef4ebd3c5d197a3c437bfae1051118358",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L666"
        },
        {
          "anchor": "@@ -680,8 +682,6 @@ fn analyze_non_terminal_calls_up_to_predicate<'db>(",
          "oldStart": 680,
          "newStart": 682,
          "sha256": "7ff09c6fefcdcc1e240566b8f490ceb8d3121ff136f46f54dd8e0afcd4558b53",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L682"
        },
        {
          "anchor": "@@ -750,7 +750,7 @@ fn analyze_body_non_terminal_call_range<'db>(",
          "oldStart": 750,
          "newStart": 750,
          "sha256": "9c783f70b013c305f99f44b58f06b8277a523ddd43f1d52688137cdb8a9c03d8",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L750"
        },
        {
          "anchor": "@@ -813,10 +813,9 @@ fn evaluate_reachability_constraint<'db>(",
          "oldStart": 813,
          "newStart": 813,
          "sha256": "85ce19b1b2466b5c24518d4e0f8b5793bae31feb7dc34558afa0480ff4e4b1b1",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L813"
        },
        {
          "anchor": "@@ -826,11 +825,11 @@ fn evaluate_reachability_constraint<'db>(",
          "oldStart": 826,
          "newStart": 825,
          "sha256": "99ca9ada06e91e881e3f5051e7e6c26ceeb3bdc43b7fd5b812f551908938ecd1",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L825"
        },
        {
          "anchor": "@@ -875,26 +874,59 @@ fn terminal_reachability(id: ScopedReachabilityConstraintId) -> Option<Truthines",
          "oldStart": 875,
          "newStart": 874,
          "sha256": "cc96ed1f2b9ae786c962a23d8ac764218b74275463627652f6062b7ebb831e5a",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L874"
        },
        {
          "anchor": "@@ -931,7 +963,7 @@ impl<'a, 'db> PredicateEvaluator<'a, 'db> {",
          "oldStart": 931,
          "newStart": 963,
          "sha256": "146d6be835d4212a65deeb55b90dd0356ad7dfcff1227452f7ce52263a601fdc",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L963"
        },
        {
          "anchor": "@@ -939,31 +971,20 @@ impl<'a, 'db> PredicateEvaluator<'a, 'db> {",
          "oldStart": 939,
          "newStart": 971,
          "sha256": "505d4a8730c4f051dff66e9881630357fe3fa96a4651f54b2915bc84a6031c2c",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L971"
        },
        {
          "anchor": "@@ -973,7 +994,7 @@ fn evaluate_reachability_path<'db>(",
          "oldStart": 973,
          "newStart": 994,
          "sha256": "ee6b03fc016c8af1df848b3b81a25571d935c2f0d3c50143f7337e75374f94ad",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L994"
        },
        {
          "anchor": "@@ -986,112 +1007,101 @@ fn evaluate_reachability_path<'db>(",
          "oldStart": 986,
          "newStart": 1007,
          "sha256": "11ebce2cf27661e3d1aaf2407ab5d61df677a361f4304cad336c695592340375",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L1007"
        },
        {
          "anchor": "@@ -1120,16 +1130,17 @@ impl<'db> ReachabilityConstraintsExtension<'db> for ReachabilityConstraints {",
          "oldStart": 1120,
          "newStart": 1130,
          "sha256": "e3a57253698db6b8c79479909c6213aeb796d15f91e9637b6dda0504dc7a3042",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L1130"
        },
        {
          "anchor": "@@ -1312,7 +1323,7 @@ fn evaluate_body_projected_narrowing_checkpoint<'db>(",
          "oldStart": 1312,
          "newStart": 1323,
          "sha256": "514e1a6934659216717761c01de19ab83ad2f592356238f7bf0ecaab167f7515",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L1323"
        },
        {
          "anchor": "@@ -1691,7 +1702,7 @@ impl<'a, 'db> NarrowingProjector<'a, 'db> {",
          "oldStart": 1691,
          "newStart": 1702,
          "sha256": "cf68cb486fc0fea0180e9e6ba5babe7933c97570f64dfb9960ba08d5c57dea7c",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L1702"
        },
        {
          "anchor": "@@ -2126,7 +2137,7 @@ fn analyze_body_non_terminal_call<'db>(",
          "oldStart": 2126,
          "newStart": 2137,
          "sha256": "8ecfc7c79aedd8e251b0d48e397c20e14850e214b28e809a7ab282bfc5a385f2",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L2137"
        },
        {
          "anchor": "@@ -2341,7 +2352,7 @@ fn analyze_single_in_domain<'db>(",
          "oldStart": 2341,
          "newStart": 2352,
          "sha256": "ef0fe5443c26d100879427543f330652838fbf0aa5647a684c4ed7430792dbd7",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L2352"
        },
        {
          "anchor": "@@ -2452,10 +2463,11 @@ pub(crate) fn is_range_reachable_in_domain<'db>(",
          "oldStart": 2452,
          "newStart": 2463,
          "sha256": "2cac325dbb4c99601f75af9cb7621e58dafbe295ed5b36804056ec915addee57",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L2463"
        },
        {
          "anchor": "@@ -2482,17 +2494,12 @@ pub(crate) fn is_end_of_scope_reachable_in_domain<'db>(",
          "oldStart": 2482,
          "newStart": 2494,
          "sha256": "ce2b88c176020c0a2db4981125514bccb8f2f163901ecf802f56d396f6317371",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L2494"
        },
        {
          "anchor": "@@ -2744,11 +2751,11 @@ pub(crate) fn refine_initial_binding_reachability<'db>(",
          "oldStart": 2744,
          "newStart": 2751,
          "sha256": "b5ee3cd3497a49d112f1d1085a9b98675ffe78aa1d3b7fa86cd83ba1e45624c8",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L2751"
        },
        {
          "anchor": "@@ -2964,6 +2971,42 @@ mod tests {",
          "oldStart": 2964,
          "newStart": 2971,
          "sha256": "d0de960ac142a86ba8d89e26659b434ad5db2805765c3049dae4ea4d2b0dd435",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L2971"
        },
        {
          "anchor": "@@ -3069,9 +3112,11 @@ class TargetB:",
          "oldStart": 3069,
          "newStart": 3112,
          "sha256": "df033ce560ade4a29bb015cf65c74248ad1f2aef0d1976ae601cc393b3f6c63b",
          "classification": "upstream-checkpoints-with-fork-domains",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/reachability.rs#L3112"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types.rs",
      "baseBlob": "4a87b508bf5f969afa2e05d88bdff2ccb1d60760",
      "candidateBlob": "46b4b8bc49c8a2aa916fcc6ab2cdc20b12ce96ae",
      "frozenCandidateBlob": "fef134e5e3b47804756cc83a184ce55c85be64cc",
      "classification": "upstream-api-migration",
      "detail": "Adds upstream factory_name_argument, cycle-initial None factory_name_literal query, and outer-alias literal resolution. Final checkpoint explicitly reviewed changes: upstream-mapping-value-cache, upstream-type-pair-doc-migration. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: upstream-shared-union-materialization. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -525,6 +525,34 @@ fn definition_expression_type<'db>(",
          "oldStart": 525,
          "newStart": 525,
          "sha256": "3628c18a19d8e4f83287e5cd9787f1f0966d862b2effb9d2fedfa10381fecf76",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types.rs#L525"
        },
        {
          "anchor": "@@ -729,10 +757,10 @@ impl<'env, 'db> ApplyTypeMappingVisitor<'env, 'db> {",
          "oldStart": 729,
          "newStart": 757,
          "sha256": "96bcd7210e169cf9c2397737a6358e34ed5d209c5aa4d3f8ff70ec7f1a326ae9",
          "classification": "upstream-shared-union-materialization",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30645 extends the existing materialization visitor to shared unions and lets an active recursive union use its alias guard; fork materialization/provenance owners remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types.rs#L757"
        },
        {
          "anchor": "@@ -2542,8 +2570,7 @@ impl<T> InstanceProjection<T> {",
          "oldStart": 2542,
          "newStart": 2570,
          "sha256": "59014d3d6aa29b4bc49eb15fe9e0b07b507b3bb0cdbfb99df9d77fbafaa158fe",
          "classification": "upstream-type-pair-doc-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types.rs#L2570"
        },
        {
          "anchor": "@@ -3569,6 +3596,11 @@ impl<'db> Type<'db> {",
          "oldStart": 3569,
          "newStart": 3596,
          "sha256": "a3192cbe5037a43196f102c574a9c3b607c8ad1d0b59e9dd467dfae5b331c4a9",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types.rs#L3596"
        },
        {
          "anchor": "@@ -7452,19 +7484,41 @@ impl<'db> Type<'db> {",
          "oldStart": 7452,
          "newStart": 7484,
          "sha256": "2e5ee98ce69cb7443ac460532c2cd641e85c4711d6d929e3e95e322230b48081",
          "classification": "upstream-mapping-value-cache",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types.rs#L7484"
        },
        {
          "anchor": "@@ -7480,10 +7534,12 @@ impl<'db> Type<'db> {",
          "oldStart": 7480,
          "newStart": 7534,
          "sha256": "f1706a2ab0cd6426cda16a7b8a5526d90aa1d5992abda4f698fdbfaebd88e357",
          "classification": "upstream-mapping-value-cache",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types.rs#L7534"
        },
        {
          "anchor": "@@ -7518,11 +7574,7 @@ impl<'db> Type<'db> {",
          "oldStart": 7518,
          "newStart": 7574,
          "sha256": "7b106d2eb1fb89abe82e9df626459a3241f42d081066f53a4cb3059199a9f336",
          "classification": "upstream-mapping-value-cache",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types.rs#L7574"
        },
        {
          "anchor": "@@ -10677,7 +10729,11 @@ impl<'db> Type<'db> {",
          "oldStart": 10677,
          "newStart": 10729,
          "sha256": "d42b3fceaf0b85d03120dedaba4f9fb662a7f75c0ad9dac3f37b832c15594f6b",
          "classification": "upstream-shared-union-materialization",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30645 extends the existing materialization visitor to shared unions and lets an active recursive union use its alias guard; fork materialization/provenance owners remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types.rs#L10729"
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
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call.rs#L72"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/ambiguous.rs#L6"
        },
        {
          "anchor": "@@ -71,6 +72,36 @@ impl<'db> AmbiguousReturnMerger<'_, 'db> {",
          "oldStart": 71,
          "newStart": 72,
          "sha256": "a839e0273798ffb279c8f7eb36da7b2084cef5d6bffe3d437975e8b085d7ecef",
          "classification": "provisional-return-structure",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/ambiguous.rs#L72"
        },
        {
          "anchor": "@@ -283,3 +314,69 @@ impl<'db> AmbiguousReturnMerger<'_, 'db> {",
          "oldStart": 283,
          "newStart": 314,
          "sha256": "39ec2b8e17010caa7098f413f891b6317b4d5883c37acbf5e7d54d3c0b00145f",
          "classification": "provisional-return-structure",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/ambiguous.rs#L314"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/arguments.rs#L23"
        },
        {
          "anchor": "@@ -303,6 +303,43 @@ impl<'db> VariadicArgument<'db> {",
          "oldStart": 303,
          "newStart": 303,
          "sha256": "93e32e3430ca126ad79d520ef02f15343944fd836bfad64bdd470753db6b2e88",
          "classification": "upstream-paramspec-suffix-selector",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/arguments.rs#L303"
        },
        {
          "anchor": "@@ -510,6 +547,34 @@ pub(crate) struct UnpackedKeywords<'db> {",
          "oldStart": 510,
          "newStart": 547,
          "sha256": "ed85f784e4dad9f2579ff3c412ff889f35243488b6c33f5a243823de71b33ae5",
          "classification": "observed-keyword-prefix-exclusions",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/arguments.rs#L547"
        },
        {
          "anchor": "@@ -669,12 +734,11 @@ impl<'db> KeywordArgument<'db> {",
          "oldStart": 669,
          "newStart": 734,
          "sha256": "4a1b19fa8ef3de545c5929d3d6d25a42e5d7a41d919a68231e0caa07b49a0bfb",
          "classification": "upstream-keyword-cache-fork-paramspec-composition",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/arguments.rs#L734"
        },
        {
          "anchor": "@@ -997,10 +1061,18 @@ impl<'a, 'db> CallArguments<'a, 'db> {",
          "oldStart": 997,
          "newStart": 1061,
          "sha256": "f17598787611a18d0dcec0a68234200ed9fb34906308872a501ed02774a612c5",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/arguments.rs#L1061"
        },
        {
          "anchor": "@@ -1072,69 +1144,6 @@ impl<'a, 'db> CallArguments<'a, 'db> {",
          "oldStart": 1072,
          "newStart": 1144,
          "sha256": "606942539d333ead2d411a210b50367423c0dbb03b63830f302d5ae0bd8bbb63",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/arguments.rs#L1144"
        },
        {
          "anchor": "@@ -1417,7 +1426,7 @@ mod tests {",
          "oldStart": 1417,
          "newStart": 1426,
          "sha256": "197be20189f1bf1377bca518587382d919ac5c36e0a4294d48d5c6e7966e80a8",
          "classification": "mechanical-native-test-import",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/arguments.rs#L1426"
        },
        {
          "anchor": "@@ -1553,7 +1562,11 @@ mod tests {",
          "oldStart": 1553,
          "newStart": 1562,
          "sha256": "7b10520b833974c1a3e3fae2a78cd61e6c14c4a1fd39300170ec82e6781f701f",
          "classification": "observed-keyword-prefix-exclusions",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/arguments.rs#L1562"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/call/bind.rs",
      "baseBlob": "dff010501a88819d315559c3d34a17fb6d41675e",
      "candidateBlob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b",
      "frozenCandidateBlob": "4b30c10649898e6da2e4aa6d21d657e97445ca70",
      "classification": "mixed-call-owner",
      "detail": "Preserves the bounded Lazy expansion precheck, constant TypeIs certification and contextual ParamSpec projection. Upstream #30594 owns shared suffix selection and diagnostic source remapping; fork integration runs the same selector for contextual inference and final checking, removes consumed Observed keyword names and records residual exclusions even when another argument bound the prefix. Independently, keyword mapping keys are validated before Observed.unpack can return early; the unreachable later Observed branch is removed. Current forward hunks additionally cover: sibling-dependent-empty-getattr-context-replay. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim. Final checkpoint explicitly reviewed changes: upstream-keyword-cache-fork-paramspec-composition, upstream-overload-prefix-cache, upstream-overload-prefix-cache-fork-provisional-guard. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: fresh-bounded-collection-sibling-context, fresh-collection-alias-marker-import-composition. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: fresh-collection-complete-sibling-preference-with-fallback, fresh-collection-context-provenance, fresh-collection-fallback-cache-identity, fresh-collection-raw-lookup-preservation, fresh-collection-tentative-context-representation, provided-keyword-field-context-delegation, provided-keyword-field-context-owner. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: prepared-fresh-collection-evidence-and-compatible-context. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -48,8 +48,8 @@ use crate::types::constraints::projection::{ProjectionTypeBudget, SolutionBudget",
          "oldStart": 48,
          "newStart": 48,
          "sha256": "497f3bde969d5f5d5644dda1334351d89a9f78360469aaeccee96a358c2e8340",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L48"
        },
        {
          "anchor": "@@ -74,7 +74,6 @@ use crate::types::infer::{TypeContextKind, original_class_type};",
          "oldStart": 74,
          "newStart": 74,
          "sha256": "59cf32b7586173f7baa5bb55c38f717aad825cab855da1e2ff655c3f5fd0aa66",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L74"
        },
        {
          "anchor": "@@ -91,17 +90,17 @@ use crate::types::typevar::{",
          "oldStart": 91,
          "newStart": 90,
          "sha256": "587d6b5493f086fe0f181bfec3d2741680614b13a74c9e7d720a2a3c18045c82",
          "classification": "fresh-collection-alias-marker-import-composition",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L90"
        },
        {
          "anchor": "@@ -2045,6 +2044,7 @@ impl<'db> Bindings<'db> {",
          "oldStart": 2045,
          "newStart": 2044,
          "sha256": "4e86e4d90a107c941e5adbedcd8ea066357028a7200fbe8b84f28039bb8e8d80",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L2044"
        },
        {
          "anchor": "@@ -2057,19 +2057,40 @@ impl<'db> Bindings<'db> {",
          "oldStart": 2057,
          "newStart": 2057,
          "sha256": "41bcaa6765ebf4a592d1a4ab4b81be42519b304a763f750db1bfd9b95502ff06",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L2057"
        },
        {
          "anchor": "@@ -2094,6 +2115,7 @@ impl<'db> Bindings<'db> {",
          "oldStart": 2094,
          "newStart": 2115,
          "sha256": "12368d2ff3a2a30fc7b9d27a6f92d2eb677e4f41b8f220e5125c8b1dca43f250",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L2115"
        },
        {
          "anchor": "@@ -2104,6 +2126,7 @@ impl<'db> Bindings<'db> {",
          "oldStart": 2104,
          "newStart": 2126,
          "sha256": "abda90d433bccfb17b6ef3fc838ea50f9e23ff78d1db04da9b2eb43e1f45c313",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L2126"
        },
        {
          "anchor": "@@ -2111,6 +2134,7 @@ impl<'db> Bindings<'db> {",
          "oldStart": 2111,
          "newStart": 2134,
          "sha256": "b54a0262e93db4210e69b2395ab898dda9a66480ec0bbbcfa49b9a7121d72e65",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L2134"
        },
        {
          "anchor": "@@ -3885,6 +3909,121 @@ impl FailingOverloadSelection {",
          "oldStart": 3885,
          "newStart": 3909,
          "sha256": "a11271906ac1809a93b8dc0d81f7a5be2516f31ccb740f6b4197cd8e64b32571",
          "classification": "upstream-overload-prefix-cache-fork-provisional-guard",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L3909"
        },
        {
          "anchor": "@@ -4385,6 +4524,12 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4385,
          "newStart": 4524,
          "sha256": "181f9a10051baf4b2c54bcb2afea6061626490f6492d4650febdaba70a1334cb",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L4524"
        },
        {
          "anchor": "@@ -4408,15 +4553,18 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4408,
          "newStart": 4553,
          "sha256": "b4d8d6c31e9b265105665738dcd0d89db2634bf089335ed8cdfd351f0ff5d68c",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L4553"
        },
        {
          "anchor": "@@ -4708,12 +4856,6 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4708,
          "newStart": 4856,
          "sha256": "8c5ddcffdde1724e087d1cdc47b915c0cebca70819480ed9d2d99e04bef7bfa1",
          "classification": "upstream-overload-prefix-cache",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L4856"
        },
        {
          "anchor": "@@ -4753,7 +4895,7 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4753,
          "newStart": 4895,
          "sha256": "f78a0658dd6f1af90babe5327279d684f67d8bc3dc1cbe3ab7ef14329f468fb2",
          "classification": "upstream-overload-prefix-cache",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L4895"
        },
        {
          "anchor": "@@ -4765,12 +4907,12 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4765,
          "newStart": 4907,
          "sha256": "a4fdcc4f6ab1aecda15a449744793eefcc29da042f88050ae629bab3ca13ac54",
          "classification": "upstream-overload-prefix-cache",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L4907"
        },
        {
          "anchor": "@@ -4781,78 +4923,22 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4781,
          "newStart": 4923,
          "sha256": "2e42c65d252b492554a7b06099f41c96d1722a43e422426791febb8483df4bc3",
          "classification": "upstream-overload-prefix-cache",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L4923"
        },
        {
          "anchor": "@@ -4893,7 +4979,13 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 4893,
          "newStart": 4979,
          "sha256": "7058aa68b50cc38b2c7235d86c03ca002a0c3ac1d2484bf7da5145ff0cef6c3d",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L4979"
        },
        {
          "anchor": "@@ -5316,7 +5408,10 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 5316,
          "newStart": 5408,
          "sha256": "e18d3cfe8df083f22133b653a790a0077852a1319507e6d609bd6dfc8e0612e3",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L5408"
        },
        {
          "anchor": "@@ -5326,10 +5421,9 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 5326,
          "newStart": 5421,
          "sha256": "72b24b964200a787120af6b10c3c168cb3838f11f89d43cc948ca9ff9289d374",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L5421"
        },
        {
          "anchor": "@@ -5338,19 +5432,47 @@ impl<'db> CallableBinding<'db> {",
          "oldStart": 5338,
          "newStart": 5432,
          "sha256": "1465e0044e306b70008de234de4f5cbb6d3fe6656fa1ef4116ee9f50a20d8306",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L5432"
        },
        {
          "anchor": "@@ -6235,8 +6357,9 @@ impl<'a, 'db> ArgumentMatcher<'a, 'db> {",
          "oldStart": 6235,
          "newStart": 6357,
          "sha256": "4fb8a3fafe8606818101557dd9ee65324a39ffbf90b3809f6671e244f8346e6e",
          "classification": "upstream-keyword-cache-fork-paramspec-composition",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L6357"
        },
        {
          "anchor": "@@ -6865,7 +6988,13 @@ fn inferred_parameter_specialization<'db>(",
          "oldStart": 6865,
          "newStart": 6988,
          "sha256": "99af99f2bd861be21ed423aaab643778744c90f8f5fa77da08491e346eab5179",
          "classification": "mixed-call-owner",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L6988"
        },
        {
          "anchor": "@@ -6982,7 +7111,7 @@ struct InferredCall<'db> {",
          "oldStart": 6982,
          "newStart": 7111,
          "sha256": "a122ce776505cff9cf485034ad82c99972b766225732493428cfdd1ff07a88f1",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7111"
        },
        {
          "anchor": "@@ -6992,6 +7121,10 @@ struct CallInference<'a, 'db> {",
          "oldStart": 6992,
          "newStart": 7121,
          "sha256": "243be3134db19d240e4f065c64f29f8b52f6eea6260b4d2f2eede7e4e43ed306",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7121"
        },
        {
          "anchor": "@@ -7018,6 +7151,8 @@ impl<'a, 'db> CallInference<'a, 'db> {",
          "oldStart": 7018,
          "newStart": 7151,
          "sha256": "3ce93f624a1739447c86f9c6dd67cf9d4ff44881d946a3716f6dd667dd9db71d",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7151"
        },
        {
          "anchor": "@@ -7035,6 +7170,12 @@ impl<'a, 'db> CallInference<'a, 'db> {",
          "oldStart": 7035,
          "newStart": 7170,
          "sha256": "ffabc477ccd3b2c0755536971f6e0112669dd59845bf3d482925c5a36bfd88fc",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7170"
        },
        {
          "anchor": "@@ -7073,29 +7214,6 @@ impl<'a, 'db> CallInference<'a, 'db> {",
          "oldStart": 7073,
          "newStart": 7214,
          "sha256": "2be66d9d32832cf5db60f3a44ef7d32a7239310edb3b78554d765047914b6a94",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7214"
        },
        {
          "anchor": "@@ -7139,8 +7257,11 @@ impl<'db> ArgumentTypeChecker<'_, 'db> {",
          "oldStart": 7139,
          "newStart": 7257,
          "sha256": "c00c385a8cc1ae9844adf15aec9a8dba037cd94558297ba400e581c60470eaa4",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7257"
        },
        {
          "anchor": "@@ -7240,7 +7361,7 @@ impl<'db> ArgumentTypeChecker<'_, 'db> {",
          "oldStart": 7240,
          "newStart": 7361,
          "sha256": "ba80a0985edfaee2219a843b4a42afde06454331678f1a605f842d576edcd1ea",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7361"
        },
        {
          "anchor": "@@ -7685,20 +7806,113 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 7685,
          "newStart": 7806,
          "sha256": "ea929a86088f5b6be4cbdc8286214ad9ce895f9702f6697a5808d435b7e0390f",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7806"
        },
        {
          "anchor": "@@ -7719,13 +7933,17 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 7719,
          "newStart": 7933,
          "sha256": "e8f1d63dd4ccd4a42c360e0504fe28dfc4dc3096a5117f5d1adc99a01801b9c9",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7933"
        },
        {
          "anchor": "@@ -7740,14 +7958,11 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 7740,
          "newStart": 7958,
          "sha256": "0d12c4f3c81120586f71f67bc62f930e19c8456ff37f686bb6ca6c89aefa1ebb",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7958"
        },
        {
          "anchor": "@@ -7756,6 +7971,7 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 7756,
          "newStart": 7971,
          "sha256": "8851bc38abf3bd3f9f55f39d1bbd4f3545208b185eccd29b3b03690421f50bdd",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7971"
        },
        {
          "anchor": "@@ -7768,13 +7984,17 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 7768,
          "newStart": 7984,
          "sha256": "23776f16ba49fce8882570128dac839749c6f3a7f226d968472c5e259f2ebaef",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7984"
        },
        {
          "anchor": "@@ -7782,6 +8002,7 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 7782,
          "newStart": 8002,
          "sha256": "dec2bffdee71d6936e0b7e67e87833bfdb9af54c45acccc94081e5cf21c89c86",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L8002"
        },
        {
          "anchor": "@@ -8011,7 +8232,6 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 8011,
          "newStart": 8232,
          "sha256": "8d36fd83c581fe7fc3fd83e7ef59e0cef95261589b2c338b349ea8bc3608b619",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L8232"
        },
        {
          "anchor": "@@ -8039,6 +8259,7 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 8039,
          "newStart": 8259,
          "sha256": "501186ad4e28f08b671c131696826365a860eefcb5160f573879437d884cdc40",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L8259"
        },
        {
          "anchor": "@@ -8050,31 +8271,74 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 8050,
          "newStart": 8271,
          "sha256": "41c5ec0b29aa9590ec216efd7b866403dd02a6c4b7f5460673a12320d244e13d",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L8271"
        },
        {
          "anchor": "@@ -8177,7 +8441,6 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 8177,
          "newStart": 8441,
          "sha256": "96dd4dc7b0d3dae9030906416c840cbd7b8298e829a9b67d7bb81ff16409a9b8",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L8441"
        },
        {
          "anchor": "@@ -8185,6 +8448,10 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 8185,
          "newStart": 8448,
          "sha256": "791ea41abcbe0267eb70d59507aaaff7e2ae6d3a7d7c2150629c4bae25a30fa2",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L8448"
        },
        {
          "anchor": "@@ -8636,12 +8903,7 @@ impl<'db> CallInference<'_, 'db> {",
          "oldStart": 8636,
          "newStart": 8903,
          "sha256": "dabc602040b64545b3181ac46b4076806c6abcfd737d2f0184fb379e3f44b5df",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L8903"
        },
        {
          "anchor": "@@ -8757,14 +9019,8 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 8757,
          "newStart": 9019,
          "sha256": "46726ddf66ade15f996b1e5cde550d148c0149d703c2c162af4e32afcd77ceba",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9019"
        },
        {
          "anchor": "@@ -8891,50 +9147,8 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 8891,
          "newStart": 9147,
          "sha256": "b30fa791811ab6ced4d911212867e2b667b6ac64836d45f268d91dc850b400d3",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9147"
        },
        {
          "anchor": "@@ -8955,7 +9169,6 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 8955,
          "newStart": 9169,
          "sha256": "f5073f03c677253b8c0fd4e4c4a9ab8fef8786c867476fc260ec39fe83fcb711",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9169"
        },
        {
          "anchor": "@@ -8988,7 +9201,7 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 8988,
          "newStart": 9201,
          "sha256": "4c5c337b2c65450e8f8b3e09e0f27b71286d5946ba807cc9ee347fb97b5b936f",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9201"
        },
        {
          "anchor": "@@ -9010,8 +9223,7 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9010,
          "newStart": 9223,
          "sha256": "73e6014431056ffa4e1e1ce3382332ce39f358c86295e576834d78eaa31e5218",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9223"
        },
        {
          "anchor": "@@ -9022,13 +9234,11 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9022,
          "newStart": 9234,
          "sha256": "79099050b866696758541407bae462ee499beebfc889ae7a15e5c271f12a9b65",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9234"
        },
        {
          "anchor": "@@ -9050,23 +9260,8 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9050,
          "newStart": 9260,
          "sha256": "518b9f3e251f93d1714d92e68931807d52c2b979afd160d7e469933e5b687967",
          "classification": "upstream-selector-with-observed-keyword-exclusions",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9260"
        },
        {
          "anchor": "@@ -9091,7 +9286,6 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9091,
          "newStart": 9286,
          "sha256": "7df25f836b7c8429584941a01f3db076af917e5792b462e8d138e3920810f509",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9286"
        },
        {
          "anchor": "@@ -9109,21 +9303,15 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9109,
          "newStart": 9303,
          "sha256": "a1ecaa33ee2c766cb0613d359f50cc3c4371936eb163e3795f3d5f5104484750",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9303"
        },
        {
          "anchor": "@@ -9172,12 +9360,11 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9172,
          "newStart": 9360,
          "sha256": "c0775044521026c37b2e0d4c013d1d75ff28c286560ab51c268cfdb6a9ee2f52",
          "classification": "mixed-upstream-selector-and-key-validation-plumbing",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9360"
        },
        {
          "anchor": "@@ -9199,7 +9386,7 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9199,
          "newStart": 9386,
          "sha256": "9fc20d9db46c412158569f3950164b1bbf0fed870ebe2fabaa3eaf6b49c4cc45",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9386"
        },
        {
          "anchor": "@@ -9212,9 +9399,23 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9212,
          "newStart": 9399,
          "sha256": "cbee11881dcf8a40ba8273a43b3fd5de883135bf2f5e92fd607e96c7516e7e55",
          "classification": "observed-keyword-key-validation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9399"
        },
        {
          "anchor": "@@ -9223,42 +9424,10 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9223,
          "newStart": 9424,
          "sha256": "7b8eae2877edcc8ac5018c2c052487e10d3934e7f947ac729bc51f716fc896ba",
          "classification": "observed-keyword-key-validation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9424"
        },
        {
          "anchor": "@@ -9286,7 +9455,7 @@ impl<'a, 'db> ArgumentTypeChecker<'a, 'db> {",
          "oldStart": 9286,
          "newStart": 9455,
          "sha256": "3cac8306697f36f63cc92a618368ba2bd2e5bb6eb58e7ec1372426a0bf620158",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9455"
        },
        {
          "anchor": "@@ -9394,12 +9563,17 @@ fn nested_union_members<'db>(",
          "oldStart": 9394,
          "newStart": 9563,
          "sha256": "599874867034eab9dabf25bb0d11eda0be92350d9b70866f3c2ebcce63857c27",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9563"
        },
        {
          "anchor": "@@ -9408,7 +9582,91 @@ struct ArgumentContextCacheEntry<'db> {",
          "oldStart": 9408,
          "newStart": 9582,
          "sha256": "5488b00de6c73751417878acc3902a218b6e6008dd9a9ed55c4644af12b0a82e",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9582"
        },
        {
          "anchor": "@@ -9504,6 +9762,13 @@ pub(crate) enum ArgumentTypeContext<'db> {",
          "oldStart": 9504,
          "newStart": 9762,
          "sha256": "2980ae0b8c1977884e4f2f73117310d28fd33275808987707f44751197885efe",
          "classification": "fresh-collection-tentative-context-representation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9762"
        },
        {
          "anchor": "@@ -9539,8 +9804,55 @@ impl<'db> ArgumentTypeContext<'db> {",
          "oldStart": 9539,
          "newStart": 9804,
          "sha256": "8f69d87f08217e9b7e233b1df508a55bc87156ccadb5ec84bf91c7a712901110",
          "classification": "fresh-collection-context-provenance",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9804"
        },
        {
          "anchor": "@@ -9549,14 +9861,23 @@ impl<'db> ArgumentTypeContext<'db> {",
          "oldStart": 9549,
          "newStart": 9861,
          "sha256": "71df05b5fd2c4d0008f83048ad63e60ede864c7532eacbc52cfe2d58df552d44",
          "classification": "fresh-collection-fallback-cache-identity",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9861"
        },
        {
          "anchor": "@@ -9573,7 +9894,15 @@ impl<'db> ArgumentTypeContext<'db> {",
          "oldStart": 9573,
          "newStart": 9894,
          "sha256": "2ffda9048894d5a1a01aa4c8b585b18edca446909abc42ee32d5a721f09b0b37",
          "classification": "fresh-collection-raw-lookup-preservation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9894"
        },
        {
          "anchor": "@@ -9594,6 +9923,81 @@ impl<'db> ArgumentTypeContext<'db> {",
          "oldStart": 9594,
          "newStart": 9923,
          "sha256": "c82b2c8d754b71d6235680993d4e14781db041e5db3a790c1529ae956382daa2",
          "classification": "upstream-selector-with-observed-keyword-exclusions",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9923"
        },
        {
          "anchor": "@@ -9843,15 +10247,13 @@ impl<'db> Binding<'db> {",
          "oldStart": 9843,
          "newStart": 10247,
          "sha256": "4ab36bf4bd1ec3f1ffa6e5b19a2436433957d83a0880a52bc097506f61de566d",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10247"
        },
        {
          "anchor": "@@ -9862,9 +10264,19 @@ impl<'db> Binding<'db> {",
          "oldStart": 9862,
          "newStart": 10264,
          "sha256": "35668327583ced327aa105527e175365e2c3ab5572a5ec15ef080d13101e15cf",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10264"
        },
        {
          "anchor": "@@ -9892,7 +10304,7 @@ impl<'db> Binding<'db> {",
          "oldStart": 9892,
          "newStart": 10304,
          "sha256": "dfe48892291c9acb34e9aff0fc6c10c6099c75b57fc3054a52a96a7d5f51a23d",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10304"
        },
        {
          "anchor": "@@ -9989,40 +10401,6 @@ impl<'db> Binding<'db> {",
          "oldStart": 9989,
          "newStart": 10401,
          "sha256": "80d8572ff11c3f41aa15d8ebb640cc597ec1c4d6598eae2c0f492e960bf9779a",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10401"
        },
        {
          "anchor": "@@ -10062,17 +10440,17 @@ impl<'db> Binding<'db> {",
          "oldStart": 10062,
          "newStart": 10440,
          "sha256": "6f433aa075b39f7795e2314b62778ac46d4cd2416737f61d09712314af8a6bcc",
          "classification": "upstream-selector-with-observed-keyword-exclusions",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10440"
        },
        {
          "anchor": "@@ -10108,11 +10486,10 @@ impl<'db> Binding<'db> {",
          "oldStart": 10108,
          "newStart": 10486,
          "sha256": "5d389a161849ca4d1bd312cdc655613059817aa6c7d288abb37a1900ed81d859",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10486"
        },
        {
          "anchor": "@@ -10211,6 +10588,45 @@ impl<'db> Binding<'db> {",
          "oldStart": 10211,
          "newStart": 10588,
          "sha256": "2fdb9f535b0e363cc21398febf03601f3b91517ff2636ebaab97b86e89c16910",
          "classification": "provided-keyword-field-context-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10588"
        },
        {
          "anchor": "@@ -10236,7 +10652,7 @@ impl<'db> Binding<'db> {",
          "oldStart": 10236,
          "newStart": 10652,
          "sha256": "8532ecdeec5edafcc12f8621f2f216349006b78c72d06bf386f90117f2de8d78",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10652"
        },
        {
          "anchor": "@@ -10246,35 +10662,18 @@ impl<'db> Binding<'db> {",
          "oldStart": 10246,
          "newStart": 10662,
          "sha256": "a525ad1efe87a3f037c7aecb9f9bf4c3fa50f2b1d885a3ca7e076c964dc7a575",
          "classification": "provided-keyword-field-context-delegation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10662"
        },
        {
          "anchor": "@@ -10304,7 +10703,7 @@ impl<'db> Binding<'db> {",
          "oldStart": 10304,
          "newStart": 10703,
          "sha256": "a87cd8c1cae2866c5d1427cb85fdcce47d0425eaebc44ed721d2cd4c0560254f",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10703"
        },
        {
          "anchor": "@@ -10315,7 +10714,6 @@ impl<'db> Binding<'db> {",
          "oldStart": 10315,
          "newStart": 10714,
          "sha256": "4d29a9b00b65e8d1863142473de6c1543a359e59f828090a70b04bfc70a43802",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10714"
        },
        {
          "anchor": "@@ -10441,6 +10839,175 @@ impl<'db> Binding<'db> {",
          "oldStart": 10441,
          "newStart": 10839,
          "sha256": "fdd12591da84fc20961e585f4dace9be0155f8b12cf92870880f52f7796cc266",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10839"
        },
        {
          "anchor": "@@ -10459,7 +11026,7 @@ impl<'db> Binding<'db> {",
          "oldStart": 10459,
          "newStart": 11026,
          "sha256": "26737d8c9297a916f43f9076188f4fbe4971e41967e2eb94389da51a2e1dfcfc",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L11026"
        },
        {
          "anchor": "@@ -10524,7 +11091,6 @@ impl<'db> Binding<'db> {",
          "oldStart": 10524,
          "newStart": 11091,
          "sha256": "1f107628d0ea7010d698c1736cb9e6a57b589577a4cccf8d6608cb3424a2ea8c",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L11091"
        },
        {
          "anchor": "@@ -10540,22 +11106,26 @@ impl<'db> Binding<'db> {",
          "oldStart": 10540,
          "newStart": 11106,
          "sha256": "cd351a45735d8319a19753e5402c4c622119df5b9a409f9adc30980a07525bfc",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L11106"
        },
        {
          "anchor": "@@ -11774,23 +12344,8 @@ impl BindingError<'_> {",
          "oldStart": 11774,
          "newStart": 12344,
          "sha256": "c8571b72cb6711b5b14df2eb0e18295233a132819397a04cb2dbecf47fd814c7",
          "classification": "upstream-paramspec-selector-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L12344"
        },
        {
          "anchor": "@@ -13037,9 +13592,191 @@ mod tests {",
          "oldStart": 13037,
          "newStart": 13592,
          "sha256": "21e204b6ec95ccabbf5196ddce89adedcd2096c3f9aff0bfe2db71a183e512d3",
          "classification": "observed-keyword-prefix-and-existing-typeis-regressions",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L13592"
        },
        {
          "anchor": "@@ -13104,7 +13841,6 @@ mod tests {",
          "oldStart": 13104,
          "newStart": 13841,
          "sha256": "6cab8a47cacd509959d34c81fc8a55c725e562b5b0a735279781a4bf868d4f3f",
          "classification": "mixed-call-owner",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L13841"
        },
        {
          "anchor": "@@ -13153,7 +13889,8 @@ mod tests {",
          "oldStart": 13153,
          "newStart": 13889,
          "sha256": "469a9f197f7af8c8cc00bcc00cdd7554ef7fad627142ffc3f0c61e4ebd806b05",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L13889"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/checked.rs#L42"
        },
        {
          "anchor": "@@ -58,7 +60,7 @@ pub struct CheckedCall<'a, 'db> {",
          "oldStart": 58,
          "newStart": 60,
          "sha256": "a82194dfef854ebc47c3b16a3e6a73b97e3ccd11ff24f5f9809e2448295a02a5",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/checked.rs#L60"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/class.rs",
      "baseBlob": "239bb50d67d1ab16966187b6abeb1cad8d4041f4",
      "candidateBlob": "5cba86c2ae17dc4fba4190db0f19b95a441e8302",
      "frozenCandidateBlob": "1d59a9f34398bdcefce882cf604d474c181b1d9a",
      "classification": "upstream-unchanged-specialization-cycle-reuse",
      "detail": "Official #30643 normalizes the same ordered type and tuple fields, copies on first changed type, and returns existing interned specialization/alias only when all normalized fields are unchanged; no cache epoch or inference snapshot is introduced. Final checkpoint explicitly reviewed changes: upstream-unchanged-specialization-cycle-reuse. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -442,12 +442,13 @@ impl<'db> GenericAlias<'db> {",
          "oldStart": 442,
          "newStart": 442,
          "sha256": "ae8e2e1c6c4e87533b43c4c086ff15f6d5a655d0cdd7e9c28bdc7fb389bacfbc",
          "classification": "upstream-unchanged-specialization-cycle-reuse",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30643 normalizes the same ordered type and tuple fields, copies on first changed type, and returns existing interned specialization/alias only when all normalized fields are unchanged; no cache epoch or inference snapshot is introduced.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/class.rs#L442"
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
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/class/known.rs#L315"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/class/static_literal.rs",
      "baseBlob": "da2fbbf1baeaf77dee8a2887e9dc43e0c0964303",
      "candidateBlob": "78450fa9e2337629117b76992f7303b4e94d0726",
      "frozenCandidateBlob": "14ca4ef54b9a2206653f64211747cc8d795ec92f",
      "classification": "upstream-generated-member-lazy-instance",
      "detail": "Official #30680 delays generated-member instance construction and pydantic policy work until a signature actually needs them; specialized instance consumers dereference the same LazyCell result. Final checkpoint explicitly reviewed changes: upstream-generated-member-lazy-instance. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -9,7 +9,7 @@ use ruff_db::{",
          "oldStart": 9,
          "newStart": 9,
          "sha256": "0fdb27ec1e8ca7c3c48ac057664479e7f703d1712d5ce0019d3df51c3cebeb23",
          "classification": "upstream-generated-member-lazy-instance",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30680 delays generated-member instance construction and pydantic policy work until a signature actually needs them; specialized instance consumers dereference the same LazyCell result.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/class/static_literal.rs#L9"
        },
        {
          "anchor": "@@ -1996,19 +1996,21 @@ impl<'db> StaticClassLiteral<'db> {",
          "oldStart": 1996,
          "newStart": 1996,
          "sha256": "5881ea24e61241227f9bd67f399a42a4e1c54e453623cdf09c50f0f294b6d40f",
          "classification": "upstream-generated-member-lazy-instance",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30680 delays generated-member instance construction and pydantic policy work until a signature actually needs them; specialized instance consumers dereference the same LazyCell result.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/class/static_literal.rs#L1996"
        },
        {
          "anchor": "@@ -2237,7 +2239,7 @@ impl<'db> StaticClassLiteral<'db> {",
          "oldStart": 2237,
          "newStart": 2239,
          "sha256": "1e7e53a5a11b876e63509ad77edf571411e6df81215b7ba2a308ef2a6b3196eb",
          "classification": "upstream-generated-member-lazy-instance",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30680 delays generated-member instance construction and pydantic policy work until a signature actually needs them; specialized instance consumers dereference the same LazyCell result.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/class/static_literal.rs#L2239"
        },
        {
          "anchor": "@@ -2258,7 +2260,7 @@ impl<'db> StaticClassLiteral<'db> {",
          "oldStart": 2258,
          "newStart": 2260,
          "sha256": "8c2dfc433027155bb49ee955eaf0019636d8d69c73f1753adc499c68ad4b3273",
          "classification": "upstream-generated-member-lazy-instance",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30680 delays generated-member instance construction and pydantic policy work until a signature actually needs them; specialized instance consumers dereference the same LazyCell result.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/class/static_literal.rs#L2260"
        },
        {
          "anchor": "@@ -2302,10 +2304,10 @@ impl<'db> StaticClassLiteral<'db> {",
          "oldStart": 2302,
          "newStart": 2304,
          "sha256": "8a9b42cefe77cbbc2b8b424c5f587640c37cfc42ca436f9b349b1f2043dcb6fc",
          "classification": "upstream-generated-member-lazy-instance",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30680 delays generated-member instance construction and pydantic policy work until a signature actually needs them; specialized instance consumers dereference the same LazyCell result.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/class/static_literal.rs#L2304"
        },
        {
          "anchor": "@@ -2326,7 +2328,7 @@ impl<'db> StaticClassLiteral<'db> {",
          "oldStart": 2326,
          "newStart": 2328,
          "sha256": "f3190f84eb895252db03ae67bf9ec545c8800629527995ee376e8c7c02af18c7",
          "classification": "upstream-generated-member-lazy-instance",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30680 delays generated-member instance construction and pydantic policy work until a signature actually needs them; specialized instance consumers dereference the same LazyCell result.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/class/static_literal.rs#L2328"
        },
        {
          "anchor": "@@ -2393,16 +2395,16 @@ impl<'db> StaticClassLiteral<'db> {",
          "oldStart": 2393,
          "newStart": 2395,
          "sha256": "1126e43e5e6d0f6f64c88e25fb0c72cfbcc3b5e2ccc811f5d196fe3614c31ff8",
          "classification": "upstream-generated-member-lazy-instance",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30680 delays generated-member instance construction and pydantic policy work until a signature actually needs them; specialized instance consumers dereference the same LazyCell result.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/class/static_literal.rs#L2395"
        },
        {
          "anchor": "@@ -2419,7 +2421,7 @@ impl<'db> StaticClassLiteral<'db> {",
          "oldStart": 2419,
          "newStart": 2421,
          "sha256": "a580e6df27e57818833909fb1a8010610dcbcfb961bc299866582153ff2ee3f6",
          "classification": "upstream-generated-member-lazy-instance",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30680 delays generated-member instance construction and pydantic policy work until a signature actually needs them; specialized instance consumers dereference the same LazyCell result.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/class/static_literal.rs#L2421"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints.rs",
      "baseBlob": "6de68cb6df38b67fdbdd23a70cbf7a0c2445b196",
      "candidateBlob": "88576e91defcda500d7cf02525314f321fa8d438",
      "frozenCandidateBlob": "11f6a491566c2a173e406335771077d11e860642",
      "classification": "receiver-obligation-lifecycle",
      "detail": "Remove owned receiver BDD inspection/remapping helpers after storing raw receiver pairs; test capture scope rewritten without assert_matches binding. Final checkpoint explicitly reviewed changes: candidate-search-runtime-api-migration, candidate-search-test-api-migration, constrained-callback-original-equality-witness, constrained-callback-test-initialization, upstream-first-valid-overlap-fork-shared-budget, upstream-first-valid-search-api. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: upstream-storage-typevar-count. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: scoped-ordered-projection-cache-identity, upstream-coverage-node-storage-composition. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -97,7 +97,6 @@ use std::marker::PhantomData;",
          "oldStart": 97,
          "newStart": 97,
          "sha256": "ef1283ddafde204e9ae65b23d9ec4f15fc2f8e1ac34c7535130c0d8e5d088267",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L97"
        },
        {
          "anchor": "@@ -306,21 +305,6 @@ impl<'db> OwnedConstraintSet<'db> {",
          "oldStart": 306,
          "newStart": 305,
          "sha256": "75708f3cef0573aab7e3c0c163215e6cde426d4d073dae9bee8c9d0140f6aa46",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L305"
        },
        {
          "anchor": "@@ -340,24 +324,6 @@ impl<'db> OwnedConstraintSet<'db> {",
          "oldStart": 340,
          "newStart": 324,
          "sha256": "0815748085890f36044a8e93030e7f379d9d0909f3cc7e0594d8a0659e36885c",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L324"
        },
        {
          "anchor": "@@ -418,7 +384,51 @@ pub struct ConstraintSet<'db, 'c> {",
          "oldStart": 418,
          "newStart": 384,
          "sha256": "ff4695c829fe5993a8cc02b5afbfd293155bf2f98916e7155babe14ae3220f69",
          "classification": "scoped-ordered-projection-cache-identity",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Fork cache adaptation retains arena/node and raw order identity, then unfiltered immediate ConstraintId first-order including quantified wrapper identities. Factored existing walker preserves ordered_constraints filtering as a later step; binder provenance/locals/body/internal order are not flattened away.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L384"
        },
        {
          "anchor": "@@ -620,10 +630,45 @@ impl<'db, 'c> ConstraintSet<'db, 'c> {",
          "oldStart": 620,
          "newStart": 630,
          "sha256": "2cd00ecae9b82cc68a6d2e7c157b236cf5b4cc289ebcaca1c0f1e447c68d49fd",
          "classification": "upstream-first-valid-overlap-fork-shared-budget",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L630"
        },
        {
          "anchor": "@@ -1016,23 +1061,7 @@ impl<'db, 'c> ConstraintSet<'db, 'c> {",
          "oldStart": 1016,
          "newStart": 1061,
          "sha256": "b667e2df2ba160a1ac1ed674911658f0275c7476566af9dd434af9b981ae636d",
          "classification": "scoped-ordered-projection-cache-identity",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Fork cache adaptation retains arena/node and raw order identity, then unfiltered immediate ConstraintId first-order including quantified wrapper identities. Factored existing walker preserves ordered_constraints filtering as a later step; binder provenance/locals/body/internal order are not flattened away.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L1061"
        },
        {
          "anchor": "@@ -1151,11 +1180,14 @@ struct ConstraintSetStorage<'db> {",
          "oldStart": 1151,
          "newStart": 1180,
          "sha256": "e25a7e9f71ad79b82a30a0ae6a4df5c0a9c87e6accb9f87e4c0dd7324b90b33b",
          "classification": "upstream-coverage-node-storage-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30658 BuilderNode data/support representation and bounded lazy minimum-positive-atom coverage shortcut, composed with fork overlay/owned storage. Compacted nodes retain original representation; owned compaction copies matching data/support. Existing fuel/provenance and scoped witnesses remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L1180"
        },
        {
          "anchor": "@@ -1270,6 +1302,15 @@ impl<'db> ConstraintSetStorage<'db> {",
          "oldStart": 1270,
          "newStart": 1302,
          "sha256": "1ac5b9dcc45d7204629615bfd17adee84f52e727fee5d17a7072ad28a9d4cc00",
          "classification": "upstream-storage-typevar-count",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L1302"
        },
        {
          "anchor": "@@ -1332,19 +1373,6 @@ impl<'db> ConstraintSetBuilder<'db> {",
          "oldStart": 1332,
          "newStart": 1373,
          "sha256": "560a0b5ed95ec571aa43f64b357a26c72071075171eec8ad3a2fc29f9c5105ff",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L1373"
        },
        {
          "anchor": "@@ -1536,13 +1564,49 @@ impl<'db> ConstraintSetStorage<'db> {",
          "oldStart": 1536,
          "newStart": 1564,
          "sha256": "71ce76e92f18cd6f94f81caa0279a5301238ef417d4353a114af3b35094f53c1",
          "classification": "upstream-coverage-node-storage-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30658 BuilderNode data/support representation and bounded lazy minimum-positive-atom coverage shortcut, composed with fork overlay/owned storage. Compacted nodes retain original representation; owned compaction copies matching data/support. Existing fuel/provenance and scoped witnesses remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L1564"
        },
        {
          "anchor": "@@ -1598,9 +1662,9 @@ impl<'db> ConstraintSetStorage<'db> {",
          "oldStart": 1598,
          "newStart": 1662,
          "sha256": "ff4e4eb0106a9d5f0a33dfa6eebc58ed049de037d00beaf570555fe682a840f3",
          "classification": "upstream-coverage-node-storage-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30658 BuilderNode data/support representation and bounded lazy minimum-positive-atom coverage shortcut, composed with fork overlay/owned storage. Compacted nodes retain original representation; owned compaction copies matching data/support. Existing fuel/provenance and scoped witnesses remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L1662"
        },
        {
          "anchor": "@@ -1655,6 +1719,31 @@ impl<'db> ConstraintSetStorage<'db> {",
          "oldStart": 1655,
          "newStart": 1719,
          "sha256": "8f1a07b5ba3f90996db7cb6e7fbe8107c8ea81cd9062dbf4e972ce8780694e62",
          "classification": "scoped-ordered-projection-cache-identity",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Fork cache adaptation retains arena/node and raw order identity, then unfiltered immediate ConstraintId first-order including quantified wrapper identities. Factored existing walker preserves ordered_constraints filtering as a later step; binder provenance/locals/body/internal order are not flattened away.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L1719"
        },
        {
          "anchor": "@@ -1745,9 +1834,9 @@ impl<'db> ConstraintSetStorage<'db> {",
          "oldStart": 1745,
          "newStart": 1834,
          "sha256": "68816df9e11201c3630ad1a243f579a36ad67e626a734b933f310b21cd6f9576",
          "classification": "upstream-coverage-node-storage-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30658 BuilderNode data/support representation and bounded lazy minimum-positive-atom coverage shortcut, composed with fork overlay/owned storage. Compacted nodes retain original representation; owned compaction copies matching data/support. Existing fuel/provenance and scoped witnesses remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L1834"
        },
        {
          "anchor": "@@ -2420,6 +2509,8 @@ const ALWAYS_TRUE: NodeId = NodeId(0xffff_ffff);",
          "oldStart": 2420,
          "newStart": 2509,
          "sha256": "9a286c4bbca5decc4f6837298256d894aa1be15ba6472b9fd25ac0f8f58f08a8",
          "classification": "upstream-coverage-node-storage-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30658 BuilderNode data/support representation and bounded lazy minimum-positive-atom coverage shortcut, composed with fork overlay/owned storage. Compacted nodes retain original representation; owned compaction copies matching data/support. Existing fuel/provenance and scoped witnesses remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L2509"
        },
        {
          "anchor": "@@ -2474,10 +2565,15 @@ impl NodeId {",
          "oldStart": 2474,
          "newStart": 2565,
          "sha256": "b945bffba19c21102e1619c0fdf22dc303cd18a23cd2ce59e4d1a9b537aa085d",
          "classification": "upstream-coverage-node-storage-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30658 BuilderNode data/support representation and bounded lazy minimum-positive-atom coverage shortcut, composed with fork overlay/owned storage. Compacted nodes retain original representation; owned compaction copies matching data/support. Existing fuel/provenance and scoped witnesses remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L2565"
        },
        {
          "anchor": "@@ -3317,6 +3413,13 @@ struct InteriorNodeData {",
          "oldStart": 3317,
          "newStart": 3413,
          "sha256": "3539e146d4e44e547e45cd295c52181e6060b376970fdc2b5307b9579cce3888",
          "classification": "upstream-coverage-node-storage-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30658 BuilderNode data/support representation and bounded lazy minimum-positive-atom coverage shortcut, composed with fork overlay/owned storage. Compacted nodes retain original representation; owned compaction copies matching data/support. Existing fuel/provenance and scoped witnesses remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L3413"
        },
        {
          "anchor": "@@ -3439,6 +3542,23 @@ impl<'db> CandidateTypeVarSolver<'db> {",
          "oldStart": 3439,
          "newStart": 3542,
          "sha256": "5f95581b4ce13e49ec5b7f09a110094840b2e9952665e0b375ea713d2c5f24dd",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L3542"
        },
        {
          "anchor": "@@ -3475,6 +3595,7 @@ impl<'db> CandidateTypeVarSolver<'db> {",
          "oldStart": 3475,
          "newStart": 3595,
          "sha256": "298f1781fa0efcbae19dfcce9c81722111890ab02f9d3c11b85fa9394850691b",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L3595"
        },
        {
          "anchor": "@@ -3573,6 +3694,8 @@ pub(crate) struct CandidateTypeVarSolution<'db> {",
          "oldStart": 3573,
          "newStart": 3694,
          "sha256": "b7c18cd29e6b1b224faa7c6b7060fd2f2e3dfdbf40658ee56b3dd2d65e0d4e38",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L3694"
        },
        {
          "anchor": "@@ -3593,6 +3716,7 @@ impl<'db> CandidateTypeVarSolution<'db> {",
          "oldStart": 3593,
          "newStart": 3716,
          "sha256": "5e2e610b193d4f4bc83316d4fc8c6ccae395bf51556e331ec32b91fcc5f15d21",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L3716"
        },
        {
          "anchor": "@@ -4238,7 +4362,7 @@ impl<'db> CandidateResidual<'db> {",
          "oldStart": 4238,
          "newStart": 4362,
          "sha256": "9c1085c1117b2337ab0be0bb22f8c8745f8aa281d2980689beab87584391b90e",
          "classification": "candidate-search-runtime-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L4362"
        },
        {
          "anchor": "@@ -4385,6 +4509,14 @@ impl SolutionLimits for BoundedSolutionLimits {",
          "oldStart": 4385,
          "newStart": 4509,
          "sha256": "821713db57baf1c70b7649f19e65959e593c72e4a93b9d01bd781f450e887775",
          "classification": "upstream-first-valid-search-api",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L4509"
        },
        {
          "anchor": "@@ -4408,7 +4540,7 @@ impl<'db> CandidateSolutions<'db> {",
          "oldStart": 4408,
          "newStart": 4540,
          "sha256": "1aca008c787c7f8c28289ea87f1a04cca9ed4797d243e09287c8506be60cdebb",
          "classification": "upstream-first-valid-search-api",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L4540"
        },
        {
          "anchor": "@@ -4423,7 +4555,7 @@ impl<'db> CandidateSolutions<'db> {",
          "oldStart": 4423,
          "newStart": 4555,
          "sha256": "9b70d17c4e623fe54be090ed471d0b601fdda73a93479bcdd8c7b925d98dd970",
          "classification": "upstream-first-valid-search-api",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L4555"
        },
        {
          "anchor": "@@ -4435,7 +4567,10 @@ impl<'db> CandidateSolutions<'db> {",
          "oldStart": 4435,
          "newStart": 4567,
          "sha256": "09d795336136433cbca1998e3867611c62ab3b1d131365c7a1c9762e5bd4f7c1",
          "classification": "upstream-first-valid-search-api",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L4567"
        },
        {
          "anchor": "@@ -4448,7 +4583,8 @@ impl<'db> CandidateSolutions<'db> {",
          "oldStart": 4448,
          "newStart": 4583,
          "sha256": "ad2221ed4892484b9fdb532623ce79f035067f72acda1465e6a76ef8f6a1d6b8",
          "classification": "upstream-first-valid-search-api",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L4583"
        },
        {
          "anchor": "@@ -5761,6 +5897,7 @@ mod tests {",
          "oldStart": 5761,
          "newStart": 5897,
          "sha256": "186a3ae44387f3aebbe924f3d90a263758f3f3d3b10a01ec096bc22178f6629e",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L5897"
        },
        {
          "anchor": "@@ -6774,7 +6911,12 @@ mod tests {",
          "oldStart": 6774,
          "newStart": 6911,
          "sha256": "aecf938313bbdc145cf744c5963d4267fd7c6e2111f161b628ca00b63aeae1f3",
          "classification": "receiver-obligation-lifecycle",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L6911"
        },
        {
          "anchor": "@@ -6825,7 +6967,7 @@ mod tests {",
          "oldStart": 6825,
          "newStart": 6967,
          "sha256": "a5297d5f5532cab281ec556b91b9f71b887714a4e4247be95153ff43ce56f361",
          "classification": "candidate-search-test-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L6967"
        },
        {
          "anchor": "@@ -7391,7 +7533,7 @@ mod tests {",
          "oldStart": 7391,
          "newStart": 7533,
          "sha256": "e368c5f07f4ce9ce62fc3da4313877fb771bf01fe65587259e429a75253e39f3",
          "classification": "candidate-search-test-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L7533"
        },
        {
          "anchor": "@@ -7750,7 +7892,7 @@ mod tests {",
          "oldStart": 7750,
          "newStart": 7892,
          "sha256": "5e6ef83b4210b141e19b507bd44415cb76d99ca5bc3cf9f5736c3a1c37defc07",
          "classification": "candidate-search-test-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L7892"
        },
        {
          "anchor": "@@ -7833,7 +7975,7 @@ mod tests {",
          "oldStart": 7833,
          "newStart": 7975,
          "sha256": "04a9e321e709e6287362b31c32c2d7979eec68231ca05e1fa24cd1f37e889685",
          "classification": "candidate-search-test-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L7975"
        },
        {
          "anchor": "@@ -8661,6 +8803,7 @@ mod tests {",
          "oldStart": 8661,
          "newStart": 8803,
          "sha256": "3880534bde45bf645570f901dcaf55b4bf223253bfaccceba95208a5b236e21a",
          "classification": "constrained-callback-test-initialization",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L8803"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/owned.rs",
      "baseBlob": "efe7fd9b2595468c94e3e78893fcf311ca79570b",
      "candidateBlob": "f164f0adbc5f919e654dc718b293bbfd64f70c3f",
      "frozenCandidateBlob": "5cf7b29bec63d9f526eb8872b6529053ce823811",
      "classification": "upstream-coverage-node-storage-composition",
      "detail": "Official #30658 BuilderNode data/support representation and bounded lazy minimum-positive-atom coverage shortcut, composed with fork overlay/owned storage. Compacted nodes retain original representation; owned compaction copies matching data/support. Existing fuel/provenance and scoped witnesses remain. Final checkpoint explicitly reviewed changes: upstream-coverage-node-storage-composition. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -231,15 +231,15 @@ impl OwnedConstraintSetBuilder {",
          "oldStart": 231,
          "newStart": 231,
          "sha256": "87e6798c8e62dd75441546205912cc365d60c32bfb4fc9ee006fe238b40abc1c",
          "classification": "upstream-coverage-node-storage-composition",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30658 BuilderNode data/support representation and bounded lazy minimum-positive-atom coverage shortcut, composed with fork overlay/owned storage. Compacted nodes retain original representation; owned compaction copies matching data/support. Existing fuel/provenance and scoped witnesses remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/owned.rs#L231"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/paths.rs#L1430"
        },
        {
          "anchor": "@@ -1583,13 +1587,20 @@ mod tests {",
          "oldStart": 1583,
          "newStart": 1587,
          "sha256": "6bc3194ac20c28383684a07f9ae55add87e1e7a73c71d01a7ca91f187f08b717",
          "classification": "native-test-mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/paths.rs#L1587"
        },
        {
          "anchor": "@@ -1731,20 +1742,22 @@ mod tests {",
          "oldStart": 1731,
          "newStart": 1742,
          "sha256": "4960cb036bcbc488b597833b7d93eee393830682cf3f0989d94a68ea1bfbec7d",
          "classification": "native-test-mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/paths.rs#L1742"
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
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/projection.rs#L4"
        },
        {
          "anchor": "@@ -149,6 +149,52 @@ impl ProjectionTypeBudget {",
          "oldStart": 149,
          "newStart": 149,
          "sha256": "da9491b8435b3dbaa26faa06348a90cd97f5d4dcdfdf1ac7b59b21d61c4a5c51",
          "classification": "upstream-solve-extraction-fork-resource-composition",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/projection.rs#L149"
        },
        {
          "anchor": "@@ -175,14 +221,13 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 175,
          "newStart": 221,
          "sha256": "ea39c8944b56bf9e72a5b6ca8837c5915946ca1ab17aeafefd9b14c1ac4bbbe7",
          "classification": "candidate-search-shared-budget-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/projection.rs#L221"
        },
        {
          "anchor": "@@ -192,7 +237,7 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 192,
          "newStart": 237,
          "sha256": "99ebaeef2fb378d9f8444b3be140aaf5a09ded17f99058553c75de6a425dc1ce",
          "classification": "candidate-search-shared-budget-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/projection.rs#L237"
        },
        {
          "anchor": "@@ -203,7 +248,7 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 203,
          "newStart": 248,
          "sha256": "545279438923e3f516c9c3d34112dcde4be6a7164a16083ddb09ddf6d6d27b10",
          "classification": "candidate-search-shared-budget-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/projection.rs#L248"
        },
        {
          "anchor": "@@ -220,15 +265,18 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 220,
          "newStart": 265,
          "sha256": "db1bf400fce10e379c62d5c2f40d53552967f43dce0c201654bfb2a188e272ee",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/projection.rs#L265"
        },
        {
          "anchor": "@@ -260,8 +308,13 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 260,
          "newStart": 308,
          "sha256": "5bdb7d929f4e1509faf7b74ad60b8a898cd32561f736fcb5c5272ce25f94c6ac",
          "classification": "candidate-search-runtime-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/projection.rs#L308"
        },
        {
          "anchor": "@@ -450,35 +503,14 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 450,
          "newStart": 503,
          "sha256": "6b27f00554dd4af064f9d5c579b79719712d9cc4ae04c320c6b85e59c4e38f0f",
          "classification": "upstream-solve-extraction-fork-resource-composition",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/projection.rs#L503"
        },
        {
          "anchor": "@@ -510,8 +542,13 @@ impl<'db> ConstraintSet<'db, '_> {",
          "oldStart": 510,
          "newStart": 542,
          "sha256": "5ddd459e84e1d16942ffc194a71e1244ea340f47feb6fe012a30b7ebd7de6f1e",
          "classification": "candidate-search-runtime-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/projection.rs#L542"
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
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/projection/tests.rs#L11"
        },
        {
          "anchor": "@@ -1266,7 +1266,13 @@ fn validation_shares_the_projection_visit_budget() {",
          "oldStart": 1266,
          "newStart": 1266,
          "sha256": "5dc7b6572aa296c75eadbb4a995d01b975d8edf92d0aa9ed4384835cc2d44a8f",
          "classification": "candidate-search-test-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/projection/tests.rs#L1266"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/resolution.rs#L4"
        },
        {
          "anchor": "@@ -13,8 +13,8 @@ use crate::types::signatures::{Signature, walk_signature};",
          "oldStart": 13,
          "newStart": 13,
          "sha256": "b153ff4f95b78bbfe73f3157276b8704f96eb83d4be85a3c178b639943f2a02c",
          "classification": "closed-filter-union-resolution",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/resolution.rs#L13"
        },
        {
          "anchor": "@@ -58,12 +58,13 @@ pub(crate) fn resolve_merged_solution<'db>(",
          "oldStart": 58,
          "newStart": 58,
          "sha256": "3787bfc3242c0488ef1cc779d0cc2caa4e399355f8ca909c8a26ee700f3b7c42",
          "classification": "closed-filter-union-resolution",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/resolution.rs#L58"
        },
        {
          "anchor": "@@ -190,29 +191,118 @@ impl<'a, 'db> Resolver<'a, 'db> {",
          "oldStart": 190,
          "newStart": 191,
          "sha256": "dadc47186a8899863e85a756feead2c0be9111a13b7cfb1a88cfa19b90162420",
          "classification": "closed-filter-union-resolution",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/resolution.rs#L191"
        },
        {
          "anchor": "@@ -344,14 +434,15 @@ mod tests {",
          "oldStart": 344,
          "newStart": 434,
          "sha256": "e2f72fe84163bbf70dbf266d13723a2fd4565cee4462daac9873735bff776a5e",
          "classification": "closed-filter-union-resolution",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/resolution.rs#L434"
        },
        {
          "anchor": "@@ -425,6 +516,467 @@ mod tests {",
          "oldStart": 425,
          "newStart": 516,
          "sha256": "6bbee995eb384691bda99db3a590e12087972d59fb035ae8f09960955315e931",
          "classification": "closed-filter-union-resolution",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/resolution.rs#L516"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/solutions.rs",
      "baseBlob": "38279f6c94b4a715373d51501038a697b5e10d2c",
      "candidateBlob": "62ea11eb60d205c383c77ba131c2c5c90c1b9b78",
      "frozenCandidateBlob": "b01cb32c984e3e7d26859ba40175272d82aa1205",
      "classification": "fixed-variable-lazy-proof",
      "detail": "Ordinary terminal path avoids a redundant bounded visit; fixed caller bounds use Lazy constraint-set relation rather than eager assignment. Final checkpoint explicitly reviewed changes: candidate-search-import-migration, constrained-callback-original-equality-witness, upstream-first-valid-walker, upstream-first-valid-walker-fork-validation-composition. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: upstream-cache-key-fork-validation-composition, upstream-cache-key-index-import, upstream-cache-key-single-path-scan. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -3,6 +3,7 @@ use std::marker::PhantomData;",
          "oldStart": 3,
          "newStart": 3,
          "sha256": "c426e865b2a8e4d6aaa5ddba590cb9603a7b1d611af0c666bbc5d8477c427aa9",
          "classification": "upstream-cache-key-index-import",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L3"
        },
        {
          "anchor": "@@ -18,10 +19,10 @@ use crate::types::constraints::variables::{",
          "oldStart": 18,
          "newStart": 19,
          "sha256": "1141a211a21dd71007e54083ed21e752a46c04f249ad147543bac1bd95c4e677",
          "classification": "candidate-search-import-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L19"
        },
        {
          "anchor": "@@ -200,6 +201,7 @@ pub(super) struct SolutionWalker<'db, L> {",
          "oldStart": 200,
          "newStart": 201,
          "sha256": "ff0afcec7338afaff19ca0bdaead59524d4f37c9d73de662eaadebbea842909a",
          "classification": "upstream-first-valid-walker",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L201"
        },
        {
          "anchor": "@@ -270,6 +272,7 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 270,
          "newStart": 272,
          "sha256": "cbe70d7d39cf0c24c7d84f530d9f5d94d385b1aa52be47b3e050430af4d153da",
          "classification": "upstream-first-valid-walker",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L272"
        },
        {
          "anchor": "@@ -287,6 +290,11 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 287,
          "newStart": 290,
          "sha256": "4826c4bd500894673eb37797ac906638edd1b9314c86095bf2a7f901f8a55376",
          "classification": "upstream-first-valid-walker",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L290"
        },
        {
          "anchor": "@@ -303,24 +311,6 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 303,
          "newStart": 311,
          "sha256": "b987248c7acad326cda4da8f33888aacecab714cf4d9b5235093113f44bff7d1",
          "classification": "upstream-cache-key-single-path-scan",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L311"
        },
        {
          "anchor": "@@ -606,6 +596,15 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 606,
          "newStart": 596,
          "sha256": "9845f009c0ce79fb066d6b08d3ae535faa41559e291c36707f7df06ade9ce5f3",
          "classification": "upstream-first-valid-walker-fork-validation-composition",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L596"
        },
        {
          "anchor": "@@ -1127,18 +1126,29 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 1127,
          "newStart": 1126,
          "sha256": "c1322f51a5dfd7d569daa0126822101778e2f40e9df5be237589f3de2ed079dd",
          "classification": "upstream-cache-key-fork-validation-composition",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1126"
        },
        {
          "anchor": "@@ -1657,6 +1667,9 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 1657,
          "newStart": 1667,
          "sha256": "1a291c0ffcb103ae3623d40429cdd02484b9254f9074ca956b9af2774b4a67ad",
          "classification": "fixed-variable-lazy-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1667"
        },
        {
          "anchor": "@@ -1798,7 +1811,9 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 1798,
          "newStart": 1811,
          "sha256": "b0cc5607339d55fe863857615f34da88e21d26a46d1436e5b688062ea2798f13",
          "classification": "fixed-variable-lazy-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L1811"
        },
        {
          "anchor": "@@ -2164,6 +2179,10 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 2164,
          "newStart": 2179,
          "sha256": "08740399255a326febdf495a49eb2a813cea0690504bcb59035645215de8995e",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L2179"
        },
        {
          "anchor": "@@ -2199,7 +2218,9 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 2199,
          "newStart": 2218,
          "sha256": "2cfe4ccb284cf8ba47b94bb00e2d1f164c64d9f1036a373b6efe841b2b02d360",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L2218"
        },
        {
          "anchor": "@@ -2270,13 +2291,15 @@ impl<'db, L: SolutionLimits> SolutionWalker<'db, L> {",
          "oldStart": 2270,
          "newStart": 2291,
          "sha256": "1b7d8de81ff088208c5718ef0fc0c4a8dd930b337912129f4042c034a3cf1a45",
          "classification": "constrained-callback-original-equality-witness",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L2291"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/constraints/support.rs",
      "baseBlob": "1a2dd0b41773de52bd2ee8f17404b97844b25b37",
      "candidateBlob": "44c49785f856b490ae302f8f19a967924fa0bb43",
      "frozenCandidateBlob": "bbc05fec532d793df602ee522706c6ba14aa79ef",
      "classification": "upstream-support-complete-closure",
      "detail": "Official #30650 complete-support shortcut composed with existing fork support/lazy-attribute representation; no new independent fork solver feature. Final checkpoint explicitly reviewed changes: upstream-support-complete-closure. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -181,7 +181,8 @@ impl Support {",
          "oldStart": 181,
          "newStart": 181,
          "sha256": "8331babf12e9e9a60558322d7cd88e07499218f358efc3004202549fad564008",
          "classification": "upstream-support-complete-closure",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/support.rs#L181"
        },
        {
          "anchor": "@@ -191,8 +192,18 @@ impl Support {",
          "oldStart": 191,
          "newStart": 192,
          "sha256": "ce4ef6981f44dc5e0e14b6e20cfe6e0f8b1fd1538442b6df72dd0bcd347f055c",
          "classification": "upstream-support-complete-closure",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/support.rs#L192"
        },
        {
          "anchor": "@@ -205,7 +216,7 @@ impl Support {",
          "oldStart": 205,
          "newStart": 216,
          "sha256": "ee23170a8af6e239d07f0655e345fe3eaeb936a812d7a0438657b9b209a44443",
          "classification": "upstream-support-complete-closure",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/support.rs#L216"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/variables.rs#L537"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/diagnostic.rs#L142"
        },
        {
          "anchor": "@@ -751,10 +759,87 @@ declare_lint! {",
          "oldStart": 751,
          "newStart": 759,
          "sha256": "031bd955ed94cb32a25e30a135839799cebe6584e9e6f3e11c7f4c0dc5872882",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/diagnostic.rs#L759"
        },
        {
          "anchor": "@@ -1692,14 +1777,15 @@ enum SharedBodyDiagnostic {",
          "oldStart": 1692,
          "newStart": 1777,
          "sha256": "2432a98aa5c98eeefe4aa669ad62233fa9f332ed310585a91d03265c1cbf65d4",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/diagnostic.rs#L1777"
        },
        {
          "anchor": "@@ -1710,7 +1796,7 @@ pub(crate) fn report_mismatched_type_name<'db>(",
          "oldStart": 1710,
          "newStart": 1796,
          "sha256": "5fd15a2736d61407df2b9188fb8356cc56815f1fd02f991920792a23a1708c84",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/diagnostic.rs#L1796"
        },
        {
          "anchor": "@@ -1776,6 +1862,10 @@ impl TypeCheckDiagnostics {",
          "oldStart": 1776,
          "newStart": 1862,
          "sha256": "aec8db5a460b9a5f588ceaf827c4d3fb2d3042b47c19c5d4b35f6091cad4180b",
          "classification": "mechanical-clippy-qualification",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/diagnostic.rs#L1862"
        },
        {
          "anchor": "@@ -5236,19 +5326,17 @@ pub(crate) fn report_cannot_delete_typed_dict_key<'db>(",
          "oldStart": 5236,
          "newStart": 5326,
          "sha256": "820acd9f69097338c5e5000d0525cf2ba2ca489179f41e5d425b10a29f679435",
          "classification": "upstream-expanded-class-base-diagnostic",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/diagnostic.rs#L5326"
        },
        {
          "anchor": "@@ -5259,9 +5347,8 @@ pub(crate) fn report_invalid_type_param_order<'db>(",
          "oldStart": 5259,
          "newStart": 5347,
          "sha256": "06f6c481f6c6b04d6392acad28041c2b02a43b53ecaa811112d84847ab9c7384",
          "classification": "upstream-expanded-class-base-diagnostic",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/diagnostic.rs#L5347"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L26"
        },
        {
          "anchor": "@@ -607,7 +607,7 @@ fn definition_contents_in_domain<'db>(",
          "oldStart": 607,
          "newStart": 607,
          "sha256": "c41457bb644e5e07e57eab4401ac1a9f4cd76a9243e412de03bc0ca9da79b119",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L607"
        },
        {
          "anchor": "@@ -624,7 +624,7 @@ fn infer_definition_contents<'db>(",
          "oldStart": 624,
          "newStart": 624,
          "sha256": "7a3ceca40c51538a51327bb607bb19c1d4441ba53a66e9cecfcdc75a64ffa1e3",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L624"
        },
        {
          "anchor": "@@ -994,7 +994,7 @@ fn initial_contents<'db>(",
          "oldStart": 994,
          "newStart": 994,
          "sha256": "695fe91c9b059d8b373205f77850a4a98687b0bbaefd8c50295af1b58db7d42b",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L994"
        },
        {
          "anchor": "@@ -1137,6 +1137,10 @@ fn frozen_export_contents<'db>(",
          "oldStart": 1137,
          "newStart": 1137,
          "sha256": "7bef3b65afd1b4538edf0eedac5dfb649b3d2c9b111c03db30c0bba63a048c7f",
          "classification": "captured-keyword-key-iteration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1137"
        },
        {
          "anchor": "@@ -1188,15 +1192,18 @@ fn frozen_exported_field_contents<'db>(",
          "oldStart": 1188,
          "newStart": 1192,
          "sha256": "6de8edff886557560a6b9cb3bef39366d9286eac96cc17c0b9e93d805320d9da",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1192"
        },
        {
          "anchor": "@@ -1246,7 +1253,12 @@ fn frozen_exported_field_contents<'db>(",
          "oldStart": 1246,
          "newStart": 1253,
          "sha256": "0d414ce91b5bbd8c55267a672f9ed538658189aebc5bb991fcceda0205cd897e",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1253"
        },
        {
          "anchor": "@@ -1255,10 +1267,39 @@ fn inert_field_argument(expression: &ast::Expr) -> bool {",
          "oldStart": 1255,
          "newStart": 1267,
          "sha256": "e56340a93871570f15e05c406bb87122ed12dde527ffeb72de6708da60bc55e0",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1267"
        },
        {
          "anchor": "@@ -1583,7 +1624,7 @@ fn operation_contents<'db>(",
          "oldStart": 1583,
          "newStart": 1624,
          "sha256": "a5996912b9286944413ff937a68c9a84bfe10ef2b3e146dd3a28c323c5d24e90",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1624"
        },
        {
          "anchor": "@@ -1594,6 +1635,37 @@ fn operation_contents<'db>(",
          "oldStart": 1594,
          "newStart": 1635,
          "sha256": "63fdb6721fdc7b0691ccf5f7a28e74d649c0b59789735921469d628b22c75975",
          "classification": "captured-keyword-key-iteration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1635"
        },
        {
          "anchor": "@@ -1755,7 +1827,7 @@ fn mapping_transfer<'db>(",
          "oldStart": 1755,
          "newStart": 1827,
          "sha256": "51a6ac9c23c3cfb150fdded3eaeb42aaa236137a98db917d35e6f2ce8d5da12f",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1827"
        },
        {
          "anchor": "@@ -1913,18 +1985,12 @@ fn mapping_transfer<'db>(",
          "oldStart": 1913,
          "newStart": 1985,
          "sha256": "3817639a8f6d9e809b6e6120f30df408f2e661c40f2c24d931fd209a626831bd",
          "classification": "captured-keyword-key-iteration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1985"
        },
        {
          "anchor": "@@ -2603,8 +2669,11 @@ pub(crate) fn needs_call_snapshot<'db>(",
          "oldStart": 2603,
          "newStart": 2669,
          "sha256": "ce2c08bccfd015331318bedee065b8dd43846008ceddb3aca71f645964a5dfc0",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L2669"
        },
        {
          "anchor": "@@ -2619,7 +2688,6 @@ pub(crate) fn needs_call_snapshot<'db>(",
          "oldStart": 2619,
          "newStart": 2688,
          "sha256": "9b3eb4e80d7bb855faf2ca0edd9be549dad57c0c0090879d873be8b73aad91ef",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L2688"
        },
        {
          "anchor": "@@ -2922,13 +2990,15 @@ pub(crate) fn fresh_argument_items<'db>(",
          "oldStart": 2922,
          "newStart": 2990,
          "sha256": "0aa16d81e7eea46c4d250e5b613786d46d2f84f4a0a21c093178eacba8eadadf",
          "classification": "sealed-builtin-string-add-recovery",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L2990"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/records.rs#L177"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/display.rs",
      "baseBlob": "8e5ee90f78b5deabd9d25340594243a55bd8457a",
      "candidateBlob": "000fb5ac30788ee6c116f696102edea0b52f6068",
      "frozenCandidateBlob": "372e5531b14fc9e1f364d77d5b1145ac77ee5148",
      "classification": "lint-policy",
      "detail": "Document independent boolean rendering settings. Final checkpoint explicitly reviewed changes: upstream-literal-union-display-deduplication. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -131,6 +131,10 @@ enum NumericTowerDisplay {",
          "oldStart": 131,
          "newStart": 131,
          "sha256": "1f5554e7dd27cd79b50135b6877ca1c318d1c15379cb50d998e43f93c3bffd71",
          "classification": "lint-policy",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/display.rs#L131"
        },
        {
          "anchor": "@@ -3332,6 +3336,7 @@ impl<'db> FmtDetailed<'db> for DisplayUnionType<'_, 'db> {",
          "oldStart": 3332,
          "newStart": 3336,
          "sha256": "e96534adbf664443fa3d59376c4bc2cdaa10ad0186bf3e39b15e3607fc46947a",
          "classification": "upstream-literal-union-display-deduplication",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30684 hash-set deduplication preserves first display order while avoiding repeated linear contains.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/display.rs#L3336"
        },
        {
          "anchor": "@@ -3342,7 +3347,7 @@ impl<'db> FmtDetailed<'db> for DisplayUnionType<'_, 'db> {",
          "oldStart": 3342,
          "newStart": 3347,
          "sha256": "ac735f34cf092cbc1774cdfe59c3c92cce7560c49af9e124dbf39e23e62c6069",
          "classification": "upstream-literal-union-display-deduplication",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30684 hash-set deduplication preserves first display order while avoiding repeated linear contains.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/display.rs#L3347"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/enums.rs",
      "baseBlob": "225098abafd2f08b25e84fed52d975f767451feb",
      "candidateBlob": "ce804b544517d3fbe2537f62320a87b11d00c904",
      "frozenCandidateBlob": "356e7606b91b91413cbe346deda486ed7bbb0ceb",
      "classification": "upstream-enum-name-index",
      "detail": "Official #30634 ordered member-name indexing; fork enum/provided integrations remain separately attributed, not a new enum cache PR. Final checkpoint explicitly reviewed changes: upstream-enum-name-index. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: upstream-vendored-enum-descriptor-shortcut. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -1,3 +1,5 @@",
          "oldStart": 1,
          "newStart": 1,
          "sha256": "0ab6e3d3a25f018d7c3276b7efd94d8c57cddd67b589b804674e8aa1f2f0f872",
          "classification": "upstream-enum-name-index",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/enums.rs#L1"
        },
        {
          "anchor": "@@ -7,7 +9,7 @@ use smallvec::SmallVec;",
          "oldStart": 7,
          "newStart": 9,
          "sha256": "e8a87c912757ceca80378ebbbff8e030192db4bbc5fed510ee2352eab9e4b1a3",
          "classification": "upstream-enum-name-index",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/enums.rs#L9"
        },
        {
          "anchor": "@@ -304,7 +306,7 @@ pub struct EnumClassLiteral<'db> {",
          "oldStart": 304,
          "newStart": 306,
          "sha256": "1c43edd8c7bd210f7aacbd7e3ca6eb4836fc500773f1e9228c947449fb8b5262",
          "classification": "upstream-enum-name-index",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/enums.rs#L306"
        },
        {
          "anchor": "@@ -334,15 +336,11 @@ fn enum_class_literal<'db>(",
          "oldStart": 334,
          "newStart": 336,
          "sha256": "76a7ab946c0301bdd41d12d7320de14507c9bf6c0af191abaaec2782196dc17e",
          "classification": "upstream-enum-name-index",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/enums.rs#L336"
        },
        {
          "anchor": "@@ -372,12 +370,16 @@ impl<'db> EnumClassLiteral<'db> {",
          "oldStart": 372,
          "newStart": 370,
          "sha256": "1bf11966f3fc3923f861adee5f54a7040508e1276970de74f8d21a1fe877eb4a",
          "classification": "upstream-enum-name-index",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/enums.rs#L370"
        },
        {
          "anchor": "@@ -386,7 +388,7 @@ impl<'db> EnumClassLiteral<'db> {",
          "oldStart": 386,
          "newStart": 388,
          "sha256": "80e216405c5778af30f61834ef35cb876e33e46b581eb62dea9a28bed6a5929f",
          "classification": "upstream-enum-name-index",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/enums.rs#L388"
        },
        {
          "anchor": "@@ -1126,6 +1128,7 @@ pub(crate) fn enum_metadata<'db>(",
          "oldStart": 1126,
          "newStart": 1128,
          "sha256": "3e05a564ea13afc10af678a116096cc3b940dbeac66033f78fb271a4331f4579",
          "classification": "upstream-vendored-enum-descriptor-shortcut",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30674 avoids descriptor lookups only for non-enum primitive literal values with vendored stubs; custom-stub descriptor behavior remains.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/enums.rs#L1128"
        },
        {
          "anchor": "@@ -1161,6 +1164,11 @@ pub(crate) fn enum_metadata<'db>(",
          "oldStart": 1161,
          "newStart": 1164,
          "sha256": "edd1a9eb283e2adf1c449faaead73b7c2a194880d5017c478781f7221dceb6c7",
          "classification": "upstream-vendored-enum-descriptor-shortcut",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30674 avoids descriptor lookups only for non-enum primitive literal values with vendored stubs; custom-stub descriptor behavior remains.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/enums.rs#L1164"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/generics.rs",
      "baseBlob": "3bca5108e588f010fd93c45a2ee09eaff8fd277e",
      "candidateBlob": "050f44bd6f806933b05154ae071fa494c4d000a7",
      "frozenCandidateBlob": "80b2f191604416923364bd9f06057eaa70f3c304",
      "classification": "mixed-existing-solver-and-upstream-api",
      "detail": "Preserve solver relation-owner handling; cached API migration; group unchanged specialization-search arguments. Final checkpoint explicitly reviewed changes: prepared-fresh-collection-evidence-and-compatible-context, upstream-unchanged-specialization-cycle-reuse. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -12,7 +12,7 @@ use crate::types::callable::walk_callable_type;",
          "oldStart": 12,
          "newStart": 12,
          "sha256": "6615fe3f27b62e1a505f2750fc4f9bc870db55c8fd9e202e6d5642f1620ce902",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/generics.rs#L12"
        },
        {
          "anchor": "@@ -1574,28 +1574,30 @@ impl<'db> Specialization<'db> {",
          "oldStart": 1574,
          "newStart": 1574,
          "sha256": "4172e99c3fc861ab280e122c474b17a5f0573990ae98f6f8062774d4476d7cc4",
          "classification": "upstream-unchanged-specialization-cycle-reuse",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30643 normalizes the same ordered type and tuple fields, copies on first changed type, and returns existing interned specialization/alias only when all normalized fields are unchanged; no cache epoch or inference snapshot is introduced.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/generics.rs#L1574"
        },
        {
          "anchor": "@@ -3127,8 +3129,7 @@ impl<'db, 'c> SpecializationBuilder<'db, 'c> {",
          "oldStart": 3127,
          "newStart": 3129,
          "sha256": "30043a004f80aa3278035fb671ce3253c76b3ef1927419a62d92a46b9c8a0d2b",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/generics.rs#L3129"
        },
        {
          "anchor": "@@ -3535,7 +3536,7 @@ impl<'db, 'c> SpecializationBuilder<'db, 'c> {",
          "oldStart": 3535,
          "newStart": 3536,
          "sha256": "b2b2eb434a1d81b23afb79bd110be9281d95188fa9cc939c057e897dbece9059",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/generics.rs#L3536"
        },
        {
          "anchor": "@@ -3608,9 +3609,12 @@ impl<'db, 'c> SpecializationBuilder<'db, 'c> {",
          "oldStart": 3608,
          "newStart": 3609,
          "sha256": "0b94fbb00564788fd2a8e0d955bf0aa4cf94ec9335023c2a218ba9710612988c",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/generics.rs#L3609"
        },
        {
          "anchor": "@@ -3648,7 +3652,6 @@ impl<'db, 'c> SpecializationBuilder<'db, 'c> {",
          "oldStart": 3648,
          "newStart": 3652,
          "sha256": "b1d8f1f272f96ead7b439883630b7c1c03a84047e499677d8b73b03f5dc9c65f",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/generics.rs#L3652"
        },
        {
          "anchor": "@@ -4183,6 +4186,11 @@ impl<'db, 'c> SpecializationBuilder<'db, 'c> {",
          "oldStart": 4183,
          "newStart": 4186,
          "sha256": "ec51fabb94ac5158d0c72cb00b0852503a2d9a919d21326c8866d68f46356911",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/generics.rs#L4186"
        },
        {
          "anchor": "@@ -5009,14 +5017,8 @@ impl<'db, 'c> SpecializationBuilder<'db, 'c> {",
          "oldStart": 5009,
          "newStart": 5017,
          "sha256": "0ada8e7c3ce7c17b3963d57bcb10d01579ef576479d846ff6ec15d969e37a6ad",
          "classification": "mixed-existing-solver-and-upstream-api",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/generics.rs#L5017"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/ide_support/unreachable_code.rs#L265"
        },
        {
          "anchor": "@@ -356,13 +465,27 @@ mod tests {",
          "oldStart": 356,
          "newStart": 465,
          "sha256": "65faa5a5461aa9c29c9c4c2a3231c8c3a7fc64a1dc4b73035c81f42856975c07",
          "classification": "checked-write-controls",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/ide_support/unreachable_code.rs#L465"
        },
        {
          "anchor": "@@ -380,8 +503,157 @@ mod tests {",
          "oldStart": 380,
          "newStart": 503,
          "sha256": "72b6ac59b0dfbdc2457225d1fa7d0c5888bbd30bd3f370543edfa98ef3de2281",
          "classification": "checked-write-controls",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/ide_support/unreachable_code.rs#L503"
        },
        {
          "anchor": "@@ -433,10 +705,7 @@ mod tests {",
          "oldStart": 433,
          "newStart": 705,
          "sha256": "ebcf2e4cb0b21cf581c6bd658e9d7e0e420908b66c094171506cf8019a6e04cf",
          "classification": "checked-write-controls",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/ide_support/unreachable_code.rs#L705"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer.rs#L653"
        },
        {
          "anchor": "@@ -831,13 +831,39 @@ pub(super) fn infer_statement_types<'db>(",
          "oldStart": 831,
          "newStart": 831,
          "sha256": "01c91c7bf3c4fb81abdb54520bbd86b44167116af677680d4d8a9dd835bcf6d5",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer.rs#L831"
        },
        {
          "anchor": "@@ -850,7 +876,7 @@ pub(crate) fn infer_expression_with_body_domain<'db>(",
          "oldStart": 850,
          "newStart": 876,
          "sha256": "d412e8e341f7f65e2cb9d549f2bd5c345f8a366ca10f38e00d89480c4008cc20",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer.rs#L876"
        },
        {
          "anchor": "@@ -872,7 +898,7 @@ pub(crate) fn infer_statement_with_body_domain<'db>(",
          "oldStart": 872,
          "newStart": 898,
          "sha256": "7ae404b671b2bb36461548c14da069ad22f158f1bf5d08eda4661eb92cb8c302",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer.rs#L898"
        },
        {
          "anchor": "@@ -977,7 +1003,7 @@ impl<'db> InferExpression<'db> {",
          "oldStart": 977,
          "newStart": 1003,
          "sha256": "1bdd4c3c698278c208d06b90083ce7585a1051ee6dd054ccca7399687ed4d176",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer.rs#L1003"
        },
        {
          "anchor": "@@ -1026,6 +1052,14 @@ impl<'db> InferScope<'db> {",
          "oldStart": 1026,
          "newStart": 1052,
          "sha256": "6f9f6a565f648848aa7bf6e5faa95b3600060f68b479e10b4f7d46704e35ad83",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer.rs#L1052"
        },
        {
          "anchor": "@@ -1037,7 +1071,8 @@ pub(super) fn infer_unpack_types<'db>(db: &'db dyn Db, unpack: Unpack<'db>) -> U",
          "oldStart": 1037,
          "newStart": 1071,
          "sha256": "5e4ad76053702fce1bfae261bc7a38747dc7b1c76f3097e9273a53ece434fed3",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer.rs#L1071"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1"
        },
        {
          "anchor": "@@ -175,11 +175,31 @@ impl<'db> OverloadBodyView<'db> {",
          "oldStart": 175,
          "newStart": 175,
          "sha256": "42c68baa9a8afb4a04bbcf6fa824297d24baa90642ad890188e0287108eba120",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L175"
        },
        {
          "anchor": "@@ -187,7 +207,10 @@ impl<'db> OverloadBodyView<'db> {",
          "oldStart": 187,
          "newStart": 207,
          "sha256": "c00991a74dbec1fbab3b4034c3c98f1d65150c88b6a11c0c79d46a4b0dc35d58",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L207"
        },
        {
          "anchor": "@@ -201,10 +224,16 @@ impl<'db> OverloadBodyView<'db> {",
          "oldStart": 201,
          "newStart": 224,
          "sha256": "2ac95a05d0c7de8f3d5cc960454cc06eea9d25e1c72910ee69e7eff13eb53ebc",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L224"
        },
        {
          "anchor": "@@ -269,6 +298,25 @@ impl<'db> FunctionBodyDomain<'db> {",
          "oldStart": 269,
          "newStart": 298,
          "sha256": "24759674dd40a52d0c7389a34111a622773478fc1092ceebf32e128ef3a11884",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L298"
        },
        {
          "anchor": "@@ -412,7 +460,10 @@ fn prepare_body_domain<'db>(",
          "oldStart": 412,
          "newStart": 460,
          "sha256": "193c13f62446636bece7054094040c636f4250bf12c529743a28d2573fec4fec",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L460"
        },
        {
          "anchor": "@@ -421,10 +472,18 @@ fn prepare_body_domain<'db>(",
          "oldStart": 421,
          "newStart": 472,
          "sha256": "27b565bae215921acfd2b8c5a6914ce394f1307ac0ad78ea7a3c8ed9e0177dbc",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L472"
        },
        {
          "anchor": "@@ -432,7 +491,24 @@ fn prepare_body_domain<'db>(",
          "oldStart": 432,
          "newStart": 491,
          "sha256": "ab711adc4939fcfa4ed2d49c58a08244f7e464063cb90f796a6cc1774a06fd34",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L491"
        },
        {
          "anchor": "@@ -444,13 +520,7 @@ fn project_body_parameters<'db>(",
          "oldStart": 444,
          "newStart": 520,
          "sha256": "57d6a2b6efbda825cb3824b16c877b80dbbc39cae1d9633837dcadf772c3b2f4",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L520"
        },
        {
          "anchor": "@@ -635,7 +705,10 @@ fn project_body_parameters<'db>(",
          "oldStart": 635,
          "newStart": 705,
          "sha256": "2f3e05abdc8d3978a87365ed0d8edf210c34ef26539c9cc6ecf272e07c84f402",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L705"
        },
        {
          "anchor": "@@ -644,6 +717,7 @@ fn supported_body(",
          "oldStart": 644,
          "newStart": 717,
          "sha256": "03d23c2d0ceee5d586e28cbe1e910105f43e01818c6d6899ee5ba36cf5ee3adc",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L717"
        },
        {
          "anchor": "@@ -653,7 +727,7 @@ fn supported_body(",
          "oldStart": 653,
          "newStart": 727,
          "sha256": "ec3532abf506196a15728bcb8241c5aed9dc63c7e6eaa75758e1506abf30204e",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L727"
        },
        {
          "anchor": "@@ -796,14 +870,113 @@ fn supported_body(",
          "oldStart": 796,
          "newStart": 870,
          "sha256": "fcff8f34f98e5beda9d388cef749bb445dca0608cc380b6b32df1c850779b70c",
          "classification": "dictionary-method-evidence-domain-composition",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L870"
        },
        {
          "anchor": "@@ -815,24 +988,25 @@ fn supported_body(",
          "oldStart": 815,
          "newStart": 988,
          "sha256": "eae3ea5085bb4f8b82c4a28cd728b2d19604b15469a512aa556ead00f70037ca",
          "classification": "dictionary-method-evidence-mutation-boundary",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L988"
        },
        {
          "anchor": "@@ -846,15 +1020,113 @@ fn supported_body(",
          "oldStart": 846,
          "newStart": 1020,
          "sha256": "89384813b8de643c8da2e9815cbf50ae93695e77018b980addc0c9e0bf53cc05",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1020"
        },
        {
          "anchor": "@@ -868,46 +1140,49 @@ fn supported_body(",
          "oldStart": 868,
          "newStart": 1140,
          "sha256": "86450d89e65886530f40ea4e2421f96a5ad562391662d8903c76c3b33184c2e3",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1140"
        },
        {
          "anchor": "@@ -928,8 +1203,8 @@ fn supported_body(",
          "oldStart": 928,
          "newStart": 1203,
          "sha256": "9523e6ea8b712dde7de49b4c41e2e5c2f178a5f4eedae9749efe2442781dabbb",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1203"
        },
        {
          "anchor": "@@ -941,12 +1216,10 @@ fn supported_body(",
          "oldStart": 941,
          "newStart": 1216,
          "sha256": "6eef430af2eb448a691e762b18c76171132206972438b4bd8f6506414c0bacb8",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1216"
        },
        {
          "anchor": "@@ -954,19 +1227,21 @@ fn supported_body(",
          "oldStart": 954,
          "newStart": 1227,
          "sha256": "fd528fe4f1b3990a2845ffcfd13964d951615d9cee554e75b7beececb233c33d",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1227"
        },
        {
          "anchor": "@@ -1052,7 +1327,7 @@ fn supported_body(",
          "oldStart": 1052,
          "newStart": 1327,
          "sha256": "611d9153fe9ee0e0f47957640a9345a590609cbb4c1cbc7b6f015a20d95d69ed",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1327"
        },
        {
          "anchor": "@@ -1061,15 +1336,50 @@ fn supported_body(",
          "oldStart": 1061,
          "newStart": 1336,
          "sha256": "88a427e3d1418849542e0091b090cc63e740ae948d80844f73be5701577295ce",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1336"
        },
        {
          "anchor": "@@ -1161,6 +1471,84 @@ mod tests {",
          "oldStart": 1161,
          "newStart": 1471,
          "sha256": "c0a084cade3dec409a9c11adcb4942dbdfe15e22acf0c629f670c3bf7141c27c",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1471"
        },
        {
          "anchor": "@@ -1711,6 +2099,93 @@ mod tests {",
          "oldStart": 1711,
          "newStart": 2099,
          "sha256": "e5ceb6a9892c9c96a9bdb2bb51dd7a1df1cfb79410255397ceacb18927c39a7d",
          "classification": "dictionary-comprehension-domain-regression",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L2099"
        },
        {
          "anchor": "@@ -1741,6 +2216,28 @@ mod tests {",
          "oldStart": 1741,
          "newStart": 2216,
          "sha256": "1a58c4141f2ddffb7d9fdbf215d0098e8a125a9c91c0264408396ae454e32722",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L2216"
        },
        {
          "anchor": "@@ -1852,6 +2349,44 @@ mod tests {",
          "oldStart": 1852,
          "newStart": 2349,
          "sha256": "6ef49dcd0294aa754d4fa6006078146e75a213d425f87c73d5c59b22dcdff9d1",
          "classification": "dictionary-method-override-refusal-regression",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L2349"
        },
        {
          "anchor": "@@ -2412,7 +2947,10 @@ mod tests {",
          "oldStart": 2412,
          "newStart": 2947,
          "sha256": "8ecfa733bde5a81f5c31f03bb48b7b072a529c053a71580d67a1490ae218a5ef",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L2947"
        },
        {
          "anchor": "@@ -2750,20 +3288,12 @@ mod tests {",
          "oldStart": 2750,
          "newStart": 3288,
          "sha256": "6d42729311e7132e60ce9509cd43dd3bba6e668fd20c514311d40180702e1f21",
          "classification": "body-domain-checkpoint-regression",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L3288"
        },
        {
          "anchor": "@@ -2774,6 +3304,17 @@ mod tests {",
          "oldStart": 2774,
          "newStart": 3304,
          "sha256": "0314355f8cdf3d157dec9df3e47e83cbc016bf4f7e1e809af6329e3810913a87",
          "classification": "body-domain-checkpoint-regression",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L3304"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder.rs",
      "baseBlob": "27dabd087b49a957445d4ec379a9f7561509bcc3",
      "candidateBlob": "c113fadc12f327faf94a2bf522bb476c8f374353",
      "frozenCandidateBlob": "c92d970edcc3aea8a3b2fd02fd2b6c4b8376b9ad",
      "classification": "mixed-inference-context-owners",
      "detail": "Commit one lambda inference when all actual TypeContexts including kind agree; retain default plus every raw/ParamSpec key. Separate cached API and lint-policy migration hunks. Upstream factory-name inference and constructor-specific diagnostics are composed with the existing shared-argument-context change. Empty collections prefer complete, static invariant contexts agreed by their later consumers; conditional specializations of caller variables are not substitutes for those contexts. Comparison inference also consults the native type-tag impossibility owner for either operand order before ordinary comparison inference; it reuses already inferred operand types. Fresh mapping recovery receives cached expression types for exact builtin-string operand checks; no new operand inference is performed. Current forward hunks additionally cover: dictionary-comprehension-body-domain-propagation, sibling-dependent-empty-getattr-context-replay. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim. Final checkpoint explicitly reviewed changes: upstream-typeddict-candidate-fork-context-composition. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: fresh-collection-context-caller-eligibility. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: context-fallback-result-predicate-api, context-fallback-transaction-selection, existing-cast-context-fallback-policy, existing-peer-context-fallback-policy, fresh-collection-display-eligibility, fresh-collection-fallback-context-wiring, fresh-collection-ordinary-fallback-capture, fresh-collection-result-compatibility-selection, fresh-collection-speculative-overload-inference, fresh-collection-unique-argument-commit, provided-authoritative-context-clears-fresh-preference, shared-overload-primary-and-fallback-context. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: prepared-fresh-collection-evidence-and-compatible-context, upstream-checked-function-typeguard-return-reuse. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -34,7 +34,8 @@ use super::{",
          "oldStart": 34,
          "newStart": 34,
          "sha256": "6bbea1cc490173b63ded3834d6f4bff81fbaf197f8b7538739e7c75a13973716",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L34"
        },
        {
          "anchor": "@@ -60,7 +61,8 @@ use crate::types::attribute_write::{",
          "oldStart": 60,
          "newStart": 61,
          "sha256": "2a81797aa0c2f12f28276b9d49aa15f32ffb9251547418ed6f21e3ac5a3b2190",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L61"
        },
        {
          "anchor": "@@ -80,10 +82,11 @@ use crate::types::diagnostic::{",
          "oldStart": 80,
          "newStart": 82,
          "sha256": "a94e6a4a91eb1338ec2f0f694b434ff133b14f65b38c9a8a1bfc59e84ad6d774",
          "classification": "upstream-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L82"
        },
        {
          "anchor": "@@ -1271,7 +1274,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 1271,
          "newStart": 1274,
          "sha256": "0b7d1521c7f861febc898702de0f92d0ecfb77a24b076d0d9b0927038804af72",
          "classification": "upstream-checked-function-typeguard-return-reuse",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30671 retains the checked function overload/return for subsequent TypeGuard validation rather than rebuilding signatures; existing fork ordinary-signature and bounded TypeIs validation remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L1274"
        },
        {
          "anchor": "@@ -1288,6 +1291,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 1288,
          "newStart": 1291,
          "sha256": "6add273d03fdf41ee5b125b6e936f80e0f77df5f5a5f5bd2d06ae54ad6e05114",
          "classification": "upstream-checked-function-typeguard-return-reuse",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30671 retains the checked function overload/return for subsequent TypeGuard validation rather than rebuilding signatures; existing fork ordinary-signature and bounded TypeIs validation remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L1291"
        },
        {
          "anchor": "@@ -3895,6 +3899,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 3895,
          "newStart": 3899,
          "sha256": "dc538ee68c6e27ac8a72b311ca1b27f2d89889fb57b6cb9baa4de9b0222515c6",
          "classification": "upstream-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L3899"
        },
        {
          "anchor": "@@ -3926,13 +3931,19 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 3926,
          "newStart": 3931,
          "sha256": "bf6f1e0e880f24c7743f3831719e5b0d5bf5682e0e8ac6c888b0b59aada0f70b",
          "classification": "upstream-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L3931"
        },
        {
          "anchor": "@@ -3945,13 +3956,14 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 3945,
          "newStart": 3956,
          "sha256": "c7f274a09256fe364076e9488e0e8bd8feb04e5c05fc898180fd7603338c168a",
          "classification": "upstream-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L3956"
        },
        {
          "anchor": "@@ -3960,7 +3972,10 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 3960,
          "newStart": 3972,
          "sha256": "52d653e9d9d3e918ae2b74137106c71248ccb08ec7ceb78c0e626bb9ba7e3323",
          "classification": "upstream-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L3972"
        },
        {
          "anchor": "@@ -4312,6 +4327,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 4312,
          "newStart": 4327,
          "sha256": "8bc5bfb8072b9c58b91740668c04e6a9ef2d9468626ac5be9f4db15b8476d60e",
          "classification": "upstream-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L4327"
        },
        {
          "anchor": "@@ -4343,13 +4359,19 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 4343,
          "newStart": 4359,
          "sha256": "eb684d2d439cf72830c19a34eac1506b93c934fe9ad970a7f0f6c38d42bf2ee1",
          "classification": "upstream-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L4359"
        },
        {
          "anchor": "@@ -4362,13 +4384,14 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 4362,
          "newStart": 4384,
          "sha256": "3565d2c75a85985a916453bf953db62f2c5bcb6007133dbee6d3775090fc10f8",
          "classification": "upstream-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L4384"
        },
        {
          "anchor": "@@ -4379,7 +4402,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 4379,
          "newStart": 4402,
          "sha256": "2884cfaf96dd3389e34d1b16b67c3045bb0467bc54dcdc44a6286d10841bc6dd",
          "classification": "upstream-api-migration",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L4402"
        },
        {
          "anchor": "@@ -6229,6 +6252,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6229,
          "newStart": 6252,
          "sha256": "d665a002344326e8716c4f4b9b3bd14635f1b4f3a0745ed13df729e1f3769403",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6252"
        },
        {
          "anchor": "@@ -6293,12 +6317,36 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6293,
          "newStart": 6317,
          "sha256": "36f3e1ea484b1716aa46e9abe066231a680ae2590244b53c49063dbc40e8d6bb",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6317"
        },
        {
          "anchor": "@@ -6356,6 +6404,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6356,
          "newStart": 6404,
          "sha256": "86174cc13bcfa3c32648238f3534a44dbb18923b5ad2e87e66cdd3250eb7149d",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6404"
        },
        {
          "anchor": "@@ -6365,10 +6414,12 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6365,
          "newStart": 6414,
          "sha256": "da8076fefd13ade81512d28c0f37b7b5833c4aceeba66bc905dfc6322fc7b4ea",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6414"
        },
        {
          "anchor": "@@ -6402,10 +6453,10 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6402,
          "newStart": 6453,
          "sha256": "4ec6d8dea391fa46f486bec25eae67a5459eb15e2d234e5164d8aabf5a3ce4a8",
          "classification": "shared-actual-argument-context",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6453"
        },
        {
          "anchor": "@@ -6538,6 +6589,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6538,
          "newStart": 6589,
          "sha256": "162472237af4249b9ba4ae5d6511761339b9cbce0f40f4b1984ebe4c5b0c5894",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6589"
        },
        {
          "anchor": "@@ -6553,6 +6605,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6553,
          "newStart": 6605,
          "sha256": "fa52145f9d9acda95f268e46b400fd1beaf7acb4653ef93ad1754f89b56e48c3",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6605"
        },
        {
          "anchor": "@@ -6614,6 +6667,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6614,
          "newStart": 6667,
          "sha256": "150f1d23af8a24e369dc259de50e48bf12e0e24192dd149e4b3e4e42c1ecedd6",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6667"
        },
        {
          "anchor": "@@ -6637,10 +6691,12 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6637,
          "newStart": 6691,
          "sha256": "e1b4d74c4e583b28baa7d5eda92e68ddee19e7e7225a285159464f35e343573b",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6691"
        },
        {
          "anchor": "@@ -6658,6 +6714,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6658,
          "newStart": 6714,
          "sha256": "6288bf8f4163fda561411f0e28b829f99e114ea03dbe77356eeb0f8cddcdb6e2",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6714"
        },
        {
          "anchor": "@@ -6691,7 +6748,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6691,
          "newStart": 6748,
          "sha256": "188d4fa8c3f4afd4e2e32c42c505ad977aeadbd76d95e9b6d755539cc1e099f6",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6748"
        },
        {
          "anchor": "@@ -6707,9 +6764,9 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6707,
          "newStart": 6764,
          "sha256": "1b2f9c8e93756d123b20417bb6f651977bfcc93c0171a8fbd985c5ce914f0bbf",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6764"
        },
        {
          "anchor": "@@ -6723,6 +6780,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6723,
          "newStart": 6780,
          "sha256": "b2e0c46357d979b3075f051db604204e13277fb70a97107105c8b2f96a236ce5",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6780"
        },
        {
          "anchor": "@@ -6771,6 +6829,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6771,
          "newStart": 6829,
          "sha256": "a16773f7db87b20a9fa40d1cf236c88684f1e0336b519993d9702e123ad40fac",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6829"
        },
        {
          "anchor": "@@ -6828,6 +6887,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6828,
          "newStart": 6887,
          "sha256": "0d957ba09a9f01b3d357b53dc056c56561edadf988727edbdc5a362a2fc81f6f",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6887"
        },
        {
          "anchor": "@@ -6851,6 +6911,14 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6851,
          "newStart": 6911,
          "sha256": "15a0bb6055d5ccadf18da114ac2ad82672f3ac1d8941dc8a296e8858cde298a9",
          "classification": "sibling-dependent-empty-getattr-context-replay",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6911"
        },
        {
          "anchor": "@@ -6861,6 +6929,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6861,
          "newStart": 6929,
          "sha256": "a7fe88b63aa689c0ad1e9ec74da57a6fd4f499529898ab3310b5b833a961b6cb",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6929"
        },
        {
          "anchor": "@@ -6870,7 +6939,11 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6870,
          "newStart": 6939,
          "sha256": "ed368c3eb063bf5937ca81d30623aff4a0ce18109f7a233986c7260924649a15",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6939"
        },
        {
          "anchor": "@@ -6906,14 +6979,24 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6906,
          "newStart": 6979,
          "sha256": "796d84ed727701b53b81cfb38bc66a45d341cbf5ed53f4e2ced8d5d5af5814d4",
          "classification": "fresh-collection-ordinary-fallback-capture",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6979"
        },
        {
          "anchor": "@@ -6925,7 +7008,17 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6925,
          "newStart": 7008,
          "sha256": "c8f34a7cc547bdc5e7c302231ebe20cfda1267e05148260ed2df613273e3eb21",
          "classification": "fresh-collection-display-eligibility",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7008"
        },
        {
          "anchor": "@@ -6933,10 +7026,13 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6933,
          "newStart": 7026,
          "sha256": "9c9c836cacbad06aa1936824ddd4263622a0ed0ea6c5002cb5372c0b3f47ff5b",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7026"
        },
        {
          "anchor": "@@ -6946,6 +7042,43 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6946,
          "newStart": 7042,
          "sha256": "b545604f9642a2db35e9db2899a9692f5645ce38a8c83c91e78233a12d68f378",
          "classification": "prepared-fresh-collection-evidence-and-compatible-context",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Reviewed optimization of the existing fresh-collection family: fixed full-snapshot per-relation pending contributions, ordered prefix/suffix target omission, original-first priming, complete-only call-owned last projection, and per-specialization source-group validation. Unsupported pack/legacy paths retain original inference; tentative compatibility/ordinary fallback and authoritative supplied-field priority remain. TypedDict literal_candidates avoids a doomed tentative trial, not mandatory diagnostics.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7042"
        },
        {
          "anchor": "@@ -6986,9 +7119,13 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 6986,
          "newStart": 7119,
          "sha256": "cf859508339c5f27bdbcaf7dbbd0d117a7f88965009f7619681bcf5347a5770d",
          "classification": "fresh-collection-unique-argument-commit",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7119"
        },
        {
          "anchor": "@@ -7011,6 +7148,41 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 7011,
          "newStart": 7148,
          "sha256": "8b1da11d6bb568d6d67f0247d2337437e7114bd4bdd74a8adc5d5db7c1050390",
          "classification": "shared-overload-primary-and-fallback-context",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7148"
        },
        {
          "anchor": "@@ -7060,12 +7232,12 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 7060,
          "newStart": 7232,
          "sha256": "4103b72a775c88f202b2d45581a6b993bf2750d2565bbe1b1f1df4afdff5d386",
          "classification": "fresh-collection-speculative-overload-inference",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7232"
        },
        {
          "anchor": "@@ -7206,11 +7378,16 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 7206,
          "newStart": 7378,
          "sha256": "a910a9e882e85923cecba8da27a9b396d8a5271e8b617257eb687ca58623ebf3",
          "classification": "existing-peer-context-fallback-policy",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7378"
        },
        {
          "anchor": "@@ -7227,13 +7404,12 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 7227,
          "newStart": 7404,
          "sha256": "403cc2d5dab795ee237d49e43f6ad78a8c3fe6d757a28de97819b19533a491ae",
          "classification": "context-fallback-result-predicate-api",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7404"
        },
        {
          "anchor": "@@ -7245,13 +7421,11 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 7245,
          "newStart": 7421,
          "sha256": "f949a2bbf1acbe0ff9f412a90177634d3b22490b981504bc02ba1ca352354623",
          "classification": "context-fallback-transaction-selection",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7421"
        },
        {
          "anchor": "@@ -8488,7 +8662,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 8488,
          "newStart": 8662,
          "sha256": "a6f864d7dc06b3348ea8704077f08cb992386e89bfa7968f8d41b74c54ed2d17",
          "classification": "upstream-typeddict-candidate-fork-context-composition",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L8662"
        },
        {
          "anchor": "@@ -8736,6 +8910,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 8736,
          "newStart": 8910,
          "sha256": "fddcc2ae7f013fc5a4c9ea536695224f8eb23126e50607e440c67a58d5438446",
          "classification": "complete-later-collection-context",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L8910"
        },
        {
          "anchor": "@@ -8748,6 +8923,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 8748,
          "newStart": 8923,
          "sha256": "ac939b30b9d41df86dcef1ca059ffab0e590aec8639ea91931f40a51bad525e2",
          "classification": "complete-later-collection-context",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L8923"
        },
        {
          "anchor": "@@ -8756,6 +8932,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 8756,
          "newStart": 8932,
          "sha256": "e64be178809e97052c571cae60c43c753e22abaa77f1785c702a9aa4e7e85ce9",
          "classification": "complete-later-collection-context",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L8932"
        },
        {
          "anchor": "@@ -8764,6 +8941,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 8764,
          "newStart": 8941,
          "sha256": "4461f37042be1a714b30227e9ef1cf4a6a576a7b363243899d724afe44d250f6",
          "classification": "complete-later-collection-context",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L8941"
        },
        {
          "anchor": "@@ -8859,9 +9037,9 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 8859,
          "newStart": 9037,
          "sha256": "2a560c33d464e323947efbe099d6743a1d6dbae94050a60c7e9a673a13733015",
          "classification": "complete-later-collection-context",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L9037"
        },
        {
          "anchor": "@@ -9000,6 +9178,8 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9000,
          "newStart": 9178,
          "sha256": "efa7d2b2bd97426efaca26797de149c050755ee6740c4564b0370faf3875e163",
          "classification": "complete-later-collection-context",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L9178"
        },
        {
          "anchor": "@@ -9065,8 +9245,69 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9065,
          "newStart": 9245,
          "sha256": "b4b402317b36d21912bc3ef9e427f06ca7544a95d5b97437973f0b919b0d33b6",
          "classification": "complete-later-collection-context",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L9245"
        },
        {
          "anchor": "@@ -9100,6 +9341,15 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9100,
          "newStart": 9341,
          "sha256": "d2a769086b2f1750dc6dabccee816ab4eaeac494b93697260d73eb44e121b739",
          "classification": "complete-later-collection-context",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L9341"
        },
        {
          "anchor": "@@ -9407,7 +9657,12 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9407,
          "newStart": 9657,
          "sha256": "9d3c35d001de3e6a64622224013c36617398f8f625d7cc158c84de10a118084c",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L9657"
        },
        {
          "anchor": "@@ -9687,8 +9942,12 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9687,
          "newStart": 9942,
          "sha256": "8dc3604be91a242ae118e282b4c7c2ffef73eff93df1bdf263fe75e6d5bb92ca",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L9942"
        },
        {
          "anchor": "@@ -9737,7 +9996,12 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9737,
          "newStart": 9996,
          "sha256": "f5e42df4430e36d8e291040f5faeb6c9fae4f86e9bd71382af3f9687d0479d50",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L9996"
        },
        {
          "anchor": "@@ -9760,7 +10024,8 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 9760,
          "newStart": 10024,
          "sha256": "f9ada5d7f261e4a439943b88a2eaab0051bfe9a9994e9caff1c1262cd12f4714",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L10024"
        },
        {
          "anchor": "@@ -10235,6 +10500,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 10235,
          "newStart": 10500,
          "sha256": "08f5d7d09fa589a65e28291291fe2e8f31bc379b77007706aeb3e9fe6bad9ee6",
          "classification": "cached-string-operands-for-fresh-mapping-recovery",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L10500"
        },
        {
          "anchor": "@@ -11201,6 +11467,7 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 11201,
          "newStart": 11467,
          "sha256": "b0dea229d38216d87a0be2412426f46a4744dfb6c0aba2dc1686d77a350d8e7f",
          "classification": "existing-cast-context-fallback-policy",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L11467"
        },
        {
          "anchor": "@@ -11640,14 +11907,17 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 11640,
          "newStart": 11907,
          "sha256": "25b49e2c3cd2c8ba5ae6c1e7d0b7c62e4dfd51f604d4658fef3d46885b7843fd",
          "classification": "provided-authoritative-context-clears-fresh-preference",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L11907"
        },
        {
          "anchor": "@@ -11739,6 +12009,10 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 11739,
          "newStart": 12009,
          "sha256": "3a2272cc1d6ddfdca9651ede2586108a6c06debb1ae14a8fd46a625f85df5037",
          "classification": "mechanical-clippy-qualification",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L12009"
        },
        {
          "anchor": "@@ -13574,7 +13848,34 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 13574,
          "newStart": 13848,
          "sha256": "3a71f04f754f3ceab37d0e4f9bc6119997e497db2b4bddfa13ca00f64ae06eba",
          "classification": "native-type-tag-impossibility-proof",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L13848"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L13"
        },
        {
          "anchor": "@@ -361,15 +362,17 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 361,
          "newStart": 362,
          "sha256": "76ebba6405f741fd18943dcce43cab49dc23d2457d7995e166aafc3b168e3889",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L362"
        },
        {
          "anchor": "@@ -388,13 +391,6 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 388,
          "newStart": 391,
          "sha256": "d9ae9341b7329879faea336e27afd8052612be296417f9452e1e1d6597f3cdea",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L391"
        },
        {
          "anchor": "@@ -417,24 +413,19 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 417,
          "newStart": 413,
          "sha256": "9604af10deda2b8cb1f411bd915a70115883da164d80aa203d4aa7e6cd5d604b",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L413"
        },
        {
          "anchor": "@@ -448,7 +439,7 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 448,
          "newStart": 439,
          "sha256": "f6044baa7b200ddbb6a34d79a528bd43b93ed63895d17680f418c57c298da36c",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L439"
        },
        {
          "anchor": "@@ -468,14 +459,14 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 468,
          "newStart": 459,
          "sha256": "ca2f5c9a6f32bd4371559663ea02e4c4f157ced1b7ec238928f49f814c55d0ae",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/enum_call.rs#L459"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/function.rs#L321"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/paramspec_validation.rs#L168"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/post_inference/function.rs",
      "baseBlob": "76081fadd72cd0452566e76e4c12ecde495af337",
      "candidateBlob": "b08fe3a80a7467e1899a296ee728869b2bdfcc77",
      "frozenCandidateBlob": "860cac4057630e2c25b63696e8e280cf66dd9ee9",
      "classification": "upstream-checked-function-typeguard-return-reuse",
      "detail": "Official #30671 retains the checked function overload/return for subsequent TypeGuard validation rather than rebuilding signatures; existing fork ordinary-signature and bounded TypeIs validation remain. Final checkpoint explicitly reviewed changes: upstream-checked-function-typeguard-return-reuse. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -30,22 +30,25 @@ use ruff_text_size::{Ranged, TextRange};",
          "oldStart": 30,
          "newStart": 30,
          "sha256": "34e9108436979d321d07ff04b92af53a24d74415c6d86ea409d6b11673945032",
          "classification": "upstream-checked-function-typeguard-return-reuse",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30671 retains the checked function overload/return for subsequent TypeGuard validation rather than rebuilding signatures; existing fork ordinary-signature and bounded TypeIs validation remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/post_inference/function.rs#L30"
        },
        {
          "anchor": "@@ -68,6 +71,11 @@ pub(crate) fn check_function_definition<'db>(",
          "oldStart": 68,
          "newStart": 71,
          "sha256": "a3aa160ce9ef89d86429dbce2302cee530ffb7215b7be0907d1b848b18ae69bf",
          "classification": "upstream-checked-function-typeguard-return-reuse",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30671 retains the checked function overload/return for subsequent TypeGuard validation rather than rebuilding signatures; existing fork ordinary-signature and bounded TypeIs validation remain.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/post_inference/function.rs#L71"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/subscript.rs#L172"
        },
        {
          "anchor": "@@ -1894,14 +1893,14 @@ impl<'db, 'ast> TypeInferenceBuilder<'db, 'ast> {",
          "oldStart": 1894,
          "newStart": 1893,
          "sha256": "c62f25a5b51b7a10c6d17397852fb598ace597a0d645ce7543bf49926de8dfb2",
          "classification": "checked-write-evidence",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/subscript.rs#L1893"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/infer/builder/typed_dict.rs",
      "baseBlob": "96549ac71e9f05fcd8cb71ac23d7caec18152d22",
      "candidateBlob": "e506040d5b97fcf60fad0552b90e37a0f3b7b4a7",
      "frozenCandidateBlob": "ed4a44301b10c4cfb3bac65510f7df690dd50e41",
      "classification": "upstream-api-migration",
      "detail": "Reuses upstream alias-resolved literal names, separate valid-name-type check and MISMATCHED_TYPEDDICT_NAME diagnostic. Final checkpoint explicitly reviewed changes: upstream-typeddict-import-fork-name-diagnostic-composition, upstream-typeddict-literal-candidates. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -5,12 +5,11 @@ use smallvec::SmallVec;",
          "oldStart": 5,
          "newStart": 5,
          "sha256": "a84f9796a486bc082763f2402a8c9463449dc2ee7596f094563b82e4911db752",
          "classification": "upstream-typeddict-import-fork-name-diagnostic-composition",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/typed_dict.rs#L5"
        },
        {
          "anchor": "@@ -24,8 +23,49 @@ use crate::types::{",
          "oldStart": 24,
          "newStart": 23,
          "sha256": "13f910674dd19c98f7b705ebe8bbc58fb376ff26d5428f5e4bec012246fcaa21",
          "classification": "upstream-typeddict-literal-candidates",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/typed_dict.rs#L23"
        },
        {
          "anchor": "@@ -267,11 +307,13 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 267,
          "newStart": 307,
          "sha256": "3476fba593a1e0c8ed27d6d145e711023951b0cb0ea36b41eae83f9e653919fd",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/typed_dict.rs#L307"
        },
        {
          "anchor": "@@ -281,12 +323,16 @@ impl<'db> TypeInferenceBuilder<'db, '_> {",
          "oldStart": 281,
          "newStart": 323,
          "sha256": "7e1c51cd4d3c35f89a3ce4164208ea8876fd116390cd130c344f2930997f7ac2",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/typed_dict.rs#L323"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/instance.rs",
      "baseBlob": "94badf89a8349a31aff834de33aead4cc6f28460",
      "candidateBlob": "a5b3719ca8b298f3cce585605fe79b086fece14c",
      "frozenCandidateBlob": "890aefab04f2c500d0ef5aa3751e4ffab5628356",
      "classification": "upstream-exact-tuple-mro-shortcut-and-fork-overlap",
      "detail": "Official #30667 extracts the existing unspecialized-MRO exclusion proof and uses it before unrelated exact-tuple specialization; fork disjointness uses the same two-direction exclusion. Unknown/dynamic/divergent or invalid MRO does not prove exclusion. Final checkpoint explicitly reviewed changes: upstream-exact-tuple-mro-shortcut-and-fork-overlap. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -311,6 +311,24 @@ pub(super) fn walk_nominal_instance_type<'db, V: super::visitor::TypeVisitor<'db",
          "oldStart": 311,
          "newStart": 311,
          "sha256": "5d71d1be3d8b7acd37c3efd7c6534fc1e073634871ccc448f3d989e4c861bcd0",
          "classification": "upstream-exact-tuple-mro-shortcut-and-fork-overlap",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30667 extracts the existing unspecialized-MRO exclusion proof and uses it before unrelated exact-tuple specialization; fork disjointness uses the same two-direction exclusion. Unknown/dynamic/divergent or invalid MRO does not prove exclusion.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/instance.rs#L311"
        },
        {
          "anchor": "@@ -390,21 +408,7 @@ impl<'db> NominalInstanceType<'db> {",
          "oldStart": 390,
          "newStart": 408,
          "sha256": "89f01229527ca73bbca4a69a0392210de6929160900e84d98b7b86e1237f0e83",
          "classification": "upstream-exact-tuple-mro-shortcut-and-fork-overlap",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30667 extracts the existing unspecialized-MRO exclusion proof and uses it before unrelated exact-tuple specialization; fork disjointness uses the same two-direction exclusion. Unknown/dynamic/divergent or invalid MRO does not prove exclusion.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/instance.rs#L408"
        },
        {
          "anchor": "@@ -1589,7 +1593,21 @@ impl<'c, 'db> TypeRelationChecker<'_, 'c, 'db> {",
          "oldStart": 1589,
          "newStart": 1593,
          "sha256": "3f6714d82af411dc3d59a91fa663842dc92866a69637c80445a25ed41c49c831",
          "classification": "upstream-exact-tuple-mro-shortcut-and-fork-overlap",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30667 extracts the existing unspecialized-MRO exclusion proof and uses it before unrelated exact-tuple specialization; fork disjointness uses the same two-direction exclusion. Unknown/dynamic/divergent or invalid MRO does not prove exclusion.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/instance.rs#L1593"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/loop_bindings.rs#L23"
        },
        {
          "anchor": "@@ -393,9 +392,8 @@ def select(rows: list[tuple[bool, list[str], str]]) -> str:",
          "oldStart": 393,
          "newStart": 392,
          "sha256": "505698a91a28d3cceb33591241d5c88ab0fa679b637dfa8671929efe1429f98c",
          "classification": "mechanical",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/loop_bindings.rs#L392"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/narrow.rs#L52"
        },
        {
          "anchor": "@@ -60,6 +60,7 @@ use super::equality::{",
          "oldStart": 60,
          "newStart": 60,
          "sha256": "ad4cc16b9c12cdb5ff17998b6ee4f370d49a2a884d479cfacde18a75b8bb9ae4",
          "classification": "native-type-tag-impossibility-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/narrow.rs#L60"
        },
        {
          "anchor": "@@ -100,7 +101,7 @@ pub(crate) fn infer_narrowing_constraints<'db>(",
          "oldStart": 100,
          "newStart": 101,
          "sha256": "82df0c775bb2d8cfa3313a247e89f7293d209179d317c3183bbe8c71a78c04c5",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/narrow.rs#L101"
        },
        {
          "anchor": "@@ -125,7 +126,7 @@ pub(crate) fn infer_narrowing_constraints<'db>(",
          "oldStart": 125,
          "newStart": 126,
          "sha256": "2de5e3ba06adb1b9d86d6a62d4035bde670d7c2911fe661b09ea87cd91bc4786",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/narrow.rs#L126"
        },
        {
          "anchor": "@@ -181,6 +182,9 @@ impl<'db, 'ast> RuntimeTypeTest<'db, 'ast> {",
          "oldStart": 181,
          "newStart": 182,
          "sha256": "9ea99589f93b60d4739f9c28aca06029f6dbf2552cc6c624710df2595d523abe",
          "classification": "native-type-tag-impossibility-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/narrow.rs#L182"
        },
        {
          "anchor": "@@ -263,6 +267,75 @@ impl<'db, 'ast> RuntimeTypeTest<'db, 'ast> {",
          "oldStart": 263,
          "newStart": 267,
          "sha256": "339b7968445207909994414a5939c8a852bbfeb51e96319f7542b44c56d1e870",
          "classification": "native-type-tag-impossibility-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/narrow.rs#L267"
        },
        {
          "anchor": "@@ -4367,7 +4440,12 @@ impl<'db> NarrowingConstraintsBuilder<'db, '_> {",
          "oldStart": 4367,
          "newStart": 4440,
          "sha256": "771ec0e79b04f2898887ab4d4a104c9a5b4473832d3fa499d39c79f538981f37",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/narrow.rs#L4440"
        },
        {
          "anchor": "@@ -4377,6 +4455,7 @@ impl<'db> NarrowingConstraintsBuilder<'db, '_> {",
          "oldStart": 4377,
          "newStart": 4455,
          "sha256": "b632980cb05d2c183497766e6695f6bedeba874bf521dbfd75cd5d911aed5d54",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/narrow.rs#L4455"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/newtype.rs#L152"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/source_tests.rs#L3255"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L70"
        },
        {
          "anchor": "@@ -88,31 +94,63 @@ Literal[float]",
          "oldStart": 88,
          "newStart": 94,
          "sha256": "1c495e5e819404b940e741eab1459b51e13ff4b6f4a9df9e842e0e65ce148aea",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L94"
        },
        {
          "anchor": "@@ -121,8 +159,14 @@ Literal[float]",
          "oldStart": 121,
          "newStart": 159,
          "sha256": "d64441e58dd7f64adaded3dd5d2af0a26b4b3dc4c8401a4be262e54da356745c",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L159"
        },
        {
          "anchor": "@@ -509,6 +553,68 @@ fn supplied_instance_refinement_preserves_storage_and_nominal_behavior() -> anyh",
          "oldStart": 509,
          "newStart": 553,
          "sha256": "ded38a283c13509550eaf92c5e9490b654760e8ebc8eafcec523f43a04c42e54",
          "classification": "finite-provided-storage-receiver-regression",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L553"
        },
        {
          "anchor": "@@ -1844,7 +1950,7 @@ consume(target, consumed=1, required=1)",
          "oldStart": 1844,
          "newStart": 1950,
          "sha256": "36409e6ff52818ab9d0914b8ce38bb7e833b0a41f88b0843edabc7f2ef65bb63",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L1950"
        },
        {
          "anchor": "@@ -2610,7 +2716,7 @@ if False:",
          "oldStart": 2610,
          "newStart": 2716,
          "sha256": "5de4392bdeabb121d85a360382f290f084bff3fc8bef0bdaedee50a5caa0f45d",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L2716"
        },
        {
          "anchor": "@@ -3087,6 +3193,115 @@ fn runtime_type_test<'db>(",
          "oldStart": 3087,
          "newStart": 3193,
          "sha256": "422fbef5a849f9b89f27293aa866445d56b965ba73a243b907d49dbd15b0b17f",
          "classification": "native-type-tag-regression-controls",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L3193"
        },
        {
          "anchor": "@@ -3733,25 +3948,25 @@ target: Target | None",
          "oldStart": 3733,
          "newStart": 3948,
          "sha256": "44da6ec9247f2481dc68f8be8568ba89603a3fe477477f9180c006e5c0ea0179",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L3948"
        },
        {
          "anchor": "@@ -3763,13 +3978,14 @@ target: Target | None",
          "oldStart": 3763,
          "newStart": 3978,
          "sha256": "300c0c9b9809b0aaf5eb2df4acee6ddfa562ff0d2a1ffb344916926e42485a41",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L3978"
        },
        {
          "anchor": "@@ -3817,7 +4033,7 @@ def use() -> str:",
          "oldStart": 3817,
          "newStart": 4033,
          "sha256": "2e1cfe87ad416febdd0ecbea79e4023f5e700e2392ad4eae124aea3f50989e22",
          "classification": "canonical-diagnostic-fixtures",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L4033"
        },
        {
          "anchor": "@@ -4101,6 +4317,82 @@ def use() -> None:",
          "oldStart": 4101,
          "newStart": 4317,
          "sha256": "038dd968c8a9f9a4a630faa5bd7da2402726a480141854e8721b43055fc1e7a7",
          "classification": "dictionary-after-arguments-snapshot-regressions",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L4317"
        },
        {
          "anchor": "@@ -4168,7 +4460,7 @@ fn dictionary_observations_preserve_first_entries() -> anyhow::Result<()> {",
          "oldStart": 4168,
          "newStart": 4460,
          "sha256": "8fde72d9d288f30f00dc233c667fbc759cc13e6f5960924654521cc4e73b2166",
          "classification": "dictionary-after-arguments-snapshot-regressions",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L4460"
        },
        {
          "anchor": "@@ -4208,7 +4500,7 @@ fn dictionary_observations_preserve_first_entries() -> anyhow::Result<()> {",
          "oldStart": 4208,
          "newStart": 4500,
          "sha256": "21234f70dfa3e4e3d33e7c8bef01893189314bb7cfa8522475a1027c795514be",
          "classification": "dictionary-after-arguments-snapshot-regressions",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L4500"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/relation.rs#L317"
        },
        {
          "anchor": "@@ -645,76 +650,89 @@ impl<'db> Type<'db> {",
          "oldStart": 645,
          "newStart": 650,
          "sha256": "e3924291c5751f4f5e42d9d31e0fdc260184443e7d6d4572a9cc4ee9f14b6bc4",
          "classification": "upstream-cached-relation-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/relation.rs#L650"
        },
        {
          "anchor": "@@ -738,69 +756,106 @@ impl<'db> Type<'db> {",
          "oldStart": 738,
          "newStart": 756,
          "sha256": "516de38f8f4e977a4ca6e96d01fd640bb539648c3f5c09367eebb183e242a789",
          "classification": "upstream-cached-relation-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/relation.rs#L756"
        },
        {
          "anchor": "@@ -810,7 +865,7 @@ impl<'db> Type<'db> {",
          "oldStart": 810,
          "newStart": 865,
          "sha256": "2f542b985cf795dadaeb18c1dee78d1742e2b6ea6d80056662108d49072309bf",
          "classification": "upstream-cached-relation-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/relation.rs#L865"
        }
      ]
    },
    {
      "path": "crates/ty_python_semantic/src/types/set_theoretic/builder.rs",
      "baseBlob": "c44c00d1fe14b7512ec820af893588742a6b684c",
      "candidateBlob": "ad83d83b7183a271940b764bec5fc4e8a530146f",
      "frozenCandidateBlob": "a00edc198ff679577ffd262656569c997c242705",
      "classification": "exact-immutable-builtin-truthiness",
      "detail": "Simplifies both AlwaysTruthy and AlwaysFalsy exclusions to Never only with a positive stable builtin and existing exact-runtime-class proof. Mutable/stateful and open classes are retained. Current forward hunks additionally cover: exact-immutable-builtin-truthiness. See each exact hunk review note; file-level ownership is mixed, not an independent PR claim. Final checkpoint explicitly reviewed changes: exact-immutable-builtin-truthiness, upstream-class-guard-union-fastpath. Mixed-file ownership is not an independent PR claim. Final checkpoint explicitly reviewed changes: upstream-class-object-string-union-pruning. Mixed-file ownership is not an independent PR claim.",
      "hunks": [
        {
          "anchor": "@@ -45,6 +45,7 @@ use std::ops::ControlFlow;",
          "oldStart": 45,
          "newStart": 45,
          "sha256": "7e7e364f9bc189ea10bad777bc19ef4db1b473ee32f6a0e4d52f2de36eaa3a9d",
          "classification": "exact-immutable-builtin-truthiness",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L45"
        },
        {
          "anchor": "@@ -54,6 +55,7 @@ use crate::types::{",
          "oldStart": 54,
          "newStart": 55,
          "sha256": "ff8fbcd92f41bcf6886f495284a782ea4d1898d510e8b5dd2f3d4ec792621859",
          "classification": "upstream-class-guard-union-fastpath",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L55"
        },
        {
          "anchor": "@@ -893,16 +895,25 @@ impl<'db> UnionBuilder<'db> {",
          "oldStart": 893,
          "newStart": 895,
          "sha256": "dcc5412faa7644d9a2f7cfd4fbe3a69416963da361aca69f50dab0fb16fbf043",
          "classification": "upstream-class-object-string-union-pruning",
          "attribution": "explicit-current-source-review",
          "reviewNote": "Official #30698 omits impossible literal-string/complement-to-class-object subtype queries while retaining reverse checks for Never-returning metaclasses.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L895"
        },
        {
          "anchor": "@@ -1152,7 +1163,8 @@ impl<'db> UnionBuilder<'db> {",
          "oldStart": 1152,
          "newStart": 1163,
          "sha256": "3b78ed04fef241fc92afd29c97bffc5efcb5aed54ff49ad5bd476d2119c94655",
          "classification": "upstream-class-guard-union-fastpath",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L1163"
        },
        {
          "anchor": "@@ -1176,6 +1188,18 @@ impl<'db> UnionBuilder<'db> {",
          "oldStart": 1176,
          "newStart": 1188,
          "sha256": "46ec38be9fe85fc959b5aaa63cc1f74a9ce0165306ce4fedbc9a44349070bf17",
          "classification": "upstream-class-guard-union-fastpath",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L1188"
        },
        {
          "anchor": "@@ -2656,6 +2680,31 @@ impl<'db> InnerIntersectionBuilder<'db> {",
          "oldStart": 2656,
          "newStart": 2680,
          "sha256": "84c811d8457f3e2509e07aa394ca833f014d24ae6f583f0e6bf4f4221266f1c8",
          "classification": "exact-immutable-builtin-truthiness",
          "attribution": "exact-body-shifted-anchor",
          "reviewNote": "All context/addition/deletion lines match the prior reviewed hunk; only its line-number anchor changed.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L2680"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L142"
        },
        {
          "anchor": "@@ -388,7 +378,6 @@ impl<'db> CallableSignature<'db> {",
          "oldStart": 388,
          "newStart": 378,
          "sha256": "4c9e8e4fe8b96e1bb1df4330189ca341b6dbd3caf06c48c6272715cdce8d7369",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L378"
        },
        {
          "anchor": "@@ -420,8 +409,6 @@ impl<'db> CallableSignature<'db> {",
          "oldStart": 420,
          "newStart": 409,
          "sha256": "88a20c8eff7ef3eb57c5a47f00d86d777168e9db3dd76cac806e767ea47191d5",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L409"
        },
        {
          "anchor": "@@ -833,17 +820,15 @@ impl<'db> SignatureExtras<'db> {",
          "oldStart": 833,
          "newStart": 820,
          "sha256": "5941307c81c6ca761668925fbbb25bf27b0414ca92f6f62b8a89df9240267a5e",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L820"
        },
        {
          "anchor": "@@ -856,7 +841,7 @@ impl<'db> ReceiverConstraints<'db> {",
          "oldStart": 856,
          "newStart": 841,
          "sha256": "25349d39bec04ee01434b9e26414686d9ffa19b06a45bf62d5505dee585e9c2f",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L841"
        },
        {
          "anchor": "@@ -865,19 +850,11 @@ impl<'db> ReceiverConstraints<'db> {",
          "oldStart": 865,
          "newStart": 850,
          "sha256": "4243e74a219cec719428e3e89795bec7c8c96bd1087d3006b8473961f45c0174",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L850"
        },
        {
          "anchor": "@@ -888,29 +865,64 @@ impl<'db> ReceiverConstraints<'db> {",
          "oldStart": 888,
          "newStart": 865,
          "sha256": "8bf23904f23036c913f2b2c710a00c82e9af8a3d827c042e5b4acc7f5aeefe83",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L865"
        },
        {
          "anchor": "@@ -961,8 +973,8 @@ impl<'db> SignatureRelationKey<'db> {",
          "oldStart": 961,
          "newStart": 973,
          "sha256": "5d8aa6503ddd0f519e60d95f8dc1eb6cf0692a05c4dc7423e88636b441322e3f",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L973"
        },
        {
          "anchor": "@@ -976,6 +988,9 @@ fn visit_type_arguments<'db>(",
          "oldStart": 976,
          "newStart": 988,
          "sha256": "2cf950b7d34bb49287d15c30c230e0c24f953b9cb78cbcf72a0ca054e25785cc",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L988"
        },
        {
          "anchor": "@@ -1088,6 +1103,12 @@ fn receiver_arguments_decrease<'db>(",
          "oldStart": 1088,
          "newStart": 1103,
          "sha256": "7226c4dd60022b3bd8286b5e18df18711b0380ac9da03fc8d668697c6f027d8a",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L1103"
        },
        {
          "anchor": "@@ -2041,7 +2062,7 @@ impl<'db> Signature<'db> {",
          "oldStart": 2041,
          "newStart": 2062,
          "sha256": "7854d10232011e2c8e2dd369c316173ae00bae67e17884d0c6f2f9d12f5e7997",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L2062"
        },
        {
          "anchor": "@@ -2071,24 +2092,14 @@ impl<'db> Signature<'db> {",
          "oldStart": 2071,
          "newStart": 2092,
          "sha256": "be8e04b509d055b69ac138c7fdfeec5c400945c42612cbe6ee2687fab21437a4",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L2092"
        },
        {
          "anchor": "@@ -2173,7 +2184,8 @@ impl<'db> Signature<'db> {",
          "oldStart": 2173,
          "newStart": 2184,
          "sha256": "f5df4078c677b4bfcf27301a1bd45c61db1942354e2fe1188756ab74d44d7e99",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L2184"
        },
        {
          "anchor": "@@ -2499,7 +2511,6 @@ impl<'db> Signature<'db> {",
          "oldStart": 2499,
          "newStart": 2511,
          "sha256": "e026bb5d1571d649f23d418c8af7582cfc5d680edd1f0895073a38ee3ff7483a",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L2511"
        },
        {
          "anchor": "@@ -2510,10 +2521,9 @@ impl<'db> Signature<'db> {",
          "oldStart": 2510,
          "newStart": 2521,
          "sha256": "e019c35ce439025706a2798d25fa1f8365f3de0d5b4aa7153b78ddfc9c8108af",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L2521"
        },
        {
          "anchor": "@@ -2560,12 +2570,7 @@ impl<'db> Signature<'db> {",
          "oldStart": 2560,
          "newStart": 2570,
          "sha256": "c57631004a029570f3d81821201bdcc10bd8d69ae16044ee86d17d1b42077a73",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L2570"
        },
        {
          "anchor": "@@ -2585,34 +2590,8 @@ impl<'db> Signature<'db> {",
          "oldStart": 2585,
          "newStart": 2590,
          "sha256": "903604317bb2bb896058f06bcc6793e638e3ed035544c3e19ece3e16a307b308",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L2590"
        },
        {
          "anchor": "@@ -3711,7 +3690,7 @@ impl<'c, 'db> TypeRelationChecker<'_, 'c, 'db> {",
          "oldStart": 3711,
          "newStart": 3690,
          "sha256": "7cad0ca4b027337ba1525da1b5629f6a7835bab45c4c753b397677c9753ebb70",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L3690"
        },
        {
          "anchor": "@@ -3783,7 +3762,7 @@ impl<'c, 'db> TypeRelationChecker<'_, 'c, 'db> {",
          "oldStart": 3783,
          "newStart": 3762,
          "sha256": "41233ccf7b4a7cc49b968f26d4ec6b77b64568020f193e4c1c508bb04dab7114",
          "classification": "strict-callback-source-witness-replay",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L3762"
        },
        {
          "anchor": "@@ -3809,6 +3788,15 @@ impl<'c, 'db> TypeRelationChecker<'_, 'c, 'db> {",
          "oldStart": 3809,
          "newStart": 3788,
          "sha256": "0ab2de4024a5c478da542d5dc7be6bfa72f0e674fe1a127dafca40d2581cfb23",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L3788"
        },
        {
          "anchor": "@@ -3877,6 +3865,18 @@ impl<'c, 'db> TypeRelationChecker<'_, 'c, 'db> {",
          "oldStart": 3877,
          "newStart": 3865,
          "sha256": "38765ddf7115d5f7ab2f5fa398a9097e791e0248d5a71db5493e1aa93970a398",
          "classification": "strict-callback-source-witness-replay",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L3865"
        },
        {
          "anchor": "@@ -3886,7 +3886,7 @@ impl<'c, 'db> TypeRelationChecker<'_, 'c, 'db> {",
          "oldStart": 3886,
          "newStart": 3886,
          "sha256": "5b3344312d754479f58603b48610cb7c602ee433f351920a18d78db37d3cf9d9",
          "classification": "strict-callback-source-witness-replay",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L3886"
        },
        {
          "anchor": "@@ -8392,7 +8392,8 @@ mod tests {",
          "oldStart": 8392,
          "newStart": 8392,
          "sha256": "7f0e012ec1a92174cd570a36f13d8e4148271ceaf6cfd0ed82197c6fdc7b469f",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L8392"
        },
        {
          "anchor": "@@ -8449,16 +8450,38 @@ mod tests {",
          "oldStart": 8449,
          "newStart": 8450,
          "sha256": "ceca924859c0ae7267049043618029127a020220efe5467294a0c100efea8331",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L8450"
        },
        {
          "anchor": "@@ -9065,28 +9088,21 @@ mod tests {",
          "oldStart": 9065,
          "newStart": 9088,
          "sha256": "0f36684877b119d36db1c936e85f6e65b5c5f91f02e8a03e880c6917fff37157",
          "classification": "receiver-and-callback-proof",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L9088"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/type_alias.rs#L11"
        },
        {
          "anchor": "@@ -311,9 +312,12 @@ impl<'db> PEP695TypeAliasType<'db> {",
          "oldStart": 311,
          "newStart": 312,
          "sha256": "4ed9875145ac2b7b640f086e5c2776ef314d5ee1cfa8eac4e45cbb1810a14632",
          "classification": "upstream-api-migration",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/type_alias.rs#L312"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/unpacker.rs#L11"
        },
        {
          "anchor": "@@ -74,6 +74,12 @@ impl<'db, 'ast> Unpacker<'db, 'ast> {",
          "oldStart": 74,
          "newStart": 74,
          "sha256": "1a07a9fb53e903c2b05b67d284ca210bc2a8a9dbcb2cbb4b7c259d990c3ab36e",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/unpacker.rs#L74"
        },
        {
          "anchor": "@@ -90,10 +96,11 @@ impl<'db, 'ast> Unpacker<'db, 'ast> {",
          "oldStart": 90,
          "newStart": 96,
          "sha256": "2ea97f818b873077258c5c135dbe0ab7fbbb217f3c2aad9bc015d14a7695c254",
          "classification": "dictionary-comprehension-body-domain-propagation",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/unpacker.rs#L96"
        },
        {
          "anchor": "@@ -137,10 +144,9 @@ impl<'db, 'ast> Unpacker<'db, 'ast> {",
          "oldStart": 137,
          "newStart": 144,
          "sha256": "edfb4cf2deab216df0502ecc03cdca44def47a9b24be1c15d368a3f8d6486bdc",
          "classification": "reviewed-comment-only",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/unpacker.rs#L144"
        },
        {
          "anchor": "@@ -325,11 +331,8 @@ impl<'db, 'ast> Unpacker<'db, 'ast> {",
          "oldStart": 325,
          "newStart": 331,
          "sha256": "228989346db73b872936f4e88abe2840e79d87659abc1d7d77fb5a48b20241aa",
          "classification": "recursive-unpack-indeterminate-marker-classification",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/unpacker.rs#L331"
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
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_test/src/db.rs#L184"
        },
        {
          "anchor": "@@ -226,7 +227,7 @@ fn file_settings(db: &dyn SemanticDb, file: File) -> FileSettings {",
          "oldStart": 226,
          "newStart": 227,
          "sha256": "eaf664f1b9d1415a612b01d60828742791d38bc03a58913d901c9b2249817c2b",
          "classification": "test-settings-layout",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_test/src/db.rs#L227"
        },
        {
          "anchor": "@@ -238,7 +239,7 @@ enum FileSettings {",
          "oldStart": 238,
          "newStart": 239,
          "sha256": "7589d334c3d323949f573b96f9b48a7fcceb0e0a72c1625534c826b7e9d149ce",
          "classification": "test-settings-layout",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_test/src/db.rs#L239"
        },
        {
          "anchor": "@@ -247,14 +248,22 @@ impl FileSettings {",
          "oldStart": 247,
          "newStart": 248,
          "sha256": "f192398e34790ef520584ac754f621d3c2f4c8126f4382813f3f5cd1e252c1bf",
          "classification": "test-settings-layout",
          "attribution": "exact-whole-hunk",
          "reviewNote": "Byte-identical prior reviewed hunk including its anchor.",
          "source": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_test/src/db.rs#L248"
        }
      ]
    }
  ],
  "runtimeQualifiedByThisAudit": false,
  "upstreamReady": false,
  "limits": [
    "Frozen historical inventories, including the 169-unit/939-hunk solver record, remain unchanged. Exact blob-pair reuse is source evidence, not runtime proof; an absent base file is a stable input, not a nonzero blob match.",
    "These 59 forward Rust paths contain mixed runtime, API, upstream migrations and maintained tests; counts do not establish independent contributions.",
    "Every changed hunk is explicitly reviewed by exact path and whole-hunk SHA. Reuse requires exact whole or body equality, never path/start fallback.",
    "Fresh collection inference reuses prepared argument constraints and at most one completed projection. Scoped constraint order remains part of the cache identity; unsupported pack/legacy calls and incomplete outcomes keep their original handling.",
    "Official proposal ba712 is separately native-qualified and awaiting Tamir review; no upstream submission approval is implied. Related #27665 overlap remains explicit.",
    "Sty engine 14d05b98 pins 07a and passes all native/optimized and 148 unchanged corpus cases. All eight qualified community workflow updates are published; GitHub CI and reviews remain separate from completed RBE qualification. No all-fork readiness or upstream submission approval is claimed.",
    "Native 43ad results are recorded from the owner receipt, not performed by this audit. The 31 unchanged failed Markdown fixtures remain failures; external-network cases are not covered.",
    "Frozen 169-unit/939-hunk history and 250-path lineage remain unchanged. Rejected global truthiness guard stripping remains absent."
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/ambiguous.rs#L18",
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder/subscript.rs#L1896",
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/resolution.rs#L190",
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
          "label": "Shared overload contexts agree on primary and fallback",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7151",
          "blob": "c113fadc12f327faf94a2bf522bb476c8f374353"
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1639",
          "blob": "f2dae47eace1122d52e881e45d37c4a1e6bb2fb2"
        },
        {
          "label": "Observed keyword-prefix exclusions",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/arguments.rs#L551",
          "blob": "fb68ab5c18565ce7ab3cc09921cb8d4956e52a5f"
        },
        {
          "label": "Shared selector integrated with observed keywords",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9940",
          "blob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b"
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L868",
          "blob": "5d19725f68178456e30b4637a117f00c5238de79"
        },
        {
          "label": "Nested provided storage regression",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L557",
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L5453",
          "blob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b"
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L4557",
          "blob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b"
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L9250",
          "blob": "c113fadc12f327faf94a2bf522bb476c8f374353"
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9403",
          "blob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b"
        },
        {
          "label": "Existing nested non-string key rejection",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/resources/mdtest/call/local_dictionary_unpacking.md#L206",
          "blob": "0e05200de1756e67995e1e5bdde514127b60d357"
        },
        {
          "label": "Existing copied non-string key rejection",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/resources/mdtest/call/local_dictionary_unpacking.md#L328",
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/narrow.rs#L272",
          "blob": "f08f563acd3b82a1f0bc238ad8df1f4bd2d9d9a4"
        },
        {
          "label": "Comparison inference consumes cached operands",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L13851",
          "blob": "c113fadc12f327faf94a2bf522bb476c8f374353"
        },
        {
          "label": "Positive and fail-closed native contract controls",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L3197",
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_core/src/builder/dictionary_contents.rs#L474",
          "blob": "9bf157bf4d035a9b7b886f07235ba2fa7dbc100c"
        },
        {
          "label": "Mutation, rebinding and ordinary/named controls",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/provided/tests.rs#L4321",
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1289",
          "blob": "f2dae47eace1122d52e881e45d37c4a1e6bb2fb2"
        },
        {
          "label": "Operand proof and recursive child traversal",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/dictionary/contents.rs#L1256",
          "blob": "f2dae47eace1122d52e881e45d37c4a1e6bb2fb2"
        },
        {
          "label": "Ordinary/final subclasses do not satisfy LiteralString",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/resources/mdtest/annotations/literal_string.md#L425",
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10251",
          "blob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b"
        },
        {
          "label": "Sibling-dependent replay and bounded context equality",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L6322",
          "blob": "c113fadc12f327faf94a2bf522bb476c8f374353"
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/unpacker.rs#L335",
          "blob": "6367fdeb22350d7ca89748569b214d300f0f833a"
        },
        {
          "label": "Recursive payload remains visible after tuple unpacking",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/resources/mdtest/narrow/complex_target.md#L321",
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L302",
          "blob": "d6e9bbb074e893cf0586ada96f668dce38f60cc8"
        },
        {
          "label": "Per-domain scope and callback-input native controls",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L1475",
          "blob": "d6e9bbb074e893cf0586ada96f668dce38f60cc8"
        },
        {
          "label": "Domain-keyed scope query routing",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer.rs#L834",
          "blob": "5c0f11102d29947d81b58786d0e335164a042721"
        },
        {
          "label": "Union/intersection canonical method proof",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/body_domain.rs#L893",
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/class/known.rs#L321",
          "blob": "9a8cfa890cc1a6489288418208a86ae7a4ffcd29"
        },
        {
          "label": "Original exact immutable contradiction proof remains",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/set_theoretic/builder.rs#L2683",
          "blob": "ad83d83b7183a271940b764bec5fc4e8a530146f"
        },
        {
          "label": "Open int subclass stays conservative",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/resources/mdtest/narrow/truthiness.md#L227",
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L3547",
          "blob": "88576e91defcda500d7cf02525314f321fa8d438"
        },
        {
          "label": "Caller domain proof before single-alternative family retention",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints/solutions.rs#L2182",
          "blob": "62ea11eb60d205c383c77ba131c2c5c90c1b9b78"
        },
        {
          "label": "Maintained callback correlation regression",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/resources/mdtest/generics/pep695/functions.md#L6271",
          "blob": "bb437c45046408d685777e1ab3ad604f09457295"
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/signatures.rs#L3868",
          "blob": "5d19725f68178456e30b4637a117f00c5238de79"
        },
        {
          "label": "Legacy caller domains and invariant negatives",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/resources/mdtest/generics/legacy/callables.md#L2244",
          "blob": "e6f703efc6136a6dd2813353a2e10f480b19363e"
        },
        {
          "label": "PEP695 caller domains and invariant negatives",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/resources/mdtest/generics/pep695/callables.md#L2172",
          "blob": "b9ea1a0d0892980e03e6bb769645488bfd05f9ca"
        }
      ],
      "trackerParent": "ty-solver-inference",
      "independentPullRequestClaim": false,
      "runtimeQualifiedByThisAudit": false,
      "upstreamReady": false
    },
    {
      "id": "fresh-bounded-collection-sibling-context",
      "title": "Infer compatible fresh collection context from reusable sibling evidence",
      "classification": "Tentative sibling context with result compatibility fallback, prepared ordered argument evidence and complete-only bounded-retention projection reuse; authoritative supplied-field context remains separate.",
      "nextAction": "Review official proposal ba712 with Tamir before submission. Preserve valid-call literal return precision, heterogeneous widening, callback/stored-wide rejection and per-expression fallback; coordinate overlap with #27665. Fork optimization includes scoped ordering-key adaptation and retained supplied-field precedence; native qualification is separate from pending Sty host gates.",
      "evidence": [
        {
          "label": "Complete sibling-only inference with reusable prepared evidence",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10844",
          "blob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b"
        },
        {
          "label": "Fresh display/comprehension eligibility",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7021",
          "blob": "c113fadc12f327faf94a2bf522bb476c8f374353"
        },
        {
          "label": "Maintained callback literal result and same-kind rejection (PEP695; paired legacy coverage)",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/resources/mdtest/generics/pep695/functions.md#L157",
          "blob": "bb437c45046408d685777e1ab3ad604f09457295"
        },
        {
          "label": "Tentative preference retains ordinary fallback provenance",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9766",
          "blob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b"
        },
        {
          "label": "Actual fresh result compatibility selects inference branch",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/infer/builder.rs#L7045",
          "blob": "c113fadc12f327faf94a2bf522bb476c8f374353"
        },
        {
          "label": "Authoritative supplied readonly or immutable field context",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L10591",
          "blob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b"
        },
        {
          "label": "Maintained heterogeneous TypedDict pair widening regression",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/resources/mdtest/generics/pep695/functions.md#L187",
          "blob": "bb437c45046408d685777e1ab3ad604f09457295"
        },
        {
          "label": "Ordered per-relation pending contributions and source-group validation",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L7858",
          "blob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b"
        },
        {
          "label": "Call-owned last complete projection; selection and validation remain outside",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/call/bind.rs#L9606",
          "blob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b"
        },
        {
          "label": "Scoped immediate constraint identities retained in cache equality",
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_python_semantic/src/types/constraints.rs#L1723",
          "blob": "88576e91defcda500d7cf02525314f321fa8d438"
        }
      ],
      "trackerParent": "ty-contextual-empty",
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
      "baseBlob": "43aadad2402d30c56f8ecb9f7d4eb0437562766c",
      "candidateBlob": "7d37c907614a893849e622aba6bb3ee7d7c0fd3d",
      "status": "M",
      "frozenRecord": [
        "embedded-ide-entrypoints-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "f7f62ab284af26f8d3e93feb44dc8159f58ba26e",
      "frozenCandidateBlob": "751fd3167465700d4c62960d6661600fbd98dce5",
      "disposition": "forward-source-attributed"
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
      "baseBlob": "6189d61f59fb8988a913f131d559858376df3081",
      "candidateBlob": "65ccee4697c8729f850e37dbd2082cbd3a9ca11f",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "b1f30fd5d26df6c33dd2b1b9a128e87e27cb927a",
      "frozenCandidateBlob": "8ec5fbe176c9e39bd51e75452c43a4d89d5c8050",
      "disposition": "forward-source-attributed"
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
      "candidateBlob": "e47e40f055efb6e875b254985aeac105ccbe9ae8",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": true,
      "semanticReuse": "requires-forward-source-review",
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
      "candidateBlob": "665f49c680ad1bd3cc90078ba412fefb420ccab7",
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
      "candidateBlob": "bb437c45046408d685777e1ab3ad604f09457295",
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
      "baseBlob": "053d8e234660a0206e4c81de9048c19cbdecd7dc",
      "candidateBlob": "c90ded690638409c499808eadafda5d8287e1e9c",
      "status": "M",
      "frozenRecord": [],
      "frozenRole": "supporting-tests",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
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
      "baseBlob": "c982a5ccda9972108f59b444ead8c2ec47d64bd5",
      "candidateBlob": "3815e7796ec150660d9c0e24f4875b0356ea4ede",
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
      "baseBlob": "c207617632b443c3f503f8dfe5d28d72b6691a11",
      "candidateBlob": "f8f8242f187ddee58b26c721ae71ce6e8dab019d",
      "status": "M",
      "frozenRecord": [
        "semantic-flow-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "76003e52c913c6cf7bc6bdd3a164ebdf86dc1ae0",
      "frozenCandidateBlob": "df4da5c5afc668612e76dcd1faaddbacfd620ffa",
      "disposition": "forward-source-attributed"
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
      "baseBlob": "4a87b508bf5f969afa2e05d88bdff2ccb1d60760",
      "candidateBlob": "46b4b8bc49c8a2aa916fcc6ab2cdc20b12ce96ae",
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
      "candidateBlob": "1b0083a9fd4a82650ffd2390cd0ebc6c2478ed4b",
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
      "baseBlob": "239bb50d67d1ab16966187b6abeb1cad8d4041f4",
      "candidateBlob": "5cba86c2ae17dc4fba4190db0f19b95a441e8302",
      "status": "M",
      "frozenRecord": [
        "producer-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "41ebe8b231a8db6e22befe5438844a5b82b2825c",
      "frozenCandidateBlob": "1d59a9f34398bdcefce882cf604d474c181b1d9a",
      "disposition": "forward-source-attributed"
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
      "baseBlob": "da2fbbf1baeaf77dee8a2887e9dc43e0c0964303",
      "candidateBlob": "78450fa9e2337629117b76992f7303b4e94d0726",
      "status": "M",
      "frozenRecord": [
        "class-call-context-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "de3296c5d09e52f8107b7e6dab90c574dbf4ee60",
      "frozenCandidateBlob": "14ca4ef54b9a2206653f64211747cc8d795ec92f",
      "disposition": "forward-source-attributed"
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
      "baseBlob": "6de68cb6df38b67fdbdd23a70cbf7a0c2445b196",
      "candidateBlob": "88576e91defcda500d7cf02525314f321fa8d438",
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
      "baseBlob": "efe7fd9b2595468c94e3e78893fcf311ca79570b",
      "candidateBlob": "f164f0adbc5f919e654dc718b293bbfd64f70c3f",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "2f93d0d2a2fd2627ebdcea82e11545c13d557e09",
      "frozenCandidateBlob": "5cf7b29bec63d9f526eb8872b6529053ce823811",
      "disposition": "forward-source-attributed"
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
      "baseBlob": "38279f6c94b4a715373d51501038a697b5e10d2c",
      "candidateBlob": "62ea11eb60d205c383c77ba131c2c5c90c1b9b78",
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
      "baseBlob": "1a2dd0b41773de52bd2ee8f17404b97844b25b37",
      "candidateBlob": "44c49785f856b490ae302f8f19a967924fa0bb43",
      "status": "M",
      "frozenRecord": [
        "solver-hunk-inventory-7120f37e.json (reuse/forward limits recorded in class-call-context inventory)"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "2c741f5c5401ccfc003e8fabcbb046af5e6122dd",
      "frozenCandidateBlob": "bbc05fec532d793df602ee522706c6ba14aa79ef",
      "disposition": "forward-source-attributed"
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
      "baseBlob": "8e5ee90f78b5deabd9d25340594243a55bd8457a",
      "candidateBlob": "000fb5ac30788ee6c116f696102edea0b52f6068",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "7a1ab4668c8ed230dd77d19cf5af9b351bca6ce2",
      "frozenCandidateBlob": "372e5531b14fc9e1f364d77d5b1145ac77ee5148",
      "disposition": "forward-source-attributed"
    },
    {
      "path": "crates/ty_python_semantic/src/types/enums.rs",
      "oldMode": "100644",
      "newMode": "100644",
      "baseBlob": "225098abafd2f08b25e84fed52d975f767451feb",
      "candidateBlob": "ce804b544517d3fbe2537f62320a87b11d00c904",
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
      "baseBlob": "3bca5108e588f010fd93c45a2ee09eaff8fd277e",
      "candidateBlob": "050f44bd6f806933b05154ae071fa494c4d000a7",
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
      "baseBlob": "27dabd087b49a957445d4ec379a9f7561509bcc3",
      "candidateBlob": "c113fadc12f327faf94a2bf522bb476c8f374353",
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
      "baseBlob": "76081fadd72cd0452566e76e4c12ecde495af337",
      "candidateBlob": "b08fe3a80a7467e1899a296ee728869b2bdfcc77",
      "status": "M",
      "frozenRecord": [
        "small-runtime-consumers-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "085171bac7203174a660b1bcb8dd27c074c90d14",
      "frozenCandidateBlob": "860cac4057630e2c25b63696e8e280cf66dd9ee9",
      "disposition": "forward-source-attributed"
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
      "baseBlob": "96549ac71e9f05fcd8cb71ac23d7caec18152d22",
      "candidateBlob": "e506040d5b97fcf60fad0552b90e37a0f3b7b4a7",
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
      "baseBlob": "94badf89a8349a31aff834de33aead4cc6f28460",
      "candidateBlob": "a5b3719ca8b298f3cce585605fe79b086fece14c",
      "status": "M",
      "frozenRecord": [
        "instance-schema-hunk-inventory-dfe98a7d.json"
      ],
      "frozenRole": "runtime-or-public-api-needs-hunk-review",
      "sameCandidateBlobAsFrozen": false,
      "sameBaseBlobAsFrozen": false,
      "semanticReuse": "requires-forward-source-review",
      "frozenBaseBlob": "617d9fdfa5fbf7b715517266074ccc6e848c6d68",
      "frozenCandidateBlob": "890aefab04f2c500d0ef5aa3751e4ffab5628356",
      "disposition": "forward-source-attributed"
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
      "baseBlob": "c44c00d1fe14b7512ec820af893588742a6b684c",
      "candidateBlob": "ad83d83b7183a271940b764bec5fc4e8a530146f",
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
  "sourceCommand": "git diff --raw --no-abbrev --no-renames 75fabee2e0a069b6bf5a1af4226025afa0324fa5 07a4f30c36d8f27455d2785f9abef566e0bf3641",
  "deployment": {
    "pinnedSty": "14d05b98238e2c0bf7773c81bbeb209861a7145b",
    "pinnedRuff": "07a4f30c36d8f27455d2785f9abef566e0bf3641",
    "auditedCandidate": "07a4f30c36d8f27455d2785f9abef566e0bf3641",
    "candidateIsPinned": true,
    "detail": "Sty engine 14d05b98 pins Ruff 07a4f30c. All eight native targets, the optimized build and 148 unchanged corpus cases pass. All eight qualified community workflow updates are published; their GitHub CI and review status is tracked separately."
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
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30641",
      "commit": "11e94e28284d620fe29495dad480f2bd8c219ae2",
      "title": "TypedDict literal candidate filtering"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30650",
      "commit": "9ca2a80e78ed2e4538ab3444606c7d560e0b9a82",
      "title": "Solver path cache-key single scan"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30646",
      "commit": "cd2d973241d7f5bcba588e94cc686d9e356a4621",
      "title": "Legacy namespace source-scan cache"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30698",
      "commit": "75fabee2e0a069b6bf5a1af4226025afa0324fa5",
      "title": "[ty] Skip impossible subtype checks for strings in class object unions (#30698)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30702",
      "commit": "295982d1919680d1c63af946e8f0bac8bae344a2",
      "title": "[ty] Skip inclusion checks when selecting a program under a source root (#30702)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30665",
      "commit": "dd5afa8e5338a2fb81fa1ce26cde97dc0d03d0e3",
      "title": "[ty] Skip unrelated definitions and imports in semantic token range requests (#30665)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30680",
      "commit": "b7014a05ff6db310ca2b3b24f6d82263067d17a6",
      "title": "[ty] Defer constructing instance types during generated member lookup (#30680)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30714",
      "commit": "b2287d635d9be03e9f57452c15cb0a16b4fe3e50",
      "title": "[ty] Filter member completions before looking up documentation (#30714)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30645",
      "commit": "661a84100c4736f507090dd31143069215a451df",
      "title": "[ty] Reuse materializations of shared unions (#30645)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30674",
      "commit": "68354a7ba38109ca6648209bfcc487991b5f5f70",
      "title": "[ty] Skip unnecessary member lookups for enum values (#30674)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30671",
      "commit": "bda568d1b665fe1581b38f749debc5ecb25f9643",
      "title": "[ty] Avoid rebuilding ordinary function signatures to check for type guards (#30671)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30667",
      "commit": "4cdf7cacc3f3dc4413579a718eef755095d801d2",
      "title": "[ty] Skip tuple specialization for unrelated nominal targets (#30667)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30684",
      "commit": "dee3e8cd82a330678da00c023be4a6a71d125a94",
      "title": "[ty] Avoid quadratic deduplication when displaying literal unions (#30684)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30668",
      "commit": "1b0606b218e6fbede35d22c8921c6c71f7ebfdac",
      "title": "[ty] Defer semantic indexing until `__all__` analysis needs an expression type (#30668)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30700",
      "commit": "cb79f61f9f3d1eeb13833d05ad42c602cee123af",
      "title": "[ty] Skip prefix checks when no outer scope can bind a member (#30700)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30643",
      "commit": "31cfa858b944e879929aeb63dcadf95faeffb286",
      "title": "[ty] Reuse unchanged specializations during cycle recovery (#30643)"
    },
    {
      "pullRequest": "https://github.com/astral-sh/ruff/pull/30658",
      "commit": "f29d832189bb5eeeabb0898c823aa4a7e42e2ba6",
      "title": "[ty] Skip impossible coverage checks in constraint diagrams (#30658)"
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/bazel/rust_crate.bzl"
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ruff_command_line/BUILD.bazel"
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty/BUILD.bazel"
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
          "url": "https://github.com/tamird/ruff/blob/07a4f30c36d8f27455d2785f9abef566e0bf3641/crates/ty_server/BUILD.bazel"
        }
      ]
    }
  ],
  "reconciliation": {
    "previousCandidate": "940e9c43b2fff543b344863986159b3fda11ae46",
    "exactWholeHunksReused": 271,
    "exactBodiesWithShiftedAnchors": 110,
    "explicitCurrentHunkReviews": 74,
    "priorAuditSHA256": "04df91174594d15688ebaeb02069f16f62a0840400faaf7c1db2e3fd377bf228"
  },
  "qualificationObservation": {
    "candidate": "07a4f30c36d8f27455d2785f9abef566e0bf3641",
    "status": "Native and Sty integration qualified; all eight qualified community workflow updates are published. GitHub CI and reviews are tracked separately.",
    "runtimeQualifiedByThisAudit": false,
    "nativeQualificationReportedSeparately": true,
    "invocation": "43ad4d02-b014-4606-b1e5-35fdc81f700a",
    "all26PostimagesVerified": true,
    "corePassed": 101,
    "semanticPassed": 904,
    "semanticIgnored": 35,
    "idePassed": 1979,
    "passedFixtures": 507,
    "failedFixtures": 31,
    "inventoryActionExcludedFromAggregate": true,
    "all31FailureBodiesMatchPrior": true,
    "runtimeReceiptSHA256": "22e6a5f4328a28c5396599323b9eb091c901adfeb0a67a10e700675834a6c578",
    "globalGuardStrippingPresent": false,
    "defaultPromotionApprovedByThisAudit": false,
    "styIntegrationQualified": true,
    "styRevision": "14d05b98238e2c0bf7773c81bbeb209861a7145b",
    "styTestsURL": "https://app.buildbuddy.io/invocation/1aa1749b-e3e7-4d35-9fbc-669a2207b7c1",
    "styOptimizedBuildURL": "https://app.buildbuddy.io/invocation/8a801ba7-161c-4566-834b-7d91c8146965",
    "realCorpusPassed": 148,
    "realCorpusFailed": 0,
    "realCorpusFixtureChanges": 0,
    "communityChecksExecuted": 20,
    "communityRefreshPublished": true
  },
  "upstreamOnlyChanges": [
    {
      "path": "crates/ty_module_resolver/src/resolve.rs",
      "officialBlob": "f3dc9fd2d557ffad967c5878c2ade85a80d08698",
      "candidateBlob": "f3dc9fd2d557ffad967c5878c2ade85a80d08698",
      "classification": "upstream-only-legacy-namespace-scan-cache",
      "detail": "Official #30646 moves the ASCII pkg source scan inside has_legacy_namespace_declaration tracked query; stdlib exclusion remains outside. No residual fork change, no extra runtime-net path or fork PR.",
      "evidence": [
        {
          "label": "Official tracked source-scan owner",
          "url": "https://github.com/astral-sh/ruff/blob/75fabee2e0a069b6bf5a1af4226025afa0324fa5/crates/ty_module_resolver/src/resolve.rs#L1698"
        }
      ]
    }
  ]
};
