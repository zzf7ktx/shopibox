"use server";

import { Csv } from "@/lib/csv";
import prisma from "@/lib/prisma";
import { Readable } from "stream";

export const importCollections = async (data: FormData) => {
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
          return {
            id: String(index),
            name: line?.["title"],
            description: line?.["description"],
          };
        });
        resolve(columnValues);
      },
      error: (error) => reject(error),
    });
  });

  const collections = await prisma.collection.createMany({
    data: parseValue.map((l) => ({
      name: l.name,
      description: l.description,
    })),
  });

  return collections;
};
