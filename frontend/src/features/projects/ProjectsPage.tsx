import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, MoreVertical, Clock, 
  CheckCircle2, AlertCircle, Trash2, Edit2
} from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  progress: number;
}

const ProjectCard = ({ project }: { project: Project }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'Overdue': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 bg-white/5 border border-white/10`}>
            {getStatusIcon(project.status)}
            {project.status}
          </div>
          <button className="text-gray-500 hover:text-white p-1">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-6">{project.description}</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-bold text-purple-400">{project.progress}%</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          />
        </div>
      </div>
    </motion.div>
  );
};

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, title: 'Branding Identity', description: 'Design a new logo and brand guidelines for Joyida platform.', status: 'Ongoing', progress: 65 },
    { id: 2, title: 'Mobile App API', description: 'Develop the REST API endpoints for the mobile application.', status: 'Completed', progress: 100 },
    { id: 3, title: 'Market Research', description: 'Analyze competitors and define the target audience demographics.', status: 'Overdue', progress: 45 },
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-400">Manage and track your active projects here.</p>
        </div>
        <button className="glow-button flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        
        {/* Empty State / Add New Placeholder */}
        <button className="border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-gray-500 hover:text-purple-400 min-h-[220px]">
          <div className="p-3 rounded-full bg-white/5">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-medium">Create New Project</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectsPage;
