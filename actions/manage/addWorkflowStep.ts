"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Input } from "@/lib/workflow/types/input";
import { Claim } from "@/types/claim";

export interface AddWorkflowStepData {
  order?: number;
  componentCode: string;
  inputValues: Input[];
}

export const addWorkflowStep = async (
  workflowId: string,
  data: AddWorkflowStepData
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.UpdateWorkflow, Claim.ReadWorkflow], userClaims)) {
    return { success: false, data: "Access denied" };
  }
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
    include: {
      component: true,
    },
  });

  const workflowSteps = [workflowStep];

  if (!!workflowStep.component.requireCode) {
    const maxOrderRef = await prisma.workflowStep.aggregate({
      where: {
        component: {
          requireCode: workflowStep.component.requireCode,
        },
      },
      _max: { order: true },
    });

    const requireStep = await prisma.workflowStep.findFirst({
      where: {
        componentCode: workflowStep.component.requireCode,
      },
    });

    if (!requireStep) {
      const shopInputValue = data.inputValues.find((i) => i.key === "shop");
      const workflowStep2 = await prisma.workflowStep.create({
        data: {
          inputValues: JSON.stringify(!shopInputValue ? [] : [shopInputValue]),
          order: (maxOrderRef._max.order ?? data.order ?? 0) + 1,
          componentCode: workflowStep.component.requireCode,
          workflowId: workflowId,
        },
        include: {
          component: true,
        },
      });

      workflowSteps.push(workflowStep2);
    } else {
      const workflowStep2 = await prisma.workflowStep.update({
        where: {
          id: requireStep.id,
        },
        data: {
          order: (maxOrderRef._max.order ?? data.order ?? 0) + 1,
        },
      });
    }
  }

  return { success: true, data: workflowSteps };
};
