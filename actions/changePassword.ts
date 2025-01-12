"use server";

import prisma from "@/lib/prisma";
import * as hasher from "@/lib/hasher";
import { verifySession } from "@/lib/dal";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(data: ChangePasswordPayload) {
  const session = await verifySession();

  if (data.currentPassword === "" || data.newPassword === "") {
    return { success: false };
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
    },
  });

  if (!user) {
    return { success: false, data: "User not found" };
  }

  const isMatched = await hasher.compare(data.currentPassword, user.password);

  if (!isMatched) {
    return { success: false, data: "Password and user are not matched" };
  }

  const newHashedPassword = await hasher.hash(data.newPassword);
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: newHashedPassword,
    },
  });

  return { success: true };
}
