import { 
  Briefcase, 
  ArrowRight, 
  Circle,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ProjectSpotlightProps {
  project: any;
  role: string;
}

export default function ProjectSpotlight({ project, role }: ProjectSpotlightProps) {
  if (!project) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary-900 rounded-3xl p-8 mb-8 text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-800 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>

      <div className="relative z-10 flex-1">
        <div className="flex items-center gap-2 mb-4">
           <span className="px-3 py-1 bg-primary-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Active Project</span>
           <span className="flex items-center gap-1 text-[10px] font-bold text-primary-300 uppercase tracking-wider">
              <Calendar size={12} /> Started {new Date(project.created_at).toLocaleDateString()}
           </span>
        </div>
        <h2 className="text-2xl font-900 mb-2">{project.title}</h2>
        <p className="text-primary-100 font-medium line-clamp-2 max-w-xl">
          {project.description || "Continue working on this project to meet your upcoming deadlines."}
        </p>
      </div>

      <div className="relative z-10 w-full md:w-auto shrink-0">
        <Link 
          to={`/dashboard/projects/${project.job_id || project.id}`} 
          className="btn btn-primary bg-white text-primary-900 hover:bg-primary-50 border-none px-8 py-4 h-auto rounded-2xl flex items-center gap-3 font-900"
        >
          Open Workspace <ArrowRight size={20} />
        </Link>
      </div>
    </motion.div>
  );
}
