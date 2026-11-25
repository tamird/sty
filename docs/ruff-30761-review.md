# Ruff #30761 review notes

The earlier revision, `142c9403b`, used global widening. The current revision confines widening to inferred `or` expressions. The comparison below used the earlier revision. [Ruff PR](https://github.com/astral-sh/ruff/pull/30761)

## Could typeshed fix the `split` error?

The comparison ran the same two calls on the upstream parent, on that parent with the specialized `split`, `rsplit`, and `splitlines` overloads removed, and on the published Ruff revision with the original stubs. The calls tested a fallback receiver, `(value or "").split(",")` for `value: str`, and a `LiteralString` receiver.

| Revision | Fallback returns `list[str]` | Literal receiver returns `list[LiteralString]` |
| --- | --- | --- |
| Upstream parent | Fails | Passes |
| Stub-only change | Passes | Fails |
| Earlier Ruff revision | Passes | Passes |

The original error comes from list invariance. The fallback inferred `list[str] | list[LiteralString]`, which cannot be returned as `list[str]`. The stub-only change removes that union by giving both receivers `list[str]`. The literal receiver then loses the guarantee that the elements are literal strings. [Alex’s question](https://github.com/astral-sh/ruff/pull/30761#issuecomment-7167004660) · [RBE comparison](https://app.buildbuddy.io/invocation/3a83c724-9a58-4307-89d3-e35cc8ea6063) · [Typeshed discussion](https://github.com/python/typeshed/issues/10887)

## What remains open?

- The ecosystem report shows one confirmed error fixed in the split family, in pytest-autoprofile. It does not establish a comparable fix outside that family. [Ecosystem report](https://github.com/astral-sh/ruff/pull/30761#issuecomment-7133073013)
- The earlier rule also widens unions users write explicitly. For example, `(str & ~AlwaysFalsy) | Literal[""]` widens to `str` and admits falsy subclass instances that the explicit union excluded. Both split probes can pass while that precision tradeoff remains. [Alex on public type forms](https://github.com/astral-sh/ruff/pull/30761#issuecomment-7167092595) · [Earlier revision](https://github.com/tamird/ruff/commit/142c9403b03b7e03d5559663823689da81cca214)
