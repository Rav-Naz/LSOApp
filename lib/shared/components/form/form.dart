import 'package:flutter/material.dart';
import 'package:lsoapp/shared/components/form/bloc/form_state_bloc.dart';
import 'package:lsoapp/shared/extensions/read_or_null_extension.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';

class AppFormBuilder extends StatelessWidget {
  final VoidCallback? onChanged;
  final WillPopCallback? onWillPop;
  final Widget Function(AppFormState appFormState) child;

  final AutovalidateMode? autovalidateMode;
  final Map<String, dynamic> initialValue;

  final bool skipDisabled;
  final bool? enabled;
  final bool clearValueOnUnregister;
  final double maxWidth;
  final GlobalKey<FormBuilderState> formKey;

  const AppFormBuilder({
    super.key,
    required this.formKey,
    required this.child,
    this.onChanged,
    this.autovalidateMode,
    this.onWillPop,
    this.maxWidth = double.infinity,
    this.initialValue = const <String, dynamic>{},
    this.skipDisabled = false,
    this.enabled,
    this.clearValueOnUnregister = false,
  });
  @override
  Widget build(BuildContext context) {
    var appFormStateBloc = context.readOrNull<AppFormStateBloc>();
    Widget formBuilder = BlocBuilder<AppFormStateBloc, AppFormState>(
      bloc: appFormStateBloc,
      builder: (context, state) {
        return ConstrainedBox(
          constraints: BoxConstraints(maxWidth: maxWidth),
          child: FormBuilder(
            key: formKey,
            autovalidateMode: autovalidateMode,
            clearValueOnUnregister: clearValueOnUnregister,
            enabled: enabled ?? state.stage != const AppFormStateStageLoading(),
            initialValue: initialValue,
            onChanged: () {
              onChanged?.call();
              var isValid = formKey.currentState?.isValid;
              if (isValid != null) {
                context
                    .read<AppFormStateBloc>()
                    .add(AppFormValidChanged(isValid));
              }
            },
            onWillPop: onWillPop,
            skipDisabled: skipDisabled,
            child: child(state),
          ),
        );
      },
    );
    if (appFormStateBloc != null) {
      return formBuilder;
    } else {
      return BlocProvider(
        create: (context) => AppFormStateBloc(),
        child: formBuilder,
      );
    }
  }
}
