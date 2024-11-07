import { publishProducts } from "@/actions";
import prisma from "@/lib/prisma";

export const maxDuration = 60;
export async function GET() {
  const jobs = await prisma.job.findMany({
    where: {
      status: "Scheduled",
    },
  });

  for (const job of jobs) {
    const batchProduct = job.productIds.slice(
      job.uploadedProducts,
      job.uploadedProducts + job.batchSize
    );

    publishProducts(job.shopId, batchProduct, true).then((result) => {
      if (result.success) {
        job.uploadedProducts += result.data ?? 0;
      }

      if (job.uploadedProducts === job.productIds.length) {
        job.status = "Succeeded";
      }

      prisma.job.update({
        data: job,
        where: {
          id: job.id,
        },
      });
    });
  }

  return Response.json({ success: true });
}
