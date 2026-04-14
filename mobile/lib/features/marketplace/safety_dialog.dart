import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/theme.dart';

class SafetyDialog extends StatelessWidget {
  const SafetyDialog({super.key});

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 20, offset: const Offset(0, 10)),
          ],
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.orange.withOpacity(0.1), shape: BoxShape.circle),
                child: const Icon(Icons.security_rounded, color: Colors.orangeAccent, size: 40),
              ),
              const SizedBox(height: 24),
              Text(
                'marketplace.safety_title'.tr(),
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'marketplace.safety_subtitle'.tr(),
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: 32),
              
              _buildSection(
                title: 'marketplace.safety_dos'.tr(),
                icon: Icons.check_circle_outline,
                color: Colors.greenAccent,
                items: [
                  'marketplace.safety_do1'.tr(),
                  'marketplace.safety_do2'.tr(),
                  'marketplace.safety_do3'.tr(),
                ],
                isDark: isDark,
              ),
              const SizedBox(height: 24),
              _buildSection(
                title: 'marketplace.safety_donts'.tr(),
                icon: Icons.cancel_outlined,
                color: Colors.redAccent,
                items: [
                  'marketplace.safety_dont1'.tr(),
                  'marketplace.safety_dont2'.tr(),
                  'marketplace.safety_dont3'.tr(),
                ],
                isDark: isDark,
              ),
              
              const SizedBox(height: 40),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text('marketplace.safety_confirm'.tr(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: Text('marketplace.safety_back'.tr(), style: TextStyle(color: isDark ? Colors.white70 : Colors.black54)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection({required String title, required IconData icon, required Color color, required List<String> items, required bool isDark}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 8),
            Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        const SizedBox(height: 12),
        ...items.map((item) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('• ', style: TextStyle(color: Colors.grey)),
              Expanded(child: Text(item, style: TextStyle(color: isDark ? Colors.white70 : Colors.black87, fontSize: 14))),
            ],
          ),
        )),
      ],
    );
  }
}
