import ImageKit from "@imagekit/javascript";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export default imagekit;

export const getImageKitUrl = (
  path: string,
  transformations?: { width?: number; height?: number; quality?: number }
): string => {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
  const baseUrl = `${endpoint}${path}`;

  if (!transformations) return baseUrl;

  const params: string[] = [];
  if (transformations.width) params.push(`w-${transformations.width}`);
  if (transformations.height) params.push(`h-${transformations.height}`);
  if (transformations.quality) params.push(`q-${transformations.quality}`);

  return `${baseUrl}?tr=${params.join(",")}`;
};
