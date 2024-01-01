import 'package:flutter/material.dart';

class AppColorsExtension extends ThemeExtension<AppColorsExtension> {
  const AppColorsExtension({
    required this.primary,
    required this.secondary,
    required this.error,
    required this.success,
    required this.background,
    required this.text,
  });

  final Color primary;
  final Color secondary;
  final Color error;
  final Color success;
  final Color background;
  final Color text;

  @override
  ThemeExtension<AppColorsExtension> copyWith(
      {Color? primary,
      Color? secondary,
      Color? error,
      Color? success,
      Color? background,
      Color? text}) {
    return AppColorsExtension(
        primary: primary ?? this.primary,
        secondary: secondary ?? this.secondary,
        error: error ?? this.error,
        success: success ?? this.success,
        background: background ?? this.background,
        text: text ?? this.text);
  }

  @override
  ThemeExtension<AppColorsExtension> lerp(
    covariant ThemeExtension<AppColorsExtension>? other,
    double t,
  ) {
    if (other is! AppColorsExtension) {
      return this;
    }

    return AppColorsExtension(
        primary: Color.lerp(primary, other.primary, t)!,
        secondary: Color.lerp(secondary, other.secondary, t)!,
        error: Color.lerp(error, other.error, t)!,
        success: Color.lerp(success, other.success, t)!,
        background: Color.lerp(background, other.background, t)!,
        text: Color.lerp(text, other.text, t)!);
  }
}
