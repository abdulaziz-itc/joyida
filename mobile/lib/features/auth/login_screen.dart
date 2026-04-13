import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_provider.dart';
import '../../core/theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  void _handleLogin() async {
    setState(() => _isLoading = true);
    final success = await Provider.of<AuthProvider>(context, listen: false)
        .login(_emailController.text, _passwordController.text);
    
    setState(() => _isLoading = false);
    if (success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Login Successful!')),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Login Failed. Check credentials.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primary.withOpacity(0.15),
              ),
              child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container()),
            ),
          ),
          Positioned(
            bottom: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.blue.withOpacity(0.15),
              ),
              child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container()),
            ),
          ),
          
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Glass Card
                    ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                        child: Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: AppTheme.glassBorder),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text(
                                'Joyida',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 40,
                                  fontWeight: FontWeight.bold,
                                  foreground: Paint()
                                    ..shader = LinearGradient(
                                      colors: [AppTheme.primary, Colors.blue.shade400],
                                    ).createShader(const Rect.fromLTWH(0, 0, 200, 70)),
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Welcome back! Sign in to continue.',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Colors.grey),
                              ),
                              const SizedBox(height: 32),
                              TextField(
                                controller: _emailController,
                                decoration: const InputDecoration(
                                  hintText: 'Email Address',
                                  prefixIcon: Icon(Icons.mail_outline, color: Colors.grey),
                                ),
                              ),
                              const SizedBox(height: 16),
                              TextField(
                                controller: _passwordController,
                                obscureText: true,
                                decoration: const InputDecoration(
                                  hintText: 'Password',
                                  prefixIcon: Icon(Icons.lock_outline, color: Colors.grey),
                                ),
                              ),
                              const SizedBox(height: 24),
                              ElevatedButton(
                                onPressed: _isLoading ? null : _handleLogin,
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                ).copyWith(
                                  backgroundColor: WidgetStateProperty.all(AppTheme.primary),
                                ),
                                child: _isLoading
                                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                    : const Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text('Sign In', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                          SizedBox(width: 8),
                                          Icon(Icons.arrow_forward),
                                        ],
                                      ),
                              ),
                              const SizedBox(height: 24),
                              const Row(
                                children: [
                                  Expanded(child: Divider(color: Colors.white10)),
                                  Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('OR', style: TextStyle(color: Colors.grey, fontSize: 12))),
                                  Expanded(child: Divider(color: Colors.white10)),
                                ],
                              ),
                              const SizedBox(height: 24),
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () async {
                                        setState(() => _isLoading = true);
                                        await Provider.of<AuthProvider>(context, listen: false).signInWithGoogle();
                                        if (mounted) setState(() => _isLoading = false);
                                      },
                                      icon: Image.network('https://www.gstatic.com/images/branding/product/1x/gsuite_64dp.png', height: 20, errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata)),
                                      label: const Text('Google'),
                                      style: OutlinedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        side: const BorderSide(color: Colors.white12),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () {},
                                      icon: const Icon(Icons.apple, color: Colors.white),
                                      label: const Text('Apple'),
                                      style: OutlinedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        side: const BorderSide(color: Colors.white12),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("Don't have an account?", style: TextStyle(color: Colors.grey)),
                        TextButton(
                          onPressed: () {},
                          child: const Text('Sign Up', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
