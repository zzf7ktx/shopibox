import { Prisma, Workflow } from "@prisma/client";
import prisma from "../prisma";
import { Input } from "./types/input";
import { ProductDto } from "./types/productDto";
import { WorkflowComponentType } from "./types/workflowComponentType";

type WorkflowDto = Prisma.WorkflowGetPayload<{
  include: {
    steps: {
      include: {
        component: true;
      };
    };
  };
}>;

export const validateWorkflow = async (workflow: WorkflowDto) => {
  for (const step of workflow.steps) {
    if (!!step.component.requireCode) {
      if (
        !workflow.steps.some(
          (s) => s.componentCode === step.component.requireCode
        )
      ) {
        return false;
      }
    }
  }

  return true;
};

export const run = async (products: ProductDto[], workflowId: string) => {
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
    },
    include: {
      steps: {
        include: {
          component: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!workflow) {
    return;
  }

  if (!validateWorkflow(workflow)) {
    return;
  }

  for (const step of workflow.steps) {
    const componentModule = await import(
      `./components/${step?.component.moduleName}`
    );

    if (!componentModule) {
      continue;
    }

    products = await componentModule.default.run(
      products,
      JSON.parse(step.inputValues?.toString() ?? "[]") as Input[]
    );
  }
};
