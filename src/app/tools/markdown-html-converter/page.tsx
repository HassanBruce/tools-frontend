import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("markdown-html-converter");

export default function Page() {
  return (
    <ToolPage slug="markdown-html-converter">
      <Client />
    </ToolPage>
  );
}
