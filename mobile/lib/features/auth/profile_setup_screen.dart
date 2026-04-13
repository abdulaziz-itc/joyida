import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/theme.dart';

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
    {'id': 'plumber', 'name': 'Santexnik', 'icon': '🔧'},
    {'id': 'electrician', 'name': 'Elektrchi', 'icon': '⚡'},
    {'id': 'lawyer', 'name': 'Advokat', 'icon': '⚖️'},
    {'id': 'tutor', 'name': 'O\'qituvchi', 'icon': '📚'},
    {'id': 'it', 'name': 'IT Mutaxassis', 'icon': '💻'},
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
                      child: const Text('Back', style: TextStyle(color: Colors.grey)),
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
                      _step == 3 ? 'Complete' : 'Next',
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
        const Text('Who are you?', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        const Text('Choose your primary role on Joyida.', style: TextStyle(color: Colors.grey, fontSize: 16)),
        const SizedBox(height: 40),
        _buildRoleCard(
          title: "Just a Client",
          desc: "I'm looking for local experts to help me with tasks.",
          icon: Icons.person_outline,
          color: Colors.blueAccent,
          isSelected: !_isExpert,
          onTap: () => setState(() => _isExpert = false),
        ),
        const SizedBox(height: 16),
        _buildRoleCard(
          title: "I'm an Expert",
          desc: "I want to offer my skills and earn money nearby.",
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
            _isExpert ? "What is your profession?" : "What are you looking for?",
            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const Text('This helps us show you the most relevant content.', style: TextStyle(color: Colors.grey, fontSize: 16)),
          const SizedBox(height: 32),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: _professions.map((p) {
              bool isSelected = _selectedProfession == p['name'];
              return GestureDetector(
                onTap: () => setState(() => _selectedProfession = p['name']),
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
                      Text(p['name']!, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
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
              hintText: 'Tell us a bit about yourself...',
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
        const Text('Set Your Location', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        const Text(
          'We use your location to find experts and clients right in your neighborhood.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey, fontSize: 16),
        ),
        const SizedBox(height: 40),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(20)),
          child: const Row(
            children: [
              Icon(Icons.gps_fixed, color: AppTheme.primary),
              SizedBox(width: 16),
              Text('Auto-detect location', style: TextStyle(fontWeight: FontWeight.bold)),
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
      // Finish Setup
      Navigator.of(context).pop();
    }
  }
}
