import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("color-converter");

export default function Page() {
  return (
    <ToolPage slug="color-converter">
      <Client />
    </ToolPage>
  );
}
