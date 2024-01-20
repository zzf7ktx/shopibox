"use client";
import "./main.css";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/Resizable";
import { Sidebar } from "@/components/Sidebar";
import { ScrollArea } from "@/components/ui/ScrollArea";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] !h-screen !w-screen"
      >
        <ResizablePanel defaultSize={15}>
          <div className="flex h-full p-6">
            <span className="font-semibold">
              <Sidebar />
            </span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={85}>
          <ScrollArea className="flex h-full p-6">
            <span className="font-semibold w-full">{children}</span>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
