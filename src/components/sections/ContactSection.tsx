import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
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
  company: ""
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
        company: formData.company
      });

      setFormData(INITIAL_FORM_STATE);
      setFormErrors({});
      setSubmitSuccess("Your message was sent successfully.");
      toast({
        title: "Message sent",
        description: "Your message was sent successfully."
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to send your message right now.";
      setSubmitError(errorMessage);
      toast({
        title: "Message not sent",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-shell section-shell-muted">
      <div aria-hidden className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-secondary/20 blur-3xl animate-orbit-soft" />

      <div className="section-inner">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="section-pill">Get in Touch</span>
            <h2 className="section-title">
              <span className="text-foreground/75">Start a</span> <span className="text-gradient">Conversation</span>
            </h2>
            <p className="section-copy mx-auto mt-4 max-w-xl">
              Share your goals, scope, and timeline. I will review your request and send a clear next-step plan.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="surface-card"
          >
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground/90">
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
                    className="h-12 border-border/70 bg-background/55 text-foreground placeholder:text-muted-foreground/80"
                  />
                  {formErrors.name && <p className="mt-2 text-sm text-destructive">{formErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground/90">
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
                    className="h-12 border-border/70 bg-background/55 text-foreground placeholder:text-muted-foreground/80"
                  />
                  {formErrors.email && <p className="mt-2 text-sm text-destructive">{formErrors.email}</p>}
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
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground/90">
                  Project Brief
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell me what you are building, timeline, and key requirements..."
                  value={formData.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                  maxLength={2000}
                  aria-invalid={Boolean(formErrors.message)}
                  className="resize-none border-border/70 bg-background/55 text-foreground placeholder:text-muted-foreground/80"
                />
                {formErrors.message && <p className="mt-2 text-sm text-destructive">{formErrors.message}</p>}
              </div>

              <div className="space-y-2">
                {submitSuccess && <p className="text-sm text-green-500">{submitSuccess}</p>}
                {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              </div>

              <Button
                type="submit"
                size="lg"
                className="group w-full bg-gradient-to-r from-primary to-secondary font-semibold text-primary-foreground shadow-glow hover:opacity-95 md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                )}
                {isSubmitting ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
