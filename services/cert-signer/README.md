# Certificate signer

Internal service for CF-602 and CF-603. It renders a vector PDF, embeds a detached RSA-4096/SHA-256 PDF signature from a mounted PKCS#12 key, and stores the signed bytes in a private MinIO bucket. Only the API knows the internal bearer token.

For local Compose, run `./scripts/create-dev-cert-ca.sh` once before `docker compose up`. This generates an untracked development CA under `.local-certificates/` and copies its public `.crt` to `.local-certificates/public/<CERT_SIGNING_KEY_ID>.crt` for API verification. A production signer must use a separately managed PKCS#12 file and password; do not reuse the development CA. Configure `CERT_P12_FILE`, `CERT_P12_PASSWORD`, `CERT_SIGNING_KEY_ID`, `CERT_SIGNER_TOKEN`, and object-store credentials through the deployment environment. Mount only public trusted `.crt` files into the API at `CERT_TRUSTED_CERTS_DIR`; keep old public certificates during key rotation so old codes remain verifiable. Never mount the private `.p12` or `.key` into the API.

`POST /v1/certificates` signs and stores one PDF for a deterministic certificate code. `GET /v1/certificates/:code/pdf` retrieves it for the authenticated API proxy. The service has no published host port.

For CF-603, `payloadSignature` is an RSA-SHA256 signature over the UTF-8 bytes of `JSON.stringify({ code, sessionId, name, examTitle, score, totalPoints, issuedAt })` in that exact property order. `signingKeyId` identifies the trusted public certificate; `verificationHash` is SHA-256 of the stored signed PDF. The public API checks both before declaring a certificate valid and never exposes the PDF.
