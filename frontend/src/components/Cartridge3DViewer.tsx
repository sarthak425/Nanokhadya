import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, Eye, Zap, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface Cartridge3DViewerProps {
  wellColors?: {
    z1: string;
    z2: string;
    z3: string;
    z4: string;
    z5: string;
    z6: string;
  };
}

export const Cartridge3DViewer: React.FC<Cartridge3DViewerProps> = ({
  wellColors = {
    z1: '#b91c1c',
    z2: '#f1f5f9',
    z3: '#f59e0b',
    z4: '#eab308',
    z5: '#84cc16',
    z6: '#ffffff'
  }
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [explosionFactor, setExplosionFactor] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [ledsOn, setLedsOn] = useState<boolean>(true);

  // References to 3D meshes for live updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const topCoverRef = useRef<THREE.Mesh | null>(null);
  const filterPadRef = useRef<THREE.Mesh | null>(null);
  const paperLayerRef = useRef<THREE.Group | null>(null);
  const baseTrayRef = useRef<THREE.Mesh | null>(null);
  const ledGroupRef = useRef<THREE.Group | null>(null);
  const wellMeshesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = 460;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 14, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.replaceChildren(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x3b82f6, 1.2);
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 0.8);
    rimLight.position.set(-15, 10, -10);
    scene.add(rimLight);

    // 3. Reader Optical Chamber Ceiling & 4x High-CRI LED Ring
    const ledGroup = new THREE.Group();
    ledGroupRef.current = ledGroup;
    ledGroup.position.set(0, 10, 0);

    // Overhead Chamber Ceiling Ring
    const chamberCeilingGeo = new THREE.CylinderGeometry(8, 8.5, 0.8, 32);
    const chamberMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8
    });
    const ceilingMesh = new THREE.Mesh(chamberCeilingGeo, chamberMat);
    ledGroup.add(ceilingMesh);

    // 4x High-CRI Diffuse LEDs
    const ledPositions = [
      [-4, -0.45, -4],
      [4, -0.45, -4],
      [-4, -0.45, 4],
      [4, -0.45, 4]
    ];
    ledPositions.forEach(pos => {
      const ledGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 16);
      const ledMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x93c5fd,
        emissiveIntensity: 1.5,
        roughness: 0.1
      });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(pos[0], pos[1], pos[2]);
      ledGroup.add(ledMesh);

      const spotLight = new THREE.SpotLight(0xffffff, 1.8, 18, Math.PI / 4, 0.5, 1);
      spotLight.position.set(pos[0], pos[1] - 0.1, pos[2]);
      spotLight.target.position.set(pos[0] * 0.4, 0, pos[2] * 0.4);
      ledGroup.add(spotLight);
      ledGroup.add(spotLight.target);
    });
    scene.add(ledGroup);

    // 4. Cartridge Root Group
    const cartridgeGroup = new THREE.Group();
    scene.add(cartridgeGroup);

    // Layer 1: Bottom Base Cassette Tray (PETG/ABS)
    const baseGeo = new THREE.BoxGeometry(14, 0.6, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.3
    });
    const baseTray = new THREE.Mesh(baseGeo, baseMat);
    baseTray.receiveShadow = true;
    baseTrayRef.current = baseTray;
    cartridgeGroup.add(baseTray);

    // Layer 2: Microfluidic Paper Analytical Device (μPAD) Layer
    const paperGroup = new THREE.Group();
    paperLayerRef.current = paperGroup;
    paperGroup.position.set(0, 0.5, 0);

    const paperGeo = new THREE.BoxGeometry(13.2, 0.15, 7.2);
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.9,
      metalness: 0.0
    });
    const paperSubstrate = new THREE.Mesh(paperGeo, paperMat);
    paperGroup.add(paperSubstrate);

    // Radial Wax Channels (Hydrophobic barriers visual lines)
    const channelMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    for (let i = -5; i <= 5; i += 2) {
      const channelGeo = new THREE.BoxGeometry(0.12, 0.16, 3.5);
      const ch = new THREE.Mesh(channelGeo, channelMat);
      ch.position.set(i * 1.1, 0.02, 0.5);
      ch.rotation.z = (i * 0.08);
      paperGroup.add(ch);
    }

    // 6 Reaction Wells on the Paper
    const wellMeshes: THREE.Mesh[] = [];
    const wellXCoords = [-4.6, -2.8, -1.0, 0.8, 2.6, 4.4];
    const initialHexColors = [
      wellColors.z1,
      wellColors.z2,
      wellColors.z3,
      wellColors.z4,
      wellColors.z5,
      wellColors.z6
    ];

    wellXCoords.forEach((x, idx) => {
      const wellGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.22, 32);
      const wellMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(initialHexColors[idx]),
        roughness: 0.4,
        metalness: 0.1
      });
      const well = new THREE.Mesh(wellGeo, wellMat);
      well.position.set(x, 0.1, 0.5);
      paperGroup.add(well);
      wellMeshes.push(well);

      // Well border ring
      const ringGeo = new THREE.RingGeometry(0.75, 0.88, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 5 ? 0x3b82f6 : 0x64748b,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.22, 0.5);
      paperGroup.add(ring);
    });
    wellMeshesRef.current = wellMeshes;
    cartridgeGroup.add(paperGroup);

    // Layer 3: PES 0.45um Pre-filtration Pad Disk (filters casein & fat globules)
    const filterGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.25, 32);
    const filterMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.7,
      transparent: true,
      opacity: 0.92
    });
    const filterPad = new THREE.Mesh(filterGeo, filterMat);
    filterPad.position.set(0, 1.1, -2.2);
    filterPadRef.current = filterPad;
    cartridgeGroup.add(filterPad);

    // Layer 4: Top Protective Housing / Cover with Sample Funnel & Optical Window
    const topGeo = new THREE.BoxGeometry(14, 0.5, 8);
    const topMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transmission: 0.75, // Translucent PMMA acrylic
      opacity: 0.85,
      transparent: true,
      roughness: 0.2,
      ior: 1.49,
      metalness: 0.1
    });
    const topCover = new THREE.Mesh(topGeo, topMat);
    topCover.position.set(0, 1.6, 0);
    topCoverRef.current = topCover;

    // Sample Funnel Inlet Hole
    const funnelGeo = new THREE.CylinderGeometry(0.8, 1.3, 0.8, 24);
    const funnelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const funnel = new THREE.Mesh(funnelGeo, funnelMat);
    funnel.position.set(0, 0.3, -2.2);
    topCover.add(funnel);

    cartridgeGroup.add(topCover);

    // Interactive Drag Controls (Manual Rotation)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      cartridgeGroup.rotation.y += deltaX * 0.01;
      cartridgeGroup.rotation.x += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      cartridgeGroup.rotation.y += deltaX * 0.015;
      cartridgeGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 5. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (autoRotate && !isDragging) {
        cartridgeGroup.rotation.y = Math.sin(elapsed * 0.4) * 0.35;
        cartridgeGroup.rotation.x = 0.25 + Math.cos(elapsed * 0.3) * 0.08;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Well Colors dynamically in 3D
  useEffect(() => {
    if (wellMeshesRef.current.length === 6) {
      const colors = [
        wellColors.z1,
        wellColors.z2,
        wellColors.z3,
        wellColors.z4,
        wellColors.z5,
        wellColors.z6
      ];
      colors.forEach((hex, idx) => {
        const mat = wellMeshesRef.current[idx].material as THREE.MeshStandardMaterial;
        mat.color.set(new THREE.Color(hex));
      });
    }
  }, [wellColors]);

  // Handle 3D Layer Explosion Separation
  useEffect(() => {
    const factor = explosionFactor;
    if (topCoverRef.current) {
      topCoverRef.current.position.y = 1.6 + factor * 5.2; // Lifts acrylic lid up
    }
    if (filterPadRef.current) {
      filterPadRef.current.position.y = 1.1 + factor * 3.6; // Suspends filtration pad
    }
    if (paperLayerRef.current) {
      paperLayerRef.current.position.y = 0.5 + factor * 1.8; // Suspends paper microchannel
    }
    if (baseTrayRef.current) {
      baseTrayRef.current.position.y = -factor * 1.5; // Lowers base tray
    }
  }, [explosionFactor]);

  // Toggle Optical Chamber LED illumination
  useEffect(() => {
    if (ledGroupRef.current) {
      ledGroupRef.current.visible = ledsOn;
    }
  }, [ledsOn]);

  return (
    <div className="glass-card" style={{ padding: '24px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-safe" style={{ fontSize: '0.7rem' }}>
              <Sparkles size={13} /> 3D Digital Twin Simulation
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>WebGL Photorealistic Model</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginTop: '4px' }}>
            Multiplex Cartridge &amp; Optical Reader Digital Twin
          </h3>
        </div>

        {/* 3D Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              sound.click();
              setLedsOn(!ledsOn);
            }}
            className={ledsOn ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          >
            <Zap size={14} /> {ledsOn ? 'High-CRI LEDs: ON' : 'Chamber LEDs: OFF'}
          </button>

          <button
            onClick={() => {
              sound.click();
              setAutoRotate(!autoRotate);
            }}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          >
            <RotateCcw size={14} /> {autoRotate ? 'Auto-Orbit: ON' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Exploded View Slider Controls */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Exploded Architectural Layer View:</span>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
            {Math.round(explosionFactor * 100)}% Separated
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Assembled</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explosionFactor}
            onChange={e => {
              setExplosionFactor(parseFloat(e.target.value));
            }}
            style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Exploded</span>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '460px',
          borderRadius: '14px',
          background: 'radial-gradient(circle at 50% 50%, #172554 0%, #0a0f1d 75%)',
          cursor: 'grab',
          position: 'relative'
        }}
      >
        {/* Layer Callout Tags when in exploded view */}
        {explosionFactor > 0.3 && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none'
          }}>
            <div className="badge badge-neutral" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', borderColor: '#3b82f6' }}>
              ✦ Top PMMA Optical Lid + Sample Inlet
            </div>
            <div className="badge badge-neutral" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', borderColor: '#10b981' }}>
              ✦ 0.45 µm PES Pre-filtration Membrane
            </div>
            <div className="badge badge-neutral" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', borderColor: '#f59e0b' }}>
              ✦ Wax Microfluidic μPAD Layer (5 Reaction Wells + BaSO4 Tile)
            </div>
            <div className="badge badge-neutral" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', borderColor: '#64748b' }}>
              ✦ Bottom Indexing Alignment Chassis
            </div>
          </div>
        )}

        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.5)',
          padding: '4px 10px',
          borderRadius: '6px'
        }}>
          Click and drag to rotate 360° in 3D space
        </div>
      </div>
    </div>
  );
};
