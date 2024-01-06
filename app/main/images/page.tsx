import prisma from "@/lib/prisma";
import ImageTable from "@/components/ImageTable";

export default async function Images() {
  // await prisma.product.create({
  //   data: {
  //     name: "Product Test",
  //     description: "This is a test product",
  //     descriptionHtml: "<h1>This is a test product</h1>",
  //     price: 12,
  //   },
  // });
  // await prisma.image.create({
  //   data: {
  //     name: "Landscape",
  //     source: ImageSource.Auto,
  //     sourceLink: "https://picsum.photos/500/300",
  //     cloudLink: "https://picsum.photos/500/300",
  //     backupLink: "https://picsum.photos/500/300",
  //     provider: CloudProvider.Cloudinary,
  //     providerRef: "",
  //     productId: "clr0ut0m300017xzvjna9mr82",
  //     syncStatus: ImageSyncStatus.Synced,
  //   },
  // });
  
  const data = await prisma.image.findMany();
  return (
    <main>
      <ImageTable data={data} />
    </main>
  );
}
