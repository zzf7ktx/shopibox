import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import ShopGeneralSettings from "@/components/ShopGeneralSettings";
import prisma from "@/lib/prisma";
import ShopLogoSettings from "@/components/ShopLogoSettings";
import ShopWorkflowSettings from "@/components/ShopWorkflowSettings";
import Link from "next/link";
import { haveAccess, verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";
import { SessionUser } from "@/lib/definitions";
import { Claim } from "@/types/claim";

export default async function ShopSettingPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await verifySession();

  if (!session.isAuth) {
    redirect("/login");
  }

  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadShop, Claim.UpdateShop], userClaims)) {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const params = await props.params;
  const tab = !searchParams?.tab ? "general" : (searchParams.tab as string);
  const shop = await prisma.shop.findFirst({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      name: true,
      shopDomain: true,
      syncStatus: true,
      provider: true,
      logoImageId: true,
      workflow: {
        select: {
          id: true,
          steps: {
            select: {
              id: true,
              component: true,
              componentCode: true,
              inputValues: true,
              order: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      },
      images: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className='flex-1 space-y-4 py-6'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Settings</h2>
      </div>
      <Tabs defaultValue={tab} className='space-y-4'>
        <TabsList>
          <TabsTrigger value='general'>
            <Link href={`./settings?tab=general`}>General</Link>
          </TabsTrigger>
          <TabsTrigger value='logo'>
            <Link href={`./settings?tab=logo`}>Logo</Link>
          </TabsTrigger>
          <TabsTrigger value='workflow'>
            <Link href={`./settings?tab=workflow`}>Workflow</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='general' className='space-y-4'>
          <ShopGeneralSettings shopInfo={shop!} />
        </TabsContent>
        <TabsContent value='logo' className='space-y-4'>
          <ShopLogoSettings shopInfo={shop!} />
        </TabsContent>
        <TabsContent value='workflow' className='space-y-4'>
          <ShopWorkflowSettings shopInfo={shop!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
