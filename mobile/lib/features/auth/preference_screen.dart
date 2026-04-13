import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme.dart';
import '../../core/theme_provider.dart';
import 'onboarding_screen.dart';

class PreferenceScreen extends StatefulWidget {
  const PreferenceScreen({super.key});

  @override
  State<PreferenceScreen> createState() => _PreferenceScreenState();
}

class _PreferenceScreenState extends State<PreferenceScreen> {
  String _selectedLang = 'uz';
  bool _isDark = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _selectedLang = context.locale.languageCode;
    _isDark = Provider.of<ThemeProvider>(context, listen: false).themeMode == ThemeMode.dark;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: _isDark 
              ? [Colors.black, const Color(0xFF1A1A1A)] 
              : [Colors.white, const Color(0xFFF0F0F0)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 40),
                Text(
                  'preferences.title'.tr(),
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: _isDark ? Colors.white : Colors.black,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'preferences.subtitle'.tr(),
                  style: TextStyle(
                    fontSize: 16,
                    color: _isDark ? Colors.grey : Colors.grey.shade700,
                  ),
                ),
                const SizedBox(height: 48),
                
                // Language Selection
                Text(
                  'preferences.language'.tr(),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
                const SizedBox(height: 16),
                _buildLanguageOption('uz', "O'zbek", '🇺🇿'),
                const SizedBox(height: 12),
                _buildLanguageOption('ru', 'Русский', '🇷🇺'),
                const SizedBox(height: 12),
                _buildLanguageOption('en', 'English', '🇬🇧'),
                
                const SizedBox(height: 40),
                
                // Theme Selection
                Text(
                  'preferences.theme'.tr(),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _buildThemeCard(true, Icons.dark_mode, 'preferences.dark'.tr())),
                    const SizedBox(width: 16),
                    Expanded(child: _buildThemeCard(false, Icons.light_mode, 'preferences.light'.tr())),
                  ],
                ),
                
                const Spacer(),
                
                SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: ElevatedButton(
                    onPressed: _handleContinue,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'preferences.continue'.tr(),
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.chevron_right, color: Colors.white),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLanguageOption(String code, String name, String flag) {
    bool isSelected = _selectedLang == code;
    return GestureDetector(
      onTap: () async {
        setState(() => _selectedLang = code);
        await context.setLocale(Locale(code));
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary.withOpacity(0.1) : (_isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.03)),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? AppTheme.primary : (_isDark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.05))),
        ),
        child: Row(
          children: [
            Text(flag, style: const TextStyle(fontSize: 24)),
            const SizedBox(width: 16),
            Text(
              name,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: _isDark ? Colors.white : Colors.black,
              ),
            ),
            const Spacer(),
            if (isSelected) const Icon(Icons.check_circle, color: AppTheme.primary),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeCard(bool dark, IconData icon, String label) {
    bool isSelected = _isDark == dark;
    return GestureDetector(
      onTap: () {
        setState(() => _isDark = dark);
        Provider.of<ThemeProvider>(context, listen: false).toggleTheme(dark);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary.withOpacity(0.1) : (_isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.03)),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? AppTheme.primary : (_isDark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.05))),
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? AppTheme.primary : Colors.grey, size: 32),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? AppTheme.primary : Colors.grey,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleContinue() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('preferences_seen', true);
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const OnboardingScreen()),
      );
    }
  }
}
