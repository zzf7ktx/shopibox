"use server";

import { Csv } from "@/lib/csv";
import prisma from "@/lib/prisma";
import { parseCurrency } from "@/utils";
import { ImageSource } from "@prisma/client";
import { Readable } from "stream";
import { addOrUpdateProductVariants, syncImageWithMainProvider } from ".";

export const maxDuration = 60;
export const importProducts = async (
  data: FormData,
  autoSyncImages: boolean = false
) => {
  const file: File = data.get("file") as unknown as File;
  if (!file) {
    throw new Error("No file uploaded");
  }

  const stream = Readable.from(Buffer.from(await file.arrayBuffer()));

  const parseValue: any[] = await new Promise((resolve, reject) => {
    Csv.parse(stream, {
      header: true,
      complete: (results: any) => {
        const columnValues = results.data.map((line: any, index: number) => {
          const images = !line?.["images"] ? [] : JSON.parse(line?.["images"]);
          const variants = !line?.["variants"]
            ? []
            : JSON.parse(line?.["variants"]);
          return {
            id: String(index),
            name: line?.["title"],
            description: line?.["description_text"],
            descriptionHtml: line?.["description_html"],
            price: parseCurrency(line?.["price"] ?? ""),
            category: line?.["category"],
            collections: !!line?.["collection"] ? [line?.["collection"]] : [],
            images,
            variants,
          };
        });
        resolve(columnValues);
      },
      error: (error) => reject(error),
    });
  });

  const products = [];
  for (const data of parseValue) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        descriptionHtml: data.descriptionHtml,
        category: data.category ? data.category.join(" > ") : "",
        ...(data.images.length > 0
          ? {
              images: {
                create: data.images.map((img: any) => ({
                  name: img.alt ?? "",
                  sourceLink: img.src ?? "",
                  cloudLink: "",
                  source: ImageSource.Auto,
                })),
              },
            }
          : {}),
        ...(data.collections.length > 0
          ? {
              collections: {
                create: data.collections.map((collection: string) => ({
                  collection: {
                    connectOrCreate: {
                      where: {
                        name: collection,
                      },
                      create: {
                        name: collection,
                      },
                    },
                  },
                })),
              },
            }
          : {}),
      },
      include: {
        images: true,
      },
    });

    if (!!data.variants) {
      addOrUpdateProductVariants(product.id, data);
    }

    if (autoSyncImages) {
      for (let image of product.images) {
        await syncImageWithMainProvider(image.id, "default");
      }
    }

    products.push(product);
  }

  return products;
};
