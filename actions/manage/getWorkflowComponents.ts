"use server";

import prisma from "@/lib/prisma";

export const getWorkflowComponents = async () => {
  const workflowComponent = await prisma.workflowComponent.findMany();
  return workflowComponent;
};
