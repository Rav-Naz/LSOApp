part of 'form_state_bloc.dart';

@immutable
sealed class AppFormStateEvent {}

final class AppFormValidChanged extends AppFormStateEvent with EquatableMixin {
  AppFormValidChanged(this.newValid);

  final bool newValid;

  @override
  List<Object?> get props => [newValid];
}

final class AppFormStageChanged extends AppFormStateEvent with EquatableMixin {
  AppFormStageChanged(this.newStage);

  final AppFormStateStage newStage;

  @override
  List<Object?> get props => [newStage];
}
