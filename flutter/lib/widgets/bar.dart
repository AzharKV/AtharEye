// Progress bar — grey by default (data); pass a colour for exceptions (red when a
// room is < 45% covered). Ports the pwa Bar() primitive.
import 'package:flutter/material.dart';
import '../theme.dart';

class Bar extends StatelessWidget {
  const Bar({
    super.key,
    required this.value,
    this.height = 6,
    this.color,
    this.track,
  });

  final double value; // 0..100
  final double height;
  final Color? color;
  final Color? track;

  @override
  Widget build(BuildContext context) {
    final v = (value.clamp(0, 100) / 100).toDouble();
    return ClipRRect(
      borderRadius: BorderRadius.circular(height),
      child: Container(
        height: height,
        color: track ?? T.track,
        child: FractionallySizedBox(
          widthFactor: v,
          alignment: Alignment.centerLeft,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: color ?? T.bar,
              borderRadius: BorderRadius.circular(height),
            ),
          ),
        ),
      ),
    );
  }
}
