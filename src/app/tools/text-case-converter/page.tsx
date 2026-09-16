import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("text-case-converter");

export default function Page() {
  return (
    <ToolPage slug="text-case-converter">
      <Client />
    </ToolPage>
  );
}
