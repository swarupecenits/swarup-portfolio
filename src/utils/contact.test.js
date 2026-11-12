import { describe, expect, it } from "vitest";
import { EMPTY_CONTACT_FORM, toEmailParams, validateContactField, validateContactForm } from "./contact";

describe("validateContactField", () => {
  it("treats whitespace-only values as empty", () => {
    expect(validateContactField("user_name", "   ")).toBe("Please enter your name.");
    expect(validateContactField("message", "\n\t ")).toBe("Please write a message.");
  });

  it("enforces length limits on trimmed values", () => {
    expect(validateContactField("user_name", " A ")).toMatch(/at least 2/);
    expect(validateContactField("user_name", " Al ")).toBe("");
    expect(validateContactField("message", "123456789")).toMatch(/at least 10/);
    expect(validateContactField("message", "1234567890")).toBe("");
    expect(validateContactField("message", "x".repeat(2001))).toMatch(/under 2000/);
    expect(validateContactField("subject", "x".repeat(101))).toMatch(/under 100/);
  });

  it.each(["name@example", "name@.com", "name example@test.com", "@example.com", "name@example.c"])(
    "rejects the malformed email %j",
    (email) => expect(validateContactField("user_email", email)).toMatch(/valid email/),
  );

  it("accepts a well-formed email surrounded by spaces", () => {
    expect(validateContactField("user_email", "  first.last+tag@mail.example.co  ")).toBe("");
  });
});

describe("validateContactForm", () => {
  it("reports every required field but not the optional subject", () => {
    expect(Object.keys(validateContactForm(EMPTY_CONTACT_FORM))).toEqual(["user_name", "user_email", "message"]);
  });

  it("returns no errors for a valid submission", () => {
    expect(
      validateContactForm({ user_name: "Ada", user_email: "ada@example.com", subject: "", message: "Hello there!" }),
    ).toEqual({});
  });
});

describe("toEmailParams", () => {
  it("trims values and fills in a blank subject", () => {
    expect(
      toEmailParams({ user_name: "  Ada  ", user_email: " ada@example.com ", subject: "   ", message: " Hi, Swarup! " }),
    ).toEqual({
      user_name: "Ada",
      user_email: "ada@example.com",
      subject: "New message from Ada via the portfolio",
      message: "Hi, Swarup!",
    });
  });

  it("keeps a provided subject", () => {
    expect(toEmailParams({ user_name: "Ada", subject: "  Collaboration  " }).subject).toBe("Collaboration");
  });
});
