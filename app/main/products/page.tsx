import ProductTable from "@/components/ProductTable";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";
import { redirect } from "next/navigation";

export const revalidate = 0;
export const maxDuration = 60;

export default async function Products() {
  const session = await verifySession();

  if (!session.isAuth) {
    redirect("/login");
  }

  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadProduct], userClaims)) {
    redirect("/");
  }

  let data = await prisma.product.findMany({
    include: {
      images: {
        where: {
          shopId: {
            equals: null,
          },
        },
      },
      collections: {
        include: {
          collection: true,
        },
      },
      shops: {
        include: {
          shop: true,
        },
      },
      variants: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
  return <ProductTable data={data} />;
}
