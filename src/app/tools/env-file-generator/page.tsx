import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("env-file-generator");

export default function Page() {
  return (
    <ToolPage slug="env-file-generator">
      <Client />
    </ToolPage>
  );
}
