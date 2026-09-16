import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("html-formatter");

export default function Page() {
  return (
    <ToolPage slug="html-formatter">
      <Client />
    </ToolPage>
  );
}
