import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("jwt-decoder");

export default function Page() {
  return (
    <ToolPage slug="jwt-decoder">
      <Client />
    </ToolPage>
  );
}
