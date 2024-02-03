import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import ShopGeneralSettings from "@/components/ShopGeneralSettings";
import prisma from "@/lib/prisma";
import ShopLogoSettings from "@/components/ShopLogoSettings";

export default async function ShopSettingPage({
  params,
}: {
  params: { id: string };
}) {
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
      maskImages: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!shop) {
    return;
  }

  return (
    <div className="flex-1 space-y-4 py-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="images" disabled>
            Images
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <ShopGeneralSettings shopInfo={shop!} />
        </TabsContent>
        <TabsContent value="logo" className="space-y-4">
          <ShopLogoSettings shopInfo={shop} />
        </TabsContent>
        <TabsContent value="images" className="space-y-4"></TabsContent>
      </Tabs>
    </div>
  );
}
