import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Calendar, ArrowRight, Tag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { articleApi, Article } from "@/api/articleApi";
import PageSeo from "@/components/seo/PageSeo";
import DynamicPageBackground from "@/components/DynamicPageBackground";

interface ArticlesPageCache {
  timestamp: number;
  articles: Article[];
}

const ARTICLES_PAGE_CACHE_KEY = "articles:page:cache:v1";
const ARTICLES_PAGE_CACHE_TTL = 15 * 60 * 1000;

const readArticlesPageCache = (): ArticlesPageCache | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawCache = window.localStorage.getItem(ARTICLES_PAGE_CACHE_KEY);
  if (!rawCache) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawCache) as ArticlesPageCache;
    if (typeof parsed.timestamp !== "number" || !Array.isArray(parsed.articles)) {
      window.localStorage.removeItem(ARTICLES_PAGE_CACHE_KEY);
      return null;
    }

    if (Date.now() - parsed.timestamp > ARTICLES_PAGE_CACHE_TTL) {
      window.localStorage.removeItem(ARTICLES_PAGE_CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(ARTICLES_PAGE_CACHE_KEY);
    return null;
  }
};

const writeArticlesPageCache = (articles: Article[]) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload: ArticlesPageCache = {
    timestamp: Date.now(),
    articles
  };

  window.localStorage.setItem(ARTICLES_PAGE_CACHE_KEY, JSON.stringify(payload));
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
};

const generatePlaceholderImage = (title: string) => {
  const titleHash = title.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const colors = ["163b8c", "225ac5", "2f77d8", "266fba", "5048c9", "2a6b86"];
  const color = colors[Math.abs(titleHash) % colors.length];
  return `https://placehold.co/1200x800/${color}/e6f2ff?text=${encodeURIComponent(title.substring(0, 24))}`;
};

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedData = readArticlesPageCache();
    if (cachedData) {
      setArticles(cachedData.articles);
      setLoading(false);
      return;
    }

    let isActive = true;

    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await articleApi.getPublishedArticles();
        if (!isActive) {
          return;
        }

        setArticles(response.articles);
        writeArticlesPageCache(response.articles);
      } catch (err) {
        if (!isActive) {
          return;
        }

        const message = err instanceof Error ? err.message : "Failed to load articles";
        setError(message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      isActive = false;
    };
  }, []);

  const featuredArticle = articles.find((a) => a.status === "published");
  const regularArticles = articles.filter((a) => a._id !== featuredArticle?._id && a.status === "published");

  const renderSkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-video rounded-xl bg-muted/30" />
      <div className="mt-5 h-4 w-1/3 rounded bg-muted/30" />
      <div className="mt-4 h-6 w-4/5 rounded bg-muted/30" />
      <div className="mt-2 h-4 w-full rounded bg-muted/30" />
      <div className="mt-2 h-4 w-2/3 rounded bg-muted/30" />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded bg-muted/30" />
        <div className="h-6 w-16 rounded bg-muted/30" />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-background">
      <DynamicPageBackground />
      <PageSeo
        title="Articles by Pamod Madubashana | Web Development"
        description="Read practical articles by Pamod Madubashana on web development, frontend architecture, and software engineering lessons from real products."
        path="/articles"
        keywords={["web development articles", "software engineering", "frontend architecture", "Pamod Madubashana"]}
        structuredData={{
          "@type": "Blog",
          "@id": "https://pamod.is-a.dev/articles#blog",
          url: "https://pamod.is-a.dev/articles",
          name: "Pamod Madubashana Articles",
          description: "Technical articles on web development and software engineering.",
          publisher: {
            "@type": "Person",
            name: "Pamod Madubashana",
            url: "https://pamod.is-a.dev/",
          },
        }}
      />
      <Navbar />
      <main className="relative z-10 pt-24 pb-20">
        <section className="section-shell">
          <div className="section-inner">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="page-hero-panel mx-auto max-w-4xl"
            >
              <span className="section-pill">Blog</span>
              <h1 className="section-title text-4xl md:text-5xl lg:text-6xl">
                <span className="text-foreground/75">Thoughts</span> <span className="text-gradient">& Ideas</span>
              </h1>
              <p className="section-copy mx-auto mt-5 max-w-2xl">
                Writing about product engineering, frontend architecture, and practical lessons from shipping real projects.
              </p>
            </motion.div>
          </div>
        </section>

        {featuredArticle && !loading && !error && (
          <section className="section-shell section-shell-muted py-10">
            <div className="section-inner">
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="surface-card group overflow-hidden p-0 backdrop-blur-2xl"
              >
                <div className="grid md:grid-cols-2">
                  <div className="relative aspect-video overflow-hidden md:aspect-auto">
                    <img
                      src={featuredArticle.featuredImage || generatePlaceholderImage(featuredArticle.title)}
                      alt={featuredArticle.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onError={(e) => {
                        e.currentTarget.src = generatePlaceholderImage(featuredArticle.title);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-background/45 to-transparent" />
                  </div>

                  <div className="flex flex-col justify-center p-7 md:p-10">
                    <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      Featured Story
                    </span>

                    <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(featuredArticle.createdAt)}
                    </div>

                    <h2 className="text-2xl font-bold text-foreground transition-colors group-hover:text-primary md:text-3xl">
                      {featuredArticle.title}
                    </h2>

                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {featuredArticle.excerpt}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {featuredArticle.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="chip-tag">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/articles/${featuredArticle.slug}`}
                      className="mt-6 inline-flex items-center gap-2 font-semibold text-primary"
                    >
                      Read Article
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            </div>
          </section>
        )}

        <section className="section-shell py-10">
          <div className="section-inner">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                <span className="text-foreground/75">Latest</span> <span className="text-gradient">Articles</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="surface-card backdrop-blur-2xl"
                  >
                    {renderSkeleton()}
                  </motion.div>
                ))
              ) : error ? (
                <div className="col-span-full rounded-2xl border border-destructive/40 bg-destructive/10 p-10 text-center">
                  <p className="mb-4 text-destructive">{error}</p>
                  <button
                    className="rounded-md border border-destructive/50 px-4 py-2 text-sm text-destructive transition hover:bg-destructive/10"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : regularArticles.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-border/60 bg-card/30 p-10 text-center backdrop-blur-xl">
                  <p className="text-muted-foreground">No articles found.</p>
                </div>
              ) : (
                regularArticles.map((article, index) => (
                  <motion.article
                    key={article._id}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className="surface-card group overflow-hidden p-0 backdrop-blur-2xl"
                  >
                    <div className="relative aspect-video overflow-hidden border-b border-border/60">
                      <img
                        src={article.featuredImage || generatePlaceholderImage(article.title)}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        onError={(e) => {
                          e.currentTarget.src = generatePlaceholderImage(article.title);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/65 to-transparent" />
                    </div>

                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(article.createdAt)}
                      </div>

                      <h3 className="line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                        {article.title}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {article.excerpt}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="chip-tag">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        to={`/articles/${article.slug}`}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Articles;
