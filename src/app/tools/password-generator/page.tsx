import { ToolPage } from "@/components/tool-page";
import { toolMetadata } from "@/lib/metadata";
import Client from "./client";

export const metadata = toolMetadata("password-generator");

export default function Page() {
  return (
    <ToolPage slug="password-generator">
      <Client />
    </ToolPage>
  );
}
