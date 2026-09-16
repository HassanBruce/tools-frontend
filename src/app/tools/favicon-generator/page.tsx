import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("favicon-generator");

export default function Page() {
  return (
    <ToolPage slug="favicon-generator">
      <Client />
    </ToolPage>
  );
}
