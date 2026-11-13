import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import styled, { css, keyframes } from "styled-components";
import { FiAlertCircle, FiSend } from "react-icons/fi";
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  EMPTY_CONTACT_FORM,
  toEmailParams,
  validateContactField,
  validateContactForm,
} from "../../utils/contact";
import Toast from "../ui/Toast";
import { monoLabel, primaryButton } from "../ui/styles";

const EMAILJS = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_w7dzhh5",
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_b0q19al",
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "LXKUbff1C0vzu7wIX",
};
const SEND_THROTTLE = 10_000;
const DRAFT_KEY = "contact-draft";
const MODIFIER_KEY = /mac|iphone|ipad/i.test(navigator.userAgentData?.platform ?? navigator.userAgent) ? "⌘" : "Ctrl";

function loadDraft() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null");
    return Object.fromEntries(
      CONTACT_FIELDS.map((name) => {
        const value = saved?.[name];
        return [name, typeof value === "string" ? value.slice(0, CONTACT_LIMITS[name].max) : ""];
      }),
    );
  } catch {
    return EMPTY_CONTACT_FORM;
  }
}

function saveDraft(values) {
  try {
    if (Object.values(values).some((value) => value.trim())) {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } else {
      sessionStorage.removeItem(DRAFT_KEY);
    }
  } catch {
    // Storage can be unavailable (e.g. blocked cookies); the draft is only a convenience.
  }
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const appear = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
`;

// When the card is stretched to match the column beside it, the message box absorbs the extra height.
// A basis of `auto` (not 0) keeps the textarea's manual resize handle working.
const Form = styled.form`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: 20px;
`;

const Intro = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  h3 {
    color: var(--text);
    font-size: clamp(1.375rem, 2.4vw, 1.625rem);
    font-weight: 600;
    letter-spacing: -0.03em;
  }

  p {
    color: var(--text-muted);
    font-size: 15px;
    line-height: 1.6;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 16px;

  @media (max-width: 639px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageField = styled(Field)`
  flex: 1 0 auto;
`;

const Label = styled.label`
  ${monoLabel}
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  color: var(--text-muted);

  small {
    color: var(--text-dim);
    font-size: 11px;
  }
`;

const control = css`
  width: 100%;
  padding: 13px 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgb(255 255 255 / 0.03);
  color: var(--text);
  /* 16px keeps iOS Safari from zooming into the field on focus. */
  font-size: 16px;
  line-height: 1.5;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &::placeholder {
    color: var(--text-dim);
  }

  &:hover {
    border-color: var(--line-strong);
  }

  &:focus {
    /* Transparent rather than none so the outline still shows in forced-colors mode. */
    outline: 2px solid transparent;
    border-color: rgb(var(--accent-rgb) / 0.6);
    background: rgb(255 255 255 / 0.05);
    box-shadow: 0 0 0 4px rgb(var(--accent-rgb) / 0.14);
  }

  &[aria-invalid="true"] {
    border-color: rgb(248 113 113 / 0.8);
  }

  &[aria-invalid="true"]:focus {
    box-shadow: 0 0 0 4px rgb(248 113 113 / 0.2);
  }
`;

const Input = styled.input`
  ${control}
`;

const TextArea = styled.textarea`
  ${control}
  flex: 1 0 auto;
  min-height: 168px;
  resize: vertical;
`;

const Meta = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const ErrorText = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #fca5a5;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.45;
  animation: ${appear} 0.2s ease;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const Counter = styled.span`
  margin-left: auto;
  color: ${({ $warn }) => ($warn ? "#fbbf24" : "var(--text-dim)")};
  font-family: var(--font-mono);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const Honeypot = styled.div`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 18px;
  margin-top: 4px;
`;

const SubmitButton = styled.button`
  ${primaryButton}
  min-width: 190px;

  &[aria-disabled="true"] {
    cursor: progress;
    opacity: 0.8;
    transform: none;
  }

  @media (max-width: 639px) {
    width: 100%;
  }
`;

const Spinner = styled.span`
  width: 18px;
  height: 18px;
  border: 2px solid rgb(0 0 0 / 0.2);
  border-top-color: var(--accent-ink);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Shortcut = styled.p`
  display: none;
  color: var(--text-dim);
  font-size: 13px;

  kbd {
    padding: 2px 6px;
    border: 1px solid var(--line-strong);
    border-radius: 6px;
    background: rgb(255 255 255 / 0.05);
    color: var(--text-soft);
    font-family: var(--font-mono);
    font-size: 11.5px;
  }

  @media (hover: hover) and (pointer: fine) {
    display: block;
  }
`;

const firstNameOf = (name) => name.trim().split(/\s+/)[0] ?? "";

export default function ContactForm() {
  const formId = useId();
  const honeypotRef = useRef(null);
  const [values, setValues] = useState(loadDraft);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(values), 400);
    return () => clearTimeout(timer);
  }, [values]);

  const setFieldError = (name, error) =>
    setErrors((current) => {
      if ((current[name] ?? "") === error) return current;
      const next = { ...current };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    // Once a field shows an error, re-check it as the visitor types so it clears right away.
    if (errors[name]) setFieldError(name, validateContactField(name, value));
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (value.trim() || attempted) setFieldError(name, validateContactField(name, value));
  };

  const handleMessageKeyDown = (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit?.();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;

    const nextErrors = validateContactForm(values);
    const firstInvalid = CONTACT_FIELDS.find((name) => nextErrors[name]);
    if (firstInvalid) {
      // Commit the error messages first so they are announced with the focused field.
      flushSync(() => {
        setErrors(nextErrors);
        setAttempted(true);
      });
      form.elements.namedItem(firstInvalid)?.focus();
      return;
    }

    const params = toEmailParams(values);
    const thanks = `Thanks${firstNameOf(params.user_name) ? `, ${firstNameOf(params.user_name)}` : ""}! Your message is on its way — I'll get back to you soon.`;
    const finish = () => {
      setValues(EMPTY_CONTACT_FORM);
      setErrors({});
      setAttempted(false);
      setToast({ id: Date.now(), type: "success", message: thanks });
    };

    // Bots fill in every field, including the hidden one; let them think it worked.
    if (honeypotRef.current?.value) {
      finish();
      return;
    }

    setSending(true);
    try {
      const { send } = await import("@emailjs/browser");
      await send(EMAILJS.serviceId, EMAILJS.templateId, params, {
        publicKey: EMAILJS.publicKey,
        blockHeadless: true,
        limitRate: { id: "contact-form", throttle: SEND_THROTTLE },
      });
      finish();
    } catch (error) {
      const rateLimited = error?.status === 429;
      // Keep the real reason (e.g. "400 The service ID not found") visible for debugging.
      if (!rateLimited) console.error("Contact form: EmailJS send failed", error);
      setToast({
        id: Date.now(),
        type: "error",
        message: rateLimited
          ? "You're sending messages a little too quickly. Please wait a few seconds and try again."
          : "Sorry, your message couldn't be sent. Please try again, or reach out on LinkedIn.",
      });
    } finally {
      setSending(false);
    }
  };

  const fieldId = (name) => `${formId}-${name}`;
  const errorId = (name) => `${formId}-${name}-error`;
  const fieldProps = (name) => ({
    id: fieldId(name),
    name,
    value: values[name],
    maxLength: CONTACT_LIMITS[name].max,
    onChange: handleChange,
    onBlur: handleBlur,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? errorId(name) : undefined,
  });
  const renderError = (name) =>
    errors[name] && (
      <ErrorText id={errorId(name)}>
        <FiAlertCircle aria-hidden="true" />
        {errors[name]}
      </ErrorText>
    );

  const messageLength = values.message.length;
  const messageMax = CONTACT_LIMITS.message.max;

  return (
    <>
      <Form noValidate onSubmit={handleSubmit} aria-labelledby={`${formId}-title`}>
        <Intro>
          <h3 id={`${formId}-title`}>Send me a message</h3>
          <p>Fill in the form below and I&apos;ll get back to you by email.</p>
        </Intro>

        <Row>
          <Field>
            <Label htmlFor={fieldId("user_name")}>Name</Label>
            <Input {...fieldProps("user_name")} type="text" autoComplete="name" placeholder="Your name" required />
            {renderError("user_name")}
          </Field>
          <Field>
            <Label htmlFor={fieldId("user_email")}>Email</Label>
            <Input
              {...fieldProps("user_email")}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="you@example.com"
              required
            />
            {renderError("user_email")}
          </Field>
        </Row>

        <Field>
          <Label htmlFor={fieldId("subject")}>
            Subject <small>Optional</small>
          </Label>
          <Input {...fieldProps("subject")} type="text" placeholder="What's this about?" />
          {renderError("subject")}
        </Field>

        <MessageField>
          <Label htmlFor={fieldId("message")}>Message</Label>
          <TextArea
            {...fieldProps("message")}
            rows={6}
            placeholder="Tell me about your project, idea or question…"
            onKeyDown={handleMessageKeyDown}
            required
          />
          <Meta>
            {renderError("message")}
            <Counter $warn={messageLength > messageMax * 0.9} aria-hidden="true">
              {messageLength} / {messageMax}
            </Counter>
          </Meta>
        </MessageField>

        <Honeypot aria-hidden="true">
          <label>
            Leave this field empty
            <input ref={honeypotRef} type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </Honeypot>

        <Actions>
          <SubmitButton type="submit" aria-disabled={sending || undefined}>
            {sending ? <Spinner aria-hidden="true" /> : <FiSend aria-hidden="true" />}
            {sending ? "Sending…" : "Send message"}
          </SubmitButton>
          <Shortcut aria-hidden="true">
            or press <kbd>{MODIFIER_KEY}</kbd> + <kbd>Enter</kbd>
          </Shortcut>
        </Actions>
      </Form>

      <Toast toast={toast} onClose={() => setToast(null)} duration={toast?.type === "error" ? 8000 : 6000} />
    </>
  );
}
