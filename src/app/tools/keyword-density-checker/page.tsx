import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("keyword-density-checker");

export default function Page() {
  return (
    <ToolPage slug="keyword-density-checker">
      <Client />
    </ToolPage>
  );
}
