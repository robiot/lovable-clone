import { notFound } from "next/navigation";
import path from "node:path";
import fs from "node:fs/promises";
import type { Project } from "@/types/chat";
import ProjectView from "./_components/project-view";

// Projects directory
const PROJECTS_DIR = path.join(process.cwd(), "projects");

async function getProject(id: string): Promise<Project | null> {
  try {
    const projectPath = path.join(PROJECTS_DIR, id, "project.json");
    const projectData = await fs.readFile(projectPath, "utf8");
    return JSON.parse(projectData);
  } catch (error) {
    console.error(`Error getting project ${id}:`, error);

    // If project is not found, return mock data for demo purposes
    return {
      id,
      name: `Demo Project ${id}`,
      description: "A demo project for the Lovable interface",
      createdAt: Date.now(),
    };
  }
}

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const loadedparams = await params; //nextjs errors if its not awaited
  
  const project = await getProject(loadedparams.id);

  if (!project) {
    notFound();
  }

  return <ProjectView project={project} />;
}
