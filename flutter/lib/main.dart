// Athar Eye — Flutter comparison build. A focused visual/performance port of the
// finished PWA (NOT all 13 screens): the 3 hero screens are Projects, the Report
// detail (animated count-up donut) and the active Scan (LiDAR point cloud). Same
// locked navy/teal design. See README.md.
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'data.dart';
import 'theme.dart';
import 'screens/projects_screen.dart';
import 'screens/reports_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/scan_active_screen.dart';
import 'widgets/ui.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.light);
  runApp(const AtharEyeApp());
}

class AtharEyeApp extends StatelessWidget {
  const AtharEyeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Athar Eye',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: const RootShell(),
    );
  }
}

/// Bottom-tab shell: Projects · Reports · [center teal Scan] · Settings.
class RootShell extends StatefulWidget {
  const RootShell({super.key});

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  int _tab = 0;

  // 3 content tabs; the Scan FAB sits between Reports and Settings.
  static const _tabs = <Widget>[
    ProjectsScreen(),
    ReportsScreen(),
    SettingsScreen(),
  ];

  /// Center action: pick a scannable project, then launch the active scan.
  Future<void> _openScan() async {
    final project = await showModalBottomSheet<Project>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => const _ScanPickerSheet(),
    );
    if (project != null && mounted) {
      await Navigator.of(context).push(
        MaterialPageRoute(
          fullscreenDialog: true,
          builder: (_) => ScanActiveScreen(project: project),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: T.bg,
      body: IndexedStack(index: _tab, children: _tabs),
      bottomNavigationBar: _BottomBar(
        index: _tab,
        onTap: (i) => setState(() => _tab = i),
        onScan: _openScan,
      ),
    );
  }
}

/// Custom bottom bar with a raised center teal Scan button.
class _BottomBar extends StatelessWidget {
  const _BottomBar({
    required this.index,
    required this.onTap,
    required this.onScan,
  });

  final int index;
  final ValueChanged<int> onTap;
  final VoidCallback onScan;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xF20C0F12),
        border: Border(top: BorderSide(color: T.hairline)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 58,
          child: Row(
            children: [
              _TabItem(
                icon: Icons.grid_view_rounded,
                label: 'Projects',
                selected: index == 0,
                onTap: () => onTap(0),
              ),
              _TabItem(
                icon: Icons.description_outlined,
                label: 'Reports',
                selected: index == 1,
                onTap: () => onTap(1),
              ),
              _ScanTab(onTap: onScan),
              _TabItem(
                icon: Icons.settings_outlined,
                label: 'Settings',
                selected: index == 2,
                onTap: () => onTap(2),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TabItem extends StatelessWidget {
  const _TabItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? T.accent : T.faint;
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 23, color: color),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScanTab extends StatelessWidget {
  const _ScanTab({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Center(
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: T.accent,
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x4D14B8C0),
                  blurRadius: 16,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(
              Icons.center_focus_strong_rounded,
              size: 26,
              color: T.onAccent,
            ),
          ),
        ),
      ),
    );
  }
}

/// Bottom sheet to choose which (non-complete) project to scan.
class _ScanPickerSheet extends StatelessWidget {
  const _ScanPickerSheet();

  @override
  Widget build(BuildContext context) {
    final scannable = kProjects.where((p) => p.status != 'Complete').toList();
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, controller) => Container(
        decoration: const BoxDecoration(
          color: Color(0xFF13181D),
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
          border: Border(
            top: BorderSide(color: T.hairline),
            left: BorderSide(color: T.hairline),
            right: BorderSide(color: T.hairline),
          ),
        ),
        child: ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          children: [
            Center(
              child: Container(
                width: 40,
                height: 5,
                decoration: BoxDecoration(
                  color: const Color(0x2EFFFFFF),
                  borderRadius: BorderRadius.circular(5),
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'NEW SCAN',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: T.accent,
                letterSpacing: 0.4,
              ),
            ),
            const SizedBox(height: 5),
            const Text(
              'Select a project',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 16),
            for (final p in scannable)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: AppCard(
                  padding: const EdgeInsets.all(13),
                  onTap: () => Navigator.of(context).pop(p),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 15.5,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${p.location} · ${p.type}',
                              style: const TextStyle(
                                fontSize: 12.5,
                                color: T.muted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      RichText(
                        text: TextSpan(
                          text: '${p.pct}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: T.accent,
                          ),
                          children: const [
                            TextSpan(
                              text: '%',
                              style: TextStyle(fontSize: 11, color: T.muted),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(
                        Icons.chevron_right,
                        size: 16,
                        color: Color(0x40FFFFFF),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
