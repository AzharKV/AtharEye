// Active scan — THE performance showcase. A dark immersive screen with a teal
// LiDAR point cloud building up over ~7s (CustomPainter + AnimationController,
// vsync, repaint each frame), a gradient room backdrop + AR corner brackets, a
// pulsing-red "SCANNING" pill, live stats (Points {p·1.84}M / Coverage / Tracking
// Strong), a teal progress bar, and a round stop button. Auto-finishes at 100%.
// Ports ScanFlow.tsx ActiveScan (the camera feed is replaced by a gradient — this
// is an analyze-only comparison build with no camera plugin).
import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/point_cloud.dart';

class ScanActiveScreen extends StatefulWidget {
  const ScanActiveScreen({super.key, required this.project});
  final Project project;

  @override
  State<ScanActiveScreen> createState() => _ScanActiveScreenState();
}

class _ScanActiveScreenState extends State<ScanActiveScreen>
    with TickerProviderStateMixin {
  static const _tips = [
    'Move slowly and steadily',
    'Keep the camera ~1.5 m from surfaces',
    'Capture corners and ceilings',
    'Avoid fast turns — hold steady',
    'Overlap areas you’ve already scanned',
  ];

  late final AnimationController _scan; // 0→1 over 7s
  late final AnimationController _pulse; // red dot pulse
  late final List<ScanPoint> _points;
  int _tip = 0;
  bool _finished = false;

  @override
  void initState() {
    super.initState();
    _points = makePoints(2000);
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
    _scan = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 7000),
    )..addStatusListener((s) {
        if (s == AnimationStatus.completed) _finish();
      });
    _scan.forward();

    // cycle the guidance tip every 2.6s
    _cycleTips();
  }

  Future<void> _cycleTips() async {
    while (mounted && !_finished) {
      await Future<void>.delayed(const Duration(milliseconds: 2600));
      if (mounted && !_finished) {
        setState(() => _tip = (_tip + 1) % _tips.length);
      }
    }
  }

  void _finish() {
    if (_finished) return;
    _finished = true;
    if (mounted) Navigator.of(context).maybePop();
  }

  @override
  void dispose() {
    _scan.dispose();
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.project;
    final mq = MediaQuery.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF070B0F),
      body: Stack(
        children: [
          // gradient room backdrop (camera-feed stand-in) + vignette
          Positioned.fill(
            child: DecoratedBox(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(0, 1.1),
                  radius: 1.1,
                  colors: [Color(0xFF1A2630), Color(0xFF0C141B), Color(0xFF070B0F)],
                  stops: [0.0, 0.45, 1.0],
                ),
              ),
            ),
          ),
          const Positioned.fill(child: _Vignette()),

          // the point cloud
          Positioned.fill(
            child: RepaintBoundary(
              child: CustomPaint(
                painter: PointCloudPainter(points: _points, progress: _scan),
              ),
            ),
          ),

          // AR corner brackets
          Positioned(
            top: 120,
            left: 26,
            right: 26,
            bottom: 226 + mq.padding.bottom,
            child: const _CornerBrackets(),
          ),

          // top bar: close · SCANNING pill
          Positioned(
            top: mq.padding.top + 14,
            left: 18,
            right: 18,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _GlassCircleBtn(
                  icon: Icons.close,
                  onTap: () => Navigator.of(context).maybePop(),
                ),
                _ScanningPill(pulse: _pulse),
                const SizedBox(width: 40),
              ],
            ),
          ),

          // project name + rotating tip
          Positioned(
            top: mq.padding.top + 64,
            left: 24,
            right: 24,
            child: Column(
              children: [
                Text(
                  p.name,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    shadows: [Shadow(color: Colors.black54, blurRadius: 6)],
                  ),
                ),
                const SizedBox(height: 8),
                _TipPill(text: _tips[_tip]),
              ],
            ),
          ),

          // bottom controls: live stats · progress bar · stop
          Positioned(
            left: 18,
            right: 18,
            bottom: 22 + mq.padding.bottom,
            child: AnimatedBuilder(
              animation: _scan,
              builder: (context, _) {
                final prog = _scan.value;
                final pointsM = (prog * 1.84).toStringAsFixed(2);
                final liveCov = (prog * p.pct).round();
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Expanded(child: _StatTile(label: 'Points', value: '${pointsM}M')),
                        const SizedBox(width: 10),
                        Expanded(child: _StatTile(label: 'Coverage', value: '$liveCov%')),
                        const SizedBox(width: 10),
                        const Expanded(
                          child: _StatTile(
                            label: 'Tracking',
                            value: 'Strong',
                            accent: true,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    // progress bar
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: Container(
                        height: 6,
                        color: const Color(0x24FFFFFF), // rgba(255,255,255,0.14)
                        child: FractionallySizedBox(
                          widthFactor: prog.clamp(0.0, 1.0),
                          alignment: Alignment.centerLeft,
                          child: const DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [T.accent, T.accent2],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // stop
                    GestureDetector(
                      onTap: _finish,
                      child: Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0x80080C10),
                          border: Border.all(
                            color: const Color(0x80FFFFFF),
                            width: 3,
                          ),
                        ),
                        child: Center(
                          child: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: T.danger,
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _Vignette extends StatelessWidget {
  const _Vignette();
  @override
  Widget build(BuildContext context) {
    return const DecoratedBox(
      decoration: BoxDecoration(
        gradient: RadialGradient(
          radius: 1.0,
          colors: [Colors.transparent, Color(0xC0000000)],
          stops: [0.55, 1.0],
        ),
      ),
    );
  }
}

class _CornerBrackets extends StatelessWidget {
  const _CornerBrackets();
  @override
  Widget build(BuildContext context) {
    const color = Color(0xB314B8C0); // rgba(20,184,192,0.7)
    Widget corner({required bool top, required bool left}) {
      return Align(
        alignment: Alignment(left ? -1 : 1, top ? -1 : 1),
        child: CustomPaint(
          size: const Size(26, 26),
          painter: _BracketPainter(top: top, left: left, color: color),
        ),
      );
    }

    return Stack(
      children: [
        corner(top: true, left: true),
        corner(top: true, left: false),
        corner(top: false, left: true),
        corner(top: false, left: false),
      ],
    );
  }
}

class _BracketPainter extends CustomPainter {
  _BracketPainter({required this.top, required this.left, required this.color});
  final bool top;
  final bool left;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    final w = size.width, h = size.height;
    final hx = left ? 0.0 : w; // horizontal anchor
    final vy = top ? 0.0 : h; // vertical anchor
    // horizontal stub
    canvas.drawLine(
      Offset(hx, vy),
      Offset(left ? w : 0, vy),
      paint,
    );
    // vertical stub
    canvas.drawLine(
      Offset(hx, vy),
      Offset(hx, top ? h : 0),
      paint,
    );
  }

  @override
  bool shouldRepaint(_BracketPainter old) => false;
}

class _GlassCircleBtn extends StatelessWidget {
  const _GlassCircleBtn({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: Color(0x99080C10),
        ),
        child: Icon(icon, size: 20, color: Colors.white),
      ),
    );
  }
}

class _ScanningPill extends StatelessWidget {
  const _ScanningPill({required this.pulse});
  final Animation<double> pulse;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0x99080C10),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          FadeTransition(
            opacity: Tween(begin: 1.0, end: 0.25).animate(pulse),
            child: Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: T.danger,
                shape: BoxShape.circle,
              ),
            ),
          ),
          const SizedBox(width: 7),
          const Text(
            'SCANNING',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: Colors.white,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}

class _TipPill extends StatelessWidget {
  const _TipPill({required this.text});
  final String text;
  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 250),
      child: Container(
        key: ValueKey(text),
        padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 7),
        decoration: BoxDecoration(
          color: const Color(0x8C080C10),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.info_outline, size: 14, color: T.accent2),
            const SizedBox(width: 7),
            Text(
              text,
              style: const TextStyle(
                fontSize: 12.5,
                color: Color(0xE6FFFFFF),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.label,
    required this.value,
    this.accent = false,
  });
  final String label;
  final String value;
  final bool accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0x99080C10),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: T.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: Color(0x99FFFFFF),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: accent ? T.accent2 : Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
