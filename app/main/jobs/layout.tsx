import "./jobs.css";
import { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Job management",
  description: "Job management",
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader title="Jobs" />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}
