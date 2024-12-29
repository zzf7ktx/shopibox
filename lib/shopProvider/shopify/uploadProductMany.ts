import { cartesian, groupByKey } from "@/utils";
import getShopifyClient from "./getClient";
import { randomUUID } from "crypto";
import axios from "axios";
import FormData from "form-data";
import { ProductDto, Credentials } from "..";

const buildBulkCreateProductJsonl = async (
  products: ProductDto[],
  collectionMap: { [key: string]: string },
  locationIds: { id: string }[]
) => {
  let stringJsonl = "";

  for (let product of products) {
    let media: any[] = [];

    for (let img of product.images) {
      media.push({
        alt: img.name,
        originalSource: img.cloudLink ?? img.sourceLink,
        mediaContentType: "IMAGE",
      });
    }

    let names = new Set();
    for (let variant of product.variants ?? []) {
      names.add(variant.key);
    }

    let variants = cartesian(
      ...groupByKey(product.variants ?? []).map((v) => v.values)
    ).map((v) => ({
      options: v,
      price: product.price ?? 0,
      inventoryItem: {
        tracked: true,
      },
      inventoryPolicy: "CONTINUE",
      inventoryQuantities: locationIds.map((l) => ({
        availableQuantity: 10000000,
        locationId: l.id ?? 0,
      })),
      taxable: false,
    }));

    const input = {
      title: product.name,
      descriptionHtml: product.descriptionHtml,
      productType: product.category,
      options: Array.from(names),
      variants: variants,
      collectionsToJoin: product.collections.map(
        (collection) => collectionMap[collection.collection.name]
      ),
    };
    stringJsonl += `{ "input": ${JSON.stringify(
      input
    )}, "media": ${JSON.stringify(media)} }\n`;
  }
  return stringJsonl;
};

const uploadProductMany = async (
  products: ProductDto[],
  credentials: Credentials
) => {
  const shopifyClient = getShopifyClient(
    credentials.shopDomain,
    credentials.apiKey ?? ""
  );

  let allProductCollections: { title: string; description: string | null }[] =
    [];

  for (let product of products) {
    for (let collection of product.collections) {
      if (
        !allProductCollections.some(
          (c) => c.title === collection.collection.name
        )
      ) {
        allProductCollections.push({
          title: collection.collection.name,
          description: collection.collection.description,
        });
      }
    }
  }

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
  }[] =
    (await getCollectionResponse.json())?.data?.collections?.edges?.map(
      (e: any) => e.node
    ) ?? [];

  let collectionsToJoinMap: { [key: string]: string } = {};
  for (let productCollection of allProductCollections) {
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

      collectionsToJoinMap[productCollection.title] =
        result.data.collectionCreate.collection.id;
    } else {
      collectionsToJoinMap[productCollection.title] = collectionInfo.id;
    }
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

  const stringJsonl = await buildBulkCreateProductJsonl(
    products,
    collectionsToJoinMap,
    locations?.length > 0
      ? [
          {
            id: locations[0]?.node?.id ?? 0,
          },
        ]
      : []
  );

  const filename = randomUUID();
  const stagedUploadsCreate = `
    mutation {
      stagedUploadsCreate(
        input: {
          resource: BULK_MUTATION_VARIABLES
          filename: "${filename}"
          mimeType: "text/jsonl"
          httpMethod: POST
        }
      ) {
        userErrors {
          field
          message
        }
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
      }
    }
  `;

  const { data, errors, extensions } = await shopifyClient.request(
    stagedUploadsCreate
  );

  if (!!errors) {
    throw errors;
  }

  const [{ url, parameters }] = data.stagedUploadsCreate.stagedTargets;

  const formData = new FormData();

  parameters.forEach(({ name, value }: { name: string; value: string }) => {
    formData.append(name, value);
  });

  const file = Buffer.from(stringJsonl);

  formData.append("file", file);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
  } catch (error) {
    console.log(error);
  }

  const stagedUploadPath: string =
    parameters?.find((p: any) => p?.name === "key")?.value ?? "";

  const importProducts = `
  mutation {
    bulkOperationRunMutation(
      mutation: "mutation call($input: ProductInput!, $media: [CreateMediaInput!]) { productCreate(input: $input, media: $media) { product {id title variants(first: 10) {edges {node {id title inventoryQuantity }}}} userErrors { message field } } }",
      stagedUploadPath: "${stagedUploadPath}") {
      bulkOperation {
        id
        url
        status
      }
      userErrors {
        message
        field
      }
    }
  }`;

  const result = await shopifyClient.request(importProducts);

  if (result.data?.bulkOperationRunMutation?.userErrors?.length > 0) {
    throw new Error(
      JSON.stringify(result.data.bulkOperationRunMutation.userErrors)
    );
  }
};

export default uploadProductMany;
