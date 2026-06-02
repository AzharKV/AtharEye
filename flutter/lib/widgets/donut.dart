// Hero coverage donut — teal→accent2 gradient arc over a faint red track, with a
// radial teal glow and the big teal % + label. Ports the pwa Donut() primitive.
// The count-up is driven by the parent (TweenAnimationBuilder) — this widget just
// renders whatever `value` it is given each frame.
import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme.dart';

class Donut extends StatelessWidget {
  const Donut({
    super.key,
    required this.value,
    this.size = 196,
    this.stroke = 18,
    this.label = 'Covered',
  });

  final double value; // 0..100
  final double size;
  final double stroke;
  final String label;

  @override
  Widget build(BuildContext context) {
    final cov = value.clamp(0, 100).toDouble();
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // soft teal glow behind the ring (radial-gradient(glow, transparent 68%))
          Padding(
            padding: EdgeInsets.all(size * 0.10),
            child: DecoratedBox(
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [T.glow, Color(0x0014B8C0)],
                  stops: [0.0, 0.68],
                ),
              ),
            ),
          ),
          CustomPaint(
            size: Size(size, size),
            painter: _DonutPainter(value: cov, stroke: stroke),
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              RichText(
                text: TextSpan(
                  text: '${cov.round()}',
                  style: TextStyle(
                    fontSize: size * 0.28,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -1.5,
                    height: 1,
                    color: T.accent,
                  ),
                  children: [
                    TextSpan(
                      text: '%',
                      style: TextStyle(
                        fontSize: size * 0.13,
                        color: T.muted,
                        letterSpacing: 0,
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 5),
                child: Text(
                  label.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: T.muted,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DonutPainter extends CustomPainter {
  _DonutPainter({required this.value, required this.stroke});

  final double value;
  final double stroke;

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final radius = (size.width - stroke) / 2;
    final rect = Rect.fromCircle(center: center, radius: radius);

    // faint red track (the "missing" reference)
    final track = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..color = const Color(0x33E5484D); // rgba(229,72,77,0.20)
    canvas.drawCircle(center, radius, track);

    // teal→accent2 gradient arc, rounded cap, starting at 12 o'clock
    final sweep = (value / 100) * 2 * math.pi;
    final arc = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [T.accent, T.accent2],
      ).createShader(rect);
    if (sweep > 0) {
      canvas.drawArc(rect, -math.pi / 2, sweep, false, arc);
    }
  }

  @override
  bool shouldRepaint(_DonutPainter old) =>
      old.value != value || old.stroke != stroke;
}
