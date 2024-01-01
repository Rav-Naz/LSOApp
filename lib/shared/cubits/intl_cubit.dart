import 'package:flutter/material.dart';
import 'package:lsoapp/shared/logger.dart';
import 'package:lsoapp/shared/utils.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Current picked language
AppLocale? _currentLanguage;

/// Loaded JSON file
Map<String, dynamic>? _loadedKeyValues;

class IntlCubit extends Cubit<AppLocale> {
  IntlCubit()
      : super(_currentLanguage ??
            getLocaleByCountryCode("pl_PL") ??
            _availableLanguages.first) {
    loadLanguage(state);
  }

  /// Available languages to choose from
  static final List<AppLocale> _availableLanguages = [
    AppLocale(name: "Polski", countryCode: "pl_PL"),
    AppLocale(name: "English", countryCode: "en_US"),
  ];

  /// Funtion that load prefered theme from local storage and set it to current active
  static Future prepareLanguage() async {
    /// Obtain shared preferences
    final prefs = await SharedPreferences.getInstance();
    var countryCode = prefs.getString('language');
    AppLocale language = IntlCubit.getLocaleByCountryCode(
        countryCode ?? IntlCubit._availableLanguages[0].countryCode)!;
    _loadedKeyValues = await AppUtils.parseJsonFromAssets(
        'assets/locales/${language.countryCode}.json');
    _currentLanguage = language;

    AppLogger.log([
      Colors.pink,
      "[IntlCubit] Current language is:",
      Colors.blue,
      language.name
    ]);
  }

  /// Translate country code to [AppLocale]
  static AppLocale? getLocaleByCountryCode(String? code) {
    var locales =
        _availableLanguages.where((element) => element.countryCode == code);
    if (locales.isNotEmpty) {
      return locales.first;
    } else {
      return null;
    }
  }

  /// Change language to given [AppLocale]
  Future<void> loadLanguage(AppLocale locale) async {
    _loadedKeyValues = await AppUtils.parseJsonFromAssets(
        'assets/locales/${locale.countryCode}.json');
    _currentLanguage = locale;
    final prefs = await SharedPreferences.getInstance();
    prefs.setString('language', _currentLanguage!.countryCode);
    emit(locale);
  }

  /// Function to translate identifier to name corresponding with current picked language
  ///
  /// Nested identifiers should be separated by comma (".")
  static String translateStatic(String identifier) {
    var list = identifier.split('.');
    String? translate;
    var a;
    try {
      for (var id in list) {
        if (a == null) {
          a = _loadedKeyValues![id];
        } else {
          a = a[id];
        }
        if (a is String) {
          translate = a;
        }
      }
    } catch (e) {
      return translate ?? '‼ ERROR $identifier ‼';
    }
    return translate ?? '🈲$identifier🈲';
  }

  /// Function to translate identifier to name corresponding with current picked language or custom name
  ///
  /// Nested identifiers should be separated by comma (".")
  String translate(String identifier) {
    var list = identifier.split('.');
    String? translate;

    /// If there is no custom name get default name for given language
    var a;
    try {
      for (var id in list) {
        if (a == null) {
          a = _loadedKeyValues![id];
        } else {
          a = a[id];
        }
        if (a is String) {
          translate = a;
        }
      }
    } catch (e) {
      return translate ?? '‼ ERROR $identifier ‼';
    }
    return translate ?? '🈲$identifier🈲';
  }
}

/// Class which defines language
class AppLocale {
  AppLocale({
    required this.name,
    required this.countryCode,
  });

  String name;
  String countryCode;
}
