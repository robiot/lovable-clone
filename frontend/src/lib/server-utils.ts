import { exec as execCallback } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

// Mark this module as server-only
import 'server-only';

export const exec = promisify(execCallback);

// Function to copy a directory recursively
export async function copyDirectory(source: string, destination: string) {
  try {
    // Create destination directory if it doesn't exist
    await fs.mkdir(destination, { recursive: true });

    // Read source directory contents
    const entries = await fs.readdir(source, { withFileTypes: true });

    // Process each entry
    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        // Recursively copy directories
        await copyDirectory(srcPath, destPath);
      } else {
        // Copy files
        await fs.copyFile(srcPath, destPath);
      }
    }

    return true;
  } catch (error) {
    console.error('Error copying directory:', error);
    throw error;
  }
}

// Function to run a command in a specific directory
export async function runCommand(command: string, cwd: string) {
  try {
    const { stdout, stderr } = await exec(command, { cwd });
    return { stdout, stderr, success: true };
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
    return {
      stdout: '',
      stderr: error instanceof Error ? error.message : String(error),
      success: false
    };
  }
}
