"use server";

import prisma from "@/lib/prisma";

export const deleteWorkflowSteps = async (ids: string[]) => {
  const result = await prisma.workflowStep.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  return { success: true, data: result };
};
