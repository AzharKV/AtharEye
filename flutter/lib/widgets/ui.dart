// Shared UI atoms ported from pwa primitives: Card, Chips, SectionLabel,
// AppButton, ScreenHeader. Tokens-faithful; pressable cards scale slightly.
import 'package:flutter/material.dart';
import '../theme.dart';

/// Rounded surface card with hairline border. Optionally tappable + press-scale.
class AppCard extends StatefulWidget {
  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.gradient,
    this.color,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Gradient? gradient;
  final Color? color;

  @override
  State<AppCard> createState() => _AppCardState();
}

class _AppCardState extends State<AppCard> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final card = AnimatedScale(
      scale: _down ? 0.99 : 1,
      duration: const Duration(milliseconds: 120),
      child: Container(
        padding: widget.padding,
        decoration: BoxDecoration(
          color: widget.gradient == null ? (widget.color ?? T.surface) : null,
          gradient: widget.gradient,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: T.hairline),
        ),
        child: widget.child,
      ),
    );
    if (widget.onTap == null) return card;
    return GestureDetector(
      onTap: widget.onTap,
      onTapDown: (_) => setState(() => _down = true),
      onTapUp: (_) => setState(() => _down = false),
      onTapCancel: () => setState(() => _down = false),
      child: card,
    );
  }
}

/// Single-select filter chip row (horizontally scrollable).
class Chips extends StatelessWidget {
  const Chips({
    super.key,
    required this.items,
    required this.active,
    required this.onPick,
  });

  final List<String> items;
  final String active;
  final ValueChanged<String> onPick;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: items.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final it = items[i];
          final on = it == active;
          return GestureDetector(
            onTap: () => onPick(it),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOutCubic,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: on ? T.accent : T.surface2,
                borderRadius: BorderRadius.circular(11),
              ),
              child: Text(
                it,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.1,
                  color: on ? T.onAccent : T.muted,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Uppercase section label, optional trailing widget.
class SectionLabel extends StatelessWidget {
  const SectionLabel({super.key, required this.label, this.trailing});
  final String label;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(2, 8, 2, 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.baseline,
        textBaseline: TextBaseline.alphabetic,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: T.muted,
              letterSpacing: 0.4,
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

/// Large-title screen header with optional subtitle + trailing actions.
class ScreenHeader extends StatelessWidget {
  const ScreenHeader({super.key, required this.title, this.sub, this.trailing});
  final String title;
  final String? sub;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.6,
                    height: 38 / 32,
                    color: T.text,
                  ),
                ),
              ),
              ?trailing,
            ],
          ),
          if (sub != null)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                sub!,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: T.muted,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Primary teal / secondary surface button (height 52), with press feedback.
class AppButton extends StatefulWidget {
  const AppButton({
    super.key,
    required this.label,
    this.icon,
    this.primary = false,
    this.onTap,
    this.expand = true,
  });

  final String label;
  final IconData? icon;
  final bool primary;
  final VoidCallback? onTap;
  final bool expand;

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final fg = widget.primary ? T.onAccent : T.text;
    final bg = widget.primary
        ? (_down ? T.accentPress : T.accent)
        : (_down ? T.surfaceHi : T.surface2);
    final btn = AnimatedScale(
      scale: _down ? 0.985 : 1,
      duration: const Duration(milliseconds: 120),
      child: Container(
        height: 52,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(14),
          border: widget.primary ? null : Border.all(color: T.hairline),
          boxShadow: widget.primary
              ? const [
                  BoxShadow(
                    color: Color(0x4D14B8C0), // rgba(20,184,192,0.30)
                    blurRadius: 16,
                    offset: Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (widget.icon != null) ...[
              Icon(widget.icon, size: 20, color: fg),
              const SizedBox(width: 8),
            ],
            Text(
              widget.label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: fg,
              ),
            ),
          ],
        ),
      ),
    );
    final tappable = GestureDetector(
      onTap: widget.onTap,
      onTapDown: (_) => setState(() => _down = true),
      onTapUp: (_) => setState(() => _down = false),
      onTapCancel: () => setState(() => _down = false),
      child: btn,
    );
    return widget.expand ? SizedBox(width: double.infinity, child: tappable) : tappable;
  }
}
