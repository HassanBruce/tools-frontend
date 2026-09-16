import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("unix-timestamp-converter");

export default function Page() {
  return (
    <ToolPage slug="unix-timestamp-converter">
      <Client />
    </ToolPage>
  );
}
