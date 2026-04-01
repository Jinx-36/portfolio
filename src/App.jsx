import { motion, useScroll, useSpring } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Sequence from './components/Sequence';
import Projects from './components/Projects';
import Contact from './components/Contact';
import './App.css';

function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="app">
      {/* Scroll progress bar — left side, vertical */}
      <motion.div
        style={{
          scaleY: scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '2px',
          height: '100vh',
          background: 'linear-gradient(to bottom, var(--crimson-light), var(--gold))',
          transformOrigin: 'top',
          zIndex: 1000,
        }}
      />

      {/* Right sidebar */}
      <Sidebar />

      <main>
        <Sequence />
        <Projects />
        <Contact />
      </main>

      <footer className="site-footer">
        <p>
          © {new Date().getFullYear()}{' '}
          <span style={{ color: 'var(--crimson-light)' }}>Tiaray Olivier</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
