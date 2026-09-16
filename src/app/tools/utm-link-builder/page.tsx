import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("utm-link-builder");

export default function Page() {
  return (
    <ToolPage slug="utm-link-builder">
      <Client />
    </ToolPage>
  );
}
