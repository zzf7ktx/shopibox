import { WorkflowComponentType } from "../../types/workflowComponentType";
import { Parameter, ParameterType } from "../../types/parameter";
import { MetaTags } from "../../../metadata";

export const name = "Set Image Metadata";
export const moduleName = "setImageMetadata";
export const code = "SET_IMAGE_METADATA";
export const type = WorkflowComponentType.ProcessImage;
export const limit = 1;
export const parameters: Parameter[] = Object.keys(MetaTags).map((tag) => ({
  name: tag,
  type: ParameterType.Text,
}));

export const requireCode = "PROCESS_BASE64_IMAGES";

const register = {
  code,
  name,
  parameters,
};

export default register;
