import { WorkflowComponentType } from "../../types/workflowComponentType";
import { Parameter, ParameterType } from "../../types/parameter";

export const moduleName = "processBase64Images";
export const name = "Process Base64 Images";
export const code = "PROCESS_BASE64_IMAGES";
export const type = WorkflowComponentType.EmitEvent;
export const limit = 1;
export const parameters: Parameter[] = [
  {
    name: "shop",
    type: ParameterType.Shop,
    isConstant: true,
  },
];

const register = {
  code,
  name,
  parameters,
};

export default register;
