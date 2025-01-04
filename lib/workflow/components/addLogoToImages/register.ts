import { WorkflowComponentType } from "../../types/workflowComponentType";
import { Parameter, ParameterType } from "../../types/parameter";

export const moduleName = "addLogoToImages";
export const name = "Add Logo To Images";
export const code = "ADD_LOGO_TO_IMAGES";
export const type = WorkflowComponentType.Transform;
export const limit = 1;
export const parameters: Parameter[] = [
  {
    name: "shop",
    type: ParameterType.Shop,
    isConstant: true,
  },
  {
    name: "x",
    type: ParameterType.Number,
  },
  {
    name: "y",
    type: ParameterType.Number,
  },
  {
    name: "scale",
    type: ParameterType.Number,
  },
];

const register = {
  code,
  name,
  parameters,
};

export default register;
