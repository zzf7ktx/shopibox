import { publishProducts } from "@/actions/publish";
import prisma from "@/lib/prisma";
import { Worker, Queue } from "bullmq";
import Redis from "ioredis";
const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const maxDuration = 60;
export const revalidate = 0;

const queue = new Queue("pushToShopQueue", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

const worker = new Worker(
  "pushToShopQueue",
  async (job) => {
    const data = job?.data;
    console.log(data);
    await doTask();
    console.log("Task executed successfully");
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const doTask = async () => {
  await prisma.event.create({
    data: {},
  });
  console.log("Task is running in the background.");
};

export async function GET() {
  // const jobs = await prisma.job.findMany({
  //   where: {
  //     status: "Scheduled",
  //   },
  // });

  // const results = [];

  // for (const job of jobs) {
  //   job.lastRunTime = new Date();
  //   const batchProduct = job.productIds.slice(
  //     job.uploadedProducts,
  //     job.uploadedProducts + job.batchSize
  //   );

  //   const result = await publishProducts(job.shopId, batchProduct);

  //   if (result.success) {
  //     job.uploadedProducts +=
  //       (result?.data as unknown as { no: number }).no ?? 0;
  //   }

  //   if (job.uploadedProducts === job.productIds.length) {
  //     job.status = "Succeeded";
  //   }

  //   results.push(result);

  //   await prisma.job.update({
  //     data: job,
  //     where: {
  //       id: job.id,
  //     },
  //   });
  // }

  const data = {
    // any serializable data you want to provide for the job
    // for this example, we'll provide a message
    message: "This is a sample job",
  };

  const firstJob = await queue.upsertJobScheduler(
    "pushToShopQueue",
    { pattern: "0 15 3 * * *" },
    {
      name: "my-job-name",
      data: { foo: "bar" },
      opts: {
        backoff: 3,
        attempts: 5,
        removeOnFail: 1000,
      },
    }
  );

  return Response.json({
    success: true,
  });
}
