import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { verifySession } from "@/lib/dal";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await verifySession();

  if (!session.isAuth) {
    redirect("/login");
  }

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
      logoImageId: true,
      images: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return (
    <div className='fixed flex items-center justify-center top-0 right-0 bg-black h-screen w-screen bg-opacity-40 z-50'>
      <Card className='flex flex-col gap-8 items-center justify-center h-[70%] w-[70%]'>
        {data.length === 0 ? (
          <Link href={`./shops`}>
            <h2 className='text-center font-semibold'>Go to list shops</h2>
          </Link>
        ) : (
          <h1 className='text-center font-semibold text-4xl text-black'>
            Choose shop
          </h1>
        )}
        <div className='flex gap-4'>
          {data.map((value) => (
            <Link key={value.name} href={`./shops/${value.id}/overview`}>
              <Card className='h-32 w-32 hover:border-primary p-3 flex flex-col justify-evenly items-center'>
                <CardHeader className='p-0 flex flex-row items-center justify-between space-y-0'>
                  <CardTitle className='text-sm font-medium text-center'>
                    {value.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0 flex place-content-center'>
                  <Avatar className='h-full'>
                    <AvatarImage
                      src={
                        value.images.find((i) => i.id === value.logoImageId)
                          ?.cloudLink ??
                        `https://avatar.vercel.sh/${value.name}.png`
                      }
                      alt={"logo"}
                      className='grayscale p-0'
                    />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
