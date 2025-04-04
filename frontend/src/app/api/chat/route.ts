/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/chat/route.ts

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, runCommand } from "@/lib/server-utils";
import path from "node:path";
import fs from "node:fs/promises";
import type { ChatRequest } from "@/types/chat";

const PROJECTS_DIR = path.join(process.cwd(), "projects");

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not set" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as ChatRequest;

    if (!body.messages?.length) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    if (!body.projectId) {
      return NextResponse.json({ error: "No project ID" }, { status: 400 });
    }

    const projectDir = path.join(PROJECTS_DIR, body.projectId);

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start streaming response
    const streamResponse = async () => {
      try {
        const systemPrompt = await buildSystemPrompt(
          body.projectId || "unknown id",
          body.current_page,
          projectDir
        );

        // Strip out id and timestamp from messages
        const messages = [
          { role: "assistant" as const, content: systemPrompt },
          ...body.messages.map(({ role, content }) => ({
            role: role === "system" ? "assistant" as const : role,
            content: content || "",
          })),
        ];

        const response = await anthropic.messages.create({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 4000,
          tools: [
            {
              name: "run_command",
              description: "Run a terminal command inside the project folder",
              input_schema: {
                type: "object",
                properties: {
                  command: { type: "string", description: "The command to run" },
                },
                required: ["command"],
              },
            },
            {
              name: "read_file",
              description: "Read a file from the project directory",
              input_schema: {
                type: "object",
                properties: {
                  path: { type: "string" },
                },
                required: ["path"],
              },
            },
            {
              name: "write_file",
              description: "Write content to a file in the project",
              input_schema: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  content: { type: "string" },
                },
                required: ["path", "content"],
              },
            },
          ],
          messages,
        });

        const toolCall = response.content.find((c) => c.type === "tool_use");

        if (toolCall && toolCall.type === "tool_use") {
          // Send tool status
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "tool_status",
                tool: toolCall.name,
                status: "started",
              })}\n\n`
            )
          );

          const toolResult = await handleTool(toolCall, projectDir);

          // Send tool completion
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "tool_status",
                tool: toolCall.name,
                status: "completed",
                result: toolResult,
              })}\n\n`
            )
          );

          const followup = await anthropic.messages.create({
            model: "claude-3-7-sonnet-20250219",
            max_tokens: 4000,
            tools: [],
            messages: [
              ...messages,
              response,
              {
                role: "user",
                content: [
                  {
                    type: "tool_result",
                    tool_use_id: toolCall.id,
                    content: toolResult,
                  },
                ],
              },
            ],
          });

          const finalResponse =
            followup.content.find((c) => c.type === "text")?.text || "No response.";

          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "message",
                content: finalResponse,
              })}\n\n`
            )
          );
        } else {
          const aiResponse =
            response.content.find((c) => c.type === "text")?.text || "No response.";

          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "message",
                content: aiResponse,
              })}\n\n`
            )
          );
        }

        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Streaming error:", error);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              content: "An error occurred while processing your request.",
            })}\n\n`
          )
        );
      } finally {
        await writer.close();
      }
    };

    streamResponse();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Chat processing failed" },
      { status: 500 }
    );
  }
}

async function buildSystemPrompt(
  projectId: string,
  currentPage: string | undefined,
  projectDir: string
) {
  let prompt =
    "You are an AI assistant helping with a web development project. ";

  if (currentPage) prompt += `The user is currently viewing ${currentPage}. `;

  try {
    const projectDataPath = path.join(projectDir, "project.json");
    const projectData = JSON.parse(await fs.readFile(projectDataPath, "utf8"));
    prompt += `Project: "${projectData.name}", description: "${projectData.description}". `;
  } catch (error) {
    console.warn("Failed to load project.json:", error);
  }

  const os = process.platform === "win32" ? "Windows" : "Linux";
  prompt += `OS: ${os}. User is using a web UI. `;
  prompt += `Use the available tools when needed (like running commands or editing files).`;

  return prompt;
}

async function handleTool(toolCall: any, projectDir: string): Promise<string> {
  const { name, input } = toolCall;

  switch (name) {
    case "run_command": {
      const result = await runCommand(input.command, projectDir);
      if (result.success) {
        try {
          const pdPath = path.join(projectDir, "project.json");
          const pd = JSON.parse(await fs.readFile(pdPath, "utf8"));
          if (pd.status === "error") {
            pd.status = "ready";
            pd.error = undefined;
            await fs.writeFile(pdPath, JSON.stringify(pd, null, 2));
          }
        } catch (_) {}
      }
      return `Output:\n${result.stdout}\nError:\n${result.stderr}`;
    }

    case "read_file": {
      const filePath = path.join(projectDir, input.path);
      const content = await fs.readFile(filePath, "utf8");
      return content;
    }

    case "write_file": {
      const filePath = path.join(projectDir, input.path);
      await fs.writeFile(filePath, input.content, "utf8");
      return `Wrote to ${input.path}`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}
