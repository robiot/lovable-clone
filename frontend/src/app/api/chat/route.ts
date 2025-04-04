import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { runCommand } from '@/lib/server-utils';
import path from 'node:path';
import fs from 'node:fs/promises';
import type { ChatRequest } from '@/types/chat';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Projects directory
const PROJECTS_DIR = path.join(process.cwd(), 'projects');

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const body = await request.json() as ChatRequest & { projectId?: string };

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Additional context information
    let systemPrompt = "You are an AI assistant helping with a web development project. ";

    // Add current page context if available
    if (body.current_page) {
      systemPrompt += `The user is currently viewing ${body.current_page}. `;
    }

    // Add project context if available
    if (body.projectId) {
      const projectDir = path.join(PROJECTS_DIR, body.projectId);
      try {
        // Check if project exists
        const projectDataPath = path.join(projectDir, 'project.json');
        const projectData = JSON.parse(await fs.readFile(projectDataPath, 'utf8'));

        systemPrompt += `You are working on a project called "${projectData.name}" with description: "${projectData.description}". `;
        systemPrompt += `The project is located at ${projectDir}. `;

        // Add project status
        if (projectData.status === 'error' && projectData.error) {
          systemPrompt += `The project currently has an error: ${projectData.error}. You should help fix this. `;
        }
      } catch (error) {
        console.error(`Error loading project data for ${body.projectId}:`, error);
      }
    }

    systemPrompt += "You can perform terminal commands in the project directory to help the user. Always provide clear explanations of what you're doing.";

    // Create properly typed messages array for Anthropic
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...body.messages.map(msg => ({
        role: msg.role === 'system' ? 'assistant' as const : msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content || '' // Ensure content is never undefined
      }))
    ];

    // In case there's no API key, simulate a response
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      // Return a mock response for demo purposes
      return NextResponse.json({
        response: "This is a demo response. You would need to add your Anthropic API key in the .env.local file to get real responses from Claude.",
        commandResult: null,
      });
    }

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: messages,
    });

    // Extract text content from the response
    const aiResponse = response.content.find(c => c.type === 'text')?.text ||
                       "I'm sorry, I couldn't generate a proper response.";

    // Check if the response contains a command to execute
    const commandMatch = aiResponse.match(/```bash\n([\s\S]*?)```/);
    let commandResult = null;

    if (commandMatch && body.projectId) {
      const command = commandMatch[1].trim();
      const projectDir = path.join(PROJECTS_DIR, body.projectId);

      try {
        // Execute the command
        const result = await runCommand(command, projectDir);
        commandResult = {
          command,
          output: result.stdout,
          error: result.stderr,
          success: result.success
        };

        // Update project status if it was in error state and the command fixed it
        if (result.success) {
          const projectDataPath = path.join(projectDir, 'project.json');
          const projectData = JSON.parse(await fs.readFile(projectDataPath, 'utf8'));

          if (projectData.status === 'error') {
            projectData.status = 'ready';
            projectData.error = undefined;

            await fs.writeFile(
              projectDataPath,
              JSON.stringify(projectData, null, 2)
            );
          }
        }
      } catch (error) {
        console.error(`Error executing command for project ${body.projectId}:`, error);
        commandResult = {
          command,
          output: '',
          error: error instanceof Error ? error.message : String(error),
          success: false
        };
      }
    }

    return NextResponse.json({
      response: aiResponse,
      commandResult,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
