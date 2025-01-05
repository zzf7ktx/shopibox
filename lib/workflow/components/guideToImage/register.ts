import { WorkflowComponentType } from "../../types/workflowComponentType";
import { Parameter } from "../../types/parameter";

export const moduleName = "guideToImage";
export const name = "Guide To Image";
export const code = "GUILE_TO_IMAGE";
export const type = WorkflowComponentType.Transform;
export const limit = 1;
export const parameters: Parameter[] = [];

const register = {
  code,
  name,
  parameters,
};

export default register;
