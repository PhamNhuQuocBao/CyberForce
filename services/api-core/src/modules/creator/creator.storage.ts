import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { ownedRoom, editable, creatorInvalid, creatorMissing } from './creator.content.js';

const maxBytes = 10 * 1024 * 1024;
const supported = new Set([
  'image/png',
  'image/jpeg',
  'application/pdf',
  'text/plain',
  'application/zip',
]);
const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: env.CREATOR_S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.CREATOR_S3_ACCESS_KEY,
    secretAccessKey: env.CREATOR_S3_SECRET_KEY,
  },
});
let bucketReady: Promise<void> | undefined;

async function ensureBucket() {
  if (
    env.NODE_ENV === 'production' &&
    (env.CREATOR_S3_ACCESS_KEY === 'cyberforce_minio' ||
      env.CREATOR_S3_SECRET_KEY === 'cyberforce_minio_dev')
  )
    throw creatorInvalid('Kho tệp production chưa được cấu hình.');
  bucketReady ??= (async () => {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: env.CREATOR_S3_BUCKET }));
    } catch (error) {
      if (env.NODE_ENV === 'production') throw error;
      await s3.send(new CreateBucketCommand({ Bucket: env.CREATOR_S3_BUCKET }));
    }
  })().catch((error) => {
    bucketReady = undefined;
    throw error;
  });
  await bucketReady;
}

function validBytes(bytes: Buffer, mime: string) {
  if (!supported.has(mime) || !bytes.length || bytes.length > maxBytes) return false;
  if (mime === 'image/png')
    return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (mime === 'application/pdf') return bytes.subarray(0, 5).toString() === '%PDF-';
  if (mime === 'application/zip') return bytes.subarray(0, 4).equals(Buffer.from([80, 75, 3, 4]));
  return !bytes.includes(0) && Buffer.from(bytes.toString('utf8')).equals(bytes);
}

export async function uploadCreatorAttachment(
  roomId: string,
  userId: string,
  filename: string,
  mime: string,
  bytes: Buffer,
) {
  const room = await ownedRoom(roomId, userId);
  editable(room);
  const safeName = basename(filename)
    .replace(/[^\p{L}\p{N}._ -]/gu, '_')
    .slice(0, 255);
  if (!safeName || !validBytes(bytes, mime))
    throw creatorInvalid('Tệp phải là PNG/JPEG/PDF/TXT/ZIP hợp lệ và không vượt quá 10 MB.');
  await ensureBucket();
  const objectKey = `creator/${roomId}/${randomUUID()}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: env.CREATOR_S3_BUCKET,
      Key: objectKey,
      Body: bytes,
      ContentType: mime,
    }),
  );
  try {
    return await prisma.$transaction(async (tx) => {
      const current = await ownedRoom(roomId, userId, tx);
      editable(current);
      const item = await tx.creatorAttachment.create({
        data: {
          roomId,
          uploaderId: userId,
          objectKey,
          filename: safeName,
          mimeType: mime,
          sizeBytes: bytes.length,
        },
      });
      await tx.room.update({
        where: { id: roomId },
        data: { reviewStatus: 'editing', reviewFingerprint: null, reviewFeedback: null },
      });
      await tx.auditLog.create({
        data: { actorId: userId, targetId: item.id, action: 'creator.attachment.uploaded' },
      });
      return {
        id: item.id,
        roomId,
        filename: item.filename,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
      };
    });
  } catch (error) {
    await s3
      .send(new DeleteObjectCommand({ Bucket: env.CREATOR_S3_BUCKET, Key: objectKey }))
      .catch(() => {});
    throw error;
  }
}

export async function creatorAttachment(roomId: string, attachmentId: string, userId: string) {
  await ownedRoom(roomId, userId);
  const item = await prisma.creatorAttachment.findFirst({ where: { id: attachmentId, roomId } });
  if (!item) throw creatorMissing();
  return item;
}

export async function downloadCreatorAttachment(
  roomId: string,
  attachmentId: string,
  userId: string,
) {
  const item = await creatorAttachment(roomId, attachmentId, userId);
  await ensureBucket();
  const response = await s3.send(
    new GetObjectCommand({ Bucket: env.CREATOR_S3_BUCKET, Key: item.objectKey }),
  );
  if (!response.Body) throw creatorMissing();
  const bytes = Buffer.from(await response.Body.transformToByteArray());
  return { item, bytes };
}

export async function downloadPublishedAttachment(roomId: string, attachmentId: string) {
  const item = await prisma.creatorAttachment.findFirst({ where: { id: attachmentId, roomId } });
  if (!item) throw creatorMissing();
  await ensureBucket();
  const response = await s3.send(
    new GetObjectCommand({ Bucket: env.CREATOR_S3_BUCKET, Key: item.objectKey }),
  );
  if (!response.Body) throw creatorMissing();
  return { item, bytes: Buffer.from(await response.Body.transformToByteArray()) };
}

export async function removeCreatorAttachment(
  roomId: string,
  attachmentId: string,
  userId: string,
) {
  const item = await creatorAttachment(roomId, attachmentId, userId);
  const room = await ownedRoom(roomId, userId);
  editable(room);
  await ensureBucket();
  await s3.send(new DeleteObjectCommand({ Bucket: env.CREATOR_S3_BUCKET, Key: item.objectKey }));
  await prisma.$transaction(async (tx) => {
    const current = await ownedRoom(roomId, userId, tx);
    editable(current);
    await tx.creatorAttachment.delete({ where: { id: item.id } });
    await tx.room.update({
      where: { id: roomId },
      data: { reviewStatus: 'editing', reviewFingerprint: null, reviewFeedback: null },
    });
    await tx.auditLog.create({
      data: { actorId: userId, targetId: item.id, action: 'creator.attachment.deleted' },
    });
  });
}
