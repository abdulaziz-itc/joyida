import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/theme.dart';
import 'core/theme_provider.dart';
import 'core/auth_provider.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/onboarding_screen.dart';
import 'features/auth/preference_screen.dart';
import 'features/dashboard/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();
  
  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('en'), Locale('ru'), Locale('uz')],
      path: 'assets/translations',
      fallbackLocale: const Locale('uz'),
      child: MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ],
        child: const MyApp(),
      ),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Joyida',
      debugShowCheckedModeBanner: false,
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: Provider.of<ThemeProvider>(context).themeMode,
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _showPreferences = true;
  bool _showOnboarding = true;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkInitialState();
  }

  void _checkInitialState() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _showPreferences = !(prefs.getBool('preferences_seen') ?? false);
      _showOnboarding = !(prefs.getBool('onboarding_seen') ?? false);
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    
    if (_showPreferences) {
      return const PreferenceScreen();
    }

    if (_showOnboarding) {
      return const OnboardingScreen();
    }

    final authProvider = Provider.of<AuthProvider>(context);
    
    if (authProvider.isAuthenticated) {
      if (!authProvider.profileCompleted) {
        return const ProfileSetupScreen();
      }
      return const HomeScreen();
    }
    
    return const LoginScreen();
  }
}
