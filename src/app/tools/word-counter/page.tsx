import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("word-counter");

export default function Page() {
  return (
    <ToolPage slug="word-counter">
      <Client />
    </ToolPage>
  );
}
