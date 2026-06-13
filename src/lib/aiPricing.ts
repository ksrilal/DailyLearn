/** Approximate list prices in USD per 1M tokens, for estimating AI usage cost.
 * These are indicative only (actual provider pricing may vary or change). */
const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-5-mini': { input: 0.25, output: 2 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-sonnet-4-5': { input: 3, output: 15 },
  'gemini-2.5-flash': { input: 0.3, output: 2.5 },
  'gemini-2.5-pro': { input: 1.25, output: 10 },
};

const DEFAULT_PRICING = { input: 1, output: 5 };

/** Estimates the USD cost of a single request given its model and token counts. */
export function estimateCost(model: string | null | undefined, inputTokens: number, outputTokens: number): number {
  const rates = (model ? PRICING[model] : undefined) ?? DEFAULT_PRICING;
  return (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output;
}

/** Formats a USD cost for display, showing more precision for very small amounts. */
export function formatCost(usd: number): string {
  if (usd === 0) return '$0.00';
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}
