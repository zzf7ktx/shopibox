"use client";
import "./main.css";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/Resizable";
import { Sidebar } from "@/components/Sidebar";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Menu } from "@/components/Menu";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden w-screen h-screen">
      <Menu />
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] !h-screen !w-screen"
      >
        <ResizablePanel defaultSize={15}>
          <div className="flex h-full">
            <span className="font-semibold">
              <Sidebar />
            </span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={85}>
          <ScrollArea className="flex h-full p-6 pb-12">
            <span className="font-semibold w-full">{children}</span>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
