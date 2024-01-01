import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lsoapp/shared/logger.dart';

abstract class AppUtils {
  /// Function which loads JSON file from assets
  static Future<Map<String, dynamic>> parseJsonFromAssets(
      String assetsPath) async {
    AppLogger.log([Colors.yellow, "Loading data from file: $assetsPath"]);
    return rootBundle
        .loadString(assetsPath)
        .then((jsonStr) => jsonDecode(jsonStr));
  }
}

class Debouncer {
  final int milliseconds;
  Timer? _timer;
  Debouncer({required this.milliseconds});
  void run(VoidCallback action) {
    if (_timer != null) {
      _timer!.cancel();
    }
    _timer = Timer(Duration(milliseconds: milliseconds), action);
  }
}
