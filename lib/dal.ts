import "server-only";

import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { cache } from "react";
import { redirect } from "next/navigation";
import prisma from "./prisma";
import { SessionPayload } from "./definitions";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;

  if (!cookie) {
    return { isAuth: false };
  }

  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }
  const payload = session as SessionPayload;

  if (payload.expiresAt > new Date()) {
    return { isAuth: false };
  }

  return { isAuth: true, userId: session.userId, user: session.user };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    const data = await prisma.user.findMany({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const user = data[0];

    return user;
  } catch (error) {
    console.log("Failed to fetch user");
    return null;
  }
});

export const haveAccess = (requireClaims: string[], userClaims: string[]) => {
  return requireClaims.every((c) => userClaims.includes(c));
};
