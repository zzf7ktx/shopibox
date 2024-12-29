import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { Credentials, ProductDto } from "..";
import getClient from "./getClient";
import { cartesian, groupByKey } from "@/utils";
import axios from "axios";

const getOrCreateCategory = async (
  client: WooCommerceRestApi,
  categoryName: string
) => {
  const response = await client.get("products/categories", {
    search: categoryName,
  });

  let category = response.data.find(
    (catg: any) => catg.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (!category) {
    const createResponse = await client.post("products/categories", {
      name: categoryName,
    });
    category = createResponse.data;
  }
  return category.id;
};

const getOrCreateAttribute = async (
  client: WooCommerceRestApi,
  attributeName: string
) => {
  const response = await client.get("products/attributes", {
    search: attributeName,
  });
  let attribute = response.data.find(
    (attr: any) => attr.name.toLowerCase() === attributeName.toLowerCase()
  );
  if (!attribute) {
    const createResponse = await client.post("products/attributes", {
      name: attributeName,
    });
    attribute = createResponse.data;
  }

  return attribute.id;
};
const uploadProduct = async (product: ProductDto, credentials: Credentials) => {
  const client = getClient(credentials);
  try {
    const categories = [];
    for (const catg of product.collections) {
      categories.push({
        id: await getOrCreateCategory(client, catg.collection.name),
      });
    }

    const images = product.images.map((i) => ({
      src: i.cloudLink ?? i.sourceLink,
    }));

    const attributes: any[] = [];
    let variants = groupByKey(product.variants ?? []);

    for (const variant of variants) {
      const attributeId = await getOrCreateAttribute(client, variant.name);
      attributes.push({
        id: attributeId,
        variation: true,
        options: variant.values,
      });
    }

    const variations = cartesian(...variants.map((v) => v.values)).map(
      (vs) => ({
        regular_price: product?.price?.toString() ?? "0",
        attributes: vs.map((vsa: any, index: number) => ({
          id: attributes[index].id,
          option: vsa,
        })),
      })
    );

    const response = await client.post("products", {
      name: product.name,
      description: product.description,
      sku: "",
      regular_price: product?.price?.toString() ?? "0",
      categories,
      images,
      attributes,
      variations,
    });
  } catch (error: any) {
    console.error("Error uploading product:", error);
  }
};

export default uploadProduct;
