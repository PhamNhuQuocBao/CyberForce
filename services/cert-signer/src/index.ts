import http from 'node:http';
import { readFileSync } from 'node:fs';
import { createHash, timingSafeEqual } from 'node:crypto';
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { pdfkitAddPlaceholder } from '@signpdf/placeholder-pdfkit';
import { P12Signer } from '@signpdf/signer-p12';
import { SignPdf } from '@signpdf/signpdf';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import forge from 'node-forge';

const env = {
  port: Number(process.env.PORT ?? 8083),
  token: process.env.CERT_SIGNER_TOKEN ?? '',
  p12Path: process.env.CERT_P12_PATH ?? '',
  p12Password: process.env.CERT_P12_PASSWORD ?? '',
  keyId: process.env.CERT_SIGNING_KEY_ID ?? '',
  fontPath: process.env.CERT_FONT_PATH ?? '',
  origin: process.env.CERT_PUBLIC_ORIGIN ?? '',
  bucket: process.env.CERT_S3_BUCKET ?? 'cyberforce-certificates',
  endpoint: process.env.CERT_S3_ENDPOINT ?? '',
  accessKey: process.env.CERT_S3_ACCESS_KEY ?? '',
  secretKey: process.env.CERT_S3_SECRET_KEY ?? '',
};
if (
  !env.token ||
  env.token.length < 32 ||
  !env.p12Path ||
  !env.keyId ||
  !env.fontPath ||
  !env.origin ||
  !env.endpoint ||
  !env.accessKey ||
  !env.secretKey
) {
  throw new Error('Certificate signer configuration is incomplete');
}
const p12Bytes = readFileSync(env.p12Path);
const p12 = forge.pkcs12.pkcs12FromAsn1(
  forge.asn1.fromDer(p12Bytes.toString('binary')),
  false,
  env.p12Password,
);
const keyBag =
  p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
    forge.pki.oids.pkcs8ShroudedKeyBag
  ]?.[0] ?? p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag]?.[0];
const privateKey = keyBag?.key as forge.pki.rsa.PrivateKey | undefined;
if (!privateKey || privateKey.n.bitLength() !== 4096)
  throw new Error('Certificate key must be RSA-4096');
const rsaKey = privateKey;
const signpdf = new SignPdf();
const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: env.endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId: env.accessKey, secretAccessKey: env.secretKey },
});
const codePattern = /^CF-CERT-\d{4}-[A-F0-9]{6}$/;
const sessionPattern = /^[a-f0-9-]{36}$/;
const keyFor = (code: string) => `certificates/${code}.pdf`;

async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.bucket }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: env.bucket }));
  }
}
function authorized(value: string | undefined) {
  const expected = Buffer.from(`Bearer ${env.token}`);
  const actual = Buffer.from(value ?? '');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
function json(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
async function readJson(req: http.IncomingMessage) {
  let body = '';
  for await (const chunk of req) {
    body += chunk.toString();
    if (body.length > 16_384) throw new Error('Request too large');
  }
  return JSON.parse(body) as Record<string, unknown>;
}
function canonical(data: {
  code: string;
  sessionId: string;
  name: string;
  examTitle: string;
  score: number;
  totalPoints: number;
  issuedAt: string;
}) {
  return JSON.stringify(data);
}
async function render(data: {
  code: string;
  name: string;
  examTitle: string;
  score: number;
  totalPoints: number;
  issuedAt: string;
}) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 0,
    autoFirstPage: true,
    compress: false,
  });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  doc.registerFont('Inter', env.fontPath);
  const width = 841.89;
  doc.rect(0, 0, width, 595.28).fill('#0B1220');
  doc
    .rect(23, 23, width - 46, 549)
    .lineWidth(1.5)
    .stroke('#CBAA6A');
  doc
    .fillColor('#CBAA6A')
    .font('Inter')
    .fontSize(13)
    .text('CYBERFORCE', 67, 61, { characterSpacing: 3 });
  doc.fillColor('#F5F3EE').fontSize(31).text('CERTIFICATE OF ACHIEVEMENT', 67, 132);
  doc.fillColor('#A8B3C7').fontSize(12).text('This certifies that', 67, 210);
  let nameSize = 29;
  while (nameSize > 12 && doc.fontSize(nameSize).heightOfString(data.name, { width: 570 }) > 46)
    nameSize--;
  doc.fillColor('#FFFFFF').fontSize(nameSize).text(data.name, 67, 239, { width: 570 });
  doc.moveTo(67, 290).lineTo(590, 290).strokeColor('#CBAA6A').lineWidth(1).stroke();
  doc.fillColor('#A8B3C7').fontSize(12).text('has successfully passed', 67, 310);
  let titleSize = 19;
  while (
    titleSize > 10 &&
    doc.fontSize(titleSize).heightOfString(data.examTitle, { width: 600 }) > 58
  )
    titleSize--;
  doc.fillColor('#FFFFFF').fontSize(titleSize).text(data.examTitle, 67, 337, { width: 600 });
  doc.fillColor('#CBAA6A').fontSize(13).text(`SCORE  ${data.score}/${data.totalPoints}`, 67, 405);
  doc
    .fillColor('#A8B3C7')
    .fontSize(10)
    .text(
      `ISSUED  ${new Date(data.issuedAt).toLocaleDateString('en-GB', { timeZone: 'UTC' })}`,
      67,
      475,
    );
  doc.text(data.code, 67, 496);
  const verifyUrl = `${env.origin.replace(/\/$/, '')}/verify/${data.code}`;
  const qr = await QRCode.toDataURL(verifyUrl, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
  doc.image(qr, 650, 367, { width: 130, height: 130 });
  doc
    .fillColor('#A8B3C7')
    .fontSize(9)
    .text('SCAN TO VERIFY', 649, 505, { width: 132, align: 'center' });
  pdfkitAddPlaceholder({
    pdf: doc,
    pdfBuffer: Buffer.alloc(0),
    reason: 'CyberForce Capstone Certificate',
    contactInfo: 'CyberForce',
    name: 'CyberForce Certificate Authority',
    location: 'CyberForce',
    signingTime: new Date(data.issuedAt),
    signatureLength: 16_384,
  });
  doc.end();
  return done;
}
async function issue(body: Record<string, unknown>) {
  const { code, sessionId, name, examTitle, score, totalPoints, issuedAt } = body;
  if (
    typeof code !== 'string' ||
    !codePattern.test(code) ||
    typeof sessionId !== 'string' ||
    !sessionPattern.test(sessionId) ||
    typeof name !== 'string' ||
    !name.trim() ||
    name.length > 120 ||
    typeof examTitle !== 'string' ||
    !examTitle.trim() ||
    examTitle.length > 255 ||
    typeof score !== 'number' ||
    !Number.isInteger(score) ||
    score < 0 ||
    typeof totalPoints !== 'number' ||
    !Number.isInteger(totalPoints) ||
    totalPoints <= 0 ||
    score > totalPoints ||
    typeof issuedAt !== 'string' ||
    !Number.isFinite(Date.parse(issuedAt))
  )
    throw new Error('Invalid certificate input');
  const data = {
    code,
    sessionId,
    name: name.trim(),
    examTitle: examTitle.trim(),
    score,
    totalPoints,
    issuedAt,
  };
  const pdf = await render(data);
  const signed = await signpdf.sign(pdf, new P12Signer(p12Bytes, { passphrase: env.p12Password }));
  const digest = createHash('sha256').update(signed).digest('hex');
  const md = forge.md.sha256.create();
  md.update(canonical(data), 'utf8');
  const payloadSignature = Buffer.from(rsaKey.sign(md), 'binary').toString('base64');
  await ensureBucket();
  const key = keyFor(code);
  await s3.send(
    new PutObjectCommand({
      Bucket: env.bucket,
      Key: key,
      Body: signed,
      ContentType: 'application/pdf',
      Metadata: { sha256: digest, 'signing-key-id': env.keyId },
    }),
  );
  return {
    pdfS3Key: key,
    verificationHash: `sha256:${digest}`,
    signingKeyId: env.keyId,
    payloadSignature,
  };
}
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health')
    return json(res, 200, { healthy: true, keyId: env.keyId });
  if (!authorized(req.headers.authorization)) return json(res, 401, { error: 'Unauthorized' });
  try {
    if (req.method === 'POST' && req.url === '/v1/certificates')
      return json(res, 201, await issue(await readJson(req)));
    const match = /^\/v1\/certificates\/(CF-CERT-\d{4}-[A-F0-9]{6})\/pdf$/.exec(req.url ?? '');
    if (req.method === 'GET' && match) {
      const object = await s3.send(
        new GetObjectCommand({ Bucket: env.bucket, Key: keyFor(match[1]) }),
      );
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `attachment; filename="${match[1]}.pdf"`,
      });
      if (!object.Body) throw new Error('Empty object');
      for await (const chunk of object.Body as AsyncIterable<Uint8Array>) res.write(chunk);
      return res.end();
    }
    return json(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('Certificate signer request failed', error);
    if (!res.headersSent) json(res, 500, { error: 'Certificate service failed' });
    else res.destroy(error instanceof Error ? error : undefined);
  }
});
server.listen(env.port, '0.0.0.0', () =>
  console.info(`Certificate signer listening on ${env.port}`),
);
