"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Input } from "@/lib/workflow/types/input";
import { Claim } from "@/types/claim";

export const updateWorkflowStepInputValues = async (
  workflowStepId: string,
  data: Input[]
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadWorkflow, Claim.UpdateWorkflow], userClaims)) {
    return { success: false, data: "Access denied" };
  }

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
