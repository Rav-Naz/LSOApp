# LSOApp 2.0

Application for acolytes

## Project Setup:
### Flutter install

Follow the [official Flutter instruction](https://docs.flutter.dev/get-started/install) to install Flutter on your device.

Change channel of Flutter repository to stable
```powershell
flutter channel stable
```

Change Flutter version to **3.16.4**
```powershell
git checkout 3.16.4 && flutter precache
```

### Before build/run

Create `.env` file from `.env-example`. It is important that `.env` file should be located in the project root directory.

Get needed dependencies
```powershell
flutter pub get
```

Generate splash screens
```powershell
flutter pub run flutter_native_splash:create
```

Generate launcher icons
```powershell
flutter pub run flutter_launcher_icons
```

Generate constants from `.env` file. Before run this command make sure that in the `/lib` directory there is no existing file named `.env.g.dart`.
(After change .env file you should run `flutter clean && flutter pub get` command before build)
```powershell
flutter pub run build_runner build
```

### Run instruction (debug)

* Android / iOS
```
flutter run
```

* WEB (you should have and Chrome browser installed)
```
flutter run -d chrome --web-browser-flag "--disable-web-security"
```

### Build instruction (prod)
* Android
```
flutter build apk
flutter build appbundle
```
Generated `.apk` file will be located in `[project]/build/app/outputs/flutter-apk/app-release.apk`.The release bundle for your app is created at `[project]/build/app/outputs/bundle/release/app.aab`.

* iOS
```
flutter build ipa
```
Generated `.ipa` file will be located in `[project]/build/ios/ipa`.

* WEB
```
flutter build web
```
Generated files will be located in `[project]/build/web`. All this files should be moved to proper destination where HTTPS server will be serving this files to WWW.