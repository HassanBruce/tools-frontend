import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("uuid-generator");

export default function Page() {
  return (
    <ToolPage slug="uuid-generator">
      <Client />
    </ToolPage>
  );
}
