import 'package:flutter/material.dart';
import 'package:lsoapp/shared/cubits/intl_cubit.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

extension AppTranslateExtension on BuildContext {
  String translate(String identifier) =>
      watch<IntlCubit>().translate(identifier);
}
