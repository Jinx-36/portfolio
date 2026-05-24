import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Antigravity from './Antigravity';
import './Projects.css';

export default function Projects({ onDiscover }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section 
      id="projects" 
      className="section projects-section" 
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '100px 20px', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Antigravity
          count={300}
          magnetRadius={6}
          ringRadius={7}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={1.5}
          lerpSpeed={0.05}
          color="#8b1e1e"
          autoAnimate={true}
          particleVariance={1}
        />
      </div>
      <div className="container" ref={ref} style={{ textAlign: 'center', position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 style={{ 
            fontFamily: '"Outfit", sans-serif', 
            fontSize: 'clamp(2.2rem, 5vw, 4rem)', 
            color: 'var(--text-primary, #f0e8e8)',
            marginBottom: '40px',
            lineHeight: 1.2,
            letterSpacing: '-0.02em'
          }}>
            You really think that's all I can do?
          </h2>
          
          <motion.button
            onClick={onDiscover}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              pointerEvents: 'auto',
              background: 'var(--crimson, #990000)',
              border: '2px solid var(--crimson, #990000)',
              color: 'var(--text-primary, #f0e8e8)',
              padding: '16px 40px',
              borderRadius: '8px',
              fontFamily: '"Outfit", sans-serif',
              fontSize: '1.2rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(153,0,0, 0.2)',
              transition: 'box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => e.target.style.boxShadow = '0 8px 30px rgba(153,0,0, 0.5)'}
            onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 20px rgba(153,0,0, 0.2)'}
          >
            Discover more
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
