import 'package:flutter/material.dart';
import 'package:lsoapp/shared/responsive.dart';

extension AppResponsive on BuildContext {
  AppResizableSize get responsiveSize => AppResizable.size(this);
}
