import { publishProducts } from "@/actions/publish";
import prisma from "@/lib/prisma";

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

    const result = await publishProducts(job.shopId, batchProduct, true);

    if (result.success) {
      job.uploadedProducts +=
        (result?.data as unknown as { no: number }).no ?? 0;
    }

    if (job.uploadedProducts === job.productIds.length) {
      job.status = "Succeeded";
    }

    results.push(result);

    await prisma.job.update({
      data: job,
      where: {
        id: job.id,
      },
    });
  }

  return Response.json({
    success: true,
    data: {
      results: results,
      jobs,
    },
  });
}
