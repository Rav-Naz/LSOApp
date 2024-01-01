import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

/// Class that is responsible for logging with color
abstract class AppLogger {
  static const String _BLACK = "\x1B[30m";
  static const String _RED = "\x1B[31m";
  static const String _GREEN = "\x1B[32m";
  static const String _YELLOW = "\x1B[33m";
  static const String _BLUE = "\x1B[34m";
  static const String _MAGENTA = "\x1B[35m";
  static const String _CYAN = "\x1B[36m";
  static const String _WHITE = "\x1B[37m";
  static const String _RESET = "\x1B[0m";

  /// Function that logs message to console with colors
  /// * **[message]** - list of messages and colors. Color inserted before [message] changes color of this [message]
  /// * Optional [error] - parameter that define if message is error (default false)
  /// * Optional [warning] - parameter that define if message is warning (default false)
  static void log(List<dynamic> message,
      {bool error = false, bool warning = false}) {
    /// Message
    var string = "";

    /// Icons
    if (warning) {
      string += " ⚠️";
    } else if (error) {
      string += " 🛑";
    }

    /// Convert list of colors and messages to colorfull messages
    string += message
        .map((e) {
          if (e is Color) {
            if (e == Colors.black) {
              return _BLACK;
            } else if (e == Colors.red) {
              return _RED;
            } else if (e == Colors.green) {
              return _GREEN;
            } else if (e == Colors.yellow) {
              return _YELLOW;
            } else if (e == Colors.blue) {
              return _BLUE;
            } else if (e == Colors.pink) {
              return _MAGENTA;
            } else if (e == Colors.cyan) {
              return _CYAN;
            } else if (e == Colors.white) {
              return _WHITE;
            } else {
              return _WHITE;
            }
          } else if (e is String) {
            return e;
          } else {
            return "";
          }
        })
        .toList()
        .join(" ");

    /// Add character that resets color
    string += _RESET;

    if (kDebugMode) {
      /// Log message
      // ignore: avoid_print
      print(string);
    }
  }
}
