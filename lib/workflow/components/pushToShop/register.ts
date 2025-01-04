import { WorkflowComponentType } from "../../types/workflowComponentType";
import { Parameter, ParameterType } from "../../types/parameter";

export const moduleName = "pushToShop";
export const name = "Push To Shop";
export const code = "PUSH_TO_SHOP";
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
