import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("base64-encoder");

export default function Page() {
  return (
    <ToolPage slug="base64-encoder">
      <Client />
    </ToolPage>
  );
}
