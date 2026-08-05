import crypto from "crypto";

/**
 * Generates ImageKit authentication parameters for secure client-side uploads.
 * Uses Node.js crypto to create an HMAC-SHA1 signature as required by ImageKit.
 */
export function getAuthenticationParameters(): {
  token: string;
  expire: number;
  signature: string;
} {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is required for ImageKit uploads");
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  const signatureData = token + expire;
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(signatureData)
    .digest("hex");

  return { token, expire, signature };
}

function getImageKitPrivateKey() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is required for ImageKit uploads");
  }
  return privateKey;
}

function getImageKitPublicKey() {
  const publicKey =
    process.env.IMAGEKIT_PUBLIC_KEY || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("IMAGEKIT_PUBLIC_KEY is required for ImageKit uploads");
  }
  return publicKey;
}

function getImageKitAuthHeader() {
  return `Basic ${Buffer.from(`${getImageKitPrivateKey()}:`).toString("base64")}`;
}

export interface ImageKitUploadResult {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  filePath?: string;
  size?: number;
  height?: number;
  width?: number;
}

export async function uploadImageToImageKit(
  file: File,
  fileName: string
): Promise<ImageKitUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", fileName);
  formData.append("publicKey", getImageKitPublicKey());
  formData.append("folder", "/retro-gaming/products");
  formData.append("useUniqueFileName", "true");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: getImageKitAuthHeader(),
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "ImageKit upload failed");
  }

  return data as ImageKitUploadResult;
}

export async function deleteImageKitFile(fileId?: string | null) {
  if (!fileId) return;

  const response = await fetch(
    `https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: getImageKitAuthHeader(),
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "ImageKit delete failed");
  }
}

export const getImageKitUrl = (
  path: string,
  transformations?: { width?: number; height?: number; quality?: number }
): string => {
  const endpoint =
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/ikmedia";
  const baseUrl = `${endpoint}${path}`;

  if (!transformations) return baseUrl;

  const params: string[] = [];
  if (transformations.width) params.push(`w-${transformations.width}`);
  if (transformations.height) params.push(`h-${transformations.height}`);
  if (transformations.quality) params.push(`q-${transformations.quality}`);

  return `${baseUrl}?tr=${params.join(",")}`;
};
