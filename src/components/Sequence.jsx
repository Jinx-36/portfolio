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
      const idx = Math.min(Math.round(p * (TOTAL_FRAMES_2 - 1)), TOTAL_FRAMES_2 - 1);
      if (idx === currentVid2Frame.current) return;
      currentVid2Frame.current = idx;
      
      const img = images2.current[idx];
      if (img?.complete) drawCover(canvasRef.current, img);
    });
    
    return unsubscribe;
  }, [loaded, vid1Done, scrollYProgress]);

  /* Scroll-driven animations for Text Overlays */
  // Hero text fades OUT early (0 to 15%)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -40]);
  const heroPointer = useTransform(scrollYProgress, v => v > 0.15 ? "none" : "auto");
  
  // About text fades IN late (85% to 100%)
  const aboutOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1]);
  const aboutY = useTransform(scrollYProgress, [0.85, 1], [40, 0]);
  const aboutPointer = useTransform(scrollYProgress, v => v < 0.85 ? "none" : "auto");

  // Watermarks
  const watermarkRightOpacity = useTransform(scrollYProgress, [0, 0.4], [0.1, 0]); /* Fades out by 40% scroll */
  const watermarkLeftOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 0.1]); /* Fades in at the end */

  // Overlays
  const heroOverlayOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const aboutOverlayOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1]); /* Fades in at the end */

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
            <motion.div 
              className="seq-about"
              style={{ opacity: aboutOpacity, y: aboutY, pointerEvents: aboutPointer }}
            >
              <p className="about-tag">02 — About Me</p>
              <h2 className="about-title">
                Crafting code<br />with <em>purpose</em>
              </h2>
              <p className="about-body">
                I am <strong>Tiaray Olivier Randrianomanana</strong> — a developer driven by a
                genuine passion for programming. For me, writing code is not just a job; it is a
                craft I take pride in.
              </p>
              <p className="about-body">
                I believe every project deserves <strong>exceptional quality</strong>, meticulous
                attention to detail, and a foundation built to last.
              </p>
              <div className="about-tags">
                {['React', 'TypeScript', 'Node.js', 'UI / UX', 'REST APIs'].map(s => (
                  <span key={s} className="about-pill">{s}</span>
                ))}
              </div>
              <a href="#projects" className="about-cta">
                <span className="about-cta-line" />
                See my work
              </a>
            </motion.div>
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
