import CollectionTable from "@/components/CollectionTable";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function Collections() {
  const session = await verifySession();

  if (!session.isAuth) {
    redirect("/login");
  }

  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadCollection], userClaims)) {
    redirect("/main");
  }

  let data = await prisma.collection.findMany({
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
  return <CollectionTable data={data} />;
}
