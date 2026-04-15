import 'package:flutter/material.dart';
import '../../core/theme.dart';

class ReelsScreen extends StatelessWidget {
  const ReelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: PageView.builder(
        scrollDirection: Axis.vertical,
        itemCount: 5,
        itemBuilder: (context, index) {
          return Stack(
            fit: StackFit.expand,
            children: [
              // Mock Video Background (Gradients)
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.primaries[index % Colors.primaries.length].withOpacity(0.4),
                      Colors.black,
                    ],
                  ),
                ),
                child: Center(
                  child: Icon(Icons.play_circle_outline, size: 80, color: Colors.white.withOpacity(0.2)),
                ),
              ),
              
              // Right side actions
              Positioned(
                right: 16,
                bottom: 150,
                child: Column(
                  children: [
                    _buildActionButton(Icons.favorite, "1.2k"),
                    const SizedBox(height: 20),
                    _buildActionButton(Icons.comment, "45"),
                    const SizedBox(height: 20),
                    _buildActionButton(Icons.share, "12"),
                  ],
                ),
              ),
              
              // Bottom Progress & Info
              Positioned(
                left: 16,
                bottom: 120,
                right: 80,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const CircleAvatar(radius: 16, backgroundColor: AppTheme.primary, child: Icon(Icons.person, size: 16, color: Colors.white)),
                        const SizedBox(width: 8),
                        Text("@expert_user_$index", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 8),
                        Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(4)), child: const Text("PRO", style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text("Mening bugungi bajargan ishimdan lavha! Yaqin atrofdagi eng yaxshi santexnik xizmati. #joyida #uzbekistan", maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.white70)),
                  ],
                ),
              ),
              
              // Custom Linear Progress bar at the bottom
              Positioned(
                bottom: 100,
                left: 0,
                right: 0,
                child: LinearProgressIndicator(value: 0.4, backgroundColor: Colors.white.withOpacity(0.1), valueColor: const AlwaysStoppedAnimation(AppTheme.primary), minHeight: 2),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 30),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 12)),
      ],
    );
  }
}
