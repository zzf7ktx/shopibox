import { deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const logout = async () => {
  deleteSession();
  redirect("/login");
};
