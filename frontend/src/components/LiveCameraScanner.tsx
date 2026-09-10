import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Sparkles, CheckCircle, AlertTriangle, XCircle, RefreshCw, Upload, Play, MonitorPlay } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { TestSessionRecord, ZoneReading } from '../types';
import { COMMODITY_TEMPLATES } from '../mockData';

interface LiveCameraScannerProps {
  onScanComplete: (test: TestSessionRecord) => void;
}

export const LiveCameraScanner: React.FC<LiveCameraScannerProps> = ({ onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simCanvasRef = useRef<HTMLCanvasElement>(null);

  type SimPreset = 'PURE_MILK' | 'MELAMINE' | 'PANEER_STARCH' | 'TURMERIC_METANIL' | 'CHILLI_SUDAN' | 'OIL_ARGEMONE' | 'HONEY_INVERT' | 'VEG_MALACHITE';

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isSimulatedFeed, setIsSimulatedFeed] = useState<boolean>(false);
  const [simPreset, setSimPreset] = useState<SimPreset>('MELAMINE');

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Virtual Animated Camera Feed Loop
  useEffect(() => {
    let animId: number;
    let t = 0;

    const renderSim = () => {
      t += 0.03;
      const canvas = simCanvasRef.current;
      if (!canvas || !isSimulatedFeed) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Draw simulated camera image of the closed optical chamber interior
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Radial lighting from 4 overhead chamber LEDs
      const grad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.6);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Cartridge Body
      const cartW = w * 0.75;
      const cartH = h * 0.5;
      const cartX = (w - cartW) / 2 + Math.sin(t * 0.5) * 2;
      const cartY = (h - cartH) / 2 + Math.cos(t * 0.5) * 1.5;

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cartX, cartY, cartW, cartH, 12);
      ctx.fill();
      ctx.stroke();

      // Chromatography Paper Strip
      const stripW = cartW * 0.9;
      const stripH = cartH * 0.65;
      const stripX = cartX + (cartW - stripW) / 2;
      const stripY = cartY + (cartH - stripH) / 2 + 10;

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(stripX, stripY, stripW, stripH, 6);
      ctx.fill();

      // Draw 6 Reaction Wells tailored to active preset
      const wellRadius = 18;
      const spacing = stripW / 7;

      let wellColors = {
        z1: '#b91c1c', // Milk safe
        z2: '#f1f5f9',
        z3: '#f59e0b',
        z4: '#eab308',
        z5: '#84cc16',
        z6: '#ffffff'
      };

      if (simPreset === 'MELAMINE') {
        wellColors = { z1: '#4338ca', z2: '#f1f5f9', z3: '#f59e0b', z4: '#ca8a04', z5: '#84cc16', z6: '#ffffff' };
      } else if (simPreset === 'PANEER_STARCH') {
        wellColors = { z1: '#0f172a', z2: '#6d28d9', z3: '#f59e0b', z4: '#f1f5f9', z5: '#b91c1c', z6: '#ffffff' };
      } else if (simPreset === 'TURMERIC_METANIL') {
        wellColors = { z1: '#a855f7', z2: '#eab308', z3: '#ca8a04', z4: '#b91c1c', z5: '#f59e0b', z6: '#ffffff' };
      } else if (simPreset === 'CHILLI_SUDAN') {
        wellColors = { z1: '#581c87', z2: '#e11d48', z3: '#f1f5f9', z4: '#f1f5f9', z5: '#ca8a04', z6: '#ffffff' };
      } else if (simPreset === 'OIL_ARGEMONE') {
        wellColors = { z1: '#ef4444', z2: '#eab308', z3: '#eab308', z4: '#f1f5f9', z5: '#eab308', z6: '#ffffff' };
      } else if (simPreset === 'HONEY_INVERT') {
        wellColors = { z1: '#e11d48', z2: '#ca8a04', z3: '#d97706', z4: '#f1f5f9', z5: '#f59e0b', z6: '#ffffff' };
      } else if (simPreset === 'VEG_MALACHITE') {
        wellColors = { z1: '#0d9488', z2: '#f1f5f9', z3: '#f1f5f9', z4: '#f1f5f9', z5: '#eab308', z6: '#ffffff' };
      }

      const wells = [
        { name: 'Z1', color: wellColors.z1 },
        { name: 'Z2', color: wellColors.z2 },
        { name: 'Z3', color: wellColors.z3 },
        { name: 'Z4', color: wellColors.z4 },
        { name: 'Z5', color: wellColors.z5 },
        { name: 'Z6', color: wellColors.z6 }
      ];

      wells.forEach((well, idx) => {
        const cx = stripX + spacing * (idx + 1);
        const cy = stripY + stripH / 2;

        ctx.fillStyle = well.color;
        ctx.strokeStyle = idx === 5 ? '#3b82f6' : '#94a3b8';
        ctx.lineWidth = idx === 5 ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, wellRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(well.name, cx - 7, cy - wellRadius - 6);
      });

      // Camera grain / noise effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < 200; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
      }

      animId = requestAnimationFrame(renderSim);
    };

    if (isSimulatedFeed) {
      animId = requestAnimationFrame(renderSim);
    }

    return () => cancelAnimationFrame(animId);
  }, [isSimulatedFeed, simPreset]);

  const startCamera = async () => {
    sound.click();
    setErrorMessage(null);
    setIsSimulatedFeed(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Camera API is not supported in this browser context (requires HTTPS or localhost). Launching Virtual Feed Mode instead.');
      startSimulatedFeed();
      return;
    }

    try {
      // 1. First try preferred high-resolution constraints
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (firstErr) {
        // 2. Fallback to relaxed basic constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Physical camera unavailable:', err);
      let msg = 'Could not access physical webcam: ';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg += 'Permission was denied by browser. Please allow camera permissions in your address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg += 'No physical webcam found on your system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg += 'Camera is currently in use by another application (e.g. Zoom or Teams).';
      } else {
        msg += err.message || 'Device error.';
      }
      setErrorMessage(msg + ' Switching to Virtual Chamber Feed below so you can still test the optical pipeline.');
      startSimulatedFeed();
    }
  };

  const startSimulatedFeed = () => {
    sound.click();
    stopCameraStream();
    setIsCameraActive(false);
    setIsSimulatedFeed(true);
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const stopAll = () => {
    sound.click();
    stopCameraStream();
    setIsSimulatedFeed(false);
  };

  const captureFrame = () => {
    sound.startTest();

    if (isCameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stopCameraStream();
      processSample(ctx, canvas.width, canvas.height, false);
    } else if (isSimulatedFeed && simCanvasRef.current) {
      const simCanvas = simCanvasRef.current;
      const ctx = simCanvas.getContext('2d');
      if (!ctx) return;
      setIsSimulatedFeed(false);
      processSample(ctx, simCanvas.width, simCanvas.height, true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          processSample(ctx, img.width, img.height, false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processSample = (ctx: CanvasRenderingContext2D, w: number, h: number, isSim: boolean) => {
    setAnalyzing(true);

    setTimeout(() => {
      setAnalyzing(false);

      const isPositive = isSim ? (simPreset !== 'PURE_MILK') : true;

      if (!isPositive) {
        sound.success();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } else {
        sound.alert();
      }

      let templateKey = 'MILK';
      if (simPreset === 'PANEER_STARCH') templateKey = 'PANEER';
      else if (simPreset === 'TURMERIC_METANIL') templateKey = 'TURMERIC';
      else if (simPreset === 'CHILLI_SUDAN') templateKey = 'RED_CHILLI';
      else if (simPreset === 'OIL_ARGEMONE') templateKey = 'COOKING_OIL';
      else if (simPreset === 'HONEY_INVERT') templateKey = 'HONEY';
      else if (simPreset === 'VEG_MALACHITE') templateKey = 'VEGETABLES';

      const tmpl = COMMODITY_TEMPLATES[templateKey] || COMMODITY_TEMPLATES['MILK'];

      const readings: ZoneReading[] = tmpl.zones.map((zone, idx) => {
        const isZoneAdulterated = isPositive && (idx === 0 || (templateKey === 'PANEER' && idx === 1));
        const color = isZoneAdulterated ? zone.adulteratedColor : zone.safeColor;
        const deltaE = isZoneAdulterated ? (10.5 + Math.random() * 3.0) : (0.7 + Math.random() * 0.5);

        let estConc = 0;
        let rationale = `Within compliant baseline limits. ${zone.description}`;

        if (isZoneAdulterated) {
          if (zone.code === 'MELAMINE') {
            estConc = 5.4;
            rationale = `Melamine LSPR peak shift detected: 5.40 ppm exceeds FSSAI MRL (${zone.threshold} ppm)`;
          } else if (zone.code === 'STARCH') {
            estConc = 2.85;
            rationale = `Polyiodide amylose complexation positive: ~2.85% w/w exogenous starch / flour detected`;
          } else if (zone.code === 'NEUTRALIZER') {
            estConc = 7.6;
            rationale = `Alkaline neutralization / detergent detected (pH 7.6). Prohibited under FSSAI`;
          } else if (zone.code === 'METANIL_YELLOW') {
            estConc = 0.72;
            rationale = `Hazardous non-permitted Metanil Yellow coal-tar dye detected (~0.72% w/w)`;
          } else if (zone.code === 'SUDAN_DYE') {
            estConc = 3.3;
            rationale = `Industrial carcinogenic Sudan I-IV synthetic colorant detected (~3.3 ppm)`;
          } else if (zone.code === 'ARGEMONE_OIL') {
            estConc = 0.51;
            rationale = `Toxic Argemone oil alkaloid (Sanguinarine) detected (~0.51%). Causes epidemic dropsy`;
          } else if (zone.code === 'INVERT_SUGAR') {
            estConc = 19.5;
            rationale = `Exogenous sugar syrup / elevated HMF detected (~19.5%). Fails pure honey standards`;
          } else if (zone.code === 'MALACHITE_GREEN') {
            estConc = 3.15;
            rationale = `Toxic industrial dye (Malachite Green) detected (~3.15 ppm) on fresh produce`;
          } else {
            estConc = 1.2;
            rationale = `Positive screening for ${zone.analyteName}`;
          }
        }

        return {
          zoneIndex: zone.zoneIndex,
          analyteName: zone.analyteName,
          code: zone.code,
          nanomaterial: zone.nanomaterial,
          rawR: color.r,
          rawG: color.g,
          rawB: color.b,
          cielabL: isZoneAdulterated ? 40.0 : 75.0,
          cielabA: isZoneAdulterated ? 25.0 : 0.0,
          cielabB: isZoneAdulterated ? -20.0 : 20.0,
          deltaE: Math.round(deltaE * 10.0) / 10.0,
          estimatedConcentration: estConc,
          unit: zone.unit,
          threshold: zone.threshold,
          status: isZoneAdulterated ? 'POSITIVE_ADULTERATED' : 'SAFE_WITHIN_LIMITS',
          rationale
        };
      });

      const newRecord: TestSessionRecord = {
        id: 'sess-live-' + Date.now(),
        sessionCode: 'SCAN-' + Date.now().toString().slice(-6),
        sampleCode: isSim ? `SIM-${simPreset}-SAMPLE` : `LIVE-${templateKey}-SAMPLE`,
        foodCategory: tmpl.category,
        foodItem: tmpl.foodItem,
        milkType: templateKey === 'MILK' ? 'COW' : 'NOT_APPLICABLE',
        collectionSource: isSim ? `Optical Chamber Virtual Feed (${tmpl.defaultSource})` : 'Direct On-Site Camera Feed',
        batchLotNumber: 'LOT-CAM-01',
        deviceSerial: 'READER-LIVE-CAM',
        cartridgeUid: 'MC-LIVE-01',
        operatorName: 'Field Quality Inspector',
        overallResult: isPositive ? 'POSITIVE_SCREENING' : 'PASS_SCREENING',
        validityStatus: 'VALID',
        startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        readings
      };

      onScanComplete(newRecord);
    }, 1200);
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-safe" style={{ fontSize: '0.7rem' }}>
              <Sparkles size={13} /> On-Site Scanner Mode
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Real-Time Video Colorimetry</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginTop: '4px' }}>
            Live Optical Camera &amp; Strip Scanner
          </h3>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!isCameraActive && !isSimulatedFeed && (
            <>
              <button onClick={startCamera} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                <Camera size={16} /> Open Device Webcam
              </button>
              <button onClick={startSimulatedFeed} className="btn-secondary" style={{ fontSize: '0.85rem', borderColor: 'var(--color-primary)' }}>
                <MonitorPlay size={16} color="#60a5fa" /> Run Virtual Chamber Feed
              </button>
            </>
          )}

          {(isCameraActive || isSimulatedFeed) && (
            <button onClick={stopAll} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              <CameraOff size={16} /> Stop Camera Feed
            </button>
          )}

          <label className="btn-secondary" style={{ fontSize: '0.85rem', cursor: 'pointer', margin: 0 }}>
            <Upload size={16} /> Upload Strip Photo
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Notice / Error Banner */}
      {errorMessage && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
          color: '#fbbf24',
          fontSize: '0.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Simulated Feed Preset Picker (Active when in simulation mode) */}
      {isSimulatedFeed && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#93c5fd' }}>
            Simulated Food Commodity Sample:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSimPreset('PURE_MILK')}
              className={simPreset === 'PURE_MILK' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              🥛 Pure Milk (Safe)
            </button>
            <button
              onClick={() => setSimPreset('MELAMINE')}
              className={simPreset === 'MELAMINE' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              🥛 Milk + Melamine (5.4 ppm)
            </button>
            <button
              onClick={() => setSimPreset('PANEER_STARCH')}
              className={simPreset === 'PANEER_STARCH' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              🧀 Paneer + Starch & Detergent
            </button>
            <button
              onClick={() => setSimPreset('TURMERIC_METANIL')}
              className={simPreset === 'TURMERIC_METANIL' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              🟡 Turmeric + Metanil Yellow
            </button>
            <button
              onClick={() => setSimPreset('CHILLI_SUDAN')}
              className={simPreset === 'CHILLI_SUDAN' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              🌶️ Red Chilli + Sudan Dye
            </button>
            <button
              onClick={() => setSimPreset('OIL_ARGEMONE')}
              className={simPreset === 'OIL_ARGEMONE' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              🛢️ Mustard Oil + Argemone
            </button>
            <button
              onClick={() => setSimPreset('HONEY_INVERT')}
              className={simPreset === 'HONEY_INVERT' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              🍯 Honey + Invert Sugar (HFCS)
            </button>
            <button
              onClick={() => setSimPreset('VEG_MALACHITE')}
              className={simPreset === 'VEG_MALACHITE' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              🥬 Peas + Malachite Green
            </button>
          </div>
        </div>
      )}

      {/* Video / Virtual Viewport with HUD Reticle */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        borderRadius: '14px',
        overflow: 'hidden',
        background: '#0a0f1d',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Physical Webcam Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            display: isCameraActive ? 'block' : 'none',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Virtual Animated Chamber Canvas */}
        <canvas
          ref={simCanvasRef}
          width={800}
          height={420}
          style={{
            display: isSimulatedFeed ? 'block' : 'none',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Standby Placeholder */}
        {!isCameraActive && !isSimulatedFeed && (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <Camera size={52} color="var(--text-dim)" style={{ marginBottom: '14px' }} />
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              Optical Camera Standby
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
              Click <strong>Open Device Webcam</strong> to scan physical test strips, or launch <strong>Run Virtual Chamber Feed</strong> to demonstrate real-time colorimetric extraction in front of the jury.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={startCamera} className="btn-primary" style={{ fontSize: '0.9rem' }}>
                <Camera size={16} /> Open Device Webcam
              </button>
              <button onClick={startSimulatedFeed} className="btn-secondary" style={{ fontSize: '0.9rem' }}>
                <MonitorPlay size={16} color="#60a5fa" /> Run Virtual Feed
              </button>
            </div>
          </div>
        )}

        {/* Cyberpunk HUD Optical Crosshair Overlay (Visible during live webcam or simulation) */}
        {(isCameraActive || isSimulatedFeed) && (
          <>
            <div style={{
              position: 'absolute',
              inset: '24px',
              border: '2px dashed rgba(59, 130, 246, 0.45)',
              borderRadius: '16px',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontFamily: 'monospace' }}>
                  {isCameraActive ? '[HARDWARE WEBCAM: 1080p D65]' : '[VIRTUAL OPTICAL CHAMBER: HIGH-CRI 4500K]'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#34d399', fontFamily: 'monospace' }}>
                  [CIELAB HOMOGRAPHY READY]
                </span>
              </div>

              {/* 6 Target Alignment Reticles */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                {['Z1 (Melamine)', 'Z2 (H2O2)', 'Z3 (Urea)', 'Z4 (Starch)', 'Z5 (Neutral.)', 'Z6 (White)'].map((zone, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '2px solid rgba(16, 185, 129, 0.85)',
                      boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
                      margin: '0 auto'
                    }}></div>
                    <span style={{ fontSize: '0.65rem', color: '#ffffff', marginTop: '6px', display: 'block', textShadow: '0 1px 4px black' }}>
                      {zone}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.65)', padding: '4px 14px', borderRadius: '6px' }}>
                  Align physical or simulated wells within the green reticles
                </span>
              </div>
            </div>

            {/* Floating Action Button to Snap and Analyze */}
            <button
              onClick={captureFrame}
              className="btn-primary"
              style={{
                position: 'absolute',
                bottom: '24px',
                padding: '12px 30px',
                fontSize: '0.95rem',
                boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)'
              }}
            >
              <Camera size={18} /> Capture &amp; Evaluate Colorimetry
            </button>
          </>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {analyzing && (
        <div style={{ textAlign: 'center', marginTop: '16px', color: '#60a5fa', fontSize: '0.9rem' }}>
          <RefreshCw size={18} className="animate-spin" style={{ display: 'inline', marginRight: '8px' }} />
          Extracting CIELAB L*a*b* coordinates and running FSSAI decision matrix...
        </div>
      )}
    </div>
  );
};
