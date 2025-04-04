import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { runCommand } from "@/lib/server-utils";
import path from "node:path";
import fs from "node:fs";
import { spawn, ChildProcess } from "child_process";
import net from "net";

const PROJECTS_DIR = path.join(process.cwd(), "projects");
const BASE_PORT = 5173;
const MAX_PORT_RETRIES = 30;

// Store references to spawned processes
const activeProcesses = new Map<string, ChildProcess>();

const isPortInUse = async (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => resolve(true))
      .once("listening", () => {
        tester.close();
        resolve(false);
      })
      .listen(port);
  });
};

// Helper function to find the first available port
const findAvailablePort = async (
  startPort: number,
  maxRetries: number
): Promise<number | null> => {
  for (let i = 0; i < maxRetries; i++) {
    const port = startPort + i;
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
    console.log(`Port ${port} is in use, trying next port...`);
  }
  return null; // No available ports found within retry limit
};

// just shut it down when next.js is killed
process.on("SIGINT", () => {
  console.log("Shutting down, killing child processes...");
  for (const [id, proc] of activeProcesses.entries()) {
    console.log(`Killing process for project ${id}`);
    if (proc.pid) {
      try {
        process.kill(-proc.pid, "SIGINT"); // negative pid kills the process group
      } catch (err) {
        console.error(`Failed to kill process for ${id}:`, err);
      }
    }
  }
  process.exit(0);
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { projectId?: string };

    if (!body.projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const projectId = body.projectId;
    const projectPath = path.join(PROJECTS_DIR, projectId);

    if (!fs.existsSync(projectPath)) {
      return NextResponse.json(
        { error: "Project directory not found" },
        { status: 404 }
      );
    }

    // Install deps first (synchronous)
    const installResult = await runCommand("pnpm install", projectPath);
    if (!installResult.success) {
      return NextResponse.json(
        {
          error: "Failed to install dependencies",
          details: installResult.stderr,
        },
        { status: 500 }
      );
    }

    console.log("Dependencies installed successfully");

    // Find an available port
    const availablePort = await findAvailablePort(BASE_PORT, MAX_PORT_RETRIES);

    if (availablePort === null) {
      return NextResponse.json(
        {
          error: "No available ports found after maximum retries",
        },
        { status: 503 }
      );
    }

    console.log(`Found available port: ${availablePort}`);

    const devProcess = spawn(
      "pnpm",
      ["dev", "--port", availablePort.toString()],
      {
        cwd: projectPath,
        stdio: "pipe", // pipe stdout and stderr
        shell: true,
        // windowsHide: true,
        // detached: true, // Create a new process group
      }
    );

    activeProcesses.set(projectId, devProcess);

    devProcess.stdout.on("data", (data) => {
      console.log(`[${projectId} stdout]: ${data.toString()}`);
    });

    devProcess.stderr.on("data", (data) => {
      console.error(`[${projectId} stderr]: ${data.toString()}`);
    });

    devProcess.on("error", (error) => {
      console.error(`[${projectId}] Failed to start process:`, error);
      activeProcesses.delete(projectId);
    });

    devProcess.on("exit", (code, signal) => {
      console.log(
        `[${projectId}] Process exited with code ${code} and signal ${signal}`
      );
      activeProcesses.delete(projectId);
    });

    console.log(
      `Server for ${projectId} is confirmed running on port ${availablePort}`
    );

    return NextResponse.json({ port: availablePort, success: true });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
