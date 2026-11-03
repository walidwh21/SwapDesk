export const shortAddress = (addr = "", head = 6, tail = 4) =>
  addr.length > head + tail ? `${addr.slice(0, head)}…${addr.slice(-tail)}` : addr;

/** Trim a decimal string to at most `dp` fraction digits without rounding noise. */
export const trimAmount = (value, dp = 5) => {
  if (value === undefined || value === null || value === "") return "0";
  const [int, frac = ""] = String(value).split(".");
  const cut = frac.slice(0, dp).replace(/0+$/, "");
  return cut ? `${int}.${cut}` : int;
};

export const compactNumber = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "–";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(x);
};

export const usd = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "–";
  return `$${compactNumber(x)}`;
};

export const feeLabel = (fee) => `${(Number(fee) / 10000).toString()}%`;

export const isPositiveNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};
