export default function sitemap() {
  const baseUrl = "https://www.dilodoor.com";

  const routes = [
    "",
    "products",
    "all-products",
    "about-us",
    "product/[id]",
    "/cosmetics",
    "/clothing",
    "/shoes",
    "/blankets",
    "/accessories",
    "/electronics",
    "/other",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  return [...routes];
}
