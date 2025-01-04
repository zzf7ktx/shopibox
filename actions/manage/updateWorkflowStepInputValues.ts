"use server";

import prisma from "@/lib/prisma";
import { Input } from "@/lib/workflow/types/input";

export const updateWorkflowStepInputValues = async (
  workflowStepId: string,
  data: Input[]
) => {
  const workflowStep = await prisma.workflowStep.update({
    where: {
      id: workflowStepId,
    },
    data: {
      inputValues: JSON.stringify(data),
    },
  });

  return { success: true, data: workflowStep };
};
