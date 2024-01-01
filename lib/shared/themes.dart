import 'package:flutter/material.dart';
import 'package:lsoapp/shared/extensions/color_extension.dart';
import 'package:lsoapp/shared/extensions/typography_extension.dart';

class AppTheme {
  /// Colors
  static const primary = Color(0xFF6200EE);
  static const secondary = Color(0xFF4F01BD);
  static const error = Color(0xFFB11F14);
  static const success = Color(0xFF128B22);

  /// Typography
  static const title = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    fontFamily: 'Audiowide',
  );

  static const body = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    fontFamily: 'Lexend',
  );

  static const input = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    fontFamily: 'Lexend',
  );

  /// Light Theme
  ///
  ///
  static final light = ThemeData.light().copyWith(
      extensions: [lightColors, lightTypography],
      highlightColor: Colors.transparent,
      splashColor: primary.withOpacity(0.2),
      hoverColor: primary.withOpacity(0.1));
  static const lightColors = AppColorsExtension(
      primary: primary,
      secondary: secondary,
      error: error,
      success: success,
      background: Color(0xFFE6E6E6),
      text: Color(0xFF141414));

  static final lightTypography = AppTypographyExtension(
    title: title.copyWith(color: lightColors.text),
    body: body.copyWith(color: lightColors.text),
    input: input.copyWith(color: lightColors.text),
  );

  /// Dark Theme
  ///
  ///
  static final dark = ThemeData.dark().copyWith(
    extensions: [darkColors, darkTypography],
    highlightColor: Colors.transparent,
    splashColor: primary.withOpacity(0.2),
    hoverColor: primary.withOpacity(0.1),
    focusColor: Colors.transparent,
  );

  static const darkColors = AppColorsExtension(
      primary: primary,
      secondary: secondary,
      error: error,
      success: success,
      background: Color(0xFF252525),
      text: Color(0xFFB4B4B4));

  static final darkTypography = AppTypographyExtension(
    title: title.copyWith(color: darkColors.text),
    body: body.copyWith(color: darkColors.text),
    input: input.copyWith(color: darkColors.text),
  );
}
