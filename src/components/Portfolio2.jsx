import { motion, useScroll, useSpring } from 'framer-motion';

export default function Portfolio2() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div style={{ backgroundColor: '#0a0505', color: '#f0e8e8', minHeight: '100vh', fontFamily: '"Outfit", sans-serif' }}>
      <motion.div
        style={{
          scaleY: scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '4px',
          height: '100vh',
          background: 'var(--crimson-light, #cc1111)',
          transformOrigin: 'top',
          zIndex: 1000,
        }}
      />
      
      {/* Header */}
      <header style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(153,0,0, 0.18)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
          T.O. <span style={{ color: '#c8943a' }}>// SYS_ADMIN</span>
        </h1>
        <nav style={{ display: 'flex', gap: '20px', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem' }}>
          <a href="#about" style={{ color: '#7a5f5f', textDecoration: 'none' }}>01_ABOUT</a>
          <a href="#systems" style={{ color: '#7a5f5f', textDecoration: 'none' }}>02_SYSTEMS</a>
          <a href="#contact" style={{ color: '#7a5f5f', textDecoration: 'none' }}>03_CONTACT</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '100px 56px' }}>
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{ maxWidth: '800px' }}
        >
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(153,0,0, 0.08)', border: '1px solid rgba(153,0,0, 0.20)', borderRadius: '100px', color: 'rgba(204,17,17, 0.85)', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', marginBottom: '24px' }}>
            &gt; SYSTEM_READY
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>
            Architecting <span style={{ color: '#cc1111' }}>Resilient</span> Infrastructures.
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#7a5f5f', lineHeight: 1.85, marginBottom: '40px' }}>
            Beyond writing code, I design, deploy, and secure the systems that keep everything running. From cloud orchestration to bare-metal networks, I build the foundations of modern applications.
          </p>
          <button style={{
            background: '#990000',
            border: '1px solid #990000',
            color: '#f0e8e8',
            padding: '16px 32px',
            borderRadius: '8px',
            fontFamily: '"Outfit", sans-serif',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 10px rgba(153,0,0,0.2)'
          }}>
            Explore Systems
          </button>
        </motion.div>
      </section>

      {/* Content Section */}
      <section id="systems" style={{ padding: '100px 56px', background: '#0f0707' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '48px', color: '#f0e8e8' }}>Core Competencies</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            { title: 'Cloud Infrastructure', desc: 'AWS, Azure, and GCP orchestration using Terraform and Kubernetes.' },
            { title: 'Network Security', desc: 'Zero-trust architecture, VPN tunneling, and hardware firewall configuration.' },
            { title: 'CI/CD Pipelines', desc: 'Automated deployment workflows ensuring zero-downtime updates.' },
            { title: 'Server Management', desc: 'Linux system administration, bash scripting, and performance tuning.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: '#160c0c',
                padding: '32px',
                borderRadius: '12px',
                borderLeft: '3px solid #cc1111',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}
            >
              <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{item.title}</h3>
              <p style={{ color: '#7a5f5f', lineHeight: 1.75 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
