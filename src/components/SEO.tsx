import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Cercle de Gouvernance de l'IA";
const SITE_URL = "https://gouvernance.ai";
const DEFAULT_IMAGE = `${SITE_URL}/images-gouvernance-ai/ceo-analysing.jpg`;

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  /** ISO date string for article pages */
  publishedTime?: string;
  /** Author name for article pages */
  authorName?: string;
  /** Article section / category */
  articleSection?: string;
  /** Article tags / keywords */
  tags?: string[];
}

/**
 * Lightweight SEO component — updates <head> meta tags on each page.
 * No external dependency required (works with React 19).
 */
export function SEO({
  title,
  description,
  image,
  type = "website",
  noindex = false,
  publishedTime,
  authorName,
  articleSection,
  tags,
}: SEOProps) {
  const { pathname } = useLocation();

  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Gouvernance responsable de l'intelligence artificielle`;

  const desc =
    description ??
    "Le Cercle de Gouvernance de l'IA réunit 150+ experts pour vous accompagner dans la conformité, l'éthique et la stratégie IA. Conforme Loi 25 et NIST AI.";

  const img = image ?? DEFAULT_IMAGE;
  const url = `${SITE_URL}${pathname}`;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Helper to set a <meta> tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Helper to set <link> tag
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // Standard meta
    setMeta("name", "description", desc);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setLink("canonical", url);

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:type", type);

    // Twitter
    setMeta("name", "twitter:card", type === "article" ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);

    // Keywords
    if (tags?.length) {
      setMeta("name", "keywords", tags.join(", "));
    }

    // Article-specific meta
    if (publishedTime) {
      setMeta("property", "article:published_time", publishedTime);
      setMeta("property", "article:author", authorName ?? "");
    }
    if (articleSection) {
      setMeta("property", "article:section", articleSection);
    }
    if (tags?.length) {
      tags.forEach((tag, i) => {
        setMeta("property", `article:tag:${i}`, tag);
      });
    }

    // Always set locale and site name
    setMeta("property", "og:locale", "fr_CA");
    setMeta("property", "og:site_name", SITE_NAME);
  }, [fullTitle, desc, img, url, type, noindex, publishedTime, authorName, articleSection, tags]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  JSON-LD HELPER                                                      */
/* ------------------------------------------------------------------ */

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Injects a JSON-LD script tag into <head> for structured data.
 */
let jsonLdCounter = 0;

export function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    const type = String(data["@type"] ?? "unknown");
    const id = `jsonld-${type.replace(/\W/g, "")}-${++jsonLdCounter}`;
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);

    return () => {
      script?.remove();
    };
  }, [data]);

  return null;
}
