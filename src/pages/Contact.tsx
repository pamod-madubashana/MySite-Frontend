import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactSection } from "@/components/sections/ContactSection";
import { useSettings } from "@/contexts/SettingsContext";

const Contact = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isContactEnabled = settings?.siteSections.showContact !== false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {isContactEnabled ? (
          <ContactSection />
        ) : (
          <section className="py-24">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-3xl font-bold text-foreground/80">Contact is currently unavailable</h1>
              <p className="mt-3 text-muted-foreground">
                The contact section is disabled in settings.
              </p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
