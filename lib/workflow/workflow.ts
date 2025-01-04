import prisma from "../prisma";
import { Input } from "./types/input";
import { ProductDto } from "./types/productDto";

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

  for (const step of workflow.steps) {
    const componentModule = await import(
      `./components/${step?.component.moduleName}`
    );

    if (!componentModule) {
      continue;
    }

    await componentModule.default.run(
      products,
      JSON.parse(step.inputValues?.toString() ?? "[]") as Input[]
    );
  }
};
