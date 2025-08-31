import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { publishProducts } from "@/inngest/functions/publishProducts";

export const maxDuration = 300;
export const revalidate = 0;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [publishProducts],
  streaming: "allow",
});
