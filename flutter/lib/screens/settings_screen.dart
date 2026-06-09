// Settings tab — a simple stub (not a comparison hero). Shows the user profile
// header + a few static rows so the tab isn't empty.
import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/ui.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.only(bottom: 16),
        children: [
          const ScreenHeader(title: 'Settings'),
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: AppCard(
              child: Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: T.surfaceHi,
                      borderRadius: BorderRadius.circular(26),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'JM',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: T.muted,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          kUser.name,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${kUser.role} · ${kUser.company}',
                          style: const TextStyle(fontSize: 13, color: T.muted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: AppCard(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  _row('Region', kUser.region, true),
                  _row('Member since', kUser.since, true),
                  _row('Plan', 'Small Business · £99/mo', false),
                ],
              ),
            ),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(20, 18, 20, 0),
            child: Text(
              'Comparison build — Settings is a stub. The hero screens are '
              'Projects, the Report detail (count-up donut) and the active Scan '
              '(LiDAR point cloud).',
              style: TextStyle(fontSize: 12, color: T.faint, height: 1.45),
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(String k, String v, bool divider) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 13),
      decoration: BoxDecoration(
        border: divider
            ? const Border(bottom: BorderSide(color: T.hairline2))
            : null,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(k, style: const TextStyle(fontSize: 14.5, color: T.muted)),
          Text(
            v,
            style: const TextStyle(
              fontSize: 14.5,
              color: T.text,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
