"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Input } from "@/lib/workflow/types/input";
import { Claim } from "@/types/claim";

export interface UpdateWorkflowStepData {
  order?: number;
  inputValues?: Input[];
}

export const updateWorkflowStep = async (
  workflowStepId: string,
  data: UpdateWorkflowStepData
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadWorkflow, Claim.UpdateWorkflow], userClaims)) {
    return { success: false, data: "Access denied" };
  }

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
