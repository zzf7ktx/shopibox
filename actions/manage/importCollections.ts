"use server";

import { Csv } from "@/lib/csv";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";
import { Readable } from "stream";

export const importCollections = async (data: FormData) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (
    !haveAccess(
      [Claim.AddCollection, Claim.UpdateCollection, Claim.ReadCollection],
      userClaims
    )
  ) {
    return { success: false, data: "Access denied" };
  }

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

  return { success: true, data: collections.count };
};
