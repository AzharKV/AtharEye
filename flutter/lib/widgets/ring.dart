// Mini progress ring — grey by default (data), teal for the screen hero.
// Ports pwa Ring(): a rounded-cap arc over a full track, value text centred.
import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme.dart';

class Ring extends StatelessWidget {
  const Ring({
    super.key,
    required this.value,
    this.size = 52,
    this.stroke = 5,
    this.accent = false,
    this.label,
  });

  final double value; // 0..100
  final double size;
  final double stroke;
  final bool accent;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final v = value.clamp(0, 100).toDouble();
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _RingPainter(
              value: v,
              stroke: stroke,
              color: accent ? T.accent : T.bar,
            ),
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '${v.round()}',
                style: TextStyle(
                  fontSize: size * 0.3,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                  color: accent ? T.accent : T.text,
                  height: 1,
                ),
              ),
              if (label != null)
                Text(
                  label!,
                  style: const TextStyle(
                    fontSize: 8.5,
                    fontWeight: FontWeight.w700,
                    color: T.faint,
                    letterSpacing: 0.3,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter({
    required this.value,
    required this.stroke,
    required this.color,
  });

  final double value;
  final double stroke;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final radius = (size.width - stroke) / 2;
    final rect = Rect.fromCircle(center: center, radius: radius);

    final trackPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..color = T.track;
    canvas.drawCircle(center, radius, trackPaint);

    final arcPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..color = color;
    final sweep = (value / 100) * 2 * math.pi;
    canvas.drawArc(rect, -math.pi / 2, sweep, false, arcPaint);
  }

  @override
  bool shouldRepaint(_RingPainter old) =>
      old.value != value || old.color != color || old.stroke != stroke;
}
