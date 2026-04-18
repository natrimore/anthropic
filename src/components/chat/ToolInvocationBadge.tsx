import type { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

function getLabel(toolName: string, args: Record<string, unknown> | undefined): string {
  const path = args?.path as string | undefined;
  const filename = path ? path.split("/").pop() ?? path : undefined;

  if (!filename) return toolName;

  const command = args?.command as string | undefined;

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create": return `Creating ${filename}`;
      case "str_replace":
      case "insert": return `Editing ${filename}`;
      case "view": return `Reading ${filename}`;
      case "undo_edit": return `Undoing edit to ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename": return `Renaming ${filename}`;
      case "delete": return `Deleting ${filename}`;
    }
  }

  return toolName;
}

interface Props {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationBadge({ toolInvocation }: Props) {
  const args = toolInvocation.args as Record<string, unknown> | undefined;
  const label = getLabel(toolInvocation.toolName, args);
  const result = (toolInvocation as { result?: unknown }).result;
  const isComplete = toolInvocation.state === "result" && Boolean(result);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
