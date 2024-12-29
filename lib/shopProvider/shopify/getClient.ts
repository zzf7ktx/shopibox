import { createAdminApiClient } from "@shopify/admin-api-client";

const getClient = (storeDomain: string, accessToken: string) =>
  createAdminApiClient({
    storeDomain: storeDomain,
    apiVersion: "2024-01",
    accessToken: accessToken,
  });

export default getClient;
