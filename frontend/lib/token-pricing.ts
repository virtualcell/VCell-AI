// LiteLLM tracks spend in USD, but a dollar figure means little to someone
// deciding whether they can afford another question. These helpers convert
// that spend into an approximate token count for display only — nothing here
// is sent back to LiteLLM, which still owns the real (dollar) budget.
//
// gpt-4o-mini is the reference model for the conversion (OpenAI list price):
//   input  $0.15 per 1M tokens
//   output $0.60 per 1M tokens
//
// A single conversion factor needs one blended rate, which needs an assumed
// input:output mix. Chat traffic here is input-heavy — every call resends the
// ~1.6K-token system prompt plus the conversation history and any tool
// results, against a comparatively short markdown answer — so we assume 4:1.
// Adjust INPUT_OUTPUT_RATIO if real usage turns out to differ; everything
// below derives from it.

export const USD_PER_1M_INPUT_TOKENS = 0.15;
export const USD_PER_1M_OUTPUT_TOKENS = 0.6;
export const INPUT_OUTPUT_RATIO = 4;

// Weighted average cost of one token under the assumed mix: $0.24 per 1M.
export const BLENDED_USD_PER_1M_TOKENS =
  (INPUT_OUTPUT_RATIO * USD_PER_1M_INPUT_TOKENS + USD_PER_1M_OUTPUT_TOKENS) /
  (INPUT_OUTPUT_RATIO + 1);

// ~4,166,667 tokens per dollar.
export const TOKENS_PER_USD = 1_000_000 / BLENDED_USD_PER_1M_TOKENS;

export const usdToTokens = (usd: number): number => usd * TOKENS_PER_USD;

// One decimal at most, with a bare integer when the decimal would be ".0".
const compact = (value: number): string =>
  Number(value.toFixed(1)).toLocaleString("en-US");

/**
 * Render a token count for the UI: "Unlimited" for a null (uncapped) budget,
 * otherwise an abbreviated count — "4.2M", "850K", "312".
 */
export const formatTokens = (tokens: number | null): string => {
  if (tokens === null) {
    return "Unlimited";
  }

  const magnitude = Math.abs(tokens);

  if (magnitude >= 1_000_000) {
    return `${compact(tokens / 1_000_000)}M`;
  }

  if (magnitude >= 1_000) {
    return `${compact(tokens / 1_000)}K`;
  }

  return Math.round(tokens).toLocaleString("en-US");
};

/** Convenience wrapper: dollars straight to a display-ready token count. */
export const formatUsdAsTokens = (usd: number | null): string =>
  usd === null ? "Unlimited" : formatTokens(usdToTokens(usd));
