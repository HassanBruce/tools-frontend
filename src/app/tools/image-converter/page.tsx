import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("image-converter");

export default function Page() {
  return (
    <ToolPage slug="image-converter">
      <Client />
    </ToolPage>
  );
}
