import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:sized_context/sized_context.dart';

/// Class to manage resizable screens
abstract class AppResizable {
  /// Funtion that determines which type of UI show to user depending on screen size
  static AppResizableSize size(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;
    final isLandscape = width > height;
    final isTablet =
        context.diagonalInches > 7.0 && context.diagonalInches < 13.0;
    if (isLandscape) {
      if (kIsWeb || isTablet) {
        if (width <= AppResizableSize.MOBILE.value) {
          return AppResizableSize.MOBILE;
        } else if (width >= AppResizableSize.DESKTOP.value) {
          return AppResizableSize.DESKTOP;
        } else {
          return AppResizableSize.TABLET;
        }
      } else {
        if (width <= AppResizableSize.MOBILE.value) {
          return AppResizableSize.MOBILE;
        } else {
          return AppResizableSize.TABLET;
        }
      }
    } else {
      if (isTablet && width >= AppResizableSize.MOBILE.value) {
        if (width >= AppResizableSize.DESKTOP.value) {
          return AppResizableSize.DESKTOP;
        }
        return AppResizableSize.TABLET;
      } else if (width >= AppResizableSize.DESKTOP.value) {
        return AppResizableSize.DESKTOP;
      } else {
        return AppResizableSize.MOBILE;
      }
    }
  }
}

/// Breakpoints of screen sizes
enum AppResizableSize {
  MOBILE(500),
  TABLET(850),
  DESKTOP(1200);

  const AppResizableSize(this.value);
  final int value;
}
