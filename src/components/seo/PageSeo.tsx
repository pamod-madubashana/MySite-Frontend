import { Helmet } from "react-helmet-async";

const SITE_URL = "https://pamod.is-a.dev";
const SITE_NAME = "Pamod Madubashana";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og.png`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PERSON_ID = `${SITE_URL}/#person`;

type JsonLdEntry = Record<string, unknown>;

interface PageSeoProps {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  ogImage?: string;
  keywords?: string[];
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: JsonLdEntry | JsonLdEntry[];
}

const buildCanonicalUrl = (path: string) => {
  if (!path || path === "/") {
    return `${SITE_URL}/`;
  }

  const pathWithSlash = path.startsWith("/") ? path : `/${path}`;
  const normalizedPath = pathWithSlash.replace(/\/+$/, "");

  return `${SITE_URL}${normalizedPath}`;
};

const buildAbsoluteUrl = (pathOrUrl: string) => {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;

  return `${SITE_URL}${normalizedPath}`;
};

const PageSeo = ({
  title,
  description,
  path,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  keywords,
  noIndex = false,
  publishedTime,
  modifiedTime,
  structuredData,
}: PageSeoProps) => {
  const canonicalUrl = buildCanonicalUrl(path);
  const ogImageUrl = buildAbsoluteUrl(ogImage);
  const robotsContent = noIndex
    ? "noindex,nofollow,noarchive,max-image-preview:large"
    : "index,follow,max-image-preview:large";

  const jsonLdNodes: JsonLdEntry[] = [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      inLanguage: "en",
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      jobTitle: "Full-Stack Developer",
      sameAs: [
        "https://github.com/pamod-madubashana",
        "https://www.linkedin.com/in/pamod-madubashana-886b621a2",
        "https://t.me/pamod_madubashana",
      ],
    },
    {
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
      inLanguage: "en",
    },
  ];

  if (structuredData) {
    if (Array.isArray(structuredData)) {
      jsonLdNodes.push(...structuredData);
    } else {
      jsonLdNodes.push(structuredData);
    }
  }

  const jsonLdPayload = {
    "@context": "https://schema.org",
    "@graph": jsonLdNodes,
  };

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 ? <meta name="keywords" content={keywords.join(", ")} /> : null}
      <meta name="robots" content={robotsContent} />
      <meta name="author" content={SITE_NAME} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {ogType === "article" && publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
      {ogType === "article" && modifiedTime ? <meta property="article:modified_time" content={modifiedTime} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:site" content="@pamod_madubashana" />

      <script id="webpage-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLdPayload)}
      </script>
    </Helmet>
  );
};

export default PageSeo;
