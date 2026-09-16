import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("sql-formatter");

export default function Page() {
  return (
    <ToolPage slug="sql-formatter">
      <Client />
    </ToolPage>
  );
}
