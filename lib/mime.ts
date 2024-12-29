import mimeLib from "mime";

const getMime = (url: string) => mimeLib.getType(url);

const mime = { getMime };
export default mime;
