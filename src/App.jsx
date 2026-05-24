import { useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Sequence from './components/Sequence';
import Projects from './components/Projects';
import Contact from './components/Contact';
import TearableScreen from './components/TearableScreen';
import Portfolio2 from './components/Portfolio2';
import './App.css';

function App() {
  const [viewState, setViewState] = useState('portfolio1');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (viewState === 'portfolio2') {
    return <Portfolio2 />;
  }

  return (
    <div className="app">
      {/* Scroll progress bar — left side, vertical */}
      {viewState === 'portfolio1' && (
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
      )}

      {/* Right sidebar */}
      {viewState === 'portfolio1' && <Sidebar />}

      {viewState === 'portfolio1' && (
        <main>
          <Sequence />
          <Projects onDiscover={() => setViewState('tearing')} />
          <Contact />
        </main>
      )}

      {viewState === 'tearing' && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
            <Portfolio2 />
          </div>
          <TearableScreen onTearComplete={() => setViewState('portfolio2')} />
        </>
      )}

      {viewState === 'portfolio1' && (
        <footer className="site-footer">
          <p>
            © {new Date().getFullYear()}{' '}
            <span style={{ color: 'var(--crimson-light)' }}>Tiaray Olivier</span>
          </p>
        </footer>
      )}
    </div>
  );
}

export default App;
