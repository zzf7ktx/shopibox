import JobTable from "@/components/JobTable";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function Products() {
  const session = await verifySession();

  if (!session.isAuth) {
    redirect("/login");
  }

  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadShop], userClaims)) {
    redirect("/main");
  }

  let data = await prisma.job.findMany({
    include: {
      shop: true,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
    ],
  });
  return <JobTable data={data} />;
}
