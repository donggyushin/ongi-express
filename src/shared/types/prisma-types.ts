import { Prisma } from '../../generated/prisma';

// Type-safe interfaces for Prisma JSON fields
export interface ImageData {
  url: string;
  publicId: string;
}

// Type guards for runtime type checking
export function isImageData(obj: any): obj is ImageData {
  return obj && 
    typeof obj === 'object' && 
    typeof obj.url === 'string' && 
    typeof obj.publicId === 'string';
}

export function isImageDataArray(obj: any): obj is ImageData[] {
  return Array.isArray(obj) && obj.every(isImageData);
}

// Utility functions for type-safe conversion
export function parseImageData(json: Prisma.JsonValue | null): ImageData | null {
  if (!json) return null;
  if (isImageData(json)) return json;
  return null;
}

export function parseImageDataArray(json: Prisma.JsonValue[]): ImageData[] {
  if (!Array.isArray(json)) return [];
  return json.filter(isImageData) as unknown as ImageData[];
}