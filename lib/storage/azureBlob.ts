import { BlobServiceClient } from "@azure/storage-blob";
import { GetResult, UploadOptions, UploadResult } from ".";
import { v1 as uuidv1 } from "uuid";
import urlUtil from "url";
import path from "path";

// const connectionString = process.env.AZURE_BLOB_CONNECTION_STRING ?? "";
// const blobServiceClient =
//   BlobServiceClient.fromConnectionString(connectionString);
// const containerClient = blobServiceClient.getContainerClient("shopibox");

const upload = async (
  url: string,
  options: UploadOptions
): Promise<UploadResult> => {
  // const parsedUrl = new urlUtil.URL(url);
  // const extension = path.extname(parsedUrl.pathname);
  // const blobName = options.overwrite ? options.publicId : uuidv1() + extension;
  // const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  // const result = await blockBlobClient.syncUploadFromURL(url);

  return {
    publicId: "blobName",
    secureUrl: "blockBlobClient.url",
  };
};

const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResult> => {
  // const parsedUrl = new urlUtil.URL(file.name);
  // const extension = path.extname(parsedUrl.pathname);
  // const blobName = options.overwrite ? options.publicId : uuidv1() + extension;
  // const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  // const result = await blockBlobClient.uploadData(file);

  return {
    publicId: "blobName",
    secureUrl: "blockBlobClient.url",
  };
};

const remove = async (id: string) => {
  // const blockBlobClient = containerClient.getBlockBlobClient(id);
  // const result = await blockBlobClient.delete();
};

const get = async (id: string): Promise<GetResult> => {
  // const blockBlobClient = containerClient.getBlockBlobClient(id);
  // const properties = await blockBlobClient.getProperties();
  return {
    assetId: id,
    bytes: 0,
    fileType: "",
    originalFilename: "blockBlobClient.name",
    publicId: id,
    secureUrl: "blockBlobClient.url",
    url: "blockBlobClient.url",
  };
};

const azureBlobService = {
  get,
  upload,
  uploadFile,
  remove,
};

export default azureBlobService;
