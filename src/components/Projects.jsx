import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ExternalLink, Code } from 'lucide-react';
import './Projects.css';

const projectsData = [
  {
    id: 1,
    title: 'Neon E-Commerce',
    description: 'A futuristic shopping experience built with Next.js, Framer Motion, and Stripe integration.',
    tags: ['React', 'Next.js', 'Framer Motion', 'Stripe'],
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Crypto Dashboard',
    description: 'Real-time cryptocurrency tracking app with glassmorphic dataviz and wallet integrations.',
    tags: ['Vue', 'Chart.js', 'Web3', 'Tailwind'],
    image: 'https://images.unsplash.com/photo-1640161704729-cbe966a08476?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'AI Image Generator',
    description: 'SaaS application allowing users to generate and share AI artwork with Stable Diffusion.',
    tags: ['Node.js', 'React', 'OpenAI', 'MongoDB'],
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop',
  }
];

export default function Projects() {
  const scrollRef = useRef(null);
  
  return (
    <section id="projects" className="section projects-section" ref={scrollRef}>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <h2 className="section-title">Featured <span className="text-gradient">Projects</span></h2>
          <p className="section-subtitle">A selection of my best work</p>
        </motion.div>

        <div className="projects-grid">
          {projectsData.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }) {
  return (
    <motion.div 
      className="project-card glass"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      whileHover={{ y: -10 }}
    >
      <div className="project-image-container">
        <img src={project.image} alt={project.title} className="project-image" />
        <div className="project-overlay">
          <a href="#" className="project-link"><ExternalLink size={24} /></a>
          <a href="#" className="project-link"><Code size={24} /></a>
        </div>
      </div>
      <div className="project-content">
        <h3 className="project-title">{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        <div className="project-tags">
          {project.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
