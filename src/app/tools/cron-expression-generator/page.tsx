import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("cron-expression-generator");

export default function Page() {
  return (
    <ToolPage slug="cron-expression-generator">
      <Client />
    </ToolPage>
  );
}
