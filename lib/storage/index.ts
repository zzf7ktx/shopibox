import { StorageProvider } from "@/types/storageProvider";
import cloudinaryService from "./cloudinary";
import azureBlobService from "./azureBlob";

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
  provider: StorageProvider = StorageProvider.Azure
): Promise<UploadResult> => {
  switch (provider) {
    case StorageProvider.Cloudinary:
      return cloudinaryService.upload(url, options);
    default:
      return azureBlobService.upload(url, options);
  }
};

const uploadFile = (
  file: File,
  options: UploadOptions,
  provider: StorageProvider = StorageProvider.Azure
): Promise<UploadResult> => {
  switch (provider) {
    case StorageProvider.Cloudinary:
      return cloudinaryService.uploadFile(file, options);
    default:
      return azureBlobService.uploadFile(file, options);
  }
};

const remove = (
  id: string,
  provider: StorageProvider = StorageProvider.Azure
) => {
  switch (provider) {
    case StorageProvider.Cloudinary:
      return cloudinaryService.remove(id);
    default:
      return azureBlobService.remove(id);
  }
};

const get = (
  id: string,
  provider: StorageProvider = StorageProvider.Azure
): Promise<GetResult> => {
  switch (provider) {
    case StorageProvider.Cloudinary:
      return cloudinaryService.get(id);
    default:
      return azureBlobService.get(id);
  }
};

const storage = {
  get,
  upload,
  uploadFile,
  remove,
};

export default storage;
