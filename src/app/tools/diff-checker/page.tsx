import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("diff-checker");

export default function Page() {
  return (
    <ToolPage slug="diff-checker">
      <Client />
    </ToolPage>
  );
}
