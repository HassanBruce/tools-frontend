import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("yaml-json-converter");

export default function Page() {
  return (
    <ToolPage slug="yaml-json-converter">
      <Client />
    </ToolPage>
  );
}
