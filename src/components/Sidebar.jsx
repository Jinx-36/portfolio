import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import './Sidebar.css';

const navLinks = [
  { label: 'Home',     href: '#home',     num: '01' },
  { label: 'About',    href: '#about',    num: '02' },
  { label: 'Projects', href: '#projects', num: '03' },
  { label: 'Contact',  href: '#contact',  num: '04' },
];

export default function Sidebar() {
  const [active, setActive]       = useState('#home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress }       = useScroll();

  // Thin crimson progress line that fills as user scrolls
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const ids = navLinks.map(l => l.href.replace('#', ''));
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(`#${e.target.id}`); }),
      { threshold: 0.4 },
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const activeIdx = navLinks.findIndex(l => l.href === active);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <motion.aside
        className="sb"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        {/* Scroll progress track + fill */}
        <div className="sb__track">
          <motion.div className="sb__fill" style={{ height: lineHeight }} />
          {/* Section dots on the track */}
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={`sb__dot ${active === link.href ? 'sb__dot--active' : ''}`}
              style={{ top: `${(i / (navLinks.length - 1)) * 100}%` }}
              onClick={() => setActive(link.href)}
              aria-label={link.label}
            >
              <span className="sb__dot-ring" />
              <span className="sb__dot-core" />
              {/* Tooltip on hover */}
              <span className="sb__dot-tip">
                <span className="sb__dot-num">{link.num}</span>
                <span className="sb__dot-lbl">{link.label}</span>
              </span>
            </a>
          ))}
        </div>

        {/* Bottom monogram */}
        <div className="sb__mono" style={{ overflow: 'hidden' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </motion.aside>

      {/* ── Mobile burger ────────────────────────────────────────────── */}
      <button
        className="sb__burger"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle menu"
      >
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="sb__burger-bar"
            animate={
              mobileOpen
                ? i === 0 ? { y: 7,  rotate: 45  }
                : i === 1 ? { opacity: 0 }
                :           { y: -7, rotate: -45 }
                : { y: 0, rotate: 0, opacity: 1 }
            }
            transition={{ duration: 0.25 }}
          />
        ))}
      </button>

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="sb__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.nav
              className="sb__drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              {/* Decorative header */}
              <div className="sb__drawer-head" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span className="sb__drawer-mono">T.O.R</span>
                  <span className="sb__drawer-sub">Portfolio</span>
                </div>
              </div>

              {/* Links */}
              <div className="sb__drawer-links">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    className={`sb__drawer-link ${active === link.href ? 'active' : ''}`}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.1 }}
                    onClick={() => { setActive(link.href); setMobileOpen(false); }}
                  >
                    <span className="sb__drawer-num">{link.num}</span>
                    <span className="sb__drawer-lbl">{link.label}</span>
                    {active === link.href && (
                      <motion.span className="sb__drawer-bar" layoutId="drawer-bar" />
                    )}
                  </motion.a>
                ))}
              </div>

              {/* Footer line */}
              <div className="sb__drawer-foot">
                <span className="sb__drawer-foot-line" />
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
