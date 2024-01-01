import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lsoapp/shared/cubits/intl_cubit.dart';
import 'package:lsoapp/shared/extensions/theme_extenstion.dart';
import 'package:flutter/gestures.dart';
import 'package:lsoapp/shared/themes.dart';
import 'package:lsoapp/shared/utils.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'dart:ui' as ui;

import 'package:intl/intl.dart';

class AppFormFieldDecoration extends InputDecoration {
  AppFormFieldDecoration(Type inputType, BuildContext context, String name,
      Color stateColor, String? errorText, bool isFocused, bool isObligatory)
      : super(
          label: AnimatedDefaultTextStyle(
            duration: const Duration(milliseconds: 150),
            style: context.theme.appTypos.input.copyWith(
                color: stateColor, fontSize: isFocused ? 19 : null, height: 1),
            child: RichText(
                text: TextSpan(children: [
              WidgetSpan(
                  child: Text([AppTextField, AppDropdown].contains(inputType)
                      ? name
                      : "")),
              if (![AppCheckbox, AppSwitch].contains(inputType) && isObligatory)
                WidgetSpan(
                    child: Text(
                  " *",
                  style: TextStyle(color: context.theme.appColors.error),
                )),
            ])),
          ),
          counterStyle: context.theme.appTypos.body.copyWith(color: stateColor),
          isCollapsed: [AppCheckbox, AppSlider].contains(inputType),
          // alignLabelWithHint: true,
          error: errorText != null
              ? Transform.translate(
                  offset: [AppCheckbox].contains(inputType)
                      ? const Offset(5, -5)
                      : Offset.zero,
                  child: Text(
                    errorText,
                    style: context.theme.appTypos.body.copyWith(
                        color: context.theme.appColors.error, height: 1.5),
                  ),
                )
              : null,
          errorMaxLines: 2,
          border: InputBorder.none,
          focusedBorder: [AppTextField, AppDropdown].contains(inputType)
              ? OutlineInputBorder(
                  borderSide: BorderSide(
                      color: context.theme.appColors.primary, width: 1.5))
              : null,
          enabledBorder: [AppTextField, AppDropdown].contains(inputType)
              ? OutlineInputBorder(
                  borderSide: BorderSide(
                      color: context.theme.appColors.text, width: 1.5))
              : null,
          disabledBorder: [AppTextField, AppDropdown].contains(inputType)
              ? OutlineInputBorder(
                  borderSide: BorderSide(
                      color: context.theme.appColors.text.withOpacity(0.7),
                      width: 1.5))
              : null,
          errorBorder: [AppTextField, AppDropdown].contains(inputType)
              ? OutlineInputBorder(
                  borderSide: BorderSide(
                      color: context.theme.appColors.error, width: 1.5))
              : null,
          focusedErrorBorder: [AppTextField, AppDropdown].contains(inputType)
              ? OutlineInputBorder(
                  borderSide: BorderSide(
                      color: context.theme.appColors.error, width: 1.5))
              : null,
        );
}

// ignore: must_be_immutable
class AppFieldOperator<T> extends StatelessWidget {
  AppFieldOperator({
    super.key,
    required this.onValidateStream,
    required this.hasFocusStream,
    required this.currentValueStream,
    required this.enabled,
    required this.builder,
    required this.validator,
    required this.inputType,
  });
  bool dirty = false;
  bool touched = false;
  final Stream<bool> onValidateStream;
  final Stream<bool> hasFocusStream;
  final Stream<T?> currentValueStream;
  final bool enabled;
  final Type inputType;
  final Widget Function(Color statusColor, String? errorText, bool isFocused)
      builder;
  final String? Function(T?)? validator;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Opacity(
        opacity: enabled ? 1.0 : 0.3,
        child: StreamBuilder<bool>(
            stream: onValidateStream,
            initialData: false,
            builder: (context, validate) {
              return StreamBuilder<bool>(
                  stream: hasFocusStream,
                  initialData: false,
                  builder: (context, isFocused) {
                    if (!dirty && touched && !isFocused.data!) {
                      dirty = true;
                    }
                    if (isFocused.data!) {
                      touched = true;
                      if (inputType == AppCheckbox) {
                        dirty = true;
                      }
                    }
                    return StreamBuilder<T?>(
                        stream: currentValueStream,
                        builder: (context, inputValue) {
                          String? errorText = touched && dirty || validate.data!
                              ? validator?.call(inputValue.data)
                              : null;
                          Color stateColor = !enabled
                              ? context.theme.appColors.text.withOpacity(0.7)
                              : errorText != null
                                  ? context.theme.appColors.error
                                  : isFocused.data!
                                      ? context.theme.appColors.primary
                                      : context.theme.appColors.text;

                          return builder(
                              stateColor, errorText, isFocused.data ?? false);
                        });
                  });
            }),
      ),
    );
  }
}

class AppTextField extends StatefulWidget {
  final String name;
  final String? label;
  final String? Function(String?)? validator;
  final InputDecoration? decoration;
  final void Function(String?)? onChanged;
  final String? Function(String?)? valueTransformer;
  final bool enabled;
  final void Function(String?)? onSaved;
  final AutovalidateMode autovalidateMode;
  final void Function()? onReset;
  final FocusNode? focusNode;
  final String? restorationId;
  final String? initialValue;
  final bool readOnly;
  final int? maxLines;
  final bool obscureText;
  final TextCapitalization textCapitalization;
  final EdgeInsets scrollPadding;
  final bool enableInteractiveSelection;
  final MaxLengthEnforcement? maxLengthEnforcement;
  final TextAlign textAlign;
  final bool autofocus;
  final bool autocorrect;
  final double cursorWidth;
  final double? cursorHeight;
  final TextInputType? keyboardType;
  final TextStyle? style;
  final TextEditingController? controller;
  final TextInputAction? textInputAction;
  final StrutStyle? strutStyle;
  final ui.TextDirection? textDirection;
  final int? maxLength;
  final VoidCallback? onEditingComplete;
  final ValueChanged<String?>? onSubmitted;
  final List<TextInputFormatter>? inputFormatters;
  final Radius? cursorRadius;
  final Color? cursorColor;
  final Brightness? keyboardAppearance;
  final InputCounterWidgetBuilder? buildCounter;
  final bool expands;
  final bool isObligatory;
  final int? minLines;
  final bool? showCursor;
  final GestureTapCallback? onTap;
  final TapRegionCallback? onTapOutside;
  final bool enableSuggestions;
  final TextAlignVertical? textAlignVertical;
  final DragStartBehavior dragStartBehavior;
  final ScrollController? scrollController;
  final ScrollPhysics? scrollPhysics;
  final ui.BoxWidthStyle selectionWidthStyle;
  final SmartDashesType? smartDashesType;
  final SmartQuotesType? smartQuotesType;
  final ui.BoxHeightStyle selectionHeightStyle;
  final Iterable<String>? autofillHints;
  final String obscuringCharacter;
  final MouseCursor? mouseCursor;
  final EditableTextContextMenuBuilder? contextMenuBuilder;
  final TextMagnifierConfiguration? magnifierConfiguration;
  final ContentInsertionConfiguration? contentInsertionConfiguration;

  const AppTextField({
    super.key,
    required this.name,
    this.label,
    this.validator,
    this.decoration,
    this.onChanged,
    this.valueTransformer,
    this.enabled = true,
    this.onSaved,
    this.autovalidateMode = AutovalidateMode.disabled,
    this.onReset,
    this.focusNode,
    this.restorationId,
    this.initialValue,
    this.readOnly = false,
    this.isObligatory = false,
    this.maxLines,
    this.obscureText = false,
    this.textCapitalization = TextCapitalization.none,
    this.scrollPadding = const EdgeInsets.all(20.0),
    this.enableInteractiveSelection = true,
    this.maxLengthEnforcement,
    this.textAlign = TextAlign.start,
    this.autofocus = false,
    this.autocorrect = true,
    this.cursorWidth = 2.0,
    this.cursorHeight,
    this.keyboardType,
    this.style,
    this.controller,
    this.textInputAction,
    this.strutStyle,
    this.textDirection,
    this.maxLength,
    this.onEditingComplete,
    this.onSubmitted,
    this.inputFormatters,
    this.cursorRadius,
    this.cursorColor,
    this.keyboardAppearance,
    this.buildCounter,
    this.expands = false,
    this.minLines,
    this.showCursor,
    this.onTap,
    this.onTapOutside,
    this.enableSuggestions = false,
    this.textAlignVertical,
    this.dragStartBehavior = DragStartBehavior.start,
    this.scrollController,
    this.scrollPhysics,
    this.selectionWidthStyle = ui.BoxWidthStyle.tight,
    this.smartDashesType,
    this.smartQuotesType,
    this.selectionHeightStyle = ui.BoxHeightStyle.tight,
    this.autofillHints,
    this.obscuringCharacter = '•',
    this.mouseCursor,
    this.contextMenuBuilder,
    this.magnifierConfiguration,
    this.contentInsertionConfiguration,
  });

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  final _debouncer = Debouncer(milliseconds: 200);
  final FocusNode _focus = FocusNode();
  final onValidate = StreamController<bool>();
  final hasFocus = StreamController<bool>();
  final currentValue = StreamController<String?>();

  @override
  void initState() {
    currentValue.add(widget.initialValue);
    _focus.addListener(_onFocusChange);
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
    _focus.removeListener(_onFocusChange);
    _focus.dispose();
  }

  void _onFocusChange() {
    hasFocus.add(_focus.hasFocus);
  }

  @override
  Widget build(BuildContext context) {
    return AppFieldOperator(
      inputType: AppTextField,
      onValidateStream: onValidate.stream,
      hasFocusStream: hasFocus.stream,
      currentValueStream: currentValue.stream,
      enabled: widget.enabled,
      validator: widget.validator,
      builder: (stateColor, errorText, isFocused) {
        return FormBuilderTextField(
          name: widget.name,
          validator: widget.validator,
          decoration: widget.decoration ??
              AppFormFieldDecoration(
                  AppTextField,
                  context,
                  widget.label ?? widget.name,
                  stateColor,
                  errorText,
                  isFocused,
                  widget.isObligatory),
          onChanged: (value) {
            widget.onChanged?.call(value);
            _debouncer.run(() {
              currentValue.add((value?.isEmpty ?? true) ? null : value);
            });
          },
          valueTransformer: widget.valueTransformer,
          enabled: widget.enabled,
          onSaved: (newValue) {
            widget.onSaved?.call(newValue);
            onValidate.add(true);
          },
          autovalidateMode: widget.autovalidateMode,
          onReset: widget.onReset,
          focusNode: widget.focusNode ?? _focus,
          restorationId: widget.restorationId,
          initialValue: widget.initialValue,
          readOnly: widget.readOnly,
          maxLines: widget.maxLines ?? 1,
          obscureText: widget.obscureText,
          textCapitalization: widget.textCapitalization,
          scrollPadding: widget.scrollPadding,
          enableInteractiveSelection: widget.enableInteractiveSelection,
          maxLengthEnforcement: widget.maxLengthEnforcement,
          textAlign: widget.textAlign,
          autofocus: widget.autofocus,
          autocorrect: widget.autocorrect,
          cursorWidth: widget.cursorWidth,
          cursorHeight: widget.cursorHeight,
          keyboardType: widget.keyboardType,
          style: widget.style,
          controller: widget.controller,
          textInputAction: widget.textInputAction,
          strutStyle: widget.strutStyle,
          textDirection: widget.textDirection,
          maxLength: widget.maxLength,
          onEditingComplete: widget.onEditingComplete,
          onSubmitted: widget.onSubmitted,
          inputFormatters: widget.inputFormatters,
          cursorRadius: widget.cursorRadius,
          cursorColor: widget.cursorColor,
          keyboardAppearance: widget.keyboardAppearance,
          buildCounter: widget.buildCounter,
          expands: widget.expands,
          minLines: widget.minLines,
          showCursor: widget.showCursor,
          onTap: widget.onTap,
          onTapOutside: widget.onTapOutside,
          enableSuggestions: widget.enableSuggestions,
          textAlignVertical: widget.textAlignVertical,
          dragStartBehavior: widget.dragStartBehavior,
          scrollController: widget.scrollController,
          scrollPhysics: widget.scrollPhysics,
          selectionWidthStyle: widget.selectionWidthStyle,
          smartDashesType: widget.smartDashesType,
          smartQuotesType: widget.smartQuotesType,
          selectionHeightStyle: widget.selectionHeightStyle,
          autofillHints: widget.autofillHints,
          obscuringCharacter: widget.obscuringCharacter,
          mouseCursor: widget.mouseCursor,
          contextMenuBuilder: widget.contextMenuBuilder,
          magnifierConfiguration: widget.magnifierConfiguration,
          contentInsertionConfiguration: widget.contentInsertionConfiguration,
        );
      },
    );
  }
}

class AppCheckbox extends StatelessWidget {
  final Key? key;
  final String name;
  final String? label;
  final String? Function(bool?)? validator;
  final bool? initialValue;
  final InputDecoration? decoration;
  final ValueChanged<bool?>? onChanged;
  final ValueTransformer<bool?>? valueTransformer;
  final bool enabled;
  final FormFieldSetter<bool?>? onSaved;
  final AutovalidateMode autovalidateMode;
  final VoidCallback? onReset;
  final FocusNode? focusNode;
  final bool isObligatory;
  final String? restorationId;
  final Widget? title;
  final Color? activeColor;
  final bool autofocus;
  final Color? checkColor;
  final EdgeInsets contentPadding;
  final ListTileControlAffinity controlAffinity;
  final Widget? secondary;
  final bool selected;
  final Widget? subtitle;
  final bool tristate;
  final OutlinedBorder? shape;
  final BorderSide? side;

  AppCheckbox({
    this.key,
    required this.name,
    this.label,
    this.validator,
    this.initialValue,
    this.decoration,
    this.onChanged,
    this.valueTransformer,
    this.enabled = true,
    this.isObligatory = false,
    this.onSaved,
    this.autovalidateMode = AutovalidateMode.disabled,
    this.onReset,
    this.focusNode,
    this.restorationId,
    this.title,
    this.activeColor,
    this.autofocus = false,
    this.checkColor,
    this.contentPadding = EdgeInsets.zero,
    this.controlAffinity = ListTileControlAffinity.leading,
    this.secondary,
    this.selected = false,
    this.subtitle,
    this.tristate = false,
    this.shape,
    this.side,
  });

  final onValidate = StreamController<bool>();

  final hasFocus = StreamController<bool>();

  final currentValue = StreamController<bool?>();

  @override
  Widget build(BuildContext context) {
    return AppFieldOperator<bool>(
        inputType: AppCheckbox,
        onValidateStream: onValidate.stream,
        hasFocusStream: hasFocus.stream,
        currentValueStream: currentValue.stream,
        enabled: enabled,
        validator: validator,
        builder: (stateColor, errorText, isFocused) {
          return FormBuilderCheckbox(
            key: key,
            name: name,
            validator: validator,
            initialValue: initialValue,
            decoration: decoration ??
                AppFormFieldDecoration(AppCheckbox, context, name, stateColor,
                    errorText, isFocused, isObligatory),
            onChanged: (value) {
              onChanged?.call(value);
              currentValue.add(value);
              hasFocus.add(value ?? true);
            },
            valueTransformer: valueTransformer,
            enabled: enabled,
            onSaved: (newValue) {
              onSaved?.call(newValue);
              onValidate.add(true);
            },
            autovalidateMode: autovalidateMode,
            onReset: onReset,
            focusNode: focusNode,
            restorationId: restorationId,
            title: Transform.translate(
              offset: const Offset(-10, 0),
              child: title ??
                  RichText(
                      text: TextSpan(
                          style: context.theme.appTypos.input,
                          children: [
                        WidgetSpan(
                            child: Text(
                          label ?? name,
                          style: context.theme.appTypos.input,
                        )),
                        if (isObligatory)
                          WidgetSpan(
                              child: Text(
                            " *",
                            style:
                                TextStyle(color: context.theme.appColors.error),
                          )),
                      ])),
            ),
            activeColor: context.theme.appColors.primary,
            autofocus: autofocus,
            checkColor: AppTheme.darkColors.text,
            contentPadding: contentPadding,
            controlAffinity: controlAffinity,
            secondary: secondary,
            selected: selected,
            subtitle: subtitle,
            tristate: tristate,
            shape: shape,
            side: side ??
                BorderSide(width: 1.5, color: context.theme.appColors.text),
          );
        });
  }
}

class AppDateTimePicker extends StatefulWidget {
  final String? Function(DateTime?)? validator;
  final String name;
  final String? label;
  final DateTime? initialValue;
  final InputDecoration? decoration;
  final void Function(DateTime?)? onChanged;
  final dynamic Function(DateTime?)? valueTransformer;
  final bool enabled;
  final void Function(DateTime?)? onSaved;
  final AutovalidateMode? autovalidateMode;
  final void Function()? onReset;
  final FocusNode? focusNode;
  final bool isObligatory;

  final String? restorationId;

  /// The date/time picker dialogs to show.
  final InputType inputType;

  final DateFormat? format;

  final DateTime? initialDate;

  final DateTime? firstDate;

  /// The latest choosable date. Defaults to 2100.
  final DateTime? lastDate;

  final DateTime? currentDate;

  final TimeOfDay initialTime;

  @Deprecated(
      'This property is no used anymore. Please use decoration.suffixIcon to set your desired icon')
  final Widget? resetIcon;

  /// [DatePickerMode.day].
  final DatePickerMode initialDatePickerMode;

  final Locale? locale;

  final ui.TextDirection? textDirection;

  final bool useRootNavigator;

  final ValueChanged<DateTime?>? onFieldSubmitted;
  final TextEditingController? controller;
  final TextInputType keyboardType;
  final TextStyle? style;
  final TextAlign textAlign;
  final TextAlignVertical? textAlignVertical;

  final bool autofocus;
  final bool obscureText;
  final bool autocorrect;
  final MaxLengthEnforcement maxLengthEnforcement;
  final int? maxLines;
  final int? maxLength;
  final List<TextInputFormatter>? inputFormatters;
  final TransitionBuilder? transitionBuilder;

  final bool showCursor;

  final int? minLines;

  final bool expands;

  final TextInputAction? textInputAction;

  final VoidCallback? onEditingComplete;

  final InputCounterWidgetBuilder? buildCounter;
  final MouseCursor? mouseCursor;

  final Radius? cursorRadius;
  final Color? cursorColor;
  final Brightness? keyboardAppearance;
  final EdgeInsets scrollPadding;
  final bool enableInteractiveSelection;

  final double cursorWidth;
  final TextCapitalization textCapitalization;

  final String? cancelText;
  final String? confirmText;
  final String? errorFormatText;
  final String? errorInvalidText;
  final String? fieldHintText;
  final String? fieldLabelText;
  final String? helpText;
  final DatePickerEntryMode initialEntryMode;
  final RouteSettings? routeSettings;

  final TimePickerEntryMode timePickerInitialEntryMode;
  final StrutStyle? strutStyle;
  final SelectableDayPredicate? selectableDayPredicate;
  final Offset? anchorPoint;
  final EntryModeChangeCallback? onEntryModeChanged;

  const AppDateTimePicker({
    super.key,
    required this.name,
    this.label,
    this.validator,
    this.initialValue,
    this.decoration,
    this.onChanged,
    this.valueTransformer,
    this.enabled = true,
    this.onSaved,
    this.autovalidateMode = AutovalidateMode.disabled,
    this.onReset,
    this.focusNode,
    this.restorationId,
    this.inputType = InputType.both,
    this.scrollPadding = const EdgeInsets.all(20.0),
    this.cursorWidth = 2.0,
    this.enableInteractiveSelection = true,
    this.resetIcon = const Icon(Icons.close),
    this.initialTime = const TimeOfDay(hour: 12, minute: 0),
    this.keyboardType = TextInputType.text,
    this.textAlign = TextAlign.start,
    this.autofocus = false,
    this.obscureText = false,
    this.autocorrect = true,
    this.maxLines = 1,
    this.expands = false,
    this.isObligatory = false,
    this.initialDatePickerMode = DatePickerMode.day,
    this.transitionBuilder,
    this.textCapitalization = TextCapitalization.none,
    this.useRootNavigator = true,
    this.initialEntryMode = DatePickerEntryMode.calendar,
    this.timePickerInitialEntryMode = TimePickerEntryMode.dial,
    this.format,
    this.initialDate,
    this.firstDate,
    this.lastDate,
    this.currentDate,
    this.locale,
    this.maxLength,
    this.textDirection,
    this.textAlignVertical,
    this.onFieldSubmitted,
    this.controller,
    this.style,
    this.maxLengthEnforcement = MaxLengthEnforcement.none,
    this.inputFormatters,
    this.showCursor = false,
    this.minLines,
    this.textInputAction,
    this.onEditingComplete,
    this.buildCounter,
    this.mouseCursor,
    this.cursorRadius,
    this.cursorColor,
    this.keyboardAppearance,
    this.cancelText,
    this.confirmText,
    this.errorFormatText,
    this.errorInvalidText,
    this.fieldHintText,
    this.fieldLabelText,
    this.helpText,
    this.routeSettings,
    this.strutStyle,
    this.selectableDayPredicate,
    this.anchorPoint,
    this.onEntryModeChanged,
  });

  @override
  State<AppDateTimePicker> createState() => _AppDateTimePickerState();
}

class _AppDateTimePickerState extends State<AppDateTimePicker> {
  final _debouncer = Debouncer(milliseconds: 200);
  final FocusNode _focus = FocusNode();
  final onValidate = StreamController<bool>();
  final hasFocus = StreamController<bool>();
  final currentValue = StreamController<DateTime?>();

  @override
  void initState() {
    currentValue.add(widget.initialValue);
    _focus.addListener(_onFocusChange);
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
    _focus.removeListener(_onFocusChange);
    _focus.dispose();
  }

  void _onFocusChange() {
    hasFocus.add(_focus.hasFocus);
  }

  @override
  Widget build(BuildContext context) {
    return AppFieldOperator<DateTime>(
        inputType: AppTextField,
        onValidateStream: onValidate.stream,
        hasFocusStream: hasFocus.stream,
        currentValueStream: currentValue.stream,
        enabled: widget.enabled,
        validator: widget.validator,
        builder: (stateColor, errorText, isFocused) {
          return FormBuilderDateTimePicker(
            name: widget.name,
            textDirection: widget.textDirection,
            textAlign: widget.textAlign,
            textAlignVertical: widget.textAlignVertical,
            maxLength: widget.maxLength,
            autofocus: widget.autofocus,
            autocorrect: widget.autocorrect,
            anchorPoint: widget.anchorPoint,
            autovalidateMode: widget.autovalidateMode,
            cancelText: widget.cancelText,
            confirmText: widget.confirmText,
            controller: widget.controller,
            currentDate: widget.currentDate,
            decoration: widget.decoration ??
                AppFormFieldDecoration(
                    AppTextField,
                    context,
                    widget.label ?? widget.name,
                    stateColor,
                    errorText,
                    isFocused,
                    widget.isObligatory),
            initialDatePickerMode: widget.initialDatePickerMode,
            initialEntryMode: widget.initialEntryMode,
            initialTime: widget.initialTime,
            initialValue: widget.initialValue,
            inputType: widget.inputType,
            enabled: widget.enabled,
            errorFormatText: widget.errorFormatText,
            errorInvalidText: widget.errorInvalidText,
            fieldHintText: widget.fieldHintText,
            fieldLabelText: widget.fieldLabelText,
            firstDate: widget.firstDate,
            focusNode: widget.focusNode,
            format: widget.format,
            helpText: widget.helpText,
            initialDate: widget.initialDate,
            inputFormatters: widget.inputFormatters,
            keyboardType: widget.keyboardType,
            maxLines: widget.maxLines,
            obscureText: widget.obscureText,
            showCursor: widget.showCursor,
            minLines: widget.minLines,
            expands: widget.expands,
            style: widget.style,
            onEditingComplete: widget.onEditingComplete,
            buildCounter: widget.buildCounter,
            mouseCursor: widget.mouseCursor,
            cursorColor: widget.cursorColor,
            cursorRadius: widget.cursorRadius,
            cursorWidth: widget.cursorWidth,
            enableInteractiveSelection: widget.enableInteractiveSelection,
            keyboardAppearance: widget.keyboardAppearance,
            scrollPadding: widget.scrollPadding,
            strutStyle: widget.strutStyle,
            textCapitalization: widget.textCapitalization,
            textInputAction: widget.textInputAction,
            maxLengthEnforcement: widget.maxLengthEnforcement,
            lastDate: widget.lastDate,
            locale: widget.locale,
            onChanged: (value) {
              widget.onChanged?.call(value);
              _debouncer.run(() {
                currentValue.add(value);
              });
            },
            onEntryModeChanged: widget.onEntryModeChanged,
            onFieldSubmitted: widget.onFieldSubmitted,
            onReset: widget.onReset,
            onSaved: (newValue) {
              widget.onSaved?.call(newValue);
              onValidate.add(true);
            },
            resetIcon: widget.resetIcon,
            restorationId: widget.restorationId,
            routeSettings: widget.routeSettings,
            selectableDayPredicate: widget.selectableDayPredicate,
            timePickerInitialEntryMode: widget.timePickerInitialEntryMode,
            transitionBuilder: widget.transitionBuilder,
            useRootNavigator: widget.useRootNavigator,
            validator: widget.validator,
            valueTransformer: widget.valueTransformer,
          );
        });
  }
}

class AppDropdown<T> extends StatefulWidget {
  final Key? key;
  final String name;
  final String? label;
  final String? Function(T?)? validator;
  final T? initialValue;
  final InputDecoration? decoration;
  final void Function(T?)? onChanged;
  final T? Function(T?)? valueTransformer;
  final bool enabled;
  final void Function(T?)? onSaved;
  final AutovalidateMode autovalidateMode;
  final void Function()? onReset;
  final FocusNode? focusNode;
  final String? restorationId;
  final List<DropdownMenuItem<T>> items;
  final bool isExpanded;
  final bool isDense;
  final int elevation;
  final double iconSize;
  final TextStyle? style;
  final Widget? disabledHint;
  final Widget? icon;
  final Color? iconDisabledColor;
  final Color? iconEnabledColor;
  final VoidCallback? onTap;
  final bool autofocus;
  final bool isObligatory;
  final Color? dropdownColor;
  final Color? focusColor;
  final double? itemHeight;
  final DropdownButtonBuilder? selectedItemBuilder;
  final double? menuMaxHeight;
  final bool? enableFeedback;
  final AlignmentGeometry alignment;
  final BorderRadius? borderRadius;

  AppDropdown({
    required this.name,
    required this.items,
    this.key,
    this.validator,
    this.initialValue,
    this.decoration,
    this.onChanged,
    this.valueTransformer,
    this.enabled = true,
    this.onSaved,
    this.autovalidateMode = AutovalidateMode.disabled,
    this.onReset,
    this.focusNode,
    this.restorationId,
    this.isExpanded = true,
    this.isDense = true,
    this.isObligatory = false,
    this.elevation = 8,
    this.iconSize = 24.0,
    this.style,
    this.disabledHint,
    this.icon,
    this.iconDisabledColor,
    this.iconEnabledColor,
    this.onTap,
    this.autofocus = false,
    this.dropdownColor,
    this.focusColor,
    this.itemHeight,
    this.selectedItemBuilder,
    this.menuMaxHeight,
    this.enableFeedback,
    this.alignment = AlignmentDirectional.centerStart,
    this.borderRadius,
    this.label,
  });

  @override
  State<AppDropdown<T>> createState() => _AppDropdownState<T>();
}

class _AppDropdownState<T> extends State<AppDropdown<T>> {
  final FocusNode _focus = FocusNode();
  final onValidate = StreamController<bool>();
  final hasFocus = StreamController<bool>();
  final currentValue = StreamController<T?>.broadcast();
  final textFieldKey = GlobalKey<FormBuilderFieldState>();
  @override
  void initState() {
    currentValue.add(widget.initialValue);
    _focus.addListener(_onFocusChange);
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
    _focus.removeListener(_onFocusChange);
    _focus.dispose();
  }

  void _onFocusChange() {
    hasFocus.add(_focus.hasFocus);
  }

  @override
  Widget build(BuildContext context) {
    onChanged(value) {
      widget.onChanged?.call(value);
      currentValue.add(value);
    }

    return AppFieldOperator<T>(
        inputType: AppDropdown,
        onValidateStream: onValidate.stream,
        hasFocusStream: hasFocus.stream,
        currentValueStream: currentValue.stream,
        enabled: widget.enabled && widget.items.isNotEmpty,
        validator: widget.validator,
        builder: (stateColor, errorText, isFocused) {
          return FormBuilderDropdown(
            name: widget.name,
            items: widget.items,
            alignment: widget.alignment,
            autofocus: widget.autofocus,
            autovalidateMode: widget.autovalidateMode,
            borderRadius: widget.borderRadius,
            decoration: widget.decoration ??
                AppFormFieldDecoration(AppDropdown, context, widget.name,
                    stateColor, errorText, isFocused, widget.isObligatory),
            disabledHint: widget.disabledHint,
            dropdownColor: widget.dropdownColor,
            elevation: widget.elevation,
            enableFeedback: widget.enableFeedback,
            enabled: widget.enabled,
            focusColor: widget.focusColor,
            focusNode: widget.focusNode ?? _focus,
            icon: widget.icon ??
                StreamBuilder(
                  stream: currentValue.stream,
                  builder: (context, snapshot) {
                    if (snapshot.data != null) {
                      return IconButton(
                          padding: EdgeInsets.zero,
                          onPressed: () =>
                              textFieldKey.currentState?.didChange(null),
                          icon: const Icon(Icons.cancel));
                    }
                    return const Icon(Icons.arrow_drop_down);
                  },
                ),
            iconDisabledColor: widget.iconDisabledColor,
            iconEnabledColor: widget.iconEnabledColor,
            iconSize: widget.iconSize,
            initialValue: widget.initialValue,
            isDense: widget.isDense,
            isExpanded: widget.isExpanded,
            itemHeight: widget.itemHeight,
            key: widget.key ?? textFieldKey,
            menuMaxHeight: widget.menuMaxHeight,
            onChanged: onChanged,
            onReset: widget.onReset,
            onSaved: (newValue) {
              widget.onSaved?.call(newValue);
              onValidate.add(true);
            },
            onTap: widget.onTap,
            restorationId: widget.restorationId,
            selectedItemBuilder: widget.selectedItemBuilder,
            style: widget.style,
            validator: widget.validator,
            valueTransformer: widget.valueTransformer,
          );
        });
  }
}

class AppSlider extends StatelessWidget {
  final Key? key;
  final String name;
  final FormFieldValidator<double>? validator;
  final double initialValue;
  final InputDecoration? decoration;
  final ValueChanged<double?>? onChanged;
  final ValueTransformer<double?>? valueTransformer;
  final bool enabled;
  final bool isObligatory;
  final FormFieldSetter<double>? onSaved;
  final AutovalidateMode autovalidateMode;
  final VoidCallback? onReset;
  final FocusNode? focusNode;
  final String? restorationId;
  final double min;
  final double max;
  final int? divisions;
  final Color? activeColor;
  final Color? inactiveColor;
  final ValueChanged<double>? onChangeStart;
  final ValueChanged<double>? onChangeEnd;
  final String? label;
  final SemanticFormatterCallback? semanticFormatterCallback;
  final NumberFormat? numberFormat;
  final DisplayValues? displayValues;
  final bool autofocus;
  final MouseCursor? mouseCursor;
  final Widget Function(String min)? minValueWidget;
  final Widget Function(String value)? valueWidget;
  final Widget Function(String max)? maxValueWidget;
  final onValidate = StreamController<bool>();
  final hasFocus = StreamController<bool>();
  final currentValue = StreamController<double?>();
  AppSlider({
    this.key,
    required this.name,
    this.validator,
    required this.initialValue,
    this.decoration,
    this.onChanged,
    this.valueTransformer,
    this.enabled = true,
    this.onSaved,
    this.autovalidateMode = AutovalidateMode.disabled,
    this.onReset,
    this.focusNode,
    this.restorationId,
    required this.min,
    required this.max,
    this.divisions,
    this.activeColor,
    this.inactiveColor,
    this.onChangeStart,
    this.onChangeEnd,
    this.label,
    this.semanticFormatterCallback,
    this.numberFormat,
    this.displayValues,
    this.autofocus = false,
    this.isObligatory = false,
    this.mouseCursor,
    this.maxValueWidget,
    this.minValueWidget,
    this.valueWidget,
  });
  @override
  Widget build(BuildContext context) {
    return AppFieldOperator<double>(
        inputType: AppSlider,
        onValidateStream: onValidate.stream,
        hasFocusStream: hasFocus.stream,
        currentValueStream: currentValue.stream,
        enabled: enabled,
        validator: validator,
        builder: (stateColor, errorText, isFocused) {
          return FormBuilderSlider(
            name: name,
            initialValue: initialValue,
            min: min,
            max: max,
            activeColor: activeColor ?? context.theme.appColors.primary,
            autofocus: autofocus,
            autovalidateMode: autovalidateMode,
            decoration: decoration ??
                AppFormFieldDecoration(AppSlider, context, label ?? name,
                    stateColor, errorText, isFocused, isObligatory),
            displayValues: displayValues ?? DisplayValues.current,
            divisions: divisions ?? max.toInt(),
            enabled: enabled,
            focusNode: focusNode,
            inactiveColor: inactiveColor ??
                context.theme.appColors.primary.withOpacity(0.2),
            label: label,
            maxValueWidget: maxValueWidget,
            minValueWidget: minValueWidget,
            mouseCursor: mouseCursor,
            numberFormat: numberFormat,
            onChangeEnd: onChangeEnd,
            onChangeStart: onChangeStart,
            onChanged: (value) {
              onChanged?.call(value);
              currentValue.add(value);
              hasFocus.add(true);
            },
            onReset: onReset,
            onSaved: (newValue) {
              onSaved?.call(newValue);
              onValidate.add(true);
            },
            restorationId: restorationId,
            semanticFormatterCallback: semanticFormatterCallback,
            validator: validator,
            valueTransformer: valueTransformer,
            valueWidget: valueWidget,
          );
        });
  }
}

class AppSwitch extends StatelessWidget {
  final Key? key;
  final String name;
  final String? label;
  final FormFieldValidator<bool>? validator;
  final bool? initialValue;
  final InputDecoration? decoration;
  final ValueChanged<bool?>? onChanged;
  final ValueTransformer<bool?>? valueTransformer;
  final bool enabled;
  final FormFieldSetter<bool>? onSaved;
  final AutovalidateMode autovalidateMode;
  final VoidCallback? onReset;
  final FocusNode? focusNode;
  final String? restorationId;
  final Widget? title;
  final Color? activeColor;
  final Color? activeTrackColor;
  final Color? inactiveThumbColor;
  final Color? inactiveTrackColor;
  final ImageProvider? activeThumbImage;
  final ImageProvider? inactiveThumbImage;
  final Widget? subtitle;
  final Widget? secondary;
  final ListTileControlAffinity? controlAffinity;
  final EdgeInsets contentPadding;
  final bool autofocus;
  final bool selected;
  final bool isObligatory;

  final onValidate = StreamController<bool>();
  final hasFocus = StreamController<bool>();
  final currentValue = StreamController<bool?>();

  AppSwitch({
    this.key,
    required this.name,
    this.isObligatory = false,
    this.label,
    this.title,
    this.validator,
    this.initialValue,
    this.decoration,
    this.onChanged,
    this.valueTransformer,
    this.enabled = true,
    this.onSaved,
    this.autovalidateMode = AutovalidateMode.disabled,
    this.onReset,
    this.focusNode,
    this.restorationId,
    this.activeColor,
    this.activeTrackColor,
    this.inactiveThumbColor,
    this.inactiveTrackColor,
    this.activeThumbImage,
    this.inactiveThumbImage,
    this.subtitle,
    this.secondary,
    this.controlAffinity,
    this.contentPadding = EdgeInsets.zero,
    this.autofocus = false,
    this.selected = false,
  });

  @override
  Widget build(BuildContext context) {
    return AppFieldOperator(
        inputType: AppSwitch,
        onValidateStream: onValidate.stream,
        hasFocusStream: hasFocus.stream,
        currentValueStream: currentValue.stream,
        enabled: enabled,
        validator: validator,
        builder: (stateColor, errorText, isFocused) {
          return FormBuilderSwitch(
            name: name,
            title: title ??
                AnimatedDefaultTextStyle(
                  duration: const Duration(milliseconds: 150),
                  style: context.theme.appTypos.input.copyWith(
                      color: stateColor,
                      fontSize: isFocused ? 19 : null,
                      height: 1),
                  child: RichText(
                      text: TextSpan(children: [
                    WidgetSpan(child: Text(label ?? name)),
                    if (isObligatory)
                      WidgetSpan(
                          child: Text(
                        " *",
                        style: TextStyle(color: context.theme.appColors.error),
                      )),
                  ])),
                ),
            activeColor: activeColor ?? AppTheme.lightColors.background,
            activeThumbImage: activeThumbImage,
            activeTrackColor:
                activeTrackColor ?? context.theme.appColors.primary,
            autofocus: autofocus,
            autovalidateMode: autovalidateMode,
            contentPadding: contentPadding,
            controlAffinity: controlAffinity ?? ListTileControlAffinity.leading,
            decoration: decoration ??
                AppFormFieldDecoration(AppSwitch, context, name, stateColor,
                    errorText, isFocused, true),
            enabled: enabled,
            focusNode: focusNode,
            inactiveThumbColor:
                inactiveThumbColor ?? context.theme.appColors.text,
            inactiveThumbImage: inactiveThumbImage,
            inactiveTrackColor: inactiveTrackColor ?? Colors.transparent,
            initialValue: initialValue,
            key: key,
            onChanged: (value) {
              onChanged?.call(value);
              currentValue.add(value);
            },
            onReset: onReset,
            onSaved: (newValue) {
              onSaved?.call(newValue);
              onValidate.add(true);
            },
            restorationId: restorationId,
            secondary: secondary,
            selected: selected,
            subtitle: subtitle,
            validator: validator,
            valueTransformer: valueTransformer,
          );
        });
  }
}

class InputValidators {
  /// Validator that check if string is not null and is correct email
  static String? isValidEmail(String? string, {bool canBeNull = false}) {
    if (canBeNull) {
      if (string == null || (string.isEmpty)) return null;
    } else {
      var isNull = isNotNull(string);
      if (isNull != null) {
        return isNull;
      }
    }

    final emailRegExp = RegExp(r"^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]+");
    return !emailRegExp.hasMatch(string!)
        ? IntlCubit.translateStatic("shared.components.input.valid_e-mail")
        : null;
  }

  /// Validator that check if string is not null and is correct format date
  static String? isValidDate(String? string, {bool canBeNull = false}) {
    if (canBeNull) {
      if (string == null || (string.isEmpty)) return null;
    } else {
      var isNull = isNotNull(string);
      if (isNull != null) {
        return isNull;
      }
    }
    final components = string!.split("-");
    if (components.length == 3) {
      final day = int.tryParse(components[0]);
      final month = int.tryParse(components[1]);
      final year = int.tryParse(components[2]);
      if (day != null && month != null && year != null) {
        final date = DateTime(year, month, day);
        if (date.year == year && date.month == month && date.day == day) {
          return null;
        }
      }
    }
    return IntlCubit.translateStatic("shared.components.input.valid_date");
  }

  /// Validator that check if string is not null
  static String? isNotNull(String? string) {
    return string == null || string.isEmpty || string == ""
        ? IntlCubit.translateStatic("shared.components.input.not_null")
        : null;
  }

  /// Validator that check if string is not null
  static String? isNotNullAndSameValue(String? string, String? compareString,
      {String? message}) {
    var isNull = isNotNull(string);
    if (isNull != null || string == null) {
      return isNull;
    }
    return string != compareString
        ? message ??
            IntlCubit.translateStatic("shared.components.input.same_string")
        : null;
  }

  /// Validator that check if string complete regex
  static String? customRegex(String? string, String pattern,
      {String? message, bool canBeNull = false}) {
    RegExp regex = RegExp(pattern);
    if (string == null) {
      if (canBeNull) {
        return null;
      } else {
        return IntlCubit.translateStatic("shared.components.input.not_null");
      }
    } else {
      if (!regex.hasMatch(string)) {
        return message ??
            IntlCubit.translateStatic("shared.components.input.regex");
      } else {
        return null;
      }
    }
  }

  /// Validator that check if string has appropriate number of characters
  static String? maxLength(String? string, int maxLength) {
    if (string == null) return null;
    return string.length > maxLength
        ? "${IntlCubit.translateStatic("shared.components.input.max_length")} $maxLength"
        : null;
  }

  /// Validator that check if string has appropriate number of characters
  static String? minLength(String? string, int minLength) {
    if (string == null || string.isEmpty) return null;
    return string.length < minLength
        ? "${IntlCubit.translateStatic("shared.components.input.min_length")} $minLength"
        : null;
  }

  /// Validator that check if string is not null and value has appropriate number of characters
  static String? isNotNullAndMaxLength(String? string, int maxLength) {
    var isNull = isNotNull(string);
    if (isNull != null || string == null) {
      return isNull;
    }
    return string.length > maxLength
        ? "${IntlCubit.translateStatic("shared.components.input.max_length")} $maxLength"
        : null;
  }

  /// Validator that check if string is not in list
  static String? isNotInList(String? string, List<String> list,
      {String? message}) {
    return list.contains(string)
        ? message ??
            IntlCubit.translateStatic("shared.components.input.in_list")
        : null;
  }

  /// Validator that check if string is not null and not in list
  static String? isNotNullAndNotInList(String? string, List<String> list,
      {String? message}) {
    var isNull = isNotNull(string);
    if (isNull != null || string == null) {
      return isNull;
    }
    return list.contains(string)
        ? message ??
            IntlCubit.translateStatic("shared.components.input.in_list")
        : null;
  }

  /// Validator that check if string is not null and not in list and has appropriate number of characters
  static String? isNotInListAndMaxLength(
      String? string, int maxChars, List<String> list,
      {String? message}) {
    var isInList = isNotInList(string, list, message: message);
    if (isInList != null) {
      return isInList;
    }

    return maxLength(string, maxChars);
  }

  /// Validator that check if string is not null and not in list and has appropriate number of characters
  static String? isNotNullAndNotInListAndMaxLength(
      String? string, int maxChars, List<String> list,
      {String? message}) {
    var isNull = isNotNull(string);
    if (isNull != null || string == null) {
      return isNull;
    }
    var isInList = isNotInList(string, list, message: message);
    if (isInList != null) {
      return isInList;
    }

    return maxLength(string, maxChars);
  }

  static String? isPhoneValid(String? string) {
    var isNull = isNotNull(string);
    if (isNull != null) {
      return isNull;
    }
    final phoneRegExp =
        RegExp(r"^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$");
    return !phoneRegExp.hasMatch(string!)
        ? IntlCubit.translateStatic("shared.components.input.phone_valid")
        : null;
  }

  static String? isNotGreaterThan(String? value1, String? value2, String from) {
    var isNull1 = isNotNull(value1);
    var isNull2 = isNotNull(value2);
    if (isNull1 != null) {
      return isNull1;
    }
    if (isNull2 != null) {
      return isNull2;
    }
    var num1 = double.parse(value1!);
    var num2 = double.parse(value2!);
    return num1 > num2
        ? "${IntlCubit.translateStatic("shared.components.input.greater")} $from"
        : null;
  }

  static String? isNotLowerThan(String? value1, String? value2, String from,
      {bool canBeNull = false}) {
    var isNull1 = isNotNull(value1);
    var isNull2 = isNotNull(value2);
    if (isNull1 != null) {
      return canBeNull ? null : isNull1;
    }
    if (isNull2 != null) {
      return isNull2;
    }
    var num1 = double.parse(value1!);
    var num2 = double.parse(value2!);
    return num1 < num2
        ? "${IntlCubit.translateStatic("shared.components.input.lower")} $from"
        : null;
  }

  static String? isNotPastDate(String? value,
      {DateTime? customDate, bool canBeNull = true}) {
    var validDate = isValidDate(value, canBeNull: canBeNull);
    if (validDate != null) return validDate;
    if (value == null && canBeNull) return null;
    final components = value!.split("-");

    /// If data was succesfully splitted then transform it
    if (components.length == 3) {
      final day = int.tryParse(components[0]);
      final month = int.tryParse(components[1]);
      final year = int.tryParse(components[2]);
      if (day != null && month != null && year != null) {
        final date = DateTime(year, month, day, 23, 59, 59);
        if (date.isBefore(customDate ?? DateTime.now())) {
          return customDate != null
              ? IntlCubit.translateStatic("shared.components.input.after_date")
              : IntlCubit.translateStatic("shared.components.input.past_date");
        }
      }
    }
    return null;
  }
}
