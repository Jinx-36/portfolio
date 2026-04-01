import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import './Sequence.css';

const TOTAL_FRAMES_1 = 73;
const TOTAL_FRAMES_2 = 73;
const FRAME_MS = 40;

const frames1 = Array.from({ length: TOTAL_FRAMES_1 }, (_, i) => {
  const n = String(i + 1).padStart(6, '0');
  return new URL(`../assets/vid1/${n}.png`, import.meta.url).href;
});

const frames2 = Array.from({ length: TOTAL_FRAMES_2 }, (_, i) => {
  const n = String(i + 1).padStart(6, '0');
  return new URL(`../assets/vid2/${n}.png`, import.meta.url).href;
});

function drawCover(canvas, img) {
  const ctx = canvas.getContext('2d');
  const { width: cw, height: ch } = canvas;
  const iw = img.naturalWidth  || img.width  || 1;
  const ih = img.naturalHeight || img.height || 1;
  const s  = Math.max(cw / iw, ch / ih);
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - iw * s) / 2, (ch - ih * s) / 2, iw * s, ih * s);
}

export default function Sequence() {
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);
  
  const images1 = useRef([]);
  const images2 = useRef([]);
  
  const [loaded, setLoaded] = useState(false);
  const [vid1Done, setVid1Done] = useState(false);
  
  const rafId = useRef(null);
  const lastTs = useRef(null);
  const currentVid1Frame = useRef(0);
  const currentVid2Frame = useRef(0);

  /* Pre-load frames */
  useEffect(() => {
    let done = 0;
    const total = TOTAL_FRAMES_1 + TOTAL_FRAMES_2;
    const checkDone = () => { if (++done === total) setLoaded(true); };
    
    images1.current = frames1.map(src => {
      const img = new Image(); img.src = src;
      img.onload = checkDone; img.onerror = checkDone; return img;
    });
    images2.current = frames2.map(src => {
      const img = new Image(); img.src = src;
      img.onload = checkDone; img.onerror = checkDone; return img;
    });

    // Prevent browser from restoring scroll position across reloads
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Always start at the top
    window.scrollTo(0, 0);
  }, []);

  /* Resize listener */
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Draw current active frame
    if (!vid1Done) {
      const img = images1.current[currentVid1Frame.current];
      if (img?.complete) drawCover(canvas, img);
    } else {
      const img = images2.current[currentVid2Frame.current];
      if (img?.complete) drawCover(canvas, img);
    }
  }, [vid1Done]);

  useEffect(() => {
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  /* Vid1 Autoplay Loop */
  useEffect(() => {
    if (!loaded || vid1Done) return;
    
    // Lock scroll safely
    document.body.style.overflow = "hidden";
    
    const canvas = canvasRef.current;
    resize(); // initial size
    
    const tick = (ts) => {
      if (!lastTs.current) lastTs.current = ts;
      if (ts - lastTs.current >= FRAME_MS) {
        lastTs.current = ts;
        const idx = currentVid1Frame.current;
        drawCover(canvas, images1.current[idx]);
        
        if (idx < TOTAL_FRAMES_1 - 1) {
          currentVid1Frame.current = idx + 1;
        } else {
          // Vid1 finished
          setVid1Done(true);
          // Unlock scroll
          document.body.style.overflow = "";
          // Immediately draw first frame of vid2
          if (images2.current[0]?.complete) {
             drawCover(canvas, images2.current[0]);
          }
          return;
        }
      }
      rafId.current = requestAnimationFrame(tick);
    };
    
    rafId.current = requestAnimationFrame(tick);
    
    return () => {
      cancelAnimationFrame(rafId.current);
      // Failsafe unlock
      document.body.style.overflow = "";
    };
  }, [loaded, vid1Done, resize]);

  /* Scroll handling for Vid2 */
  const { scrollYProgress } = useScroll({
    target: stickyRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    if (!loaded || !vid1Done) return;
    
    const unsubscribe = scrollYProgress.on('change', (p) => {
      // Map global scroll [0, 0.25] to video 2 frames [0, 72]
      const v2p = Math.min(Math.max(p / 0.25, 0), 1);
      const idx = Math.min(Math.round(v2p * (TOTAL_FRAMES_2 - 1)), TOTAL_FRAMES_2 - 1);
      if (idx === currentVid2Frame.current) return;
      currentVid2Frame.current = idx;
      
      const img = images2.current[idx];
      if (img?.complete) drawCover(canvasRef.current, img);
    });
    
    return unsubscribe;
  }, [loaded, vid1Done, scrollYProgress]);

  /* Scroll-driven animations for Text Overlays */
  // Hero text fades OUT early (0 to 10%)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.10], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.10], [0, -40]);
  const heroPointer = useTransform(scrollYProgress, v => v > 0.10 ? "none" : "auto");
  
  // Card 1
  const card1Opacity = useTransform(scrollYProgress, [0.2, 0.25, 0.45, 0.5], [0, 1, 1, 0]);
  const card1Y = useTransform(scrollYProgress, [0.2, 0.25, 0.45, 0.5], [40, 0, 0, -40]);
  const card1Pointer = useTransform(scrollYProgress, v => (v >= 0.2 && v <= 0.5) ? "auto" : "none");

  // Card 2
  const card2Opacity = useTransform(scrollYProgress, [0.45, 0.5, 0.7, 0.75], [0, 1, 1, 0]);
  const card2Y = useTransform(scrollYProgress, [0.45, 0.5, 0.7, 0.75], [40, 0, 0, -40]);
  const card2Pointer = useTransform(scrollYProgress, v => (v >= 0.45 && v <= 0.75) ? "auto" : "none");

  // Card 3
  const card3Opacity = useTransform(scrollYProgress, [0.7, 0.75, 1, 1], [0, 1, 1, 1]); 
  const card3Y = useTransform(scrollYProgress, [0.7, 0.75, 1, 1], [40, 0, 0, 0]);
  const card3Pointer = useTransform(scrollYProgress, v => v >= 0.7 ? "auto" : "none");

  // Watermarks
  const watermarkRightOpacity = useTransform(scrollYProgress, [0, 0.2], [0.1, 0]); /* Fades out by 20% scroll */
  const watermarkLeftOpacity = useTransform(scrollYProgress, [0.2, 0.25], [0, 0.1]); /* Fades in at 25% */

  // Overlays
  const heroOverlayOpacity = useTransform(scrollYProgress, [0, 0.10], [1, 0]);
  const aboutOverlayOpacity = useTransform(scrollYProgress, [0.2, 0.25], [0, 1]); /* Fades in at 25% */

  return (
    <div ref={stickyRef} className="seq-wrapper">
      
      {/* Anchor for Home Section at top */}
      <div id="home" className="seq-anchor top" style={{ height: '100vh' }} />

      {/* Anchor for About Section at bottom so sidebar intersection triggers precisely in the last 100vh */}
      <div id="about" className="seq-anchor bottom" style={{ height: '100vh' }} />

      <div className="seq-sticky">
        
        {/* Loader */}
        <AnimatePresence>
          {!loaded && (
            <motion.div className="seq-loader" exit={{ opacity: 0 }}>
              <span className="seq-loader__bar" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Unified Canvas */}
        <canvas ref={canvasRef} className="seq-canvas" />

        {/* Dynamic Gradient Overlays tailored for left and right visibility */}
        <AnimatePresence>
          {vid1Done && (
            <motion.div 
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div className="hero-overlay" style={{ opacity: heroOverlayOpacity }} />
              <motion.div className="about-overlay" style={{ opacity: aboutOverlayOpacity }} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* ── HERO CONTENT (LEFT SIDE) ── */}
        <AnimatePresence>
          {vid1Done && (
            <motion.div 
              className="seq-hero"
              style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroPointer }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="hero-tag">Software Developer &amp; Engineer</p>
              <h1 className="hero-name">
                Tiaray<br /><em>Olivier</em><br />Randrianomanana
              </h1>
              <p className="hero-tagline">
                Passionate about code, obsessed with quality — I build websites
                that perform flawlessly and leave a lasting impression.
              </p>
              <a href="#about" className="hero-cta">
                <span className="hero-cta-line" />
                Discover my work
              </a>
              
              <div className="hero-scroll">
                <span className="hero-scroll-line" />
                <span className="hero-scroll-text">Scroll</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ABOUT CONTENT (RIGHT SIDE) ── */}
        <AnimatePresence>
          {vid1Done && (
            <>
              {/* Card 1 */}
              <motion.div 
                className="seq-card"
                style={{ opacity: card1Opacity, y: card1Y, pointerEvents: card1Pointer }}
              >
                <p className="card-tag">Skill 1 — Frontend</p>
                <h2 className="card-title">
                  Interfaces that <em>breathe</em>
                </h2>
                <p className="card-body">
                  I craft pixel-precise UIs with <strong>React</strong> — component-driven, performant, and designed to feel alive. With a sharp eye for spacing, typography, and motion, I bridge the gap between what works and what wows.
                </p>
                <div className="card-tags">
                  {['React', 'CSS', 'Animations', 'UX', 'Responsive Design'].map(s => (
                    <span key={s} className="card-pill">{s}</span>
                  ))}
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div 
                className="seq-card"
                style={{ opacity: card2Opacity, y: card2Y, pointerEvents: card2Pointer }}
              >
                <p className="card-tag">Skill 2 — Backend</p>
                <h2 className="card-title">
                  Logic built to <em>last</em>
                </h2>
                <p className="card-body">
                  From <strong>REST APIs</strong> to business logic, I engineer clean, scalable server-side solutions with <strong>Node.js</strong> — reliable under pressure, structured with intent, and easy to maintain.
                </p>
                <div className="card-tags">
                  {['Node.js', 'Express', 'REST APIs', 'Authentication'].map(s => (
                    <span key={s} className="card-pill">{s}</span>
                  ))}
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div 
                className="seq-card"
                style={{ opacity: card3Opacity, y: card3Y, pointerEvents: card3Pointer }}
              >
                <p className="card-tag">Skill 3 — Data & Full-Stack</p>
                <h2 className="card-title">
                  From idea to <em>reality</em>
                </h2>
                <p className="card-body">
                  I design schemas that scale and write queries that perform — then connect every layer into one cohesive product. Frontend, backend, database: <strong>one vision, end to end</strong>.
                </p>
                <div className="card-tags">
                  {['PostgreSQL', 'MySQL', 'Schema Design', 'Full-Stack'].map(s => (
                    <span key={s} className="card-pill">{s}</span>
                  ))}
                </div>
                <a href="#projects" className="card-cta">
                  <span className="card-cta-line" />
                  Discover my work
                </a>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Dynamic Watermark - Fades from 01 to 02 across scroll */}
        <AnimatePresence>
          {vid1Done && (
            <div className="seq-watermark-wrapper">
              <motion.div style={{ opacity: watermarkRightOpacity }} className="seq-watermark right">
                01
              </motion.div>
              <motion.div style={{ opacity: watermarkLeftOpacity }} className="seq-watermark left">
                02
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
