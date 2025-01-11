import prisma from "@/lib/prisma";
import ImageTable from "@/components/ImageTable";
import { haveAccess, verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";
import { SessionUser } from "@/lib/definitions";
import { Claim } from "@/types/claim";

export const revalidate = 0;

export default async function Images() {
  const session = await verifySession();

  if (!session.isAuth) {
    redirect("/login");
  }

  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadImage], userClaims)) {
    redirect("/main");
  }

  let data = await prisma.image.findMany({
    include: {
      product: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });

  return <ImageTable data={data} />;
}
