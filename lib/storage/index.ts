import { StorageProvider } from "@/types/StorageProvider";
import cloudinaryService from "./cloudinary";

export interface UploadOptions {
  overwrite: boolean;
  publicId: string;
  folder: string;
}

export interface UploadResult {
  secureUrl: string;
  publicId: string;
}

export interface GetResult {
  assetId: string;
  publicId: string;
  fileType: string;
  bytes: number;
  url: string;
  secureUrl: string;
  originalFilename: string;
}

const upload = (
  url: string,
  options: UploadOptions,
  provider: StorageProvider = StorageProvider.Cloudinary
): Promise<UploadResult> => {
  switch (provider) {
    case StorageProvider.Cloudinary:
    default:
      return cloudinaryService.upload(url, options);
  }
};

const uploadFile = (
  file: File,
  options: UploadOptions,
  provider: StorageProvider = StorageProvider.Cloudinary
): Promise<UploadResult> => {
  switch (provider) {
    case StorageProvider.Cloudinary:
    default:
      return cloudinaryService.uploadFile(file, options);
  }
};

const remove = (
  id: string,
  provider: StorageProvider = StorageProvider.Cloudinary
) => {
  switch (provider) {
    case StorageProvider.Cloudinary:
    default:
      return cloudinaryService.remove(id);
  }
};

const get = (
  id: string,
  provider: StorageProvider = StorageProvider.Cloudinary
): Promise<GetResult> => {
  switch (provider) {
    case StorageProvider.Cloudinary:
    default:
      return cloudinaryService.get(id);
  }
};

const storage = {
  get,
  upload,
  uploadFile,
  remove,
};

export default storage;
