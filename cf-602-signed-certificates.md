# CF-602 — Signed capstone certificates (approved implementation)

## Goal

Issue one downloadable, cryptographically signed PDF certificate per passing Capstone exam session, store it privately in MinIO, and show its status and links on the result screen.

## Approved implementation

1. Add a durable certificate issuance record keyed uniquely by `examSessionId`. Finalization and timeout enqueue only eligible, final exam sessions. A small worker retries pending/failed work after restarts, while the existing `Certificate` row is created only after the signed PDF is stored successfully. Preserve immutable exam score and one certificate per session.
2. Add `services/cert-signer/` as an internal Node service. Render a vector PDF with the learner name, exam title, score, certificate code, issue date, and a QR code for `/verify/[code]`; apply an actual embedded RSA-4096/SHA-256 PDF signature using a mounted PKCS#12 CA credential; upload the signed bytes to a private MinIO bucket. Keep the private key out of the API and repository. Use PDFKit, `@signpdf` PDFKit placeholder/P12 signer, `qrcode`, and AWS SDK v3 S3 client.
3. Add authenticated exam result/status and PDF download APIs. The API checks certificate ownership, streams the private object, and does not expose the bucket or internal signing endpoint. The signer accepts only internal requests with a dedicated token. Include a key identifier and digest/signature metadata for future CF-603 verification.
4. Build `/exams/[slug]/results` from the modern-minimal EXAM-03 spec: passed/failed score, pending/error/issued certificate state, download and LinkedIn actions when issued, and a 14-day retry date when failed. Remove the current fabricated profile certificate awarded from EXP.
5. Add signer health/configuration to local Compose, private bucket initialization, and a development-only test CA fixture. Do not apply a migration to any existing database or deploy to production in this task without separate approval.
6. Verify one issuance after finish and after timeout, no issuance below threshold, retry after transient S3/signing failure, no duplicate on repeated finish/restart, PDF signature validity, QR URL, owner-only download, and full API/web build and test suites.

## Approved decisions

1. **Passing threshold.** CF-601 already stores each exam's `passingScore`, while the CF-602 roadmap says at least 80% and the epic gives a 70/100 example. Recommend using the configured `passingScore` as the single rule for both “passed” and certificate issuance. A hard 80% floor would make some learners pass the exam yet receive no certificate; enforcing 80% in exam configuration would change existing exams.
2. **PDF signature and service.** Recommend a real embedded PDF signature with a dedicated signer and mounted PKCS#12 RSA-4096 credential. This needs new packages, a service, secrets, and storage configuration, but PDF readers can validate the file. Signing only a database payload would be simpler but would not make the PDF itself digitally signed.
3. **Recipient name.** The user model has `username` but no real/display name. Recommend adding a certificate name field that the learner confirms before exam start; snapshot it into the exam session so automatic issuance can use a stable name. Existing completed sessions would need a one-time name confirmation before issuing. Using `username` requires no extra flow but may produce an unsuitable official certificate.
4. **Issuance state.** Recommend a separate issuance table plus a unique session link on `Certificate`. This supports retry and makes duplicate issuance preventable across restarts. Extending `Certificate` with nullable in-progress fields is smaller but mixes incomplete jobs with issued credentials.

## Current state and constraints

CF-601 is merged in main at 9f8fddb. CF-603 will implement the public verification page later, so the QR URL is reserved in CF-602. The user approved the technical choices and requested the task description be updated before implementation.

## Implementation record

- Updated CF-602 in `task-breakdown.md`, US-06.02 in the epic, and section 10 of the TDD before coding.
- Added an issuance record per exam session, automatic retry worker, owner-only certificate status and download API, one-time name confirmation for passing legacy sessions, and a result screen.
- Added an internal PKCS#12 signer, private MinIO storage, local Compose configuration, and a script that generates an ignored development-only RSA-4096 CA.
- Verified a real PDF with `pdfsig`: SHA-256, valid detached signature, entire document signed. Rendered and inspected the PDF with a Vietnamese learner name and QR. API tests cover retry, duplicate prevention, expiration, below-threshold score, name confirmation, and owner-only download.
- The public `/verify/[code]` portal remains CF-603. No migration was applied to an existing database and no production deployment was performed.
