---
title: Information Security Policy
author: Hoppy Tech LLC
date: August 14, 2026
geometry: margin=1in
fontsize: 11pt
---

**Hoppy Tech LLC**  
Effective: August 14, 2026  
Owner: Jeremy Hopkins  
Contact: jeremy@hoppytech.com

This policy describes how Hoppy Tech LLC identifies, mitigates, and monitors information security risks. It is scaled to a single-member software consulting company. It is not a SOC 2 or ISO 27001 program.

## 1. Scope

Applies to Hoppy Tech systems, client inquiry data, credentials we handle, and internal operations tools (including LedgerFlow). Client production systems we access under a contract are treated with the same least-privilege and secret-handling rules.

## 2. Roles

The owner is responsible for this policy, access decisions, incident response, vendor review, and privacy requests. There is no separate security team.

## 3. Risk identification

Risks in scope: unauthorized access to inquiry or financial data, credential leakage, abuse of public forms, and integrity of invoices and tax records. New features and integrations are reviewed for auth, secret handling, and fail-closed behavior before they go live. Public forms record IP, user agent, referrer, and approximate geo for abuse investigation.

## 4. Access control

Internal admin and bookkeeping systems are restricted to the agency owner (`jeremy@hoppytech.com`). Client portal accounts cannot access admin functions. Browser routes deny access by default unless explicitly public. Machine-to-machine APIs require a dedicated key compared in constant time. Unused access is revoked.

## 5. Data handling and privacy

Collection, use, sharing, and retention follow the public Privacy Policy at [https://hoppytech.com/privacy](https://hoppytech.com/privacy) (last updated July 18, 2026). We do not sell personal information or share it for third-party marketing. Inquiry data is kept only as long as needed for the relationship, operations, or legal requirements, then deleted or de-identified. Access, correction, and deletion requests go to jeremy@hoppytech.com.

## 6. Secrets and credentials

Secrets live in environment configuration or a secrets manager, not in source control. Passwords and API keys are not texted or emailed. Client secrets are shared via expiring, preferably one-time vault links (Bitwarden Send or 1Password). After confirmed access, the link is revoked or left to expire.

## 7. Application and infrastructure controls

Production traffic is served over TLS. Baseline headers are in place (HSTS, clickjacking protections, nosniff, referrer policy). Webhooks (Stripe and similar) fail closed: unsigned or unverified events are rejected. Public contact forms use a honeypot, per-IP rate limiting, validation, and automated screening; rejected submissions are not delivered. Storage buckets holding financial or subcontractor documents are private.

## 8. Monitoring

Contact submissions keep an audit trail (screening verdict and related metadata). Internal ingest alerts on integrity failures that would otherwise silently skew financial records. Required environment and schema configuration is probed so a misconfigured deploy is visible.

## 9. Incidents

Suspected unauthorized access, leaked credentials, or data integrity issues are investigated immediately by the owner. Exposed secrets are rotated. Affected clients are notified when their data or access is involved. Access is revoked as needed.

## 10. Vendors

Processors are limited to what is required to run the business (hosting, database, email, payments, advertising measurement, AI screening). They process data only to provide their service to us.

## 11. Review

This policy is reviewed at least annually, or sooner after a material change in systems, vendors, or incidents.

---

Approved by: Jeremy Hopkins, Hoppy Tech LLC  
Date: August 14, 2026
