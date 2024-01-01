import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ThemeModeCubit extends Cubit<ThemeMode> {
  ThemeModeCubit() : super(ThemeMode.system);

  void setSystemMode() => emit(ThemeMode.system);
  void setLightMode() => emit(ThemeMode.light);
  void setDarkMode() => emit(ThemeMode.dark);
  void switchMode() =>
      emit(state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark);
}
