import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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
            const Text('Welcome to Pro!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 12),
            const Text(
              'Your profile is now boosted. You will appear at the top of search results.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
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
              child: const Text('Great!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
        title: const Text('Upgrade Account', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Grow Your Business',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.black, letterSpacing: -1),
              ),
              const SizedBox(height: 8),
              const Text(
                'Professional tools for local experts to get more clients and build a premium reputation.',
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
              const SizedBox(height: 48),
              
              _buildPlanCard(
                id: 'free',
                name: 'Free Plan',
                price: '0 UZS',
                features: ['Basic search visibility', 'Up to 3 portfolio items', 'Standard badge'],
                color: Colors.grey,
                isSelected: _selectedPlan == 'free',
                onSelect: () => setState(() => _selectedPlan = 'free'),
                isDark: isDark,
              ),
              const SizedBox(height: 20),
              _buildPlanCard(
                id: 'pro',
                name: 'Professional',
                price: '49,000 UZS',
                features: ['Top priority ranking', 'Unlimited portfolio/reels', 'Diamond premium badge', 'Client analytics'],
                color: Colors.amber,
                isSelected: _selectedPlan == 'pro',
                onSelect: () => setState(() => _selectedPlan = 'pro'),
                isDark: isDark,
                isPro: true,
              ),
              
              const SizedBox(height: 48),
              const Text(
                'Select Payment Method',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  _buildPaymentMethod('Payme', 'assets/images/payme.png', true, isDark),
                  const SizedBox(width: 16),
                  _buildPaymentMethod('CLICK', 'assets/images/click.png', false, isDark),
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
                      _selectedPlan == 'pro' ? 'Upgrade Now' : 'Continue with Free',
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

  Widget _buildPaymentMethod(String name, String asset, bool isSelected, bool isDark) {
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
