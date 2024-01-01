import 'package:flutter/material.dart';
import 'package:lsoapp/shared/components/button.dart';
import 'package:lsoapp/shared/components/form/bloc/form_state_bloc.dart';
import 'package:lsoapp/shared/components/form/form.dart';
import 'package:lsoapp/shared/components/form/form_fields.dart';
import 'package:lsoapp/shared/cubits/intl_cubit.dart';
import 'package:lsoapp/shared/cubits/theme_mode_cubit.dart';
import 'package:lsoapp/shared/extensions/intl_extension.dart';
import 'package:lsoapp/shared/extensions/theme_extenstion.dart';
import 'package:lsoapp/shared/icons.dart';
import 'package:lsoapp/views/details_page.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:go_router/go_router.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.title});

  final String title;
  static const String route = "/home";

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
      if (_counter.isEven) {
        context.read<ThemeModeCubit>().setDarkMode();
      } else {
        context.read<ThemeModeCubit>().setLightMode();
      }
      var newLang =
          IntlCubit.getLocaleByCountryCode(_counter.isEven ? "pl_PL" : "en_US");
      if (newLang != null) {
        context.read<IntlCubit>().loadLanguage(newLang);
      }
    });
  }

  final _formKey = GlobalKey<FormBuilderState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.theme.appColors.background,
      appBar: AppBar(
        backgroundColor: context.theme.appColors.primary,
        title: Text(
          widget.title,
          style: context.theme.appTypos.title,
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Text(
                context.translate("views.main"),
              ),
              Text('$_counter', style: context.theme.appTypos.title),
              TextButton(
                  onPressed: () {
                    GoRouter.of(context).goNamed(DetailsPage.route);
                  },
                  child: Text('Details Page')),
              AppFormBuilder(
                formKey: _formKey,
                child: (appFormState) => Column(
                  children: [
                    AppTextField(
                      name: 'email',
                      label: "ASASDASD",
                      isObligatory: true,
                      autovalidateMode: AutovalidateMode.disabled,
                      validator: (p0) => InputValidators.isValidEmail(p0),
                    ),
                    const SizedBox(height: 10),
                    AppButton(
                      text: "Login",
                      customIcon: CustomIcons.check,
                      onPressed: () {
                        _formKey.currentContext?.read<AppFormStateBloc>().add(
                            AppFormStageChanged(
                                const AppFormStateStageLoading()));
                        Future.delayed(
                          const Duration(seconds: 2),
                          () {
                            _formKey.currentContext
                                ?.read<AppFormStateBloc>()
                                .add(AppFormStageChanged(
                                    const AppFormStateStageError()));
                          },
                        );
                      },
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}
