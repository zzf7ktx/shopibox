import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { publishProducts } from "@/inngest/functions/publishProducts";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [publishProducts],
});
