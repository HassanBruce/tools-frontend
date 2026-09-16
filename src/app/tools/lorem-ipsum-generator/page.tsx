import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("lorem-ipsum-generator");

export default function Page() {
  return (
    <ToolPage slug="lorem-ipsum-generator">
      <Client />
    </ToolPage>
  );
}
