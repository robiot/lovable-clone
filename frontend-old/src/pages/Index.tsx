import React from "react";
import ChatInterface from "@/components/ChatInterface";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

const Index = () => {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await axios.get("/api/projects");
      return [
        {
          id: "1",
          title: "Project 1",
          description: "Description of Project 1",
          imageUrl: "https://via.placeholder.com/150",
        },
      ];
    },
  });

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-primary mb-6 text-center">
          Idea to app in seconds.
        </h1>

        {/* Chat Interface Section */}
        <div className="bg-card rounded-lg p-6 shadow-lg mb-12">
          <p className="text-muted-foreground mb-4">
            Ask me anything about my projects and experience!
          </p>
          <Input />
        </div>
      </div>

      {/* Projects Grid Section */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">My Projects</h2>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <div
                key={project.id}
                className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {project.imageUrl && (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
