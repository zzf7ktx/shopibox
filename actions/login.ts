"use server";

import { LoginFormSchema, FormState } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import * as hasher from "@/lib/hasher";

export async function login(state: FormState, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      name: validatedFields.data.name,
    },
  });

  if (!user) {
    return { success: false, data: "User not found" };
  }

  const isMatched = await hasher.compare(
    validatedFields.data.password,
    user.password
  );

  if (!isMatched) {
    return { success: false, data: "Password and user are not matched" };
  }

  await createSession(user.id, user);

  redirect("/main");
}
