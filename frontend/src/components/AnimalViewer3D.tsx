import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rotate3D, Sparkles, Scan, Info } from 'lucide-react';

interface AnimalViewer3DProps {
  foodType: 'Milk' | 'Honey' | 'Paneer';
  isScanning?: boolean;
  compact?: boolean;
}

export function AnimalViewer3D({ foodType, isScanning = false, compact = false }: AnimalViewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [interactiveNotice, setInteractiveNotice] = useState(true);
  const [specimenScanned, setSpecimenScanned] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setInteractiveNotice(false), 3500);
    return () => clearTimeout(timer);
  }, [foodType]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── 1. Scene, Dynamic Perspective Camera & Renderer ──────────────
    const width = container.clientWidth || 340;
    const height = compact ? 180 : (container.clientHeight || 230);

    const scene = new THREE.Scene();
    
    // Dynamic 3/4 isometric perspective that makes 3D animals look heroic & full
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    
    if (foodType === 'Honey') {
      camera.position.set(1.9, 1.4, 3.4);
    } else {
      camera.position.set(2.5, 1.5, 3.8);
    }
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── 2. Cinematic Cyber-Bio Lighting ──────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    // Key Light (Cyan / Sky)
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.6);
    keyLight.position.set(5, 7, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill Light (Warm Amber / Sunlight)
    const fillLight = new THREE.DirectionalLight(0xfef08a, 1.5);
    fillLight.position.set(-4, 3, 4);
    scene.add(fillLight);

    // Rim / Backlight (Neon Violet / Blue for high-tech contour)
    const rimLight = new THREE.DirectionalLight(0xc084fc, 2.0);
    rimLight.position.set(-3, 5, -5);
    scene.add(rimLight);

    // Bottom Bioluminescent Glow
    const specimenColor = foodType === 'Milk' ? 0x38bdf8 : foodType === 'Honey' ? 0xf59e0b : 0x10b981;
    const underGlow = new THREE.PointLight(specimenColor, 2.2, 7);
    underGlow.position.set(0, -0.6, 0);
    scene.add(underGlow);

    // ── 3. High-Tech Holographic Scanner Pedestal ────────────────────
    const pedestalGroup = new THREE.Group();

    // Metallic beveled platform
    const platformGeo = new THREE.CylinderGeometry(1.9, 2.1, 0.18, 36);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.25,
      metalness: 0.85,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.9;
    platform.receiveShadow = true;
    pedestalGroup.add(platform);

    // Glowing Hologram Inner Ring
    const innerRingGeo = new THREE.RingGeometry(1.3, 1.45, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: specimenColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = -0.8;
    pedestalGroup.add(innerRing);

    // Outer Circuit Dash Ring
    const outerRingGeo = new THREE.RingGeometry(1.65, 1.72, 48);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = -0.8;
    pedestalGroup.add(outerRing);

    // Hexagonal Grid Projection
    const gridHelper = new THREE.PolarGridHelper(1.8, 6, 3, 32, specimenColor, 0x1e293b);
    gridHelper.position.y = -0.79;
    pedestalGroup.add(gridHelper);

    scene.add(pedestalGroup);

    // ── 4. Laser Scan Vertical Sweep Plane ───────────────────────────
    const laserGroup = new THREE.Group();
    const laserGeo = new THREE.PlaneGeometry(3.2, 0.08);
    const laserMat = new THREE.MeshBasicMaterial({
      color: specimenColor,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.rotation.x = Math.PI / 2;
    laserGroup.add(laserBeam);
    laserGroup.position.y = -0.7;
    scene.add(laserGroup);

    // ── 5. Detailed Procedural 3D Animals ────────────────────────────
    const animalRoot = new THREE.Group();
    scene.add(animalRoot);

    let headGroup: THREE.Object3D | null = null;
    let tailGroup: THREE.Object3D | null = null;
    let wingL: THREE.Group | null = null;
    let wingR: THREE.Group | null = null;
    let earL: THREE.Object3D | null = null;
    let earR: THREE.Object3D | null = null;
    let cowBell: THREE.Object3D | null = null;

    // ═════════════════════════════════════════════════════════════════
    // 🐄 HIGH-FIDELITY 3D DAIRY COW (Milk)
    // ═════════════════════════════════════════════════════════════════
    const buildCow = () => {
      const cow = new THREE.Group();

      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
      const spotMat  = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
      const pinkMat  = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
      const hornMat  = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.5 });
      const hoofMat  = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
      const goldMat  = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 });
      const collarMat= new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });

      // Torso / Main Barrel
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.05, 0.95), whiteMat);
      body.castShadow = true;
      body.position.set(0, 0.2, 0);
      cow.add(body);

      // Spots (Black patches on dairy cow)
      const spot1 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.98), spotMat);
      spot1.position.set(0.2, 0.35, 0);
      cow.add(spot1);

      const spot2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.98), spotMat);
      spot2.position.set(-0.45, 0.1, 0);
      cow.add(spot2);

      const spot3 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.98), spotMat);
      spot3.position.set(0.5, 0.1, 0.02);
      cow.add(spot3);

      // Udder with 4 distinct teats underneath
      const udderGroup = new THREE.Group();
      const udderBase = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.25, 0.4), pinkMat);
      udderGroup.add(udderBase);

      const teatGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.12, 8);
      for (const [tx, tz] of [[0.12, 0.1], [0.12, -0.1], [-0.12, 0.1], [-0.12, -0.1]]) {
        const teat = new THREE.Mesh(teatGeo, pinkMat);
        teat.position.set(tx, -0.15, tz);
        udderGroup.add(teat);
      }
      udderGroup.position.set(-0.25, -0.32, 0);
      cow.add(udderGroup);

      // Neck with Collar and Gold Cowbell
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.6), whiteMat);
      neck.rotation.z = -0.4;
      neck.position.set(0.8, 0.55, 0);
      cow.add(neck);

      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.62), collarMat);
      collar.rotation.z = -0.4;
      collar.position.set(0.78, 0.52, 0);
      cow.add(collar);

      // Hanging Golden Bell
      const bell = new THREE.Group();
      const bellMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.14, 8), goldMat);
      bell.add(bellMesh);
      bell.position.set(0.8, 0.25, 0);
      cowBell = bell;
      cow.add(bell);

      // Head Group (animates chewing & looking)
      const hGroup = new THREE.Group();
      hGroup.position.set(1.15, 0.72, 0);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.62, 0.58), whiteMat);
      head.castShadow = true;
      hGroup.add(head);

      // Black patch over left eye
      const eyePatch = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.6), spotMat);
      eyePatch.position.set(0.1, 0.1, 0.01);
      hGroup.add(eyePatch);

      // Snout / Muzzle
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.5), pinkMat);
      snout.position.set(0.4, -0.15, 0);
      hGroup.add(snout);

      // Nostrils
      const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
      const n1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.08), nostrilMat);
      n1.position.set(0.58, -0.12, 0.12);
      const n2 = n1.clone();
      n2.position.set(0.58, -0.12, -0.12);
      hGroup.add(n1, n2);

      // Expressive Eyes with white specular catchlight
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
      const eyeLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.08), eyeMat);
      eyeLMesh.position.set(0.22, 0.12, 0.3);
      const eyeRMesh = eyeLMesh.clone();
      eyeRMesh.position.set(0.22, 0.12, -0.3);
      hGroup.add(eyeLMesh, eyeRMesh);

      // Horns (Amber curved tips)
      const hornGeo = new THREE.ConeGeometry(0.06, 0.28, 8);
      const hL = new THREE.Mesh(hornGeo, hornMat);
      hL.rotation.z = -0.3;
      hL.rotation.x = 0.3;
      hL.position.set(-0.05, 0.42, 0.22);
      const hR = hL.clone();
      hR.rotation.x = -0.3;
      hR.position.set(-0.05, 0.42, -0.22);
      hGroup.add(hL, hR);

      // Floppy Ears (with pink interior)
      const earGeo = new THREE.BoxGeometry(0.08, 0.15, 0.28);
      const eL = new THREE.Mesh(earGeo, whiteMat);
      eL.position.set(-0.12, 0.22, 0.42);
      eL.rotation.x = 0.35;
      const eR = eL.clone();
      eR.position.set(-0.12, 0.22, -0.42);
      eR.rotation.x = -0.35;
      hGroup.add(eL, eR);
      earL = eL;
      earR = eR;

      headGroup = hGroup;
      cow.add(hGroup);

      // 4 Sturdy Legs reaching down to pedestal
      const legGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.85, 12);
      const hoofGeo = new THREE.CylinderGeometry(0.11, 0.12, 0.16, 12);

      const makeLeg = (x: number, z: number, hasSpot: boolean) => {
        const leg = new THREE.Group();
        const main = new THREE.Mesh(legGeo, hasSpot ? spotMat : whiteMat);
        main.position.y = -0.42;
        main.castShadow = true;
        const hoof = new THREE.Mesh(hoofGeo, hoofMat);
        hoof.position.y = -0.78;
        leg.add(main, hoof);
        leg.position.set(x, -0.05, z);
        return leg;
      };

      cow.add(makeLeg(0.55, 0.32, false));
      cow.add(makeLeg(0.55, -0.32, true));
      cow.add(makeLeg(-0.55, 0.32, true));
      cow.add(makeLeg(-0.55, -0.32, false));

      // Animated Tail with Bushy Tuft
      const tGroup = new THREE.Group();
      const tRod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65), whiteMat);
      tRod.position.y = -0.32;
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), spotMat);
      tuft.position.y = -0.68;
      tGroup.add(tRod, tuft);
      tGroup.position.set(-0.85, 0.55, 0);
      tGroup.rotation.z = 0.25;
      tailGroup = tGroup;
      cow.add(tGroup);

      cow.position.y = 0.1;
      return cow;
    };

    // ═════════════════════════════════════════════════════════════════
    // 🐝 GLOWING 3D HONEYBEE (Honey)
    // ═════════════════════════════════════════════════════════════════
    const buildBee = () => {
      const bee = new THREE.Group();

      const goldYellow = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.3 });
      const velvetBlack = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5 });
      const wingGlass  = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
        roughness: 0.1,
        metalness: 0.4,
        side: THREE.DoubleSide,
      });

      // Thorax (Fuzzy golden chest)
      const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), goldYellow);
      thorax.scale.set(1.15, 0.95, 0.95);
      thorax.castShadow = true;
      bee.add(thorax);

      // Abdomen (Distinct curved bumblebee stripes)
      const abdomen = new THREE.Group();
      abdomen.position.set(-0.75, -0.05, 0);

      for (let i = 0; i < 6; i++) {
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42 - i * 0.05, 0.46 - i * 0.04, 0.2, 16),
          i % 2 === 0 ? velvetBlack : goldYellow
        );
        seg.rotation.z = Math.PI / 2;
        seg.position.x = -i * 0.18;
        seg.castShadow = true;
        abdomen.add(seg);
      }
      // Sharp Honey Stinger
      const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 8), velvetBlack);
      stinger.rotation.z = Math.PI / 2;
      stinger.position.x = -1.15;
      abdomen.add(stinger);
      bee.add(abdomen);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), velvetBlack);
      head.position.set(0.68, 0.05, 0);
      head.castShadow = true;

      // Cyan Compound Eyes (Glowing bio-optics)
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15, metalness: 0.9 });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), eyeMat);
      eyeL.position.set(0.18, 0.1, 0.22);
      const eyeR = eyeL.clone();
      eyeR.position.set(0.18, 0.1, -0.22);
      head.add(eyeL, eyeR);

      // Antennae
      const antMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const antL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.38), antMat);
      antL.position.set(0.2, 0.32, 0.12);
      antL.rotation.x = 0.45;
      antL.rotation.z = -0.35;
      const antR = antL.clone();
      antR.position.set(0.2, 0.32, -0.12);
      antR.rotation.x = -0.45;
      head.add(antL, antR);

      headGroup = head;
      bee.add(head);

      // Shimmering Rapid-Flutter Wings
      const makeWingPair = (side: 1 | -1) => {
        const wG = new THREE.Group();
        // Forewing
        const fWing = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.55), wingGlass);
        fWing.position.set(-0.35, 0.35, 0.55 * side);
        fWing.rotation.x = side * 0.25;
        // Hindwing
        const hWing = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.35), wingGlass);
        hWing.position.set(-0.55, 0.22, 0.45 * side);
        hWing.rotation.x = side * 0.25;
        wG.add(fWing, hWing);
        wG.position.set(0, 0.45, 0);
        return wG;
      };

      wingL = makeWingPair(1);
      wingR = makeWingPair(-1);
      bee.add(wingL, wingR);

      // Legs with Pollen Baskets (Bright yellow pollen clumps)
      const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.42);
      const pollenGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const pollenMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3 });

      for (const s of [-1, 1]) {
        for (const x of [-0.2, 0.1, 0.38]) {
          const leg = new THREE.Mesh(legGeo, velvetBlack);
          leg.position.set(x, -0.38, s * 0.26);
          leg.rotation.z = x * 0.4;
          leg.rotation.x = s * 0.45;
          if (x === -0.2) {
            // Hind leg pollen basket
            const pollen = new THREE.Mesh(pollenGeo, pollenMat);
            pollen.position.set(0, -0.15, 0.04 * s);
            leg.add(pollen);
          }
          bee.add(leg);
        }
      }

      // Golden Pollen Dust Particle Cloud
      const pGeo = new THREE.BufferGeometry();
      const pCount = 45;
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3]     = (Math.random() - 0.5) * 2.2;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.08, transparent: true, opacity: 0.75 });
      const particles = new THREE.Points(pGeo, pMat);
      bee.add(particles);

      bee.position.y = 0.4;
      return bee;
    };

    // ═════════════════════════════════════════════════════════════════
    // 🐃 MAJESTIC 3D WATER BUFFALO (Paneer)
    // ═════════════════════════════════════════════════════════════════
    const buildBuffalo = () => {
      const buffalo = new THREE.Group();

      const charcoalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.2 });
      const darkSlateMat= new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const hornMetalMat= new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.2, metalness: 0.7 });
      const muzzleMat   = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65 });
      const ringMat     = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, metalness: 0.8 });

      // Robust muscular torso & shoulders
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.15, 1.1), charcoalMat);
      body.castShadow = true;
      body.position.set(0, 0.25, 0);
      buffalo.add(body);

      // Powerful shoulder hump
      const hump = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 1.0), charcoalMat);
      hump.position.set(0.4, 0.72, 0);
      buffalo.add(hump);

      // Head Group
      const hGroup = new THREE.Group();
      hGroup.position.set(1.15, 0.55, 0);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.68, 0.62), charcoalMat);
      head.castShadow = true;
      hGroup.add(head);

      const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 0.54), muzzleMat);
      muzzle.position.set(0.45, -0.18, 0);
      hGroup.add(muzzle);

      // Silver/Teal Nose Ring
      const noseRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 16), ringMat);
      noseRing.position.set(0.66, -0.22, 0);
      hGroup.add(noseRing);

      // Wide Sweeping Curved Horns (Murrah Dairy Buffalo)
      const makeHorn = (side: 1 | -1) => {
        const hG = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.55, 8), hornMetalMat);
        base.rotation.z = -0.7;
        base.rotation.x = side * 1.15;
        base.position.set(-0.08, 0.35, side * 0.38);

        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.5, 8), hornMetalMat);
        tip.rotation.z = 0.45;
        tip.rotation.x = side * -0.55;
        tip.position.set(-0.25, 0.68, side * 0.62);

        hG.add(base, tip);
        return hG;
      };

      hGroup.add(makeHorn(1));
      hGroup.add(makeHorn(-1));

      // Ears
      const earGeo = new THREE.BoxGeometry(0.1, 0.14, 0.32);
      const eL = new THREE.Mesh(earGeo, darkSlateMat);
      eL.position.set(-0.1, 0.14, 0.4);
      eL.rotation.x = 0.45;
      const eR = eL.clone();
      eR.position.set(-0.1, 0.14, -0.4);
      eR.rotation.x = -0.45;
      hGroup.add(eL, eR);

      headGroup = hGroup;
      buffalo.add(hGroup);

      // Sturdy 4 Legs
      const legGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.88, 12);
      const hoofGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.16, 12);

      const makeLeg = (x: number, z: number) => {
        const leg = new THREE.Group();
        const main = new THREE.Mesh(legGeo, charcoalMat);
        main.position.y = -0.42;
        main.castShadow = true;
        const hoof = new THREE.Mesh(hoofGeo, darkSlateMat);
        hoof.position.y = -0.78;
        leg.add(main, hoof);
        leg.position.set(x, 0, z);
        return leg;
      };

      buffalo.add(makeLeg(0.6, 0.38));
      buffalo.add(makeLeg(0.6, -0.38));
      buffalo.add(makeLeg(-0.6, 0.38));
      buffalo.add(makeLeg(-0.6, -0.38));

      // Tail
      const tG = new THREE.Group();
      const tRod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7), charcoalMat);
      tRod.position.y = -0.32;
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.25, 8), darkSlateMat);
      tuft.position.y = -0.72;
      tG.add(tRod, tuft);
      tG.position.set(-0.95, 0.5, 0);
      tG.rotation.z = 0.22;
      tailGroup = tG;
      buffalo.add(tG);

      buffalo.position.y = 0.12;
      return buffalo;
    };

    // Instantiate active animal
    if (foodType === 'Milk') {
      animalRoot.add(buildCow());
    } else if (foodType === 'Honey') {
      animalRoot.add(buildBee());
    } else {
      animalRoot.add(buildBuffalo());
    }

    // ── 6. Intuitive Touch & Mouse Orbit Controls ────────────────────
    let isDragging = false;
    let prevX = 0;
    let targetRotationY = 0.45;
    let targetRotationX = 0.06;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      setInteractiveNotice(false);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevX;
        targetRotationY += deltaX * 0.015;
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
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth dampening rotation
      if (!isDragging) {
        targetRotationY += 0.007; // auto continuous turntable spin
      }
      animalRoot.rotation.y += (targetRotationY - animalRoot.rotation.y) * 0.1;
      animalRoot.rotation.x += (targetRotationX - animalRoot.rotation.x) * 0.1;

      // Platform hologram rings spin
      innerRing.rotation.z = t * 0.7;
      outerRing.rotation.z = -t * 0.5;

      // Laser scan beam oscillation
      if (isScanning || specimenScanned) {
        laserGroup.visible = true;
        laserGroup.position.y = Math.sin(t * 5) * 1.1 + 0.15;
      } else {
        laserGroup.visible = false;
      }

      // Animal micro-animations
      if (foodType === 'Milk' || foodType === 'Paneer') {
        // Breathing
        const breathe = Math.sin(t * 2.2) * 0.018;
        animalRoot.scale.set(1 + breathe, 1 + breathe, 1);

        // Head looking around & chewing
        if (headGroup) {
          headGroup.rotation.y = Math.sin(t * 1.4) * 0.12;
          headGroup.rotation.x = Math.sin(t * 2.5) * 0.06;
        }
        // Tail swishing
        if (tailGroup) {
          tailGroup.rotation.z = 0.25 + Math.sin(t * 3.8) * 0.22;
        }
        // Cow bell sway
        if (cowBell) {
          cowBell.rotation.z = Math.sin(t * 2.8) * 0.15;
        }
        // Ear twitch
        if (earL && earR) {
          earL.rotation.z = Math.sin(t * 4.2) * 0.08;
          earR.rotation.z = -Math.sin(t * 4.2) * 0.08;
        }
      } else if (foodType === 'Honey') {
        // Floating hover physics
        animalRoot.position.y = 0.35 + Math.sin(t * 3.2) * 0.14;
        animalRoot.rotation.z = Math.sin(t * 2.4) * 0.09;

        // Rapid wing fluttering
        if (wingL && wingR) {
          const flutter = Math.sin(t * 50) * 0.48;
          wingL.rotation.y = flutter;
          wingR.rotation.y = -flutter;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // ── 8. Responsive Resize ──────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 340;
      const h = container.clientHeight || 230;
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
      biomarker: 'Casein Protein · Lactose Refractive Index',
      sourceInfo: 'Primary biological matrix tested for water, detergent, urea, and starch adulteration.',
      color: '#38bdf8',
      icon: '🐄',
    },
    Honey: {
      name: 'Honeybee Colony Specimen',
      scientific: 'Apis mellifera (European Honeybee)',
      biomarker: 'Diastase Activity · C4 Sugarcane Nectar',
      sourceInfo: 'Natural floral nectar vector analyzed for high-fructose corn syrup & invert sugars.',
      color: '#f59e0b',
      icon: '🐝',
    },
    Paneer: {
      name: 'Dairy Buffalo Specimen',
      scientific: 'Bubalus bubalis (Murrah Buffalo)',
      biomarker: 'Curd Fat Globule Density · Starch Matrix',
      sourceInfo: 'High-fat dairy coagulation matrix tested for synthetic milk, detergent & starch fillers.',
      color: '#10b981',
      icon: '🐃',
    },
  }[foodType];

  return (
    <div style={{
      position: 'relative',
      background: 'radial-gradient(ellipse at 50% 20%, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 0.99) 100%)',
      borderRadius: '18px',
      border: `1.5px solid ${SPECIMEN_METRICS.color}45`,
      boxShadow: `0 14px 35px rgba(0, 0, 0, 0.8), 0 0 30px ${SPECIMEN_METRICS.color}25`,
      overflow: 'hidden',
      marginBottom: '16px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Top Banner Tag */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{SPECIMEN_METRICS.icon}</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>3D {SPECIMEN_METRICS.name}</span>
              <span style={{
                fontSize: '9px',
                padding: '1px 6px',
                borderRadius: '4px',
                background: `${SPECIMEN_METRICS.color}25`,
                color: SPECIMEN_METRICS.color,
                fontWeight: 700,
                fontFamily: 'monospace',
              }}>
                LIVE 3D
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
              {SPECIMEN_METRICS.scientific}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setShowInfo(prev => !prev)}
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              background: showInfo ? `${SPECIMEN_METRICS.color}30` : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${showInfo ? SPECIMEN_METRICS.color : 'rgba(255, 255, 255, 0.15)'}`,
              color: showInfo ? SPECIMEN_METRICS.color : '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
            }}
            title="Bio-Matrix Info"
          >
            <Info size={13} />
            <span>Info</span>
          </button>

          <button
            type="button"
            onClick={() => setSpecimenScanned(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              background: specimenScanned ? `${SPECIMEN_METRICS.color}35` : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${specimenScanned ? SPECIMEN_METRICS.color : 'rgba(255, 255, 255, 0.15)'}`,
              color: specimenScanned ? SPECIMEN_METRICS.color : '#cbd5e1',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Toggle Laser Scan Effect"
          >
            <Scan size={13} />
            <span>{specimenScanned ? 'Laser On' : 'Laser Scan'}</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: compact ? '175px' : '220px',
          cursor: 'grab',
          touchAction: 'none',
          position: 'relative',
        }}
      />

      {/* Info drawer when toggled */}
      {showInfo && (
        <div style={{
          position: 'absolute',
          top: '46px',
          left: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${SPECIMEN_METRICS.color}60`,
          borderRadius: '12px',
          padding: '12px 14px',
          fontSize: '12px',
          color: '#e2e8f0',
          lineHeight: 1.45,
          zIndex: 10,
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.8)',
        }}>
          <div style={{ fontWeight: 700, color: SPECIMEN_METRICS.color, marginBottom: '4px' }}>
            {SPECIMEN_METRICS.name} Bio-Characteristics
          </div>
          <div>{SPECIMEN_METRICS.sourceInfo}</div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8' }}>
            Tested via AS7265x 18-channel tri-spectral sensor + PCA/SVM machine learning classifier.
          </div>
        </div>
      )}

      {/* Interactive Drag Hint Overlay */}
      {interactiveNotice && (
        <div style={{
          position: 'absolute',
          bottom: '46px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          padding: '5px 14px',
          fontSize: '10px',
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'none',
        }}>
          <Rotate3D size={13} color={SPECIMEN_METRICS.color} />
          <span>Swipe with finger to rotate 3D animal in 360°</span>
        </div>
      )}

      {/* Bottom Biomarker Bar */}
      <div style={{
        padding: '8px 14px',
        background: 'rgba(15, 23, 42, 0.85)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        fontSize: '11px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}>
          <Sparkles size={12} color={SPECIMEN_METRICS.color} style={{ flexShrink: 0 }} />
          <span style={{ color: '#cbd5e1', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            Biomarker: <strong>{SPECIMEN_METRICS.biomarker}</strong>
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <Rotate3D size={11} /> 360°
        </div>
      </div>
    </div>
  );
}
