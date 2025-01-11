"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export const getWorkflowComponents = async () => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadWorkflow], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const workflowComponent = await prisma.workflowComponent.findMany();
  return { success: true, data: workflowComponent };
};
