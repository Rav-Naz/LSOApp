import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:lsoapp/env.dart';
import 'package:lsoapp/shared/cubits/intl_cubit.dart';
import 'package:lsoapp/shared/logger.dart';

/// Singleton class which provides HTTP Client
/// with customs options and headers
class AppAPIClient {
  /// Private client of custom Dio
  late Dio _client;

  /// Private variable that contains bearer token
  String? _bearer;

  /// Options of API calls
  late BaseOptions options;

  /// Singleton instance
  static final AppAPIClient _instance = AppAPIClient._internal();

  factory AppAPIClient() => _instance;

  /// Public getter of client
  Dio get client => _client;

  /// Public getter of bearer
  String? get getBearer => _bearer;

  /// Bearer setter
  set bearer(String? bearer) {
    options.headers = {
      "Accept": 'application/json',
      "Authorization": 'Bearer $bearer'
    };
    _bearer = bearer;
  }

  /// Basic constructor of [AppAPIClient]
  AppAPIClient._internal() {
    options = BaseOptions(
        // connectTimeout: 8000,
        // receiveTimeout: 5000,
        followRedirects: false,
        headers: {"Accept": 'application/json'},
        baseUrl: "https://${AppEnv.API_URL}${AppEnv.API_SUFFIX}");
    _client = Dio(options)
      ..interceptors.add(InterceptorsWrapper(
        onError: (e, handler) async {
          handler.next(e);
        },
      ));
  }

  /// Function that returns message depending on error
  ///
  /// * **[error]** - Throwed error
  /// * Optional [expectedErrorsList] - List containing expeceted errors which should be customly handled
  String errorMessage(dynamic error,
      {List<AppExpectedError>? expectedErrorsList}) {
    if (kDebugMode) {
      AppLogger.log([Colors.red, "[AppAPIClient] Error occured: $error"],
          error: true);
    }
    var defaultMessage = IntlCubit.translateStatic("shared.api.error.message");
    if (error.runtimeType == DioException) {
      error as DioException;
      if (kDebugMode) {
        AppLogger.log(
            [Colors.red, "[AppAPIClient] Description: ${error.response}"],
            error: true);
      }

      /// If error has status code and expected errors is provided
      if (error.response?.statusCode != null) {
        var statusCode = error.response?.statusCode;

        /// If filtered list is not empty and error has returned message
        if (error.response?.data != null && expectedErrorsList != null) {
          /// Filtered expected errors with status code as same as in error
          var list = expectedErrorsList
              .where((element) => element.expectedStatus == statusCode);
          var respMessage =
              IntlCubit.translateStatic("shared.api.error.unexpected");
          if (error.response?.data is String) {
            respMessage = error.response?.data;
          } else {
            try {
              var dataJson = Map<String, dynamic>.from(error.response?.data);
              respMessage = dataJson['message'];
            } catch (e) {
              AppLogger.log([
                "Cannot convert response to JSON. Leaving with default message"
              ], warning: true);
            }
          }

          /// Expected errors with message like in error
          var messages = list.where((element) =>
              (element.expectedMessage != null &&
                  respMessage.contains(element.expectedMessage!)) ||
              element.expectedMessage == null);

          /// error alert
          if (messages.isNotEmpty) {
            return messages.first.errorHandleMessage;
          }

          if (statusCode != null) {
            /// Errors by status codes
            return IntlCubit.translateStatic(
                'shared.api.error.statuses.$statusCode');
          }
          return defaultMessage;
        } else {
          /// Errors by status codes
          return IntlCubit.translateStatic(
              'shared.api.error.statuses.$statusCode');
        }
      }
      if (error.type == DioExceptionType.cancel) {
        return IntlCubit.translateStatic('shared.api.error.cancel');
      }
      if (error.type == DioExceptionType.connectionTimeout) {
        return IntlCubit.translateStatic('shared.api.error.timeout');
      }
      if (error.type == DioExceptionType.unknown ||
          error.type == DioExceptionType.badResponse) {
        if (error.message?.contains('Connection failed') ?? false) {
          return IntlCubit.translateStatic('shared.api.error.response');
        }
        return defaultMessage;
      }
      if (error.type == DioExceptionType.receiveTimeout) {
        return IntlCubit.translateStatic('shared.api.error.receiveTimeout');
      }
      if (error.type == DioExceptionType.sendTimeout) {
        return IntlCubit.translateStatic('shared.api.error.sendTimeout');
      }
      return defaultMessage;
    } else {
      return defaultMessage;
    }
  }
}

/// Class that describes model of expected error
///
/// * **[expectedStatus]** - Status of error
/// * **[errorHandleMessage]** - Message which will be displayed in response of this error
/// * Optional [expectedMessage] - Message of error
class AppExpectedError {
  AppExpectedError(this.expectedStatus, this.errorHandleMessage,
      {this.expectedMessage});

  int expectedStatus;
  String? expectedMessage;
  String errorHandleMessage;
}
