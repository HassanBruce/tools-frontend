import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("image-compressor");

export default function Page() {
  return (
    <ToolPage slug="image-compressor">
      <Client />
    </ToolPage>
  );
}
