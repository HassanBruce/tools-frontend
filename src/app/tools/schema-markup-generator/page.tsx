import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("schema-markup-generator");

export default function Page() {
  return (
    <ToolPage slug="schema-markup-generator">
      <Client />
    </ToolPage>
  );
}
