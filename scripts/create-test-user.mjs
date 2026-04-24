#!/usr/bin/env node
/** Create a persistent test user for Playwright sign-in verification. */
import { createClerkClient } from "@clerk/backend";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  console.error("Need CLERK_SECRET_KEY");
  process.exit(1);
}
const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
// `+clerk_test@example.com` → Clerk test-email pattern, always accepts 424242.
const email = "playwright+clerk_test@example.com";
const password = "PlaywrightLilach2026!";

// Delete any existing user with that email first (idempotent)
const existing = await clerk.users.getUserList({ emailAddress: [email] });
for (const u of existing.data) {
  console.log("deleting existing:", u.id);
  await clerk.users.deleteUser(u.id);
}

const user = await clerk.users.createUser({
  emailAddress: [email],
  password,
  firstName: "Playwright",
  lastName: "Tester",
  skipPasswordChecks: true,
});
console.log("created user:", user.id);
console.log("email:", email);
console.log("password:", password);
