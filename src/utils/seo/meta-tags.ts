import type { MetaTagsOptions } from "./types";

export function updateMetaTags(options: MetaTagsOptions): void {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = "website",
  } = options;

  if (title) {
    document.title = title;
    updateOrCreateMetaTag("og:title", title);
    updateOrCreateMetaTag("twitter:title", title);
  }

  if (description) {
    updateOrCreateMetaTag("description", description);
    updateOrCreateMetaTag("og:description", description);
    updateOrCreateMetaTag("twitter:description", description);
  }

  if (keywords && keywords.length > 0) {
    updateOrCreateMetaTag("keywords", keywords.join(", "));
  }

  if (image) {
    updateOrCreateMetaTag("og:image", image);
    updateOrCreateMetaTag("twitter:image", image);
  }

  if (url) {
    updateOrCreateMetaTag("og:url", url);
    updateOrSetCanonical(url);
  }

  if (type) {
    updateOrCreateMetaTag("og:type", type);
  }
}

function updateOrCreateMetaTag(name: string, content: string): void {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;

  if (!meta) {
    meta = document.querySelector(
      `meta[property="${name}"]`
    ) as HTMLMetaElement;
  }

  if (!meta) {
    meta = document.createElement("meta");
    const isProperty = name.startsWith("og:") || name.startsWith("twitter:");

    if (isProperty) {
      meta.setAttribute("property", name);
    } else {
      meta.setAttribute("name", name);
    }

    document.head.appendChild(meta);
  }

  meta.content = content;
}

function updateOrSetCanonical(href: string): void {
  let link = document.querySelector(`link[rel="canonical"]`) as HTMLLinkElement;

  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }

  link.href = href;
}

export function setCanonical(url: string): void {
  updateOrSetCanonical(url);
}

export function getMetaTags(): MetaTagElement[] {
  const metas = document.querySelectorAll("meta");
  return Array.from(metas).map((meta) => ({
    name: meta.getAttribute("name") || meta.getAttribute("property") || "",
    content: meta.getAttribute("content") || "",
  }));
}

export function removeMetaTag(name: string): void {
  const meta =
    document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`);

  if (meta) {
    meta.remove();
  }
}

export function clearMetaTags(): void {
  const essentialTags = ["charset", "viewport"];
  document.querySelectorAll("meta").forEach((meta) => {
    const name =
      meta.getAttribute("name") || meta.getAttribute("property") || "";
    if (!essentialTags.includes(name)) {
      meta.remove();
    }
  });
}

interface MetaTagElement {
  name: string;
  content: string;
}
