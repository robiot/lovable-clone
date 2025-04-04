import { NextResponse } from "next/server";
import { generateId } from "@/lib/utils";
import { anthropic, copyDirectory, runCommand } from "@/lib/server-utils";
import path from "node:path";
import fs from "node:fs/promises";
import type { CreateProjectRequest } from "@/types/chat";

// Path to template and projects directory
const TEMPLATE_DIR = path.join(process.cwd(), "template");
const PROJECTS_DIR = path.join(process.cwd(), "projects");

export async function POST(request: Request) {
  try {
    // Ensure projects directory exists
    await fs.mkdir(PROJECTS_DIR, { recursive: true });

    // Parse request body
    const body = (await request.json()) as CreateProjectRequest;

    if (!body.prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // generate a name with AI
    const projectnameResponse = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 10,
      messages: [
        {
          role: "user",
          content: `Create a short dash-separated name for the project based on this prompt: "${body.prompt}". It should be a maximum of 3 words, separated by dashes only. Do not under any circumstance answer with more than 3 words separated by dashes.`,
        },
      ],
    });

    const projectname = projectnameResponse.content[0]?.type === 'text' 
      ? projectnameResponse.content[0].text 
      : 'untitled-project';
    
    // Generate a unique ID for the project
    const projectId = generateId();
    const projectDir = path.join(PROJECTS_DIR, projectId);

    // Create project metadata
    const projectData = {
      id: projectId,
      name: projectname,
      first_prompt: body.prompt,
      createdAt: Date.now(),
      status: "inactive",
    };

    // Copy template to project directory
    await copyDirectory(TEMPLATE_DIR, projectDir);

    // Save project metadata
    await fs.writeFile(
      path.join(projectDir, "project.json"),
      JSON.stringify(projectData, null, 2)
    );

    return NextResponse.json({ projectId });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
