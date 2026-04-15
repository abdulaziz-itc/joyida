import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../core/auth_provider.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  int _step = 1;
  bool _isExpert = false;
  String? _selectedProfession;
  final TextEditingController _bioController = TextEditingController();

  final List<Map<String, String>> _professions = [
    {'id': 'plumber', 'icon': '🔧'},
    {'id': 'electrician', 'icon': '⚡'},
    {'id': 'lawyer', 'icon': '⚖️'},
    {'id': 'tutor', 'icon': '📚'},
    {'id': 'it', 'icon': '💻'},
  ];

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Progress Bar
              Row(
                children: [
                  for (int i = 1; i <= 3; i++)
                    Expanded(
                      child: Container(
                        height: 4,
                        margin: const EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          color: _step >= i ? AppTheme.primary : (isDark ? Colors.white10 : Colors.black12),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 40),
              
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: _buildCurrentStep(),
                ),
              ),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (_step > 1)
                    TextButton(
                      onPressed: () => setState(() => _step--),
                      child: Text('auth.back'.tr(), style: const TextStyle(color: Colors.grey)),
                    )
                  else
                    const SizedBox(),
                  
                  ElevatedButton(
                    onPressed: _handleNext,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text(
                      _step == 3 ? 'auth.complete_registration'.tr() : 'auth.continue'.tr(),
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_step) {
      case 1: return _buildStep1();
      case 2: return _buildStep2();
      case 3: return _buildStep3();
      default: return const SizedBox();
    }
  }

  Widget _buildStep1() {
    return Column(
      key: const ValueKey(1),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('profile_setup.title'.tr(), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Text('profile_setup.subtitle'.tr(), style: const TextStyle(color: Colors.grey, fontSize: 16)),
        const SizedBox(height: 40),
        _buildRoleCard(
          title: "profile_setup.role_client".tr(),
          desc: "profile_setup.role_client_desc".tr(),
          icon: Icons.person_outline,
          color: Colors.blueAccent,
          isSelected: !_isExpert,
          onTap: () => setState(() => _isExpert = false),
        ),
        const SizedBox(height: 16),
        _buildRoleCard(
          title: "profile_setup.role_expert".tr(),
          desc: "profile_setup.role_expert_desc".tr(),
          icon: Icons.work_outline,
          color: AppTheme.primary,
          isSelected: _isExpert,
          onTap: () => setState(() => _isExpert = true),
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return SingleChildScrollView(
      key: const ValueKey(2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _isExpert ? "profile_setup.prof_title_expert".tr() : "profile_setup.prof_title_user".tr(),
            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Text('profile_setup.prof_subtitle'.tr(), style: const TextStyle(color: Colors.grey, fontSize: 16)),
          const SizedBox(height: 32),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: _professions.map((p) {
              String professionName = "profile_setup.professions.${p['id']}".tr();
              bool isSelected = _selectedProfession == p['id'];
              return GestureDetector(
                onTap: () => setState(() => _selectedProfession = p['id']),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primary.withOpacity(0.1) : Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isSelected ? AppTheme.primary : Colors.white12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(p['icon']!),
                      const SizedBox(width: 8),
                      Text(professionName, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 32),
          TextField(
            controller: _bioController,
            maxLines: 4,
            decoration: InputDecoration(
              hintText: 'profile_setup.bio_hint'.tr(),
              hintStyle: const TextStyle(color: Colors.grey),
              filled: true,
              fillColor: Colors.white.withOpacity(0.05),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep3() {
    return Column(
      key: const ValueKey(3),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), shape: BoxShape.circle),
          child: const Icon(Icons.location_on, size: 64, color: Colors.greenAccent),
        ),
        const SizedBox(height: 32),
        Text('profile_setup.location_title'.tr(), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Text(
          'profile_setup.location_desc'.tr(),
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.grey, fontSize: 16),
        ),
        const SizedBox(height: 40),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(20)),
          child: Row(
            children: [
              const Icon(Icons.gps_fixed, color: AppTheme.primary),
              const SizedBox(width: 16),
              Text('profile_setup.auto_detect'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRoleCard({required String title, required String desc, required IconData icon, required Color color, required bool isSelected, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.1) : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: isSelected ? color : Colors.white12),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withOpacity(0.2), borderRadius: BorderRadius.circular(16)),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(desc, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleNext() {
    if (_step < 3) {
      if (_step == 2 && _selectedProfession == null) return;
      setState(() => _step++);
    } else {
      // Finish Setup and update global state instead of popping the root navigator (which causes black screen)
      Provider.of<AuthProvider>(context, listen: false).completeProfile();
    }
  }
}
