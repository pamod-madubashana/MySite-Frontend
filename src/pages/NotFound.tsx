import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PageSeo from "@/components/seo/PageSeo";
import { Link } from "react-router-dom";
import DynamicPageBackground from "@/components/DynamicPageBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <PageSeo
        title="Page Not Found | Pamod Madubashana"
        description="The page you are looking for does not exist on pamod.is-a.dev."
        path={location.pathname || "/404"}
        noIndex
      />
      <main className="relative min-h-screen bg-background" id="main-content">
        <DynamicPageBackground />
        <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <Link to="/" className="text-primary underline hover:text-primary/90">
            Return to Home
          </Link>
        </section>
      </main>
    </>
  );
};

export default NotFound;
