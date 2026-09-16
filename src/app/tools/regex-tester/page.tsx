import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("regex-tester");

export default function Page() {
  return (
    <ToolPage slug="regex-tester">
      <Client />
    </ToolPage>
  );
}
