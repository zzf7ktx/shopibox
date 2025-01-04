import { GetChatMPhi } from "../../../ml";
import { ProductDto } from "../../types/productDto";
import { Input } from "../../types/input";
import { code } from "./register";

const run = async (products: ProductDto[], inputs: Input[]) => {
  if (products.length === 0) {
    return [];
  }

  const listProductsString = products
    .map(
      (p) =>
        `{"collection":"${p.collections[0].collection.name}","title":"${p.name}"`
    )
    .join(",");

  const stream = GetChatMPhi([
    {
      role: "system",
      content:
        "You are master in write product name. Your product named by you should natural and without any special characters. The response only include json without ```json and ```.",
    },
    {
      role: "user",
      content:
        '[{"collection":"Slam Dunk Shoes","title":"Miyagi Ryota Kids Sneakers"},{"collection":"ABC Shoes", "title": "Sakuragi Hanamichi Kids Sneakers MV1302"},{"collection":"Slam Dunk Shoes","title":"Hisashi Mitsui Kids Sneakers MV1302"}]. Rewrite titles including all words in collection name and must include "shoes". Return json (without ```, json```) list of only titles (string, doublequote). Title must not have any special characters',
    },
    {
      role: "assistant",
      content: `["Slam Dunk Shoes Miyagi Ryota Kids Sneakers","ABC Shoes Sakuragi Hanamichi Kids Sneakers MV1302","Slam Dunk Shoes Hisashi Mitsui Kids Sneakers MV1302"]`,
    },
    {
      role: "user",
      content: `[${listProductsString}]. The response should only content the array`,
    },
  ]);

  let out = "";

  for await (const chunk of stream) {
    if (chunk.choices && chunk.choices.length > 0) {
      const newContent = chunk.choices[0].delta.content;
      out += newContent;
    }
  }

  const productTitles: string[] = JSON.parse(out);

  const newProducts = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    product.name = productTitles[i]?.replaceAll('"', "");
    newProducts.push(product);
  }

  return newProducts;
};

const component = {
  run,
  code,
};

export default component;
