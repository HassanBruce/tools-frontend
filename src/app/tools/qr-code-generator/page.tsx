import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("qr-code-generator");

export default function Page() {
  return (
    <ToolPage slug="qr-code-generator">
      <Client />
    </ToolPage>
  );
}
