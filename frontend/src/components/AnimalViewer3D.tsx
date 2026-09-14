import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rotate3D, Sparkles, Scan } from 'lucide-react';

interface AnimalViewer3DProps {
  foodType: 'Milk' | 'Honey' | 'Paneer';
  isScanning?: boolean;
}

export function AnimalViewer3D({ foodType, isScanning = false }: AnimalViewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [interactiveNotice, setInteractiveNotice] = useState(true);
  const [specimenScanned, setSpecimenScanned] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setInteractiveNotice(false), 4000);
    return () => clearTimeout(timer);
  }, [foodType]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── 1. Scene, Camera, Renderer Setup ─────────────────────────────
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    // Transparent background to blend seamlessly with glassmorphism card
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 2.4, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── 2. Lighting Setup ─────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.6);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const warmLight = new THREE.PointLight(0xf59e0b, 1.2, 10);
    warmLight.position.set(0, 3, 2);
    scene.add(warmLight);

    // ── 3. Holographic Scanner Pedestal ──────────────────────────────
    const pedestalGroup = new THREE.Group();

    // Circular base grid
    const baseGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.15, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.2;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Glowing Hologram Rings
    const ringGeo1 = new THREE.RingGeometry(1.6, 1.75, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = -1.1;
    pedestalGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(2.0, 2.08, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = -1.1;
    pedestalGroup.add(ring2);

    // Grid wireframe disc
    const gridHelper = new THREE.PolarGridHelper(2.1, 8, 4, 32, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -1.09;
    pedestalGroup.add(gridHelper);

    scene.add(pedestalGroup);

    // ── 4. Laser Scan Plane (for active scan mode) ────────────────────
    const scanGeo = new THREE.PlaneGeometry(3.6, 0.05);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const scanLaser = new THREE.Mesh(scanGeo, scanMat);
    scanLaser.rotation.x = Math.PI / 2;
    scanLaser.position.y = -1.0;
    scene.add(scanLaser);

    // ── 5. Procedural 3D Animal Builders ─────────────────────────────
    const animalRoot = new THREE.Group();
    scene.add(animalRoot);

    let tailMesh: THREE.Object3D | null = null;
    let headMesh: THREE.Object3D | null = null;
    let wingL: THREE.Object3D | null = null;
    let wingR: THREE.Object3D | null = null;

    // ── COW BUILDER (Milk) ───────────────────────────────────────────
    const buildCow = () => {
      const cow = new THREE.Group();

      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
      const spotMat  = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const pinkMat  = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.6 });
      const hornMat  = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.4 });
      const hoofMat  = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

      // Body (sturdy dairy cow torso)
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.1), whiteMat);
      body.castShadow = true;
      body.position.y = 0;
      cow.add(body);

      // Spots on body
      const spot1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 1.12), spotMat);
      spot1.position.set(0.2, 0.15, 0);
      cow.add(spot1);

      const spot2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 1.12), spotMat);
      spot2.position.set(-0.5, -0.2, 0);
      cow.add(spot2);

      // Udder underneath (symbol of pure milk)
      const udder = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.5), pinkMat);
      udder.position.set(-0.3, -0.65, 0);
      cow.add(udder);

      // Neck & Head
      const headGroup = new THREE.Group();
      headGroup.position.set(1.0, 0.6, 0);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.65), whiteMat);
      head.castShadow = true;
      headGroup.add(head);

      // Snout / Muzzle
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.55), pinkMat);
      snout.position.set(0.42, -0.15, 0);
      headGroup.add(snout);

      // Nostrils
      const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
      const n1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.08), nostrilMat);
      n1.position.set(0.62, -0.12, 0.12);
      const n2 = n1.clone();
      n2.position.set(0.62, -0.12, -0.12);
      headGroup.add(n1, n2);

      // Eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
      const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.08), eyeMat);
      eyeL.position.set(0.25, 0.12, 0.33);
      const eyeR = eyeL.clone();
      eyeR.position.set(0.25, 0.12, -0.33);
      headGroup.add(eyeL, eyeR);

      // Horns
      const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 8), hornMat);
      hornL.rotation.z = -0.3;
      hornL.rotation.x = 0.2;
      hornL.position.set(-0.05, 0.45, 0.25);
      const hornR = hornL.clone();
      hornR.rotation.x = -0.2;
      hornR.position.set(-0.05, 0.45, -0.25);
      headGroup.add(hornL, hornR);

      // Ears
      const earL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.3), pinkMat);
      earL.position.set(-0.1, 0.25, 0.45);
      earL.rotation.x = 0.4;
      const earR = earL.clone();
      earR.position.set(-0.1, 0.25, -0.45);
      earR.rotation.x = -0.4;
      headGroup.add(earL, earR);

      headMesh = headGroup;
      cow.add(headGroup);

      // 4 Legs
      const legGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.9, 12);
      const hoofGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.15, 12);

      const makeLeg = (x: number, z: number) => {
        const leg = new THREE.Group();
        const main = new THREE.Mesh(legGeo, whiteMat);
        main.position.y = -0.45;
        main.castShadow = true;
        const hoof = new THREE.Mesh(hoofGeo, hoofMat);
        hoof.position.y = -0.85;
        leg.add(main, hoof);
        leg.position.set(x, -0.3, z);
        return leg;
      };

      cow.add(makeLeg(0.6, 0.4));
      cow.add(makeLeg(0.6, -0.4));
      cow.add(makeLeg(-0.6, 0.4));
      cow.add(makeLeg(-0.6, -0.4));

      // Tail
      const tail = new THREE.Group();
      const tailRod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7), whiteMat);
      tailRod.position.y = -0.35;
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), spotMat);
      tuft.position.y = -0.75;
      tail.add(tailRod, tuft);
      tail.position.set(-0.95, 0.4, 0);
      tail.rotation.z = 0.3;
      tailMesh = tail;
      cow.add(tail);

      cow.position.y = 0.2;
      return cow;
    };

    // ── BEE BUILDER (Honey) ──────────────────────────────────────────
    const buildBee = () => {
      const bee = new THREE.Group();

      const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
      const blackMat  = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const wingMat   = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
        roughness: 0.1,
        metalness: 0.3,
        side: THREE.DoubleSide,
      });

      // Thorax (front chest)
      const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), blackMat);
      thorax.scale.set(1.1, 0.9, 0.9);
      thorax.castShadow = true;
      bee.add(thorax);

      // Abdomen (striped rear body)
      const abdomen = new THREE.Group();
      abdomen.position.set(-0.75, -0.1, 0);

      // 4 yellow/black stripes
      for (let i = 0; i < 5; i++) {
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38 - i * 0.05, 0.42 - i * 0.04, 0.22, 16),
          i % 2 === 0 ? yellowMat : blackMat
        );
        seg.rotation.z = Math.PI / 2;
        seg.position.x = -i * 0.2;
        seg.castShadow = true;
        abdomen.add(seg);
      }
      // Stinger
      const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 8), blackMat);
      stinger.rotation.z = Math.PI / 2;
      stinger.position.x = -1.1;
      abdomen.add(stinger);
      bee.add(abdomen);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), blackMat);
      head.position.set(0.65, 0, 0);
      head.castShadow = true;

      // Compound Eyes
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.8 });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), eyeMat);
      eyeL.position.set(0.18, 0.1, 0.22);
      const eyeR = eyeL.clone();
      eyeR.position.set(0.18, 0.1, -0.22);
      head.add(eyeL, eyeR);

      // Antennae
      const antL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35), blackMat);
      antL.position.set(0.18, 0.3, 0.12);
      antL.rotation.x = 0.4;
      antL.rotation.z = -0.3;
      const antR = antL.clone();
      antR.position.set(0.18, 0.3, -0.12);
      antR.rotation.x = -0.4;
      head.add(antL, antR);

      headMesh = head;
      bee.add(head);

      // Wings (Glowing and fluttered in loop)
      const makeWing = (side: 1 | -1) => {
        const wGroup = new THREE.Group();
        const mainW = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.55), wingMat);
        mainW.position.set(-0.3, 0.25, 0.5 * side);
        mainW.rotation.x = side * 0.3;
        wGroup.add(mainW);
        wGroup.position.set(0, 0.4, 0);
        return wGroup;
      };

      wingL = makeWing(1);
      wingR = makeWing(-1);
      bee.add(wingL, wingR);

      // Small legs
      const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
      for (let s of [-1, 1]) {
        for (let x of [-0.2, 0.1, 0.35]) {
          const leg = new THREE.Mesh(legGeo, blackMat);
          leg.position.set(x, -0.4, s * 0.25);
          leg.rotation.z = x * 0.5;
          leg.rotation.x = s * 0.4;
          bee.add(leg);
        }
      }

      // Golden Pollen Glow Particles
      const particleGeo = new THREE.BufferGeometry();
      const pCount = 30;
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3]     = (Math.random() - 0.5) * 2;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.07, transparent: true, opacity: 0.8 });
      const particles = new THREE.Points(particleGeo, pMat);
      bee.add(particles);

      bee.position.y = 0.3;
      return bee;
    };

    // ── BUFFALO BUILDER (Paneer) ─────────────────────────────────────
    const buildBuffalo = () => {
      const buffalo = new THREE.Group();

      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.2 });
      const slateMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const hornMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.2, metalness: 0.6 });
      const muzzleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

      // Muscular torso
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.3, 1.25), darkMat);
      body.castShadow = true;
      buffalo.add(body);

      // Robust shoulders / hump
      const hump = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 1.1), darkMat);
      hump.position.set(0.4, 0.7, 0);
      buffalo.add(hump);

      // Head
      const headGroup = new THREE.Group();
      headGroup.position.set(1.2, 0.45, 0);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 0.7), darkMat);
      head.castShadow = true;
      headGroup.add(head);

      const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.6), muzzleMat);
      muzzle.position.set(0.5, -0.18, 0);
      headGroup.add(muzzle);

      // Nostrils
      const n1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.08), slateMat);
      n1.position.set(0.72, -0.15, 0.15);
      const n2 = n1.clone();
      n2.position.set(0.72, -0.15, -0.15);
      headGroup.add(n1, n2);

      // Distinctive Sweeping Curved Buffalo Horns
      const makeHorn = (side: 1 | -1) => {
        const hornG = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.6, 8), hornMat);
        base.rotation.z = -0.7;
        base.rotation.x = side * 1.1;
        base.position.set(-0.1, 0.4, side * 0.4);

        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 8), hornMat);
        tip.rotation.z = 0.4;
        tip.rotation.x = side * -0.5;
        tip.position.set(-0.25, 0.7, side * 0.65);

        hornG.add(base, tip);
        return hornG;
      };

      headGroup.add(makeHorn(1));
      headGroup.add(makeHorn(-1));

      // Ears
      const earL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.35), slateMat);
      earL.position.set(-0.1, 0.15, 0.45);
      earL.rotation.x = 0.5;
      const earR = earL.clone();
      earR.position.set(-0.1, 0.15, -0.45);
      earR.rotation.x = -0.5;
      headGroup.add(earL, earR);

      headMesh = headGroup;
      buffalo.add(headGroup);

      // Sturdy Legs
      const legGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.95, 12);
      const hoofGeo = new THREE.CylinderGeometry(0.15, 0.16, 0.18, 12);

      const makeLeg = (x: number, z: number) => {
        const leg = new THREE.Group();
        const main = new THREE.Mesh(legGeo, darkMat);
        main.position.y = -0.45;
        main.castShadow = true;
        const hoof = new THREE.Mesh(hoofGeo, slateMat);
        hoof.position.y = -0.85;
        leg.add(main, hoof);
        leg.position.set(x, -0.3, z);
        return leg;
      };

      buffalo.add(makeLeg(0.65, 0.45));
      buffalo.add(makeLeg(0.65, -0.45));
      buffalo.add(makeLeg(-0.65, 0.45));
      buffalo.add(makeLeg(-0.65, -0.45));

      // Tail
      const tail = new THREE.Group();
      const tailRod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75), darkMat);
      tailRod.position.y = -0.35;
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 8), slateMat);
      tuft.position.y = -0.8;
      tail.add(tailRod, tuft);
      tail.position.set(-1.05, 0.4, 0);
      tail.rotation.z = 0.25;
      tailMesh = tail;
      buffalo.add(tail);

      buffalo.position.y = 0.2;
      return buffalo;
    };

    // Instantiate selected specimen
    if (foodType === 'Milk') {
      animalRoot.add(buildCow());
    } else if (foodType === 'Honey') {
      animalRoot.add(buildBee());
    } else {
      animalRoot.add(buildBuffalo());
    }

    // ── 6. Touch & Mouse Interaction Controls ─────────────────────────
    let isDragging = false;
    let prevX = 0;
    let targetRotationY = 0.4;
    let targetRotationX = 0.05;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      setInteractiveNotice(false);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevX;
        targetRotationY += deltaX * 0.012;
        prevX = e.clientX;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // ── 7. Animation Loop ─────────────────────────────────────────────
    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth dampening rotation
      if (!isDragging) {
        targetRotationY += 0.006; // continuous gentle rotation
      }
      animalRoot.rotation.y += (targetRotationY - animalRoot.rotation.y) * 0.1;
      animalRoot.rotation.x += (targetRotationX - animalRoot.rotation.x) * 0.1;

      // Pedestal rings spin
      ring1.rotation.z = t * 0.6;
      ring2.rotation.z = -t * 0.4;

      // Scanning laser effect
      if (isScanning || specimenScanned) {
        scanLaser.visible = true;
        scanLaser.position.y = Math.sin(t * 4) * 1.2 + 0.2;
      } else {
        scanLaser.visible = false;
      }

      // Animal specific micro-animations
      if (foodType === 'Milk' || foodType === 'Paneer') {
        // Breathing
        const breathe = Math.sin(t * 2) * 0.015;
        animalRoot.scale.set(1 + breathe, 1 + breathe, 1);

        // Head bobbing & looking around
        if (headMesh) {
          headMesh.rotation.y = Math.sin(t * 1.5) * 0.12;
          headMesh.rotation.x = Math.sin(t * 2.2) * 0.08;
        }
        // Tail wagging
        if (tailMesh) {
          tailMesh.rotation.z = 0.3 + Math.sin(t * 3.5) * 0.2;
        }
      } else if (foodType === 'Honey') {
        // Bee hovering up and down
        animalRoot.position.y = 0.3 + Math.sin(t * 3) * 0.18;
        animalRoot.rotation.z = Math.sin(t * 2) * 0.08;

        // Ultra-rapid wing flapping (realistic bee wing flutter)
        if (wingL && wingR) {
          const flutter = Math.sin(t * 45) * 0.45;
          wingL.rotation.y = flutter;
          wingR.rotation.y = -flutter;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // ── 8. Resize Handler ─────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 340;
      const h = container.clientHeight || 260;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [foodType, isScanning, specimenScanned]);

  const SPECIMEN_METRICS = {
    Milk: {
      name: 'Dairy Cattle Specimen',
      scientific: 'Bos taurus (Holstein-Friesian)',
      biomarker: 'Casein protein & Lactose refractive index',
      sourceInfo: 'Primary matrix source for Raw & Pasteurized Milk adulteration check',
      color: '#38bdf8',
    },
    Honey: {
      name: 'Honeybee Colony Specimen',
      scientific: 'Apis mellifera (European Honeybee)',
      biomarker: 'Diastase activity & C4 sugarcane nectar markers',
      sourceInfo: 'Natural floral nectar vector tested for high-fructose syrup contamination',
      color: '#f59e0b',
    },
    Paneer: {
      name: 'Dairy Buffalo Specimen',
      scientific: 'Bubalus bubalis (Murrah Buffalo)',
      biomarker: 'Curd fat globules & starch adulteration density',
      sourceInfo: 'High-fat coagulation dairy source tested for synthetic milk & detergents',
      color: '#10b981',
    },
  }[foodType];

  return (
    <div style={{
      position: 'relative',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%)',
      borderRadius: '16px',
      border: `1px solid ${SPECIMEN_METRICS.color}40`,
      boxShadow: `0 12px 30px rgba(0, 0, 0, 0.7), 0 0 25px ${SPECIMEN_METRICS.color}20`,
      overflow: 'hidden',
      marginBottom: '16px',
    }}>
      {/* Top Banner Tag */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: SPECIMEN_METRICS.color,
            boxShadow: `0 0 10px ${SPECIMEN_METRICS.color}`,
          }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
              3D Holographic Source Specimen
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
              {SPECIMEN_METRICS.scientific}
            </div>
          </div>
        </div>

        {/* Scan Specimen Trigger Button */}
        <button
          type="button"
          onClick={() => setSpecimenScanned(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: '6px',
            background: specimenScanned ? `${SPECIMEN_METRICS.color}25` : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${specimenScanned ? SPECIMEN_METRICS.color : 'rgba(255, 255, 255, 0.15)'}`,
            color: specimenScanned ? SPECIMEN_METRICS.color : '#cbd5e1',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title="Toggle Laser Scan Effect"
        >
          <Scan size={12} />
          <span>{specimenScanned ? 'Scanning' : 'Scan'}</span>
        </button>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '240px',
          cursor: 'grab',
          touchAction: 'none',
          position: 'relative',
        }}
      />

      {/* Interactive Helper Overlay */}
      {interactiveNotice && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '10px',
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'none',
          animation: 'pulse 2s infinite',
        }}>
          <Rotate3D size={12} color="#38bdf8" />
          <span>Drag with finger to rotate 3D animal in 360°</span>
        </div>
      )}

      {/* Bottom Specimen Biomarker Bar */}
      <div style={{
        padding: '8px 14px',
        background: 'rgba(15, 23, 42, 0.7)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        fontSize: '11px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <Sparkles size={12} color={SPECIMEN_METRICS.color} />
          <span style={{ color: '#cbd5e1', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            Biomarker Target: <strong>{SPECIMEN_METRICS.biomarker}</strong>
          </span>
        </div>
        <span style={{
          fontSize: '9px',
          padding: '2px 6px',
          borderRadius: '4px',
          background: `${SPECIMEN_METRICS.color}20`,
          color: SPECIMEN_METRICS.color,
          fontWeight: 700,
          fontFamily: 'monospace',
          flexShrink: 0,
        }}>
          3D LIVE
        </span>
      </div>
    </div>
  );
}
