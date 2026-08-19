export function siteOrigin() {
  const configured = process.env.APP_ORIGIN?.replace(/\/$/, "");
  if (configured) return configured;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "https://www.rft.money";
}
