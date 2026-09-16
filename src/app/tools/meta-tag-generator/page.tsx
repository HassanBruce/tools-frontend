import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("meta-tag-generator");

export default function Page() {
  return (
    <ToolPage slug="meta-tag-generator">
      <Client />
    </ToolPage>
  );
}
