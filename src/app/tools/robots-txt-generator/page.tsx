import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("robots-txt-generator");

export default function Page() {
  return (
    <ToolPage slug="robots-txt-generator">
      <Client />
    </ToolPage>
  );
}
