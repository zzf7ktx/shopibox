import { Input } from "../../types/input";
import { ProductDto } from "../../types/productDto";
import { code } from "./register";
import metadata, { MetaTags, RawMetadata } from "@/lib/metadata";

const run = async (products: ProductDto[], inputs: Input[]) => {
  const inputObject = inputs.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.key]: cur.value,
    }),
    {} as { [key: string]: string }
  );

  for (const product of products) {
    for (const img of product.images) {
      let binary = "";
      if ((img.cloudLink as any) instanceof Buffer) {
        binary = (img.cloudLink as unknown as Buffer).toString("binary");
      } else {
        binary = await metadata.getBinaryStringImage(
          img.cloudLink ?? img.sourceLink
        );
      }

      let originalMeta: RawMetadata = metadata.load(binary);

      let newMeta: RawMetadata = { ...originalMeta };

      for (let [key, value] of Object.entries(MetaTags)) {
        if (!inputObject[key]) {
          continue;
        }

        newMeta = metadata.setMetaByTag(newMeta, value, inputObject[key]);
      }

      const newExifBinary = metadata.dump(newMeta!);
      const newPhotoData = metadata.insert(newExifBinary, binary);

      const fileBuffer = Buffer.from(newPhotoData, "binary");

      img.cloudLink = Buffer.from(fileBuffer.buffer) as any;
    }
  }

  return products;
};

const component = {
  run,
  code,
};

export default component;
