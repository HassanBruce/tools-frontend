import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("slug-generator");

export default function Page() {
  return (
    <ToolPage slug="slug-generator">
      <Client />
    </ToolPage>
  );
}
