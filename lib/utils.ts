import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import mime from "./mime";
import { blobToFile } from "@/utils/blobToFile";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const bufferToDataUri = async (buffer: Buffer) => {
  const uint8Array = new Uint8Array(buffer);
  const blob = new Blob([uint8Array]);
  const newFile = blob as File;
  let byteArrayBuffer = await new Response(newFile).arrayBuffer();
  const encoding = "base64";
  const base64Data = buffer.toString("base64");
  const { mime: mimeType } = await mime.getMimeFromArrayBuffer(byteArrayBuffer);
  const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

  return fileUri;
};

export const arrayBufferToDataUri = async (buffer: ArrayBuffer) => {
  const encoding = "base64";
  const base64Data = Buffer.from(buffer).toString("base64");
  const { mime: mimeType } = await mime.getMimeFromArrayBuffer(buffer);
  const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

  return fileUri;
};

export const isBase64Uri = (uri: string) => {
  const temp = uri.split(":");
  return temp.length > 1 && temp[0] === "data";
};

export const uriToFile = async (uri: string, fileNameWithoutExt: string) => {
  const [_, ...mimeAndData] = uri.split(":");
  const [mimeType, ...encodingAndData] = mimeAndData.join().split(";");
  const [encoding, ...dataList] = encodingAndData.join().split(",");
  const data = dataList.join();
  const ext = mime.getExtension(mimeType);
  const buffer = Buffer.from(data, encoding as BufferEncoding);
  const blob = new Blob([buffer], { type: mimeType });

  const file = blobToFile(blob, `${fileNameWithoutExt}.${ext}`);
  return file;
};

export const uriToBuffer = async (uri: string) => {
  const [_, ...mimeAndData] = uri.split(":");
  const [mimeType, ...encodingAndData] = mimeAndData.join().split(";");
  const [encoding, ...dataList] = encodingAndData.join().split(",");
  const data = dataList.join();
  const ext = mime.getExtension(mimeType);
  const buffer = Buffer.from(data, encoding as BufferEncoding);
  return buffer;
};
