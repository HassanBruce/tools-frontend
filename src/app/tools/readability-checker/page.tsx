import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("readability-checker");

export default function Page() {
  return (
    <ToolPage slug="readability-checker">
      <Client />
    </ToolPage>
  );
}
