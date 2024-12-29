import { Credentials, ProductDto } from "..";
import uploadProduct from "./uploadProduct";

const uploadProductMany = async (
  products: ProductDto[],
  credentials: Credentials
) => {
  for (const product of products) {
    await uploadProduct(product, credentials);
  }
};

export default uploadProductMany;
