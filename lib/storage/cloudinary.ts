import cloudinary from "cloudinary";
import { GetResult, UploadOptions, UploadResult } from ".";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const upload = async (
  url: string,
  options: UploadOptions
): Promise<UploadResult> => {
  const uploadResult = await cloudinary.v2.uploader.upload(url, {
    overwrite: options.overwrite,
    publicId: options.publicId,
    folder: options.folder,
  });

  return {
    publicId: uploadResult.public_id,
    secureUrl: uploadResult.secure_url,
  };
};

const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResult> => {
  let byteArrayBuffer = await new Response(file).arrayBuffer();
  const buffer = Buffer.from(byteArrayBuffer);

  const mime = file.type;
  const encoding = "base64";
  const base64Data = buffer.toString("base64");
  const fileUri = "data:" + mime + ";" + encoding + "," + base64Data;

  return upload(fileUri, options);
};

const remove = async (id: string) => {
  await new Promise((resolve) => {
    cloudinary.v2.uploader.destroy(id, (error: any, result: any) => {
      resolve({
        url: result.secure_url,
        assetId: result.asset_id,
        publicId: result.public_id,
      });
    });
  });
};

const get = async (id: string): Promise<GetResult> => {
  return await new Promise((resolve) => {
    cloudinary.v2.api.resource(id, (error: any, result: any) => {
      resolve({
        assetId: result.asset_id,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        url: result.url,
        bytes: result.bytes,
        fileType: result.format,
        originalFilename: result.original_filename,
      } as GetResult);
    });
  });
};

const cloudinaryService = {
  get,
  upload,
  uploadFile,
  remove,
};

export default cloudinaryService;
