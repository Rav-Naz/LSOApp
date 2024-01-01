import 'package:flutter/material.dart';

class AppTypographyExtension extends ThemeExtension<AppTypographyExtension> {
  const AppTypographyExtension({
    required this.title,
    required this.body,
    required this.input,
  });

  final TextStyle title;
  final TextStyle body;
  final TextStyle input;

  @override
  ThemeExtension<AppTypographyExtension> copyWith({
    TextStyle? title,
    TextStyle? body,
    TextStyle? input,
  }) {
    return AppTypographyExtension(
      title: title ?? this.title,
      body: body ?? this.body,
      input: input ?? this.input,
    );
  }

  @override
  ThemeExtension<AppTypographyExtension> lerp(
    covariant ThemeExtension<AppTypographyExtension>? other,
    double t,
  ) {
    if (other is! AppTypographyExtension) {
      return this;
    }

    return AppTypographyExtension(
      title: TextStyle.lerp(title, other.title, t)!,
      body: TextStyle.lerp(body, other.body, t)!,
      input: TextStyle.lerp(input, other.input, t)!,
    );
  }
}
