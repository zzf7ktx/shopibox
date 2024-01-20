import prisma from "@/lib/prisma";
import ImageTable from "@/components/ImageTable";

export default async function Images() {
  let data = await prisma.image.findMany({
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });

  return <ImageTable data={data} />;
}
