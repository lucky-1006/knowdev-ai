# Security Policy - knowDev AI

We take the security of **knowDev AI** seriously. This document outlines the reporting processes for security vulnerabilities, configuration guidelines, and security best practices.

---

## 1. Supported Versions

We actively maintain and provide security patches for the following versions:

| Version | Supported |
|:---|:---|
| v1.0.x | Yes (Current release) |
| < v1.0.0 | No (Legacy/Pre-release) |

---

## 2. Reporting a Vulnerability

> [!WARNING]
> Please do **NOT** open public GitHub issues for security vulnerabilities. Report all issues privately.

If you identify a security flaw, please report it directly:
* **Email**: [security@knowdev.ai](mailto:security@knowdev.ai)
* **Encryption Key**: You can request our PGP public key to encrypt your report.

Please include:
1. A detailed description of the vulnerability.
2. Steps to reproduce the exploit (with code snippets or payload parameters if applicable).
3. The potential impact of the issue.

We will review your submission and respond within **48 hours** to coordinate a fix.

---

## 3. Best Security Practices for Deployment

When running knowDev AI in production, always follow these rules:

* **Environment Secrets**: Never commit `.env` or `.env.local` files to Git. Set these variables directly in your host container configurations (e.g. Render, Vercel, AWS ECS).
* **JWT Token Security**: Change the default `JWT_SECRET` (`knowdev_secret_12345_dev`) and `NEXTAUTH_SECRET` immediately in production mode.
* **API Rate Limiting**: Deploy a reverse proxy (such as Nginx, Cloudflare, or AWS API Gateway) to protect backend FastAPI routes from brute-force authentication or rate exhaustion attacks.
* **Offline Deployment**: To ensure 100% data privacy, deploy knowDev AI inside a private Virtual Private Cloud (VPC) with `LOCAL_INFERENCE=true`.
