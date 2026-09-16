import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("xml-formatter");

export default function Page() {
  return (
    <ToolPage slug="xml-formatter">
      <Client />
    </ToolPage>
  );
}
