import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';

class GritButton extends StatelessWidget {
  const GritButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.isDestructive = false,
    this.isSecondary = false,
    this.icon,
    this.fullWidth = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isDestructive;
  final bool isSecondary;
  final IconData? icon;
  final bool fullWidth;

  @override
  Widget build(BuildContext context) {
    final bg = isDestructive
        ? AppColors.error
        : isSecondary
            ? AppColors.surfaceHighlight
            : null;
    final fg = isDestructive
        ? Colors.white
        : isSecondary
            ? AppColors.textPrimary
            : AppColors.background;

    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: 54,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: (!isDestructive && !isSecondary) ? AppColors.primaryGradient : null,
          color: bg,
          borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
        ),
        child: MaterialButton(
          onPressed: isLoading ? null : () {
            HapticFeedback.mediumImpact();
            onPressed?.call();
          },
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
          ),
          child: isLoading
              ? SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: fg,
                  ),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (icon != null) ...[Icon(icon, color: fg, size: 18), const SizedBox(width: 8)],
                    Text(
                      label,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: fg,
                        letterSpacing: 0.1,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
