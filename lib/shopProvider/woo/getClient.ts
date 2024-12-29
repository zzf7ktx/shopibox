import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { Credentials } from "..";

const getClient = (credentials: Credentials) =>
  new WooCommerceRestApi({
    url: credentials.shopDomain ?? "http://localhost:3000",
    consumerKey: credentials.apiKey ?? "",
    consumerSecret: credentials.apiSerect ?? "",
    version: "wc/v3",
  });

export default getClient;
