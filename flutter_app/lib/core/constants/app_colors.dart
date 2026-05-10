import 'package:flutter/material.dart';

abstract class AppColors {
  // === Backgrounds ===
  static const Color background = Color(0xFF000000);
  static const Color surface = Color(0xFF0D0D0D);
  static const Color surfaceElevated = Color(0xFF141414);
  static const Color surfaceHighlight = Color(0xFF1A1A1A);

  // === Primary (Neon Green) ===
  static const Color primary = Color(0xFF00FF87);
  static const Color primaryVariant = Color(0xFF00D4A0);
  static const Color primaryDim = Color(0xFF00FF8726);   // 15% alpha
  static const Color primarySubtle = Color(0xFF00FF870F); // 6% alpha

  // === Accent (Electric Purple) ===
  static const Color accent = Color(0xFF7B2FFF);
  static const Color accentDim = Color(0xFF7B2FFF26);

  // === Semantic ===
  static const Color error = Color(0xFFFF3B30);
  static const Color errorDim = Color(0xFFFF3B3020);
  static const Color warning = Color(0xFFFF9F0A);
  static const Color warningDim = Color(0xFFFF9F0A20);
  static const Color success = Color(0xFF00FF87);
  static const Color info = Color(0xFF0A84FF);

  // === Text ===
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFAAAAAA);
  static const Color textMuted = Color(0xFF666666);
  static const Color textDisabled = Color(0xFF333333);

  // === Borders ===
  static const Color border = Color(0xFF1E1E1E);
  static const Color borderHighlight = Color(0xFF2A2A2A);
  static const Color borderPrimary = Color(0xFF00FF8740);

  // === Macro Colors ===
  static const Color protein = Color(0xFF3B82F6); // blue
  static const Color carbs = Color(0xFFF59E0B);   // amber
  static const Color fat = Color(0xFFEC4899);     // pink

  // === Workout Type Colors ===
  static const Color strength = Color(0xFFFF6B35);
  static const Color cardio = Color(0xFF00D4A0);
  static const Color hiit = Color(0xFFFF3B30);
  static const Color yoga = Color(0xFF7B2FFF);
  static const Color rest = Color(0xFF444444);

  // === Gradients ===
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF00FF87), Color(0xFF00D4A0)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF141414), Color(0xFF0D0D0D)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF001A0F), Color(0xFF000000)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
