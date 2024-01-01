part of 'form_state_bloc.dart';

@immutable
final class AppFormState extends Equatable {
  const AppFormState({
    this.isValid = false,
    this.stage = const AppFormStateStageNormal(),
  });

  final bool isValid;
  final AppFormStateStage stage;

  AppFormState copyWith({bool? isValid, AppFormStateStage? stage}) {
    return AppFormState(
        isValid: isValid ?? this.isValid, stage: stage ?? this.stage);
  }

  @override
  List<Object> get props => [isValid, stage];
}

/// Stage class
final class AppFormStateStage {
  const AppFormStateStage();
}

final class AppFormStateStageNormal extends AppFormStateStage
    with EquatableMixin {
  const AppFormStateStageNormal();
  @override
  List<Object> get props => [1];
}

final class AppFormStateStageLoading extends AppFormStateStage
    with EquatableMixin {
  const AppFormStateStageLoading();

  @override
  List<Object> get props => [2];
}

final class AppFormStateStageSuccess extends AppFormStateStage
    with EquatableMixin {
  const AppFormStateStageSuccess();

  @override
  List<Object> get props => [3];
}

final class AppFormStateStageError extends AppFormStateStage
    with EquatableMixin {
  const AppFormStateStageError();
  @override
  List<Object> get props => [4];
}
