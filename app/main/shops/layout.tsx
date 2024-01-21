import "./shops.css";
import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Shop management",
  description: "Shop management",
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader title="Shops" />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}
