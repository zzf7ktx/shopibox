import ShopOverview from "@/components/ShopOverview";
import ShopRecentSales from "@/components/ShopRecentSales";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { LuActivity, LuFolder, LuImage, LuShoppingBag } from "react-icons/lu";

export default async function ShopOverviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const shop = await prisma.shop.findFirst({
    where: {
      id: params.id,
    },
    select: {
      images: {
        select: {
          id: true,
          productId: true,
        },
      },
      job: {
        select: {
          batchSize: true,
          uploadedProducts: true,
          lastRunTime: true,
        },
      },
      products: {
        select: {
          status: true,
          product: {
            select: {
              collections: {
                select: {
                  collectionId: true,
                },
              },
              images: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const noProducts = shop?.products.length ?? 0;
  const noPushedProducts =
    shop?.products.filter((p) => p.status === "Published").length ?? 0;
  const noScheduleProducts =
    shop?.products.filter((p) => p.status === "Scheduled").length ?? 0;
  const noNotPushedProducts =
    noProducts - noPushedProducts - noScheduleProducts;
  const noCollections = new Set(
    shop?.products.flatMap((p) => p.product.collections) ?? []
  ).size;
  const noImages = shop?.products.flatMap((p) => p.product.images).length ?? 0;
  const noTransformImages =
    shop?.images.filter((i) => !!i.productId).length ?? 0;
  const shopImages = (shop?.images.length ?? 0) - noTransformImages;

  return (
    <div className='flex-1 space-y-4 py-6'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
        <div className='flex items-center space-x-2'>
          <Button>Download</Button>
        </div>
      </div>
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='reports' disabled>
            Reports
          </TabsTrigger>
          <TabsTrigger value='notifications' disabled>
            Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <Link href={"./products"}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Products
                  </CardTitle>
                  <LuShoppingBag />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{noProducts}</div>
                  <p className='text-xs text-muted-foreground'>{`Pushed ${noPushedProducts} | Scheduled ${noScheduleProducts}`}</p>
                </CardContent>
              </Link>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Images</CardTitle>
                <LuImage />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{noImages}</div>
                <p className='text-xs text-muted-foreground'>
                  {`Shop ${shopImages} | Transformed ${noTransformImages}`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <Link href={"./collections"}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Collections
                  </CardTitle>
                  <LuFolder />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{noCollections}</div>
                  <p className='text-xs text-muted-foreground'></p>
                </CardContent>
              </Link>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Jobs</CardTitle>
                <LuActivity />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {shop?.job.length ?? 0}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {shop?.job.length
                    ? `Last run: ${shop?.job[0]?.lastRunTime}`
                    : ""}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value='analytics' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Revenue
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4 text-muted-foreground'
                >
                  <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$00,000.00</div>
                <p className='text-xs text-muted-foreground'>
                  +0.0% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Subscriptions
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4 text-muted-foreground'
                >
                  <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                  <circle cx='9' cy='7' r='4' />
                  <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+0</div>
                <p className='text-xs text-muted-foreground'>
                  +0.0% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Sales</CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4 text-muted-foreground'
                >
                  <rect width='20' height='14' x='2' y='5' rx='2' />
                  <path d='M2 10h20' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+00,000</div>
                <p className='text-xs text-muted-foreground'>
                  +0% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Now
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4 text-muted-foreground'
                >
                  <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+0</div>
                <p className='text-xs text-muted-foreground'>
                  +0 since last hour
                </p>
              </CardContent>
            </Card>
          </div>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ShopOverview />
              </CardContent>
            </Card>
            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>You made 0 sales this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <ShopRecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
