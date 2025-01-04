"use server";

import prisma from "@/lib/prisma";
import { Input } from "@/lib/workflow/types/input";

export interface AddWorkflowStepData {
  order?: number;
  componentCode: string;
  inputValues: Input[];
}

export const addWorkflowStep = async (
  workflowId: string,
  data: AddWorkflowStepData
) => {
  const maxOrder = await prisma.workflowStep.aggregate({
    _max: { order: true },
  });
  const workflowStep = await prisma.workflowStep.create({
    data: {
      inputValues: JSON.stringify(data.inputValues),
      order: data.order ?? (maxOrder?._max?.order ?? 0) + 1,
      componentCode: data.componentCode,
      workflowId: workflowId,
    },
  });

  return { success: true, data: workflowStep };
};
