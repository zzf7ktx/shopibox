import mimeLib from "mime";
import * as fileType from "file-type";

const getExtension = (type: string) => mimeLib.getExtension(type);
const getMime = (url: string) => mimeLib.getType(url);
const getMimeFromBuffer = async (buffer: Buffer) => {
  const type = await fileType.fileTypeFromBlob(new Blob([buffer]));
  return { mime: type?.mime.toString() ?? "", ext: type?.ext.toString() ?? "" };
};

const getMimeFromBlob = async (blob: Blob) => {
  const type = await fileType.fileTypeFromBlob(blob);
  return { mime: type?.mime.toString() ?? "", ext: type?.ext.toString() ?? "" };
};

const getMimeFromArrayBuffer = async (buffer: ArrayBuffer) => {
  const type = await fileType.fileTypeFromBuffer(buffer);
  return { mime: type?.mime.toString() ?? "", ext: type?.ext.toString() ?? "" };
};

const mime = {
  getMime,
  getMimeFromBuffer,
  getMimeFromBlob,
  getMimeFromArrayBuffer,
  getExtension,
};
export default mime;
