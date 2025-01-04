"use server";

import prisma from "@/lib/prisma";
import { Input } from "@/lib/workflow/types/input";

export interface UpdateWorkflowStepData {
  order?: number;
  inputValues?: Input[];
}

export const updateWorkflowStep = async (
  workflowStepId: string,
  data: UpdateWorkflowStepData
) => {
  const maxOrder = await prisma.workflowStep.aggregate({
    _max: { order: true },
  });
  const workflowStep = await prisma.workflowStep.update({
    where: {
      id: workflowStepId,
    },
    data: {
      ...(!data.inputValues
        ? {}
        : { inputValues: JSON.stringify(data.inputValues) }),
      ...(!data.order ? {} : { order: data.order }),
    },
  });

  return { success: true, data: workflowStep };
};
