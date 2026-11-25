import {
  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.B2_REGION!,
  endpoint: process.env.B2_ENDPOINT!,
  credentials: { accessKeyId: process.env.B2_KEY_ID!, secretAccessKey: process.env.B2_APP_KEY! },
  // B2 rejects the newer default checksum headers
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

const Bucket = process.env.B2_BUCKET!;
const EXPIRES = 300; // 5 minutes

export const presignUpload = (key: string, contentType: string) =>
  getSignedUrl(s3, new PutObjectCommand({ Bucket, Key: key, ContentType: contentType }), { expiresIn: EXPIRES });

export const presignDownload = (key: string, fileName: string, inline: boolean, contentType?: string) =>
  getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket,
      Key: key,
      ResponseContentDisposition: `${inline ? 'inline' : 'attachment'}; filename="${fileName.replace(/["\r\n]/g, '')}"`,
      ...(contentType ? { ResponseContentType: contentType } : {}),
    }),
    { expiresIn: EXPIRES }
  );

export async function headObject(key: string): Promise<number | null> {
  try {
    const res = await s3.send(new HeadObjectCommand({ Bucket, Key: key }));
    return res.ContentLength ?? null;
  } catch {
    return null;
  }
}

export const deleteObject = (key: string) => s3.send(new DeleteObjectCommand({ Bucket, Key: key }));