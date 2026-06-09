// Status badge — quiet neutral chip + a coloured dot (teal positive / amber
// caution). Ports the pwa StatusBadge() primitive.
import 'package:flutter/material.dart';
import '../theme.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.status, this.small = false});

  final String status;
  final bool small;

  @override
  Widget build(BuildContext context) {
    final s = kStatus[status] ?? kStatus['On Track']!;
    return Container(
      padding: small
          ? const EdgeInsets.fromLTRB(8, 3, 9, 3)
          : const EdgeInsets.fromLTRB(9, 4, 11, 4),
      decoration: BoxDecoration(
        color: const Color(0x0DFFFFFF), // rgba(255,255,255,0.05)
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: T.hairline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: s.color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            s.label,
            style: TextStyle(
              fontSize: small ? 11.5 : 12.5,
              fontWeight: FontWeight.w600,
              letterSpacing: -0.1,
              color: T.text,
            ),
          ),
        ],
      ),
    );
  }
}
