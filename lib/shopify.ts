import { createAdminApiClient } from "@shopify/admin-api-client";

const getShopifyClient = (storeDomain: string, accessToken: string) =>
  createAdminApiClient({
    storeDomain: storeDomain,
    apiVersion: "2023-04",
    accessToken: accessToken,
  });

export default getShopifyClient;
