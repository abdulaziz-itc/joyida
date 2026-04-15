import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/auth_provider.dart';
import '../../core/theme_provider.dart';
import '../../core/theme.dart';
import '../auth/profile_setup_screen.dart';
import 'profile_image_gallery_screen.dart';

class ProfileSettingsScreen extends StatefulWidget {
  const ProfileSettingsScreen({super.key});

  @override
  State<ProfileSettingsScreen> createState() => _ProfileSettingsScreenState();
}

class _ProfileSettingsScreenState extends State<ProfileSettingsScreen> {
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
              Navigator.of(ctx).pop(); 
              await Provider.of<AuthProvider>(context, listen: false).logout();
            },
            child: Text('settings.logout'.tr(), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showLanguageDialog() {
     showModalBottomSheet(
        context: context,
        backgroundColor: Colors.transparent,
        builder: (ctx) => Container(
           padding: const EdgeInsets.all(24),
           decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
           ),
           child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                 const Text("Tilni tanlang", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                 const SizedBox(height: 24),
                 _buildLangItem("O'zbekcha", 'uz'),
                 _buildLangItem("Русский", 'ru'),
                 _buildLangItem("English", 'en'),
                 const SizedBox(height: 16),
              ],
           ),
        )
     );
  }

  Widget _buildLangItem(String label, String code) {
     return ListTile(
        title: Text(label),
        trailing: context.locale.languageCode == code ? const Icon(Icons.check, color: AppTheme.primary) : null,
        onTap: () {
           context.setLocale(Locale(code));
           Navigator.pop(context);
        },
     );
  }

  void _showThemeDialog() {
     final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
     showModalBottomSheet(
        context: context,
        backgroundColor: Colors.transparent,
        builder: (ctx) => Container(
           padding: const EdgeInsets.all(24),
           decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
           ),
           child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                 const Text("Mavzuni tanlang", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                 const SizedBox(height: 24),
                 ListTile(
                    leading: const Icon(Icons.dark_mode),
                    title: const Text("To'q mavzu"),
                    trailing: themeProvider.themeMode == ThemeMode.dark ? const Icon(Icons.check, color: AppTheme.primary) : null,
                    onTap: () {
                       themeProvider.toggleTheme(true);
                       Navigator.pop(context);
                    },
                 ),
                 ListTile(
                    leading: const Icon(Icons.light_mode),
                    title: const Text("Yorug' mavzu"),
                    trailing: themeProvider.themeMode == ThemeMode.light ? const Icon(Icons.check, color: AppTheme.primary) : null,
                    onTap: () {
                       themeProvider.toggleTheme(false);
                       Navigator.pop(context);
                    },
                 ),
                 const SizedBox(height: 16),
              ],
           ),
        )
     );
  }

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.currentUser;
    final isExpert = user?['is_expert'] ?? false;
    
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
               GestureDetector(
                 onTap: () => Navigator.push(context, MaterialPageRoute(builder: (ctx) => const ProfileImageGalleryScreen())),
                 child: Row(
                   children: [
                      Stack(
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: AppTheme.primary, width: 2),
                              boxShadow: [BoxShadow(color: AppTheme.primary.withOpacity(0.2), blurRadius: 10, spreadRadius: 2)]
                            ),
                            child: CircleAvatar(
                               radius: 40,
                               backgroundColor: AppTheme.primary.withOpacity(0.1),
                               backgroundImage: user?['profile_picture_url'] != null 
                                   ? NetworkImage(user!['profile_picture_url']) 
                                   : null,
                               child: user?['profile_picture_url'] == null 
                                   ? const Icon(Icons.person, size: 40, color: AppTheme.primary)
                                   : null,
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
                              child: const Icon(Icons.camera_alt, color: Colors.white, size: 14),
                            ),
                          )
                        ],
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                           crossAxisAlignment: CrossAxisAlignment.start,
                           children: [
                              Text(user?['full_name'] ?? "User Profile", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                              Text(user?['email'] ?? "user@joida.uz", style: TextStyle(color: Colors.grey.shade500)),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isExpert ? AppTheme.primary.withOpacity(0.1) : Colors.blue.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8)
                                ),
                                child: Text(
                                  isExpert ? "Mutaxassis" : "Mijoz", 
                                  style: TextStyle(color: isExpert ? AppTheme.primary : Colors.blue, fontSize: 10, fontWeight: FontWeight.bold)
                                ),
                              )
                           ],
                        ),
                      )
                   ],
                 ),
               ),
               const SizedBox(height: 40),
               
               // Menu Items
               Text("settings.account".tr(), style: TextStyle(color: Colors.grey.shade500, fontWeight: FontWeight.bold)),
               const SizedBox(height: 10),
               _buildMenuItem(Icons.person_outline, "settings.personal_info".tr(), isDark, onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (ctx) => const ProfileSetupScreen()));
               }),
               if (!isExpert)
                  _buildMenuItem(Icons.engineering, "Mutaxassis bo'lish", isDark, onTap: () {
                     Navigator.push(context, MaterialPageRoute(builder: (ctx) => const ProfileSetupScreen()));
                  }),
               _buildMenuItem(Icons.payment, "settings.payment_methods".tr(), isDark),
               _buildMenuItem(Icons.history, "settings.history".tr(), isDark),
               
               const SizedBox(height: 30),
               Text("settings.preferences".tr(), style: TextStyle(color: Colors.grey.shade500, fontWeight: FontWeight.bold)),
               const SizedBox(height: 10),
               _buildMenuItem(Icons.language, "settings.language".tr(), isDark, onTap: _showLanguageDialog),
               _buildMenuItem(Icons.notifications_outlined, "settings.notifications".tr(), isDark),
               _buildMenuItem(Icons.dark_mode_outlined, "settings.theme".tr(), isDark, onTap: _showThemeDialog),
               
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

  Widget _buildMenuItem(IconData icon, String title, bool isDark, {VoidCallback? onTap}) {
      return ListTile(
         contentPadding: EdgeInsets.zero,
         leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.05), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: AppTheme.primary),
         ),
         title: Text(title, style: TextStyle(color: isDark ? Colors.white : Colors.black, fontWeight: FontWeight.w500)),
         trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
         onTap: onTap,
      );
  }
}
