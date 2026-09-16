import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("css-js-minifier");

export default function Page() {
  return (
    <ToolPage slug="css-js-minifier">
      <Client />
    </ToolPage>
  );
}
