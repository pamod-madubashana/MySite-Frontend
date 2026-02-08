import { Helmet } from "react-helmet-async";

const SITE_URL = "https://pamod.is-a.dev";
const SITE_NAME = "Pamod Madubashana";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og.png`;
const WEBSITE_ID = `${SITE_URL}/#website`;

interface PageSeoProps {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  ogImage?: string;
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
}: PageSeoProps) => {
  const canonicalUrl = buildCanonicalUrl(path);
  const ogImageUrl = buildAbsoluteUrl(ogImage);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        inLanguage: "en",
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: { "@id": WEBSITE_ID },
        inLanguage: "en",
      },
    ],
  };

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow,max-image-preview:large" />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      <script id="webpage-jsonld" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default PageSeo;
