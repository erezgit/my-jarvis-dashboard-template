// The MyJarvis brand logo ships as a committed static asset under public/logos/
// so every forked tenant is self-contained from the first build — no runtime
// dependency on any external/cross-tenant R2 bucket, no provisioning step.
// (Previously this pointed at a PNG on a personal R2 bucket, which coupled
// every tenant's logo to one account's storage.)
export const myjarvisLogoUrl = "/logos/logo_jarvis_dark.svg";
