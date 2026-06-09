// Scan step 3 — the immersive active scan. Live camera (CameraBG) behind a Skia point cloud that
// builds up over ~7s on the UI thread (useClock → derived SkPicture), plus a perspective room
// wireframe. React stats + completion are driven by a low-frequency timer (decoupled from the 60fps
// canvas). Port of the PWA ActiveScan (canvas 2D → react-native-skia).
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Canvas, createPicture, PaintStyle, Picture, Skia, useClock } from '@shopify/react-native-skia';
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '@/theme';
import { haptic } from '@/lib/haptic';
import { fill } from '@/lib/ui';
import { useProject } from '@/store/AppStore';
import { Icon } from '@/components/Icon';
import { CameraBG } from '@/components/CameraBG';

const DUR = 7000;
const N = 2000;
const TIPS = [
  'Move slowly and steadily',
  'Keep the camera ~1.5 m from surfaces',
  'Capture corners and ceilings',
  'Avoid fast turns — hold steady',
  'Overlap areas you’ve already scanned',
];

// 3D room point cloud (1-point perspective box), revealed in random order — port of makePoints.
function makePoints(n: number): { x: number; y: number; z: number; r: number }[] {
  const pts: { x: number; y: number; z: number; r: number }[] = [];
  for (let i = 0; i < n; i++) {
    const s = Math.random();
    let x: number, y: number, z: number;
    if (s < 0.34) {
      y = 0;
      x = Math.random() * 2 - 1;
      z = Math.random() * 3.4;
    } else if (s < 0.5) {
      y = 1.5;
      x = Math.random() * 2 - 1;
      z = Math.random() * 3.4;
    } else if (s < 0.68) {
      x = -1;
      y = Math.random() * 1.5;
      z = Math.random() * 3.4;
    } else if (s < 0.86) {
      x = 1;
      y = Math.random() * 1.5;
      z = Math.random() * 3.4;
    } else {
      z = 3.4;
      x = Math.random() * 2 - 1;
      y = Math.random() * 1.5;
    }
    pts.push({ x, y, z, r: Math.random() });
  }
  return pts.sort((a, b) => a.r - b.r);
}

interface CloudData {
  sx: Float32Array;
  sy: Float32Array;
  size: Float32Array;
  alpha: Float32Array;
}

function buildCloud(W: number, H: number): CloudData {
  const pts = makePoints(N);
  const cx = W / 2;
  const cy = H * 0.46;
  const f = H * 0.62;
  const sx = new Float32Array(N);
  const sy = new Float32Array(N);
  const size = new Float32Array(N);
  const alpha = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const pt = pts[i];
    const zz = pt.z + 0.6;
    const depth = 1 / zz;
    sx[i] = cx + (pt.x / zz) * f;
    sy[i] = cy - ((pt.y - 0.75) / zz) * f;
    size[i] = Math.max(0.7, depth * 2.6);
    alpha[i] = Math.min(1, 0.25 + depth * 0.75);
  }
  return { sx, sy, size, alpha };
}

function buildWireframe(W: number, H: number): { primary: number[]; secondary: number[] } {
  const cx = W / 2;
  const cy = H * 0.46;
  const f = H * 0.62;
  const proj = (x: number, y: number, z: number): [number, number] => {
    const zz = z + 0.6;
    return [cx + (x / zz) * f, cy - ((y - 0.75) / zz) * f];
  };
  const primary: number[] = [];
  const push = (arr: number[], a: [number, number], b: [number, number]) => arr.push(a[0], a[1], b[0], b[1]);
  for (const gx of [-1, -0.5, 0, 0.5, 1]) push(primary, proj(gx, 0, 0), proj(gx, 0, 3.4));
  for (const gz of [0, 0.85, 1.7, 2.55, 3.4]) push(primary, proj(-1, 0, gz), proj(1, 0, gz));
  const secondary: number[] = [];
  for (const [cxn, czn] of [
    [-1, 0],
    [1, 0],
    [-1, 3.4],
    [1, 3.4],
  ] as [number, number][])
    push(secondary, proj(cxn, 0, czn), proj(cxn, 1.5, czn));
  const r1 = proj(-1, 1.5, 0);
  const r2 = proj(1, 1.5, 0);
  const r3 = proj(1, 1.5, 3.4);
  const r4 = proj(-1, 1.5, 3.4);
  push(secondary, r1, r2);
  push(secondary, r2, r3);
  push(secondary, r3, r4);
  push(secondary, r4, r1);
  return { primary, secondary };
}

export default function ActiveScan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const p = useProject(projectId);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [tip, setTip] = useState(0);
  const [progress, setProgress] = useState(0);
  const ready = size.w > 0 && size.h > 0;

  const clock = useClock();
  const start = useSharedValue(0);
  const cloud = useMemo(() => (ready ? buildCloud(size.w, size.h) : null), [ready, size.w, size.h]);
  const wf = useMemo(() => (ready ? buildWireframe(size.w, size.h) : null), [ready, size.w, size.h]);
  const colors = useMemo(
    () => ({
      teal: Skia.Color('rgb(110,215,222)'),
      fresh: Skia.Color('rgb(120,232,238)'),
      wire: Skia.Color('rgb(20,184,192)'),
    }),
    [],
  );
  const rect = useMemo(() => ({ x: 0, y: 0, width: size.w || 1, height: size.h || 1 }), [size.w, size.h]);

  // capture the clock baseline once the canvas has a size
  useEffect(() => {
    if (ready) start.value = clock.value;
  }, [ready, clock, start]);

  const prog = useDerivedValue(() => {
    if (start.value === 0) return 0;
    return Math.min(1, Math.max(0, (clock.value - start.value) / DUR));
  });

  const picture = useDerivedValue(() => {
    const pr = prog.value;
    return createPicture((canvas) => {
      if (!cloud || !wf) return;
      // perspective room wireframe (fades in as the scan progresses)
      const wfA = 0.18 + 0.32 * pr;
      const wp = Skia.Paint();
      wp.setStyle(PaintStyle.Stroke);
      wp.setStrokeWidth(1.5);
      wp.setColor(colors.wire);
      wp.setAlphaf(wfA);
      for (let i = 0; i < wf.primary.length; i += 4) canvas.drawLine(wf.primary[i], wf.primary[i + 1], wf.primary[i + 2], wf.primary[i + 3], wp);
      wp.setAlphaf(wfA * 0.55);
      for (let i = 0; i < wf.secondary.length; i += 4) canvas.drawLine(wf.secondary[i], wf.secondary[i + 1], wf.secondary[i + 2], wf.secondary[i + 3], wp);
      // point cloud
      const reveal = Math.floor(pr * N);
      const base = Skia.Paint();
      base.setColor(colors.teal);
      const fresh = Skia.Paint();
      fresh.setColor(colors.fresh);
      for (let i = 0; i < reveal; i++) {
        if (i > reveal - 40) {
          fresh.setAlphaf(Math.min(1, cloud.alpha[i] + 0.2));
          canvas.drawCircle(cloud.sx[i], cloud.sy[i], cloud.size[i] * 1.8, fresh);
        } else {
          base.setAlphaf(cloud.alpha[i] * 0.85);
          canvas.drawCircle(cloud.sx[i], cloud.sy[i], cloud.size[i], base);
        }
      }
    }, rect);
  });

  const barStyle = useAnimatedStyle(() => ({ width: `${prog.value * 100}%` }));

  // rotating tip
  useEffect(() => {
    const id = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 2600);
    return () => clearInterval(id);
  }, []);

  // stats + completion (low-frequency; the canvas runs at 60fps independently)
  const doneRef = useRef(false);
  useEffect(() => {
    if (!ready || !p) return;
    const startMs = Date.now();
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      haptic();
      router.replace('/scan/processing?projectId=' + p.id);
    };
    const id = setInterval(() => {
      const pr = Math.min(1, (Date.now() - startMs) / DUR);
      setProgress(pr);
      if (pr >= 1) {
        clearInterval(id);
        setTimeout(finish, 400);
      }
    }, 80);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!p) return null;
  const pointsM = (progress * 1.84).toFixed(2);
  const liveCov = Math.round(progress * p.pct);
  const stop = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    haptic();
    router.replace('/scan/processing?projectId=' + p.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#070B0F' }}>
      <CameraBG />
      <View style={fill} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {ready ? (
          <Canvas style={fill}>
            <Picture picture={picture} />
          </Canvas>
        ) : null}
      </View>

      {/* AR corner brackets */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 120, left: 26, right: 26, bottom: 226 + insets.bottom }}>
        {([
          { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 14 },
          { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 14 },
          { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 14 },
          { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 14 },
        ] as const).map((c, i) => (
          <View key={i} style={{ position: 'absolute', width: 26, height: 26, borderColor: 'rgba(20,184,192,0.7)', ...c }} />
        ))}
      </View>

      {/* top bar */}
      <View style={{ position: 'absolute', top: insets.top + 14, left: 18, right: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={stop} accessibilityLabel="Cancel scan" style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(8,12,16,0.6)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={20} color="#fff" />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(8,12,16,0.6)', paddingVertical: 7, paddingHorizontal: 13, borderRadius: 20 }}>
          <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: T.danger }} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: 0.3 }}>SCANNING</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* project + tip */}
      <View style={{ position: 'absolute', top: insets.top + 70, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{p.name}</Text>
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(8,12,16,0.55)', paddingVertical: 7, paddingHorizontal: 13, borderRadius: 20 }}>
          <Icon name="info" size={14} color={T.accent2} />
          <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.9)' }}>{TIPS[tip]}</Text>
        </View>
      </View>

      {/* bottom controls */}
      <View style={{ position: 'absolute', left: 18, right: 18, bottom: insets.bottom + 22, gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {([
            ['Points', `${pointsM}M`],
            ['Coverage', `${liveCov}%`],
            ['Tracking', 'Strong'],
          ] as [string, string][]).map(([l, v]) => (
            <View key={l} style={{ flex: 1, backgroundColor: 'rgba(8,12,16,0.6)', borderWidth: 1, borderColor: T.hairline, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>{l}</Text>
              <Text style={{ fontSize: 17, fontWeight: '800', color: l === 'Tracking' ? T.accent2 : '#fff', marginTop: 3 }}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
          <Animated.View style={[{ height: '100%', backgroundColor: T.accent2 }, barStyle]} />
        </View>

        <View style={{ alignItems: 'center', marginTop: 2 }}>
          <Pressable onPress={stop} accessibilityLabel="Stop scan" style={{ width: 64, height: 64, borderRadius: 64, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(8,12,16,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: T.danger }} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
