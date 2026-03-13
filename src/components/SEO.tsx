import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Cercle de Gouvernance de l'IA";
const SITE_URL = "https://gouvernance.ai";
const DEFAULT_IMAGE = `${SITE_URL}/images-gouvernance-ai/ceo-analysing.jpg`;
const DEFAULT_IMAGE_ALT = "Cercle de Gouvernance de l'IA — Gouvernance responsable";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  type?: string;
  noindex?: boolean;
  /** ISO date string for article pages */
  publishedTime?: string;
  /** ISO date string — defaults to publishedTime if omitted */
  modifiedTime?: string;
  /** Author name for article pages */
  authorName?: string;
  /** Article section / category */
  articleSection?: string;
  /** Article tags / keywords */
  tags?: string[];
  /** Reading time in minutes */
  readingTime?: number;
}

/**
 * Lightweight SEO component — updates <head> meta tags on each page.
 * No external dependency required (works with React 19).
 *
 * All meta tags are set via DOM manipulation in useEffect, which means:
 * - Client-side: tags update on navigation
 * - Prerendered: Puppeteer captures the final state including these tags
 */
export function SEO({
  title,
  description,
  image,
  imageAlt,
  type = "website",
  noindex = false,
  publishedTime,
  modifiedTime,
  authorName,
  articleSection,
  tags,
  readingTime,
}: SEOProps) {
  const { pathname } = useLocation();

  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Gouvernance responsable de l'intelligence artificielle`;

  const desc =
    description ??
    "Le Cercle de Gouvernance de l'IA réunit 150+ experts pour vous accompagner dans la conformité, l'éthique et la stratégie IA. Conforme Loi 25 et NIST AI.";

  const img = image ?? DEFAULT_IMAGE;
  const imgAlt = imageAlt ?? (title ? `${title} — ${SITE_NAME}` : DEFAULT_IMAGE_ALT);
  const url = `${SITE_URL}${pathname}`;

  useEffect(() => {
    // ---- Title ----
    document.title = fullTitle;

    // ---- Helpers ----
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const removeMeta = (attr: string, key: string) => {
      document.querySelector(`meta[${attr}="${key}"]`)?.remove();
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // ---- Standard meta ----
    setMeta("name", "description", desc);
    setMeta(
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );
    setLink("canonical", url);

    // ---- Open Graph ----
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:image:alt", imgAlt);
    setMeta("property", "og:type", type);
    setMeta("property", "og:locale", "fr_CA");
    setMeta("property", "og:site_name", SITE_NAME);

    // ---- Twitter Card ----
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);
    setMeta("name", "twitter:image:alt", imgAlt);

    // ---- Keywords ----
    if (tags?.length) {
      setMeta("name", "keywords", tags.join(", "));
    }

    // ---- Article-specific meta ----
    if (type === "article") {
      if (publishedTime) {
        setMeta("property", "article:published_time", publishedTime);
        setMeta("property", "article:modified_time", modifiedTime ?? publishedTime);
      }
      if (authorName) {
        setMeta("property", "article:author", authorName);
      }
      if (articleSection) {
        setMeta("property", "article:section", articleSection);
      }

      // Each tag as a separate <meta property="article:tag"> (proper Open Graph format)
      document.querySelectorAll('meta[property="article:tag"]').forEach((el) => el.remove());
      if (tags?.length) {
        for (const tag of tags) {
          const el = document.createElement("meta");
          el.setAttribute("property", "article:tag");
          el.setAttribute("content", tag);
          document.head.appendChild(el);
        }
      }

      // Twitter labels for article metadata
      if (readingTime) {
        setMeta("name", "twitter:label1", "Temps de lecture");
        setMeta("name", "twitter:data1", `${readingTime} min`);
      }
      if (authorName) {
        setMeta("name", "twitter:label2", "Auteur");
        setMeta("name", "twitter:data2", authorName);
      }
    } else {
      // Clean up article-specific metas when navigating to a non-article page
      removeMeta("property", "article:published_time");
      removeMeta("property", "article:modified_time");
      removeMeta("property", "article:author");
      removeMeta("property", "article:section");
      document.querySelectorAll('meta[property="article:tag"]').forEach((el) => el.remove());
      removeMeta("name", "twitter:label1");
      removeMeta("name", "twitter:data1");
      removeMeta("name", "twitter:label2");
      removeMeta("name", "twitter:data2");
    }

    // Clean up legacy indexed article:tag format
    document.querySelectorAll('meta[property^="article:tag:"]').forEach((el) => el.remove());
  }, [fullTitle, desc, img, imgAlt, url, type, noindex, publishedTime, modifiedTime, authorName, articleSection, tags, readingTime]);

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
