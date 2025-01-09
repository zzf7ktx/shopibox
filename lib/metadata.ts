import axios from "axios";

const pi = require("piexifjs");

const initRawMetadata = {
  "0th": {
    // ImageDescription -> Title
    "270": "",
    "271": "",
    "272": "",
    "274": 0,
    "282": [] as Array<number>,
    "283": [] as Array<number>,
    "296": 0,
    "306": "",
    // Artis
    "315": "",
    // ExifTag
    "34665": 0,
    "34853": 0,
    // XPTitle -> Subject
    "40091": [] as Array<number>,
    // XPKeywords -> Tags
    "40094": [] as Array<number>,
    // XPSubject -> Subject
    "40095": [] as Array<number>,
  },
  Exif: {
    "33434": [] as Array<number>,
    "33437": [] as Array<number>,
    "34850": 0,
    "34855": 0,
    "36864": "",
    "36867": "",
    "36868": "",
    // binary ""
    "37121": "",
    "37377": [] as Array<number>,
    "37378": [] as Array<number>,
    "37379": [] as Array<number>,
    "37380": [] as Array<number>,
    "37381": [] as Array<number>,
    "37383": 0,
    "37384": 0,
    "37385": 0,
    "37386": [] as Array<number>,
    "37520": "",
    "37521": "",
    "37522": "",
    "40960": "",
    "40961": 0,
    "40962": 0,
    "40963": 0,
    "41495": 0,
    "41986": 0,
    "41987": 0,
    "41988": [] as Array<number>,
    "41989": 0,
    "41990": 0,
  },
  GPS: {
    "1": "",
    "2": [[] as any, [] as any, [] as any],
    "3": "",
    "4": [[] as any, [] as any, [] as any],
    "5": 0,
    "6": [] as Array<number>,
    "29": "",
  },
  Interop: "",
  "1st": {
    "513": "",
  },
  thumbnail: [],
};

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

const decimalArrayToString = (
  array: Array<number>,
  zeroChar: string = ""
): string => {
  var result = "";
  for (let i = 0; i < array.length; i++) {
    result += array[i] === 0 ? zeroChar : String.fromCharCode(+array[i], 10);
  }
  return result;
};

const stringToDecimalArray = (stringValue: string): Array<number> => {
  var result = [];
  for (let i = 0; i < stringValue.length; i++) {
    result.push(stringValue.charCodeAt(i));
    result.push(0);
  }
  result.push(0);
  result.push(0);
  return result;
};

const load = (base64String: string): RawMetadata => {
  try {
    return pi.load(base64String);
  } catch (error) {
    return initRawMetadata as RawMetadata;
  }
};

const dump = (rawMetadata: RawMetadata): any => {
  return pi.dump(rawMetadata);
};

const insert = (newExifBinary: string, imageData: string): string => {
  return pi.insert(newExifBinary, imageData);
};

const setMetaByTag = (
  rawMetadata: RawMetadata,
  tag: MetaTags,
  value: string
): RawMetadata => {
  switch (tag) {
    case MetaTags.XPTitle:
      rawMetadata["0th"][40091] = stringToDecimalArray(value);
      break;
    case MetaTags.ImageDescription:
      rawMetadata["0th"][270] = value;
      break;
    case MetaTags.XPKeywords:
      rawMetadata["0th"][40094] = stringToDecimalArray(value);
      break;
    case MetaTags.XPSubject:
      rawMetadata["0th"][40095] = stringToDecimalArray(value);
      break;
    case MetaTags.Artist:
      rawMetadata["0th"][315] = value;
      break;
  }
  return rawMetadata;
};

const getBinaryStringImage = async (imageUrl: string): Promise<string> => {
  const imageBuffer = (
    await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    })
  ).data as Buffer;

  return imageBuffer.toString("binary");
};

export enum MetaTags {
  XPTitle = "40091",
  XPKeywords = "40094",
  XPSubject = "40095",
  ImageDescription = "270",
  Artist = "315",
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
    // Artis
    "315": string;
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
      return rawMetadata?.["0th"]?.[40091] ?? [];
    case MetaTags.ImageDescription:
      return rawMetadata?.["0th"]?.[270] ?? "";
    case MetaTags.XPKeywords:
      return rawMetadata?.["0th"]?.[40094] ?? [];
    case MetaTags.XPSubject:
      return rawMetadata?.["0th"]?.[40095] ?? [];
    case MetaTags.Artist:
      return rawMetadata?.["0th"]?.[315] ?? "";
  }
};

const metadata = {
  load,
  dump,
  insert,
  debugExif,
  getBinaryStringImage,
  getMetaByTag,
  setMetaByTag,
  decimalArrayToString,
  stringToDecimalArray,
};

export default metadata;
