import { WorkflowComponentType } from "../../types/workflowComponentType";
import { Parameter } from "../../types/parameter";

export const moduleName = "rewriteProductTitleIncludeCollectionName";
export const name = "Rewrite Product Title Include Collection Name";
export const code = "REWRITE_PRODUCT_TITLE_INCLUDE_COLLECTION_NAME";
export const type = WorkflowComponentType.Transform;
export const limit = 1;
export const parameters: Parameter[] = [];

const register = {
  code,
  name,
  parameters,
};

export default register;
