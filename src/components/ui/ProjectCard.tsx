import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';

export const ProjectCard = ({ project, large = false }: { project: Project, large?: boolean }) => {
  return (
    <Link to={`/project/${project.id}`} className="block w-full h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`group cursor-pointer relative overflow-hidden bg-surface-container-high w-full h-full ${
          large ? 'aspect-video md:aspect-[21/9]' : 'aspect-square'
        }`}
      >
        <img 
          src={project.image} 
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 p-8 space-y-3">
          <div className="flex gap-2">
            {project.tags.map((tag: string) => (
              <span key={tag} className="bg-surface-container-highest/60 backdrop-blur px-2 py-0.5 font-label text-[9px] uppercase tracking-widest text-white border border-outline-variant/10">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight font-sans">{project.title}</h3>
          <p className="text-secondary text-sm max-w-md font-light">{project.description}</p>
        </div>
      </motion.div>
    </Link>
  );
};
