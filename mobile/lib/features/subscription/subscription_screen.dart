import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/theme.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  String _selectedPlan = 'pro';
  bool _isProcessing = false;

  void _handleUpgrade() {
    setState(() => _isProcessing = true);
    // Simulate payment process
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _isProcessing = false);
        _showSuccessDialog();
      }
    });
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.amber.withOpacity(0.1), shape: BoxShape.circle),
              child: const Icon(Icons.workspace_premium, color: Colors.amber, size: 60),
            ),
            const SizedBox(height: 24),
            Text('subscription.welcome_pro'.tr(), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 12),
            Text(
              'subscription.pro_desc'.tr(),
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: Text('subscription.great'.tr(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: Text('subscription.title'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'subscription.header'.tr(),
                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.black, letterSpacing: -1),
              ),
              const SizedBox(height: 8),
              Text(
                'subscription.subtitle'.tr(),
                style: const TextStyle(color: Colors.grey, fontSize: 16),
              ),
              const SizedBox(height: 48),
              
              _buildPlanCard(
                id: 'free',
                name: 'subscription.plan_free'.tr(),
                price: '0 UZS',
                features: [
                  'subscription.f1'.tr(),
                  'subscription.f2'.tr(),
                  'subscription.f3'.tr(),
                ],
                color: Colors.grey,
                isSelected: _selectedPlan == 'free',
                onSelect: () => setState(() => _selectedPlan = 'free'),
                isDark: isDark,
              ),
              const SizedBox(height: 20),
              _buildPlanCard(
                id: 'pro',
                name: 'subscription.plan_pro'.tr(),
                price: '49,000 UZS',
                features: [
                  'subscription.p1'.tr(),
                  'subscription.p2'.tr(),
                  'subscription.p3'.tr(),
                  'subscription.p4'.tr(),
                ],
                color: Colors.amber,
                isSelected: _selectedPlan == 'pro',
                onSelect: () => setState(() => _selectedPlan = 'pro'),
                isDark: isDark,
                isPro: true,
              ),
              
              const SizedBox(height: 48),
              Text(
                'subscription.select_payment'.tr(),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  _buildPaymentMethod('Payme', isDark),
                  const SizedBox(width: 16),
                  _buildPaymentMethod('CLICK', isDark),
                ],
              ),
              
              const SizedBox(height: 48),
              ElevatedButton(
                onPressed: _isProcessing ? null : _handleUpgrade,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _selectedPlan == 'pro' ? Colors.amber : AppTheme.primary,
                  minimumSize: const Size(double.infinity, 64),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 10,
                  shadowColor: _selectedPlan == 'pro' ? Colors.amber.withOpacity(0.3) : AppTheme.primary.withOpacity(0.3),
                ),
                child: _isProcessing 
                  ? const CircularProgressIndicator(color: Colors.black)
                  : Text(
                      _selectedPlan == 'pro' ? 'subscription.upgrade_now'.tr() : 'subscription.continue_free'.tr(),
                      style: const TextStyle(fontWeight: FontWeight.black, fontSize: 16, color: Colors.black),
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlanCard({
    required String id,
    required String name,
    required String price,
    required List<String> features,
    required Color color,
    required bool isSelected,
    required VoidCallback onSelect,
    required bool isDark,
    bool isPro = false,
  }) {
    return GestureDetector(
      onTap: onSelect,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.1) : (isDark ? Colors.white.withOpacity(0.05) : Colors.white),
          borderRadius: BorderRadius.circular(30),
          border: Border.all(
            color: isSelected ? color : Colors.white10,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: isSelected ? color : null)),
                    const SizedBox(height: 4),
                    Text(price, style: const TextStyle(fontWeight: FontWeight.black, fontSize: 14, color: Colors.grey)),
                  ],
                ),
                if (isPro) Icon(Icons.gem, color: color, size: 32),
              ],
            ),
            const SizedBox(height: 24),
            ...features.map((f) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  Icon(Icons.check_circle, color: isSelected ? color : Colors.grey, size: 16),
                  const SizedBox(width: 8),
                  Text(f, style: const TextStyle(fontSize: 14)),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethod(String name, bool isDark) {
    bool isSelected = name == 'Payme'; // Mock selection
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: isSelected ? Colors.amber.withOpacity(0.1) : (isDark ? Colors.white10 : Colors.white),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? Colors.amber : Colors.transparent),
        ),
        child: Column(
          children: [
            Icon(name == 'Payme' ? Icons.smartphone : Icons.credit_card, color: isSelected ? Colors.amber : Colors.grey),
            const SizedBox(height: 8),
            Text(name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: isSelected ? Colors.amber : Colors.grey)),
          ],
        ),
      ),
    );
  }
}
