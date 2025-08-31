import prisma from "@/lib/prisma";
import { publishProductsInngest } from "@/actions/publish/publishProducts";

export const maxDuration = 60;
export const revalidate = 0;

export async function GET() {
  const jobs = await prisma.job.findMany({
    where: {
      status: "Scheduled",
    },
  });

  const results = [];

  for (const job of jobs) {
    job.lastRunTime = new Date();
    const batchProduct = job.productIds.slice(
      job.uploadedProducts,
      job.uploadedProducts + job.batchSize
    );

    await publishProductsInngest(job.shopId, batchProduct)
  }

  return Response.json({
    success: true,
  });
}
