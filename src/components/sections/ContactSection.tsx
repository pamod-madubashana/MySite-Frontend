import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { contactApi } from "@/api/contactApi";

interface ContactFormState {
  name: string;
  email: string;
  message: string;
  company: string;
}

interface ContactFormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const INITIAL_FORM_STATE: ContactFormState = {
  name: "",
  email: "",
  message: "",
  company: "",
};

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const validateForm = (data: ContactFormState): ContactFormErrors => {
    const errors: ContactFormErrors = {};

    const name = data.name.trim();
    const email = data.email.trim();
    const message = data.message.trim();

    if (!name) {
      errors.name = "Name is required";
    } else if (name.length < 2 || name.length > 80) {
      errors.name = "Name must be between 2 and 80 characters";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!message) {
      errors.message = "Message is required";
    } else if (message.length < 10 || message.length > 2000) {
      errors.message = "Message must be between 10 and 2000 characters";
    }

    return errors;
  };

  const handleChange = (field: keyof ContactFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
    setSubmitSuccess(null);

    if (field !== "company") {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitError("Please fix the highlighted fields and try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await contactApi.submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        company: formData.company,
      });

      setFormData(INITIAL_FORM_STATE);
      setFormErrors({});
      setSubmitSuccess("Your message was sent successfully.");
      toast({
        title: "Message sent",
        description: "Your message was sent successfully.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to send your message right now.";
      setSubmitError(errorMessage);
      toast({
        title: "Message not sent",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 text-sm font-medium text-accent bg-accent/10 rounded-full mb-4">
              Get in Touch
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-foreground/70">Let's Work</span> <span className="text-gradient">Together</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Have a project in mind? I'd love to hear about it. Let's discuss how we can bring your ideas to life.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {[
              {
                icon: Mail,
                title: "Email",
                value: "contact@pamod.is-a.dev",
                href: "mailto:contact@pamod.is-a.dev",
              },
              {
                icon: MapPin,
                title: "Location",
                value: "Ampara, Sri Lanka",
                href: "#",
              },
              {
                icon: Calendar,
                title: "Availability",
                value: "Open to projects",
                href: "#",
              },
            ].map((item, index) => (
              <motion.a
                key={item.title}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="p-6 rounded-xl glass hover-lift text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center group-hover:shadow-glow transition-shadow duration-300">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.value}</p>
              </motion.a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl glass"
          >
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(event) => handleChange("name", event.target.value)}
                    autoComplete="name"
                    maxLength={80}
                    aria-invalid={Boolean(formErrors.name)}
                    className="h-12 border-border bg-transparent text-foreground placeholder:text-muted-foreground"
                  />
                  {formErrors.name && <p className="mt-2 text-sm text-destructive">{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    autoComplete="email"
                    maxLength={254}
                    aria-invalid={Boolean(formErrors.email)}
                    className="h-12 border-border bg-transparent text-foreground placeholder:text-muted-foreground"
                  />
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-destructive">{formErrors.email}</p>
                  )}
                </div>
              </div>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={(event) => handleChange("company", event.target.value)}
                  autoComplete="off"
                  tabIndex={-1}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell me about your project..."
                  value={formData.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                  maxLength={2000}
                  aria-invalid={Boolean(formErrors.message)}
                  className="resize-none border-border bg-background/70 text-foreground placeholder:text-muted-foreground"
                />
                {formErrors.message && (
                  <p className="mt-2 text-sm text-destructive">{formErrors.message}</p>
                )}
              </div>
              <div className="space-y-2">
                {submitSuccess && <p className="text-sm text-green-500">{submitSuccess}</p>}
                {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto neon-glow group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-1" />
                )}
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
