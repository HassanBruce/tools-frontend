import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("url-encoder");

export default function Page() {
  return (
    <ToolPage slug="url-encoder">
      <Client />
    </ToolPage>
  );
}
