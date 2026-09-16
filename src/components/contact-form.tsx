"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { contactForm, links } from "@/content/site";

type Status = "idle" | "sending" | "sent" | "error";
type Fields = Record<keyof typeof contactForm.entries, string>;

const inputClass =
  "mt-2.5 block w-full rounded-md border border-line bg-bg px-3.5 text-[15px] text-fg transition-colors duration-200 placeholder:text-subtle hover:border-line-strong focus-visible:border-line-strong focus-visible:outline-offset-0 autofill:shadow-[inset_0_0_0_1000px_var(--color-bg)] autofill:[-webkit-text-fill-color:var(--color-fg)]";

/** Sends a message to the Google Form configured in `contactForm`, or via the visitor's email app until one is set. */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [sender, setSender] = useState({ name: "", email: "" });
  const doneHeading = useRef<HTMLHeadingElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const returning = useRef(false);

  // Move focus to whatever replaced the element the user was on.
  useEffect(() => {
    if (status === "sent") doneHeading.current?.focus();
    if (status === "idle" && returning.current) {
      returning.current = false;
      firstInput.current?.focus();
    }
  }, [status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();

    // Honeypot: people never see this field, spam bots tend to fill it. Pretend it worked.
    if (value("website")) {
      setStatus("sent");
      return;
    }

    const fields: Fields = {
      name: value("name"),
      email: value("email"),
      company: value("company"),
      topic: value("topic"),
      message: value("message"),
    };

    if (!contactForm.formId) {
      const subject = `${fields.topic || "Project enquiry"} from ${fields.name}`;
      const signature = [fields.name, fields.company, fields.email].filter(Boolean).join("\n");
      location.href = `mailto:${links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${fields.message}\n\n${signature}`)}`;
      return;
    }

    setStatus("sending");
    const body = new URLSearchParams();
    for (const [key, entry] of Object.entries(contactForm.entries)) body.append(entry, fields[key as keyof Fields]);

    try {
      // Google Forms sends no CORS headers, so the response is opaque. A resolved request means it reached Google;
      // a network failure rejects and shows the error state.
      await fetch(`https://docs.google.com/forms/d/e/${contactForm.formId}/formResponse`, {
        method: "POST",
        mode: "no-cors",
        body,
      });
      setSender({ name: fields.name.split(/\s+/)[0], email: fields.email });
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="panel p-6 md:p-10">
        <p className="flex items-center gap-2.5 font-mono text-xs text-muted">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Message sent
        </p>
        <h3 ref={doneHeading} tabIndex={-1} className="text-title mt-5 outline-none">
          Thanks{sender.name ? `, ${sender.name}` : ""}. Your message is on its way.
        </h3>
        <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-muted">
          I&apos;ll get back to you{sender.email ? ` at ${sender.email}` : ""} as soon as I can.
        </p>
        <button
          type="button"
          onClick={() => {
            returning.current = true;
            setStatus("idle");
          }}
          className="mt-8 inline-flex h-10 items-center rounded-md border border-line-strong px-4 font-mono text-xs text-muted transition-colors duration-200 hover:border-fg/30 hover:text-fg focus-visible:text-fg"
        >
          Send another message
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} aria-labelledby="contact-form-title" className="panel relative overflow-hidden">
      <div className="flex h-11 items-center justify-between gap-4 border-b border-line px-5 font-mono text-xs md:px-8">
        <span id="contact-form-title" className="text-muted">
          New message
        </span>
        <span aria-hidden className="text-subtle">
          POST /contact
        </span>
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-2 md:p-8">
        <div>
          <label htmlFor="contact-name" className="eyebrow">
            Name
          </label>
          <input ref={firstInput} id="contact-name" name="name" required autoComplete="name" className={`${inputClass} h-11`} />
        </div>

        <div>
          <label htmlFor="contact-email" className="eyebrow">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            className={`${inputClass} h-11`}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contact-company" className="eyebrow">
            Company <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input id="contact-company" name="company" autoComplete="organization" className={`${inputClass} h-11`} />
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="eyebrow">
            What&apos;s it about? <span className="normal-case tracking-normal">(optional)</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {contactForm.topics.map((topic) => (
              <label
                key={topic}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-line px-3 text-sm text-muted transition-colors duration-200 hover:border-line-strong hover:text-fg has-checked:border-accent/60 has-checked:bg-accent-soft has-checked:text-fg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
              >
                <input type="radio" name="topic" value={topic} className="peer sr-only" />
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-line-strong transition-colors peer-checked:bg-accent" />
                {topic}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="eyebrow">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            placeholder="What are you building, and where is it stuck?"
            className={`${inputClass} min-h-36 resize-y py-3 leading-relaxed`}
          />
        </div>

        {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
        <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-4 border-t border-line pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-subtle">
            {contactForm.formId
              ? "Delivered through Google Forms. I only use your details to reply."
              : "Opens your email app with the message ready to send."}
          </p>
          <button
            type="submit"
            disabled={sending}
            className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-accent px-5 font-medium text-accent-ink transition-colors duration-300 ease-out-expo hover:bg-accent/90 disabled:cursor-progress disabled:opacity-70 sm:self-auto"
          >
            {sending ? "Sending…" : "Send message"}
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>

        {status === "error" && (
          <p role="alert" className="text-sm leading-relaxed text-fg sm:col-span-2">
            Your message couldn&apos;t be sent. Check your connection and try again, or email me at{" "}
            <a href={`mailto:${links.email}`} className="underline decoration-line-strong underline-offset-4 hover:decoration-fg">
              {links.email}
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
