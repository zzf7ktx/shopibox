import "./collections.css";
import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import CollectionPageHeader from "@/components/CollectionPageHeader";

export const metadata: Metadata = {
  title: "Collection management",
  description: "Collection management",
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CollectionPageHeader />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}
