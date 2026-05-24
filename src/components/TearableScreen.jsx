import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function TearableScreen({ onTearComplete }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    let animationFrameId;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/hero-screen.png', (texture) => {
      setLoading(false);
      texture.colorSpace = THREE.SRGBColorSpace;
      
      const cols = Math.min(Math.floor(width / 20), 80);
      const rows = Math.min(Math.floor(height / 20), 80);
      const cells = cols * rows;
      
      const vertices = new Float32Array(cells * 4 * 3);
      const uvs = new Float32Array(cells * 4 * 2);
      const indices = new Uint16Array(cells * 6);

      const cellW = width / cols;
      const cellH = height / rows;

      const particles = [];
      const constraints = []; // Rigid constraints within a cell
      const tearableConstraints = []; // Breakable constraints between cells

      class Particle {
        constructor(x, y) {
          this.pos = new THREE.Vector3(x, y, 0);
          this.prev = new THREE.Vector3(x, y, 0);
          this.original = new THREE.Vector3(x, y, 0);
          this.pinned = y > (height / 2) - 10;
        }
      }

      const getCellParticles = (c, r) => {
        const i = r * cols + c;
        const offset = i * 4;
        return [
          particles[offset + 0], // TL
          particles[offset + 1], // TR
          particles[offset + 2], // BL
          particles[offset + 3]  // BR
        ];
      };

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const offset = i * 4;
          
          const startX = -width / 2 + c * cellW;
          const startY = height / 2 - r * cellH;

          // 4 Particles for this cell
          const p0 = new Particle(startX, startY);
          const p1 = new Particle(startX + cellW, startY);
          const p2 = new Particle(startX, startY - cellH);
          const p3 = new Particle(startX + cellW, startY - cellH);

          particles.push(p0, p1, p2, p3);

          // Internal constraints (rigid, unbreakable)
          const addC = (pa, pb) => constraints.push({ p1: pa, p2: pb, rest: pa.original.distanceTo(pb.original) });
          addC(p0, p1); addC(p1, p3); addC(p3, p2); addC(p2, p0); // Edges
          addC(p0, p3); addC(p1, p2); // Diagonals

          // UVs
          const u0 = c / cols, v0 = 1 - (r / rows);
          const u1 = (c + 1) / cols, v1 = v0;
          const u2 = u0, v2 = 1 - ((r + 1) / rows);
          const u3 = u1, v3 = v2;

          uvs.set([u0, v0, u1, v1, u2, v2, u3, v3], i * 8);

          // Indices
          const idxOffset = i * 6;
          indices.set([
            offset + 0, offset + 2, offset + 1,
            offset + 1, offset + 2, offset + 3
          ], idxOffset);
        }
      }

      // Inter-cell constraints (tearable)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const [p0, p1, p2, p3] = getCellParticles(c, r);

          if (c < cols - 1) {
            const [np0, np1, np2, np3] = getCellParticles(c + 1, r);
            tearableConstraints.push({ p1: p1, p2: np0, broken: false }); // Top-Right to neighbor Top-Left
            tearableConstraints.push({ p1: p3, p2: np2, broken: false }); // Bottom-Right to neighbor Bottom-Left
          }
          if (r < rows - 1) {
            const [np0, np1, np2, np3] = getCellParticles(c, r + 1);
            tearableConstraints.push({ p1: p2, p2: np0, broken: false }); // Bottom-Left to neighbor Top-Left
            tearableConstraints.push({ p1: p3, p2: np1, broken: false }); // Bottom-Right to neighbor Top-Right
          }
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));

      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        side: THREE.DoubleSide
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Interaction
      const mouse = new THREE.Vector2(-10000, -10000);
      let isDragging = false;

      const getPointerPos = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - width / 2,
          y: -(clientY - height / 2)
        };
      };

      const onDown = (e) => {
        isDragging = true;
        const { x, y } = getPointerPos(e);
        mouse.set(x, y);
      };

      const onMove = (e) => {
        if (!isDragging) return;
        const { x, y } = getPointerPos(e);
        mouse.set(x, y);
      };

      const onUp = () => {
        isDragging = false;
        mouse.set(-10000, -10000);
      };

      window.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchstart', onDown, { passive: false });
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);

      const gravity = new THREE.Vector3(0, -600, 0);
      const mouseTearRadius = 60;
      let lastTime = performance.now();

      const animate = (time) => {
        animationFrameId = requestAnimationFrame(animate);
        
        let dt = (time - lastTime) / 1000;
        lastTime = time;
        if (dt > 0.05) dt = 0.05; // Cap dt for stability

        // Verlet integration
        for (const p of particles) {
          if (p.pinned) continue;
          
          const vel = p.pos.clone().sub(p.prev).multiplyScalar(0.99); // friction
          p.prev.copy(p.pos);
          p.pos.add(vel).add(gravity.clone().multiplyScalar(dt * dt));
        }

        // Tearing from mouse
        if (isDragging) {
          const mVec = new THREE.Vector3(mouse.x, mouse.y, 0);
          for (const c of tearableConstraints) {
            if (c.broken) continue;
            // The tearable constraint connects two overlapping particles initially.
            const mid = c.p1.pos.clone().add(c.p2.pos).multiplyScalar(0.5);
            if (mid.distanceTo(mVec) < mouseTearRadius) {
              c.broken = true;
              c.p1.pinned = false; 
              c.p2.pinned = false;
            }
          }
        }

        // Resolve constraints
        for (let iter = 0; iter < 10; iter++) {
          // Internal rigid constraints
          for (const c of constraints) {
            const diff = c.p2.pos.clone().sub(c.p1.pos);
            const dist = diff.length();
            if (dist === 0) continue;
            
            const diffRatio = (dist - c.rest) / dist;
            const offset = diff.multiplyScalar(diffRatio * 0.5);

            if (!c.p1.pinned) c.p1.pos.add(offset);
            if (!c.p2.pinned) c.p2.pos.sub(offset);
          }

          // Tearable constraints (distance should be 0)
          for (const c of tearableConstraints) {
            if (c.broken) continue;
            const diff = c.p2.pos.clone().sub(c.p1.pos);
            const dist = diff.length();
            if (dist === 0) continue;
            
            // Auto-tear if stretched too much (structural failure)
            if (dist > cellW * 4.5) {
              c.broken = true;
              continue;
            }

            const offset = diff.multiplyScalar(0.5);
            if (!c.p1.pinned) c.p1.pos.add(offset);
            if (!c.p2.pinned) c.p2.pos.sub(offset);
          }
        }

        // Update geometry
        let activeCount = 0;
        const posAttr = geometry.attributes.position;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.pos.y > -height) activeCount++;
          posAttr.setXYZ(i, p.pos.x, p.pos.y, p.pos.z);
        }
        posAttr.needsUpdate = true;

        renderer.render(scene, camera);

        // Check completion (most particles fallen)
        if (activeCount < particles.length * 0.1) {
          cancelAnimationFrame(animationFrameId);
          onTearComplete();
        }
      };

      animate(performance.now());
      
      const onResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        renderer.setSize(width, height);
        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.updateProjectionMatrix();
      };
      
      window.addEventListener('resize', onResize);

      // Cleanup
      mountRef.current.cleanup = () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchstart', onDown);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
      };
    });

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (mountRef.current && mountRef.current.cleanup) {
        mountRef.current.cleanup();
      }
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
      renderer.dispose();
    };
  }, [onTearComplete]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'transparent', overflow: 'hidden' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0e8e8', fontFamily: '"Outfit", sans-serif', fontSize: '1.5rem', background: '#0a0505' }}>
          Loading scene...
        </div>
      )}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab', touchAction: 'none' }} />
      <div style={{ 
        position: 'absolute', 
        bottom: '40px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        color: 'rgba(255,255,255,0.8)', 
        fontFamily: '"Outfit", sans-serif', 
        fontWeight: 600, 
        pointerEvents: 'none', 
        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        background: 'rgba(153,0,0,0.4)',
        padding: '12px 24px',
        borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        Click and drag to discover more
      </div>
    </div>
  );
}
