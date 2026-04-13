import 'package:flutter/material.dart';
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
              const Text(
                'Safety First',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Please follow these guidelines for your safety.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: 32),
              
              _buildSection(
                title: 'Dos',
                icon: Icons.check_circle_outline,
                color: Colors.greenAccent,
                items: [
                  'Meet in a public or safe place.',
                  'Pay ONLY after the service is done.',
                  'Verify identity upon arrival.',
                ],
                isDark: isDark,
              ),
              const SizedBox(height: 24),
              _buildSection(
                title: 'Don\'ts',
                icon: Icons.cancel_outlined,
                color: Colors.redAccent,
                items: [
                  'Do NOT pay any advance/deposit.',
                  'Do NOT share financial details.',
                  'Avoid meeting in isolated areas.',
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
                child: const Text('I Understand & Continue', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: Text('Go Back', style: TextStyle(color: isDark ? Colors.white70 : Colors.black54)),
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
