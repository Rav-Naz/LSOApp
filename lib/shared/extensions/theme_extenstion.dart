import 'package:flutter/material.dart';
import 'package:lsoapp/shared/extensions/typography_extension.dart';
import 'package:lsoapp/shared/themes.dart';
import 'package:lsoapp/shared/extensions/color_extension.dart';

extension AppThemeGetter on BuildContext {
  // Usage example: `context.theme`
  ThemeData get theme => Theme.of(this);
}

extension AppThemeExtension on ThemeData {
  /// Usage example: Theme.of(context).appColors;
  AppColorsExtension get appColors =>
      extension<AppColorsExtension>() ?? AppTheme.lightColors;

  /// Usage example: Theme.of(context).appTypos;
  AppTypographyExtension get appTypos =>
      extension<AppTypographyExtension>() ?? AppTheme.lightTypography;
}
