import { inngest } from "@/inngest/client";
import { publishProducts as publishProductsAction } from "@/actions/publish";

export const publishProducts = inngest.createFunction(
  { id: "publish-products" },
  { event: "shop/publish-products" },
  async ({ event, step }) => {
    const { shopId, productIds } = event.data;

    const publishPromise = step.run("Publish Products", async () => {
      return await publishProductsAction(shopId, productIds);
    });

    const result = await publishPromise;

    return result;
  }
);
