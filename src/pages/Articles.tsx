import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Tag, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { articleApi, Article } from "@/api/articleApi";



const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const generatePlaceholderImage = (title: string) => {
  // Generate a consistent placeholder image based on the title
  const titleHash = title.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colors = [
    '6366f1', '8b5cf6', 'ec4899', 'f43f5e', 'f59e0b',
    '10b981', '06b6d4', '3b82f6', '8b5cf6', 'ec4899'
  ];
  
  const color = colors[Math.abs(titleHash) % colors.length];
  return `https://placehold.co/800x600/${color}/white?text=${encodeURIComponent(title.substring(0, 20))}`;
};

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await articleApi.getPublishedArticles();
        setArticles(response.articles);
      } catch (err: any) {
        setError(err.message || 'Failed to load articles');
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);
  
  const featuredArticle = articles.find((a) => a.status === 'published');
  const regularArticles = articles.filter((a) => a._id !== featuredArticle?._id && a.status === 'published');

  // Loading skeletons
  const renderSkeleton = () => (
    <div className="animate-pulse">
      <div className="rounded-xl overflow-hidden bg-muted/20 aspect-video" />
      <div className="p-6">
        <div className="h-4 bg-muted/30 rounded w-1/4 mb-3" />
        <div className="h-6 bg-muted/30 rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted/30 rounded w-full mb-2" />
        <div className="h-4 bg-muted/30 rounded w-2/3 mb-4" />
        <div className="flex gap-2">
          <div className="h-6 bg-muted/30 rounded w-16" />
          <div className="h-6 bg-muted/30 rounded w-16" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <span className="inline-block px-4 py-1 text-sm font-medium text-accent bg-accent/10 rounded-full mb-6">
                Blog
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-foreground/70">Thoughts & </span><span className="text-gradient">Ideas</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Writing about web development, programming best practices, and lessons 
                learned from building software at scale.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Article */}
        {featuredArticle && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group rounded-2xl overflow-hidden glass hover-lift"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative aspect-video md:aspect-auto overflow-hidden bg-muted/20 flex items-center justify-center">
                    <img
                      src={featuredArticle.featuredImage || generatePlaceholderImage(featuredArticle.title)}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.src = generatePlaceholderImage(featuredArticle.title);
                      }}
                    />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredArticle.createdAt)}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground/80 group-hover:text-primary transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6 text-muted-foreground">
                      {featuredArticle.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-mono bg-muted/50 rounded-full"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={`/articles/${featuredArticle.slug}`}
                      className="inline-flex items-center gap-2 text-primary font-medium group/link"
                    >
                      Read Article
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            </div>
          </section>
        )}

        {/* Articles Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                // Show skeletons while loading
                Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group rounded-xl overflow-hidden glass"
                  >
                    {renderSkeleton()}
                  </motion.div>
                ))
              ) : error ? (
                // Show error state
                <div className="col-span-full text-center py-12">
                  <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <button 
                    className="px-4 py-2 border rounded-md text-sm hover:bg-muted transition-colors"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : regularArticles.length === 0 ? (
                // Show empty state
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No articles found</p>
                </div>
              ) : (
                // Show actual articles
                regularArticles.map((article, index) => (
                  <motion.article
                    key={article._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group rounded-xl overflow-hidden glass hover-lift"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted/20 flex items-center justify-center">
                      <img
                        src={article.featuredImage || generatePlaceholderImage(article.title)}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.src = generatePlaceholderImage(article.title);
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(article.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground/80 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4 text-muted-foreground">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs font-mono bg-muted/50 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        to={`/articles/${article.slug}`}
                        className="inline-flex items-center gap-2 text-sm text-primary font-medium group/link"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Articles;
