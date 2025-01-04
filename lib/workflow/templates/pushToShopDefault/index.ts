import { WorkflowTemplateStep } from "@prisma/client";
import pushToShop from "../../components/pushToShop/register";
import { WorkflowTemplateTarget } from "../../types/workflowTemplateTarget";

export const name = "Push To Shop Default";
export const code = "PUSH_TO_SHOP_DEFAULT";
export const target = WorkflowTemplateTarget.PushToShop;
export const steps: Partial<WorkflowTemplateStep>[] = [
  {
    componentCode: pushToShop.code,
    defaultInputValues: JSON.stringify([]),
    order: 100,
  },
];

const register = {
  code,
  name,
  target,
  steps,
};

export default register;
