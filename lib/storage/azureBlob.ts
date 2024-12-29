import { BlobServiceClient } from "@azure/storage-blob";
import { GetResult, UploadOptions, UploadResult } from ".";
import { v1 as uuidv1 } from "uuid";
import urlUtil from "url";
import path from "path";
import mime from "../mime";

const connectionString = process.env.AZURE_BLOB_CONNECTION_STRING ?? "";
const containerName = process.env.AZURE_BLOB_CONTAINER_NAME ?? "";

const blobServiceClient = connectionString
  ? BlobServiceClient.fromConnectionString(connectionString)
  : new BlobServiceClient("http://localhost:3000");

const getOrCreateContainer = async () => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const exists = await containerClient.exists();
  if (!exists) {
    await containerClient.create();
    console.log(`Container "${containerName}" created.`);
  } else {
    console.log(`Container "${containerName}" already exists.`);
  }
  return containerClient;
};

const upload = async (
  url: string,
  options: UploadOptions
): Promise<UploadResult> => {
  const containerClient = await getOrCreateContainer();
  const parsedUrl = new urlUtil.URL(url);
  const extension = path.extname(parsedUrl.pathname);
  const blobName =
    options.overwrite && options.publicId
      ? options.publicId
      : [options.folder, uuidv1() + extension].join("/");
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const result = await blockBlobClient.syncUploadFromURL(url, {
    blobHTTPHeaders: {
      blobContentType: mime.getMime(url) ?? "application/octet-stream",
    },
  });

  return {
    publicId: blobName,
    secureUrl: blockBlobClient.url,
  };
};

const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResult> => {
  const containerClient = await getOrCreateContainer();
  const extension = path.extname(file.name);
  const blobName =
    options.overwrite && options.publicId
      ? options.publicId
      : [options.folder, uuidv1() + extension].join("/");
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const array = await file.arrayBuffer();
  const result = await blockBlobClient.uploadData(array, {
    blobHTTPHeaders: {
      blobContentType: mime.getMime(file.name) ?? "application/octet-stream",
    },
  });

  return {
    publicId: blobName,
    secureUrl: blockBlobClient.url,
  };
};

const remove = async (id: string) => {
  const containerClient = await getOrCreateContainer();
  const blockBlobClient = containerClient.getBlockBlobClient(id);
  const result = await blockBlobClient.delete();
};

const get = async (id: string): Promise<GetResult> => {
  const containerClient = await getOrCreateContainer();
  const blockBlobClient = containerClient.getBlockBlobClient(id);
  const properties = await blockBlobClient.getProperties();
  return {
    assetId: id,
    bytes: properties.contentLength ?? 0,
    fileType: properties.contentType ?? "",
    originalFilename: blockBlobClient.name,
    publicId: id,
    secureUrl: blockBlobClient.url,
    url: blockBlobClient.url,
  };
};

const azureBlobService = {
  get,
  upload,
  uploadFile,
  remove,
};

export default azureBlobService;
