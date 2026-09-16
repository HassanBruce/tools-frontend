import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("bulk-qr-generator");

export default function Page() {
  return (
    <ToolPage slug="bulk-qr-generator">
      <Client />
    </ToolPage>
  );
}
