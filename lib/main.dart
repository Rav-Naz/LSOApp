import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lsoapp/shared/cubits/intl_cubit.dart';
import 'package:lsoapp/shared/cubits/theme_mode_cubit.dart';
import 'package:lsoapp/shared/extensions/theme_extenstion.dart';
import 'package:lsoapp/shared/router.dart';
import 'package:lsoapp/shared/themes.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_strategy/url_strategy.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  setPathUrlStrategy();

  /// Load language
  await IntlCubit.prepareLanguage();
  runApp(const App());
}

class App extends StatelessWidget {
  const App({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    var router = AppRouter().router;
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => ThemeModeCubit(),
        ),
        BlocProvider(
          lazy: false,
          create: (context) => IntlCubit(),
        )
      ],
      child: BlocBuilder<ThemeModeCubit, ThemeMode>(
        builder: (context, currentThemeMode) {
          return AnnotatedRegion(
            value: SystemUiOverlayStyle(
                systemNavigationBarColor: context.theme.appColors.background,
                systemNavigationBarIconBrightness:
                    currentThemeMode == ThemeMode.light
                        ? Brightness.dark
                        : Brightness.light,
                statusBarColor: Colors.transparent,
                statusBarIconBrightness: currentThemeMode == ThemeMode.light
                    ? Brightness.dark
                    : Brightness.light),
            child: MaterialApp.router(
              /// Router configuration
              routeInformationProvider: router.routeInformationProvider,
              routeInformationParser: router.routeInformationParser,
              routerDelegate: router.routerDelegate,
              debugShowCheckedModeBanner: false,
              theme: AppTheme.light,
              darkTheme: AppTheme.dark,
              themeMode: currentThemeMode,
            ),
          );
        },
      ),
    );
  }
}
