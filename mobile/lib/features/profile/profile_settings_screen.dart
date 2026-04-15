import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/auth_provider.dart';
import '../../core/theme.dart';

class ProfileSettingsScreen extends StatelessWidget {
  const ProfileSettingsScreen({super.key});

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.grey.shade900,
        title: Text('settings.logout_title'.tr(), style: const TextStyle(color: Colors.white)),
        content: Text('settings.logout_confirm'.tr(), style: const TextStyle(color: Colors.white70)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text('settings.cancel'.tr(), style: const TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              Navigator.of(ctx).pop(); // Close dialog
              await Provider.of<AuthProvider>(context, listen: false).logout();
              // After logout notifyListeners triggers AuthWrapper automatically
            },
            child: Text('settings.logout'.tr(), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0A0A0A) : Colors.white,
      appBar: AppBar(
         backgroundColor: Colors.transparent,
         elevation: 0,
         centerTitle: true,
         title: Text('dashboard.settings'.tr(), style: TextStyle(color: isDark ? Colors.white : Colors.black)),
      ),
      body: SingleChildScrollView(
         padding: const EdgeInsets.all(24),
         child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
               // Profile Header
               Row(
                 children: [
                    CircleAvatar(
                       radius: 40,
                       backgroundColor: AppTheme.primary.withOpacity(0.2),
                       child: const Icon(Icons.person, size: 40, color: AppTheme.primary),
                    ),
                    const SizedBox(width: 20),
                    Column(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                          const Text("User Profile", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          Text("user@joida.uz", style: TextStyle(color: Colors.grey.shade500)),
                       ],
                    )
                 ],
               ),
               const SizedBox(height: 40),
               
               // Menu Items
               Text("settings.account".tr(), style: TextStyle(color: Colors.grey.shade500, fontWeight: FontWeight.bold)),
               const SizedBox(height: 10),
               _buildMenuItem(Icons.person_outline, "settings.personal_info".tr(), isDark),
               _buildMenuItem(Icons.payment, "settings.payment_methods".tr(), isDark),
               _buildMenuItem(Icons.history, "settings.history".tr(), isDark),
               
               const SizedBox(height: 30),
               Text("settings.preferences".tr(), style: TextStyle(color: Colors.grey.shade500, fontWeight: FontWeight.bold)),
               const SizedBox(height: 10),
               _buildMenuItem(Icons.language, "settings.language".tr(), isDark),
               _buildMenuItem(Icons.notifications_outlined, "settings.notifications".tr(), isDark),
               _buildMenuItem(Icons.dark_mode_outlined, "settings.theme".tr(), isDark),
               
               const SizedBox(height: 40),
               SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: OutlinedButton.icon(
                     style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.redAccent),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15))
                     ),
                     icon: const Icon(Icons.logout, color: Colors.redAccent),
                     label: Text("settings.logout".tr(), style: const TextStyle(color: Colors.redAccent, fontSize: 16)),
                     onPressed: () => _showLogoutDialog(context),
                  )
               )
            ],
         )
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, bool isDark) {
      return ListTile(
         contentPadding: EdgeInsets.zero,
         leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.05), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: AppTheme.primary),
         ),
         title: Text(title, style: TextStyle(color: isDark ? Colors.white : Colors.black, fontWeight: FontWeight.w500)),
         trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
         onTap: () {},
      );
  }
}
