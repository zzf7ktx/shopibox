import JobTable from "@/components/JobTable";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function Products() {
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
