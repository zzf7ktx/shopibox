import "./images.css";
import { Metadata } from "next";
import ImagePageHeader from "@/components/ImagePageHeader";
import { Suspense } from "react";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Image management",
  description: "Image management",
};

export default function ImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ImagePageHeader />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}
