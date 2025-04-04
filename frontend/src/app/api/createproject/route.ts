import { NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';
import { copyDirectory, runCommand } from '@/lib/server-utils';
import path from 'node:path';
import fs from 'node:fs/promises';
import type { CreateProjectRequest } from '@/types/chat';

// Path to template and projects directory
const TEMPLATE_DIR = path.join(process.cwd(), 'template');
const PROJECTS_DIR = path.join(process.cwd(), 'projects');

export async function POST(request: Request) {
  try {
    // Ensure projects directory exists
    await fs.mkdir(PROJECTS_DIR, { recursive: true });

    // Parse request body
    const body = await request.json() as CreateProjectRequest;

    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate a unique ID for the project
    const projectId = generateId();
    const projectDir = path.join(PROJECTS_DIR, projectId);

    // Create project metadata
    const projectData = {
      id: projectId,
      name: body.prompt.split(' ').slice(0, 5).join(' '),
      description: body.prompt,
      createdAt: Date.now(),
      status: 'initializing',
    };

    // Copy template to project directory
    await copyDirectory(TEMPLATE_DIR, projectDir);

    // Save project metadata
    await fs.writeFile(
      path.join(projectDir, 'project.json'),
      JSON.stringify(projectData, null, 2)
    );

    // Start project setup in background (in production you'd use a queue system)
    setupProject(projectId, projectDir).catch(console.error);

    return NextResponse.json({ projectId });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

async function setupProject(projectId: string, projectDir: string) {
  try {
    // Save project status
    const updateStatus = async (status: string, error?: string) => {
      const projectDataPath = path.join(projectDir, 'project.json');
      const projectData = JSON.parse(await fs.readFile(projectDataPath, 'utf8'));

      projectData.status = status;
      if (error) projectData.error = error;

      await fs.writeFile(
        projectDataPath,
        JSON.stringify(projectData, null, 2)
      );
    };

    // Install dependencies
    const installResult = await runCommand('bun install', projectDir);

    if (!installResult.success) {
      await updateStatus('error', `Failed to install dependencies: ${installResult.stderr}`);
      return;
    }

    // Mark as ready
    await updateStatus('ready');
  } catch (error) {
    console.error(`Error setting up project ${projectId}:`, error);
    // Update project status to error
    try {
      const projectDataPath = path.join(projectDir, 'project.json');
      const projectData = JSON.parse(await fs.readFile(projectDataPath, 'utf8'));

      projectData.status = 'error';
      projectData.error = error instanceof Error ? error.message : String(error);

      await fs.writeFile(
        projectDataPath,
        JSON.stringify(projectData, null, 2)
      );
    } catch (updateError) {
      console.error('Failed to update project status:', updateError);
    }
  }
}
