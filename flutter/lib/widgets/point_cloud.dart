// LiDAR point-cloud painter — THE performance showcase. Ports ScanFlow.tsx:
// makePoints(2000) (a 1-point-perspective room box: floor / ceiling / walls /
// back, revealed in random order), the depth-shaded teal points, and the faint
// perspective room wireframe that fades in as the scan progresses.
//
// Driven by an external AnimationController (0→1 over ~7s); repaints every frame.
import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme.dart';

/// One captured point in room space, with its reveal order `r` (0..1).
class ScanPoint {
  const ScanPoint(this.x, this.y, this.z, this.r);
  final double x;
  final double y;
  final double z;
  final double r;
}

/// Generate `n` points across the 5 surfaces of a 1-point-perspective room box,
/// then sort by `r` so they reveal in a random-looking order. Mirrors makePoints.
List<ScanPoint> makePoints(int n, [math.Random? rng]) {
  final rnd = rng ?? math.Random();
  final pts = <ScanPoint>[];
  for (var i = 0; i < n; i++) {
    final s = rnd.nextDouble();
    double x, y, z;
    if (s < 0.34) {
      // floor
      y = 0;
      x = rnd.nextDouble() * 2 - 1;
      z = rnd.nextDouble() * 3.4;
    } else if (s < 0.5) {
      // ceiling
      y = 1.5;
      x = rnd.nextDouble() * 2 - 1;
      z = rnd.nextDouble() * 3.4;
    } else if (s < 0.68) {
      // left wall
      x = -1;
      y = rnd.nextDouble() * 1.5;
      z = rnd.nextDouble() * 3.4;
    } else if (s < 0.86) {
      // right wall
      x = 1;
      y = rnd.nextDouble() * 1.5;
      z = rnd.nextDouble() * 3.4;
    } else {
      // back wall
      z = 3.4;
      x = rnd.nextDouble() * 2 - 1;
      y = rnd.nextDouble() * 1.5;
    }
    pts.add(ScanPoint(x, y, z, rnd.nextDouble()));
  }
  pts.sort((a, b) => a.r.compareTo(b.r));
  return pts;
}

class PointCloudPainter extends CustomPainter {
  PointCloudPainter({required this.points, required this.progress})
    : super(repaint: progress);

  final List<ScanPoint> points;
  final Animation<double> progress;

  @override
  void paint(Canvas canvas, Size size) {
    final p = progress.value.clamp(0.0, 1.0);
    final w = size.width;
    final h = size.height;
    final cx = w / 2;
    final cy = h * 0.46;
    final f = h * 0.62;

    // 1-point projection: matches the PWA's proj()/inline math exactly.
    Offset proj(double x, double y, double z) {
      final zz = z + 0.6;
      return Offset(cx + (x / zz) * f, cy - ((y - 0.75) / zz) * f);
    }

    // ── faint perspective room wireframe (reads as a room being reconstructed),
    //    opacity fades in with progress.
    final roomA = 0.18 + 0.32 * p;
    final floorPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..color = T.accent.withValues(alpha: roomA);
    final floor = Path();
    for (final gx in const [-1.0, -0.5, 0.0, 0.5, 1.0]) {
      final a = proj(gx, 0, 0);
      final b = proj(gx, 0, 3.4);
      floor.moveTo(a.dx, a.dy);
      floor.lineTo(b.dx, b.dy);
    }
    for (final gz in const [0.0, 0.85, 1.7, 2.55, 3.4]) {
      final a = proj(-1, 0, gz);
      final b = proj(1, 0, gz);
      floor.moveTo(a.dx, a.dy);
      floor.lineTo(b.dx, b.dy);
    }
    canvas.drawPath(floor, floorPaint);

    // vertical corners + ceiling rectangle (dimmer)
    final edgePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..color = T.accent.withValues(alpha: roomA * 0.55);
    final edges = Path();
    for (final corner in const [
      [-1.0, 0.0],
      [1.0, 0.0],
      [-1.0, 3.4],
      [1.0, 3.4],
    ]) {
      final a = proj(corner[0], 0, corner[1]);
      final b = proj(corner[0], 1.5, corner[1]);
      edges.moveTo(a.dx, a.dy);
      edges.lineTo(b.dx, b.dy);
    }
    final r1 = proj(-1, 1.5, 0);
    final r2 = proj(1, 1.5, 0);
    final r3 = proj(1, 1.5, 3.4);
    final r4 = proj(-1, 1.5, 3.4);
    edges.moveTo(r1.dx, r1.dy);
    edges.lineTo(r2.dx, r2.dy);
    edges.lineTo(r3.dx, r3.dy);
    edges.lineTo(r4.dx, r4.dy);
    edges.close();
    canvas.drawPath(edges, edgePaint);

    // ── points, revealed up to `reveal`; the freshest ~40 glow brighter+larger.
    final reveal = (p * points.length).floor();
    final dot = Paint();
    for (var i = 0; i < reveal; i++) {
      final pt = points[i];
      final zz = pt.z + 0.6;
      final sx = cx + (pt.x / zz) * f;
      final sy = cy - ((pt.y - 0.75) / zz) * f;
      final depth = 1 / zz;
      final fresh = i > reveal - 40;
      final sizePx = math.max(0.6, depth * 2.4);
      final a = (0.25 + depth * 0.75).clamp(0.0, 1.0);
      if (fresh) {
        dot.color = const Color(0xFF78E8EE).withValues(alpha: a);
        canvas.drawCircle(Offset(sx, sy), sizePx * 1.8, dot);
      } else {
        // CSS clamps rgb() channels for free; Dart asserts 0..255, and depth can
        // push blue/green past 255, so clamp explicitly.
        dot.color = Color.fromRGBO(
          (90 + depth * 90).round().clamp(0, 255),
          (190 + depth * 50).round().clamp(0, 255),
          (200 + depth * 50).round().clamp(0, 255),
          (a * 0.8).clamp(0.0, 1.0),
        );
        canvas.drawCircle(Offset(sx, sy), sizePx, dot);
      }
    }
  }

  @override
  bool shouldRepaint(PointCloudPainter old) => old.points != points;
}
