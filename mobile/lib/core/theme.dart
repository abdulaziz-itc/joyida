import 'package:flutter/material.dart';

class AppTheme {
  static const primary = Color(0xFF9D50BB);
  static const secondary = Color(0xFF6E48AA);
  static const accent = Color(0xFF00D2FF);
  
  static final darkTheme = ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: Colors.black,
    primaryColor: primary,
    colorScheme: const ColorScheme.dark(
      primary: primary,
      secondary: secondary,
    ),
    textTheme: const TextTheme(
      bodyLarge: TextStyle(color: Colors.white),
      bodyMedium: TextStyle(color: Colors.white70),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
    ),
  );

  static final lightTheme = ThemeData(
    brightness: Brightness.light,
    scaffoldBackgroundColor: const Color(0xFFF8F9FA),
    primaryColor: primary,
    colorScheme: const ColorScheme.light(
      primary: primary,
      secondary: secondary,
      onSurface: Colors.black87,
    ),
    textTheme: const TextTheme(
      bodyLarge: TextStyle(color: Color(0xFF1A1A1A)),
      bodyMedium: TextStyle(color: Colors.black54),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      iconTheme: IconThemeData(color: Colors.black),
      titleTextStyle: TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold),
    ),
  );

  static const glassBorder = Color(0x33FFFFFF);
  static const glassBorderLight = Color(0x1A6E48AA);
}
