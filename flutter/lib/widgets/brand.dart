// Brand.dart — Mark (navy squircle + a teal scanning-eye glyph) + Wordmark lockup
// (Athar**Eye**, the teal "Eye"). The PWA renders the actual PNG app icon here;
// to keep this comparison build self-contained (no bundled asset) the Mark draws
// a faithful teal aperture/eye on the navy squircle instead — same brand read.
import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme.dart';

class Mark extends StatelessWidget {
  const Mark({super.key, this.size = 30});
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(size * 0.22),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF12303A), T.bg],
        ),
        border: Border.all(color: const Color(0x14FFFFFF)),
      ),
      child: CustomPaint(painter: _MarkPainter()),
    );
  }
}

class _MarkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final c = size.center(Offset.zero);
    final r = size.width * 0.28;

    // scanning aperture ring
    final ring = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.07
      ..strokeCap = StrokeCap.round
      ..color = T.accent;
    // four arc segments (aperture blades) leave small gaps
    const gap = 0.34;
    for (var i = 0; i < 4; i++) {
      final start = i * (math.pi / 2) + gap / 2;
      canvas.drawArc(
        Rect.fromCircle(center: c, radius: r),
        start,
        math.pi / 2 - gap,
        false,
        ring,
      );
    }

    // pupil
    final pupil = Paint()..color = T.accent2;
    canvas.drawCircle(c, size.width * 0.11, pupil);
  }

  @override
  bool shouldRepaint(_MarkPainter oldDelegate) => false;
}

class Wordmark extends StatelessWidget {
  const Wordmark({super.key, this.size = 19, this.sub});
  final double size;
  final String? sub;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        RichText(
          text: TextSpan(
            text: 'Athar',
            style: TextStyle(
              fontSize: size,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
              color: T.text,
              height: 1,
            ),
            children: const [
              TextSpan(text: 'Eye', style: TextStyle(color: T.accent)),
            ],
          ),
        ),
        if (sub != null)
          Padding(
            padding: const EdgeInsets.only(top: 3),
            child: Text(
              sub!,
              style: const TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w600,
                color: T.muted,
                letterSpacing: 0.5,
              ),
            ),
          ),
      ],
    );
  }
}
