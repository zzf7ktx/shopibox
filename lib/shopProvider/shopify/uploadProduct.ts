"use server";

import { cartesian, groupByKey } from "@/utils";
import getClient from "./getClient";
import { ProductDto, Credentials } from "..";

const uploadProduct = async (product: ProductDto, credentials: Credentials) => {
  const shopifyClient = getClient(
    credentials.shopDomain,
    credentials.apiKey ?? ""
  );

  const getCollectionResponse = await shopifyClient.fetch(`
    query {
      collections(first: 5) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `);

  let shopifyCollections: {
    id: string;
    title: string;
  }[] = (await getCollectionResponse.json()).data.collections.edges.map(
    (e: any) => e.node
  );

  let productCollections = (product?.collections ?? []).map((c) => ({
    title: c.collection.name,
    description: c.collection.description,
  }));

  let collectionsToJoin: string[] = [];

  for (let productCollection of productCollections) {
    let collectionInfo = shopifyCollections.find(
      (sc) => sc.title === productCollection.title
    );
    if (!collectionInfo) {
      const createCollectionQuery = `
        mutation collectionCreate($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection {
              id
              title
              descriptionHtml
              handle
              sortOrder
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      const result = await shopifyClient.request(createCollectionQuery, {
        variables: {
          input: {
            title: productCollection.title,
            descriptionHtml: productCollection.description,
          },
        },
      });
      collectionsToJoin.push(result.data.collectionCreate.collection.id);
    } else {
      collectionsToJoin.push(collectionInfo.id);
    }
  }

  const createProduct = `
    mutation ProductCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
      productCreate(input: $input, media: $media) {
        product {
          id
          title
          variants(first: 10) {
            edges {
              node {
                id
                title
                inventoryQuantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  let media: any[] = [];

  for (let img of product.images) {
    media.push({
      alt: img.name,
      originalSource: img.cloudLink ?? img.sourceLink,
      mediaContentType: "IMAGE",
    });
  }

  const getLocationResponse = await shopifyClient.fetch(`
        query {
          locations(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      `);

  let locations = (await getLocationResponse.json()).data?.locations?.edges;

  let names = new Set();
  for (let variant of product.variants ?? []) {
    names.add(variant.key);
  }

  // Temporally solution: fix 10000000 for first location
  let variants =
    !product?.variants || product?.variants.length === 0
      ? []
      : cartesian(
          ...groupByKey(product.variants ?? []).map((v) => v.values)
        ).map((v) => ({
          options: v,
          price: product.price ?? 0,
          inventoryItem: {
            tracked: true,
          },
          taxable: false,
          inventoryPolicy: "CONTINUE",
          inventoryQuantities:
            locations?.length > 0
              ? [
                  {
                    availableQuantity: 10000000,
                    locationId: locations[0]?.node?.id ?? 0,
                  },
                ]
              : [],
        }));
  const result = await shopifyClient.request(createProduct, {
    variables: {
      input: {
        title: product.name,
        descriptionHtml: product.descriptionHtml,
        productType: product.category,
        options: Array.from(names),
        variants: variants,
        collectionsToJoin: collectionsToJoin,
      },
      media,
    },
  });

  if (!!result.errors || result.data?.productCreate?.userErrors?.length > 0) {
    throw (
      result.errors ??
      new Error(JSON.stringify(result.data?.productCreate?.userErrors))
    );
  }
};

export default uploadProduct;
