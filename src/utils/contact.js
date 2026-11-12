/** Field names match the variables used by the EmailJS template. */
export const CONTACT_FIELDS = ["user_name", "user_email", "subject", "message"];

export const CONTACT_LIMITS = {
  user_name: { min: 2, max: 60 },
  user_email: { max: 100 },
  subject: { max: 100 },
  message: { min: 10, max: 2000 },
};

export const EMPTY_CONTACT_FORM = Object.fromEntries(CONTACT_FIELDS.map((name) => [name, ""]));

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns an error message for one contact form field, or "" when the value is valid. */
export function validateContactField(name, rawValue) {
  const value = String(rawValue ?? "").trim();
  const limits = CONTACT_LIMITS[name];

  switch (name) {
    case "user_name":
      if (!value) return "Please enter your name.";
      if (value.length < limits.min) return `Your name should be at least ${limits.min} characters.`;
      if (value.length > limits.max) return `Please keep your name under ${limits.max} characters.`;
      return "";
    case "user_email":
      if (!value) return "Please enter your email address.";
      if (value.length > limits.max || !EMAIL_PATTERN.test(value)) {
        return "Please enter a valid email address, like name@example.com.";
      }
      return "";
    case "subject":
      return value.length > limits.max ? `Please keep the subject under ${limits.max} characters.` : "";
    case "message":
      if (!value) return "Please write a message.";
      if (value.length < limits.min) return `Your message should be at least ${limits.min} characters.`;
      if (value.length > limits.max) return `Please keep your message under ${limits.max} characters.`;
      return "";
    default:
      return "";
  }
}

/** `{ [field]: message }` for every invalid field; empty when the form can be sent. */
export function validateContactForm(values) {
  const errors = {};
  for (const name of CONTACT_FIELDS) {
    const error = validateContactField(name, values?.[name]);
    if (error) errors[name] = error;
  }
  return errors;
}

/** Trimmed EmailJS template parameters, with a subject filled in when it was left blank. */
export function toEmailParams(values) {
  const params = Object.fromEntries(CONTACT_FIELDS.map((name) => [name, String(values?.[name] ?? "").trim()]));
  if (!params.subject) params.subject = `New message from ${params.user_name} via the portfolio`;
  return params;
}
