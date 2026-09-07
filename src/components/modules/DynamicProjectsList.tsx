import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ProjectEntry } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface DynamicProjectsListProps {
  projects: ProjectEntry[];
  onChange: (projects: ProjectEntry[]) => void;
}

export const DynamicProjectsList: React.FC<DynamicProjectsListProps> = ({
  projects,
  onChange,
}) => {
  const handleAddProject = () => {
    const newProject: ProjectEntry = {
      id: Math.random().toString(36).substring(2, 9),
      title: '',
      liveUrl: '',
      githubUrl: '',
      description: '',
    };
    onChange([...projects, newProject]);
  };

  const handleRemoveProject = (id: string) => {
    onChange(projects.filter((p) => p.id !== id));
  };

  const handleUpdateProject = (id: string, field: keyof ProjectEntry, value: string) => {
    onChange(
      projects.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Featured Projects & Portfolio Repositories
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Highlight your best live apps, open-source repositories, or hackathon prototypes.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddProject}
          leftIcon={<Plus className="w-3.5 h-3.5 text-primary" />}
          className="shrink-0"
        >
          Add Project
        </Button>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="p-5 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] text-center">
          <p className="text-xs text-slate-400">
            No projects added yet. Click &quot;Add Project&quot; to showcase your work!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj, index) => (
            <div
              key={proj.id}
              className="p-4 rounded-xl border border-white/[0.08] bg-slate-950/40 space-y-3.5 hover:border-white/[0.12] transition-all duration-200"
            >
              {/* Project Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
                <span className="font-mono text-xs font-semibold text-primary tracking-wide">
                  Project #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(proj.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remove Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Project Fields */}
              <div className="space-y-3.5">
                <Input
                  label="Project Title *"
                  placeholder="e.g. EduFlow LMS or AI Code Assistant"
                  value={proj.title}
                  onChange={(e) => handleUpdateProject(proj.id, 'title', e.target.value)}
                  required
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    label="Live Demo URL"
                    placeholder="https://myproject.vercel.app"
                    value={proj.liveUrl}
                    onChange={(e) => handleUpdateProject(proj.id, 'liveUrl', e.target.value)}
                  />
                  <Input
                    label="GitHub Repo URL"
                    placeholder="https://github.com/username/repo"
                    value={proj.githubUrl}
                    onChange={(e) => handleUpdateProject(proj.id, 'githubUrl', e.target.value)}
                  />
                </div>

                <Textarea
                  label="Brief Description & Tech Stack"
                  placeholder="Describe key features, architectural highlights, and technologies used (e.g. React, Node, Docker)..."
                  rows={2}
                  value={proj.description}
                  onChange={(e) => handleUpdateProject(proj.id, 'description', e.target.value)}
                  className="min-h-[70px]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
