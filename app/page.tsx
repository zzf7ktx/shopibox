import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/main");
  let data = await prisma.shop.findMany({
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      name: true,
      syncStatus: true,
      status: true,
      provider: true,
      images: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return (
    <div className='flex flex-col gap-8 items-center justify-center h-screen w-screen px-6 py-6'>
      <h1 className='text-center font-bold text-4xl'>Choose shop</h1>
      <div className='flex gap-4'>
        {data.map((value) => (
          <Card key={value.name} className='h-32 w-32 hover:border-primary'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0'>
              <CardTitle className='text-sm font-medium text-center'>
                {value.name}
              </CardTitle>
            </CardHeader>
            <CardContent className='flex place-content-center'>
              <Avatar className='h-full'>
                <AvatarImage
                  src={
                    value.images.find((i) => !i.productId)?.cloudLink ??
                    `https://avatar.vercel.sh/${value.name}.png`
                  }
                  alt={"logo"}
                  className='grayscale'
                />
                <AvatarFallback>SA</AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
