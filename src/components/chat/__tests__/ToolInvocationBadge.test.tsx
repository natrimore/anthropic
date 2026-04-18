import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "partial-call" | "call" | "result",
  result?: unknown
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "test", toolName, args, state, result } as ToolInvocation;
  }
  return { toolCallId: "test", toolName, args, state } as ToolInvocation;
}

test("str_replace_editor create shows Creating filename", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/App.jsx" }, "result", "ok")} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing filename", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "src/components/Card.jsx" }, "result", "ok")} />);
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing filename", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "src/lib/utils.ts" }, "result", "ok")} />);
  expect(screen.getByText("Editing utils.ts")).toBeDefined();
});

test("str_replace_editor view shows Reading filename", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "index.html" }, "result", "ok")} />);
  expect(screen.getByText("Reading index.html")).toBeDefined();
});

test("str_replace_editor undo_edit shows Undoing edit to filename", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "src/App.jsx" }, "result", "ok")} />);
  expect(screen.getByText("Undoing edit to App.jsx")).toBeDefined();
});

test("file_manager rename shows Renaming filename", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "rename", path: "src/Old.jsx" }, "result", "ok")} />);
  expect(screen.getByText("Renaming Old.jsx")).toBeDefined();
});

test("file_manager delete shows Deleting filename", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "delete", path: "src/Temp.jsx" }, "result", "ok")} />);
  expect(screen.getByText("Deleting Temp.jsx")).toBeDefined();
});

test("unknown tool falls back to raw toolName", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("some_unknown_tool", { command: "do_thing", path: "src/File.tsx" }, "result", "ok")} />);
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("in-progress state shows spinner and label", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/App.jsx" }, "call")} />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("missing args.path falls back to raw toolName", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create" }, "partial-call")} />);
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("completed state shows green dot and no spinner", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/App.jsx" }, "result", "ok")} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("in-progress state shows spinner and no green dot", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/App.jsx" }, "call")} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
