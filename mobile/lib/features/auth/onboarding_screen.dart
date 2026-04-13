import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/theme.dart';
import 'login_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  bool isLastPage = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          PageView(
            controller: _controller,
            onPageChanged: (index) {
              setState(() => isLastPage = index == 2);
            },
            children: [
              buildPage(
                image: 'assets/images/onboarding1.png',
                title: 'onboarding.slide1_title'.tr(),
                subtitle: 'onboarding.slide1_subtitle'.tr(),
              ),
              buildPage(
                image: 'assets/images/onboarding2.png',
                title: 'onboarding.slide2_title'.tr(),
                subtitle: 'onboarding.slide2_subtitle'.tr(),
              ),
              buildPage(
                image: 'assets/images/onboarding3.png',
                title: 'onboarding.slide3_title'.tr(),
                subtitle: 'onboarding.slide3_subtitle'.tr(),
              ),
            ],
          ),
          
          // Navigation Controls
          Container(
            alignment: const Alignment(0, 0.85),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: () => _finishOnboarding(),
                  child: Text('onboarding.skip'.tr(), style: const TextStyle(color: Colors.grey)),
                ),
                SmoothPageIndicator(
                  controller: _controller,
                  count: 3,
                  effect: const ExpandingDotsEffect(
                    activeDotColor: AppTheme.primary,
                    dotColor: Colors.white24,
                    dotHeight: 8,
                    dotWidth: 8,
                    expansionFactor: 4,
                  ),
                ),
                IconButton(
                  onPressed: () {
                    if (isLastPage) {
                      _finishOnboarding();
                    } else {
                      _controller.nextPage(
                        duration: const Duration(milliseconds: 500),
                        curve: Curves.easeInOut,
                      );
                    }
                  },
                  icon: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: AppTheme.primary,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isLastPage ? Icons.done : Icons.arrow_forward,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget buildPage({required String image, required String title, required String subtitle}) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(image, height: 400),
          const SizedBox(height: 32),
          Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              color: isDark ? Colors.grey.shade400 : Colors.grey.shade700,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  void _finishOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_seen', true);
    
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }
}
