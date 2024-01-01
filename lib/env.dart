// lib/env.dart
import 'package:envied/envied.dart';

part 'env.g.dart';

@Envied(path: '.env')
abstract class AppEnv {
  @EnviedField(varName: 'API_URL')
  static const String API_URL = _AppEnv.API_URL;
  @EnviedField(varName: 'API_SUFFIX')
  static const String API_SUFFIX = _AppEnv.API_SUFFIX;
}
