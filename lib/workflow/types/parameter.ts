export enum ParameterType {
  Text = "text",
  Number = "number",
  Bool = "bool",
  Product = "product",
  Products = "products",
  Shop = "shop",
  Shops = "shops",
  Collection = "collection",
  Collections = "collections",
}

export interface Parameter {
  name: string;
  type: ParameterType;
  defaultValue?: any;
  isConstant?: boolean;
}
