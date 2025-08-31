import prisma from "@/lib/prisma";
import { publishProductsInngest } from "@/actions/publish/publishProducts";
import { ShopStatus } from "@prisma/client";

export const maxDuration = 60;
export const revalidate = 0;

export async function GET() {
  const jobs = await prisma.job.findMany({
    where: {
      status: "Scheduled",
      shop: {
        status: ShopStatus.Active,
      }
    },
  });

  const results = [];

  for (const job of jobs) {
    job.lastRunTime = new Date();
    const batchProduct = job.productIds.slice(
      job.uploadedProducts,
      job.uploadedProducts + job.batchSize
    );

    await publishProductsInngest(job.shopId, batchProduct);
    await prisma.job.update({
      where: {
        id: job.id,
      },
      data: {
        lastRunTime: job.lastRunTime,
        uploadedProducts: job.uploadedProducts + batchProduct.length,
        status:
          job.uploadedProducts + batchProduct.length >= job.productIds.length
            ? "Succeeded"
            : "Scheduled",
      },
    });
  }
  return Response.json({
    success: true,
  });
}
