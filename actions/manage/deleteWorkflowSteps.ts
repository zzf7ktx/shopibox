"use server";

import prisma from "@/lib/prisma";

export const deleteWorkflowSteps = async (ids: string[]) => {
  const deleteIds = [...ids];
  const recordsToDelete = await prisma.workflowStep.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      workflowId: true,
      component: {
        select: {
          id: true,
          code: true,
          requireCode: true,
        },
      },
    },
  });

  const workflowId = recordsToDelete?.[0]?.workflowId;

  const requiredCodes = new Set(
    recordsToDelete
      .filter((r) => !!r.component.requireCode)
      .map((r) => r.component.requireCode!)
  );

  const requireSteps = await prisma.workflowStep.findMany({
    where: {
      workflowId,
      componentCode: {
        in: Array.from(requiredCodes),
      },
    },
  });

  for (const step of requireSteps) {
    const numberOfWorkflowRefToCode = await prisma.workflowStep.findMany({
      where: {
        workflowId,
        component: {
          requireCode: step.componentCode,
        },
        id: {
          notIn: ids,
        },
      },
    });

    if (numberOfWorkflowRefToCode.length === 0) {
      deleteIds.push(step.id);
    }
  }

  const result = await prisma.workflowStep.deleteMany({
    where: {
      id: {
        in: deleteIds,
      },
    },
  });

  return { success: true, data: result };
};
