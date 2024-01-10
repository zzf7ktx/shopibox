const pi = require("piexifjs");

const debugExif = (exif: RawMetadata) => {
  for (const ifd in exif) {
    if (ifd == "thumbnail") {
      const thumbnailData = exif[ifd] === null ? "null" : exif[ifd];
      console.log(`- thumbnail: ${thumbnailData}`);
    } else {
      console.log(`- ${ifd}`);
      for (const tag in exif[ifd]) {
        console.log(
          `    - ${Object.entries(pi.TAGS[ifd][tag])}: ${
            exif[ifd][tag]
          }: ${tag}`
        );
      }
    }
  }
};

const decimalArrayToString = (array: Array<number>, zeroChar: string = "") => {
  var result = "";
  for (let i = 0; i < array.length; i++) {
    result += array[i] === 0 ? zeroChar : String.fromCharCode(+array[i], 10);
  }
  return result;
};

const load = (base64String: string): RawMetadata => {
  return pi.load(base64String);
};

const getBase64Image = async (imageUrl: string): Promise<string> => {
  let result = await fetch(imageUrl);
  const imageBytes = await result.arrayBuffer();
  var binary = "";
  var bytes = new Uint8Array(imageBytes);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
};

export enum MetaTags {
  XPTitle = "40091",
  XPKeywords = "40094",
  XPSubject = "40095",
  ImageDescription = "270",
}

export interface RawMetadata extends Partial<{ [key: string]: any }> {
  "0th": {
    // ImageDescription -> Title
    "270": string;
    "271": string;
    "272": string;
    "274": number;
    "282": Array<number>;
    "283": Array<number>;
    "296": number;
    "306": string;
    // ExifTag
    "34665": number;
    "34853": number;
    // XPTitle -> Subject
    "40091": Array<number>;
    // XPKeywords -> Tags
    "40094": Array<number>;
    // XPSubject -> Subject
    "40095": Array<number>;
  };
  Exif: {
    "33434": Array<number>;
    "33437": Array<number>;
    "34850": number;
    "34855": number;
    "36864": string;
    "36867": string;
    "36868": string;
    // binary string
    "37121": string;
    "37377": Array<number>;
    "37378": Array<number>;
    "37379": Array<number>;
    "37380": Array<number>;
    "37381": Array<number>;
    "37383": number;
    "37384": number;
    "37385": number;
    "37386": Array<number>;
    "37520": string;
    "37521": string;
    "37522": string;
    "40960": string;
    "40961": number;
    "40962": number;
    "40963": number;
    "41495": number;
    "41986": number;
    "41987": number;
    "41988": Array<number>;
    "41989": number;
    "41990": number;
  };
  GPS: {
    "1": string;
    "2": [[Array<any>], [Array<any>], [Array<any>]];
    "3": string;
    "4": [[Array<any>], [Array<any>], [Array<any>]];
    "5": number;
    "6": Array<number>;
    "29": string;
  };
  Interop: any;
  "1st": any;
  thumbnail: any;
}

const getMetaByTag = (rawMetadata: RawMetadata, tag: MetaTags): any => {
  switch (tag) {
    case MetaTags.XPTitle:
      return rawMetadata["0th"][40091];
    case MetaTags.ImageDescription:
      return rawMetadata["0th"][270];
    case MetaTags.XPKeywords:
      return rawMetadata["0th"][40094];
    case MetaTags.XPSubject:
      return rawMetadata["0th"][40095];
  }
};

const metadata = {
  load,
  debugExif,
  getBase64Image,
  getMetaByTag,
  decimalArrayToString,
};

export default metadata;
