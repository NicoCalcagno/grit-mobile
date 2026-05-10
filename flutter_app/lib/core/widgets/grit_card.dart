import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';

class GritCard extends StatelessWidget {
  const GritCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.onTap,
    this.glowing = false,
    this.color,
    this.borderColor,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final bool glowing;
  final Color? color;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    Widget card = Container(
      margin: margin,
      padding: padding ?? const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: color ?? AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(
          color: borderColor ?? (glowing ? AppColors.borderPrimary : AppColors.border),
        ),
        boxShadow: glowing
            ? [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.08),
                  blurRadius: 16,
                  spreadRadius: 2,
                ),
              ]
            : null,
      ),
      child: child,
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: card,
      );
    }

    return card;
  }
}
