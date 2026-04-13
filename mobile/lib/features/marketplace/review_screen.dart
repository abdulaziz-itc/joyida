import 'package:flutter/material.dart';
import '../../core/theme.dart';

class ReviewScreen extends StatefulWidget {
  final String expertName;
  const ReviewScreen({super.key, required this.expertName});

  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> {
  int _rating = 0;
  final TextEditingController _commentController = TextEditingController();
  bool _isSubmitting = false;

  void _handleSubmit() {
    if (_rating == 0) return;
    setState(() => _isSubmitting = true);
    
    // Simulate API call
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _isSubmitting = false);
        _showSuccess();
      }
    });
  }

  void _showSuccess() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.4,
        padding: const EdgeInsets.all(32),
        decoration: const BoxDecoration(
          color: Color(0xFF1E1E1E),
          borderRadius: BorderRadius.vertical(top: Radius.circular(40)),
        ),
        child: Column(
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 80),
            const SizedBox(height: 24),
            const Text(
              'Rahmat!',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.black, color: Colors.white),
            ),
            const SizedBox(height: 12),
            const Text(
              'Sizning fikringiz loyiha ishonchliligini oshirishga yordam beradi.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 16),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context); // close sheet
                Navigator.pop(context); // close review screen
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('Tushunarli', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
        title: const Text('Fikr qoldirish'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${widget.expertName}\nbilan ishlash qanday bo\'ldi?',
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.black, letterSpacing: -1),
            ),
            const SizedBox(height: 12),
            const Text(
              'Ko\'rsatilgan xizmat sifatini baholang.',
              style: TextStyle(color: Colors.grey, fontSize: 16),
            ),
            const SizedBox(height: 48),
            
            // Star Selection
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                int star = index + 1;
                return IconButton(
                  onPressed: () => setState(() => _rating = star),
                  icon: Icon(
                    star <= _rating ? Icons.star : Icons.star_border,
                    color: star <= _rating ? Colors.amber : Colors.grey.withOpacity(0.3),
                    size: 48,
                  ),
                );
              }),
            ),
            
            const SizedBox(height: 48),
            const Text('Sharh matni', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.grey)),
            const SizedBox(height: 12),
            TextField(
              controller: _commentController,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: 'Usta haqida o\'z fikringizni yozing...',
                filled: true,
                fillColor: isDark ? Colors.white.withOpacity(0.05) : Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
              ),
            ),
            
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.camera_alt_outlined),
              label: const Text('Rasm qo\'shish'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
            
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: _rating == 0 || _isSubmitting ? null : _handleSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                minimumSize: const Size(double.infinity, 64),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                elevation: 10,
                shadowColor: AppTheme.primary.withOpacity(0.3),
              ),
              child: _isSubmitting 
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text('Yuborish', style: TextStyle(fontWeight: FontWeight.black, fontSize: 16, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
