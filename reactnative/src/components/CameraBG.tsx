// Live rear-camera background behind the point cloud (expo-camera). Falls back to a dark gradient
// if permission is denied/unavailable. RN port of the PWA's CameraBG (getUserMedia).
import { useEffect } from 'react';
import { View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { fill } from '../lib/ui';

export function CameraBG() {
  const [perm, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (perm && !perm.granted && perm.canAskAgain) requestPermission();
  }, [perm, requestPermission]);

  const has = !!perm?.granted;

  return (
    <View style={[fill, { overflow: 'hidden', backgroundColor: '#0A0E12' }]}>
      {/* fallback gradient (always present; hidden once the camera is live) */}
      <LinearGradient
        colors={['#1A2630', '#0C141B', '#070B0F']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 1.1 }}
        end={{ x: 0.5, y: 0 }}
        style={[fill, { opacity: has ? 0 : 1 }]}
      />
      {has ? <CameraView facing="back" active style={[fill, { opacity: 0.55 }]} /> : null}
      {/* vignette approximation */}
      <View style={[fill, { backgroundColor: 'rgba(0,0,0,0.18)' }]} pointerEvents="none" />
    </View>
  );
}
