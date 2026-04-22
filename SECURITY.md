# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ Active  |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Please report security issues by emailing:

> **security@beusable.com**

Include the following in your report:
- Description of the vulnerability
- Steps to reproduce
- Affected package(s) and version(s)
- Potential impact

We will acknowledge your report within **72 hours** and provide a resolution timeline within **14 business days**.

## Coordinated Disclosure

We follow a **90-day coordinated disclosure** policy. After a fix is released, we will publish a security advisory crediting the reporter (unless anonymity is requested).

## Scope

This policy covers the following packages in this monorepo:

| Package | Scope |
|---------|-------|
| `@beusable-dev/react` | In scope |
| `@beusable-dev/vue` | In scope |
| `@beusable-dev/tokens` | In scope |

## Security Considerations for Consumers

- **`Tooltip` `linkHref`**: The component sanitizes `href` values to block `javascript:` and other unsafe protocols. Do not bypass this by passing pre-constructed `href` strings from untrusted sources.
- **`Table` `column.render`**: The `render` callback receives raw data. Sanitize external data before rendering HTML-like content inside `render`.
- **Tokens import**: Always import `@beusable-dev/tokens/css` to load CSS variables. Do not inline token values into user-generated content.

## Compliance

This project is developed in accordance with:
- **EU Cyber Resilience Act (CRA)** — Article 12 (Vulnerability handling)
- **OWASP Top 10** — components are reviewed against A01–A10

## Out of Scope

- Vulnerabilities in applications built **using** this design system (consumer responsibility)
- Storybook documentation site (development only, not distributed)
