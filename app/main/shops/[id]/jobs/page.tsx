import JobTable from "@/components/JobTable";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function ShopJobs(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();

  if (!session.isAuth) {
    redirect("/login");
  }

  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadShop], userClaims)) {
    redirect("/");
  }

  const params = await props.params;

  let data = await prisma.job.findMany({
    where: {
      shopId: params?.id,
    },
    include: {
      shop: true,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
    ],
  });

  return (
    <div className="flex-1 space-y-4 py-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
        <div className="flex items-center space-x-2"></div>
      </div>
      <JobTable data={data} />
    </div>
  );
}
