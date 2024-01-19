import "./collections.css";
import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import PageHeader from "@/components/PageHeader";
import AddManualCollectionModal from "@/components/AddManualCollectionModal";

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
      <PageHeader title="Collections" action={<AddManualCollectionModal />} />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}
