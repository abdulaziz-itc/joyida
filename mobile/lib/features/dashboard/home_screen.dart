import 'package:flutter/material.dart';
import '../../core/theme.dart';

import '../search/smart_map_screen.dart';
import '../reels/reels_screen.dart';
import '../projects/projects_screen.dart';
import '../profile/profile_settings_screen.dart';
import '../chat/chat_list_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 2; // Start with Search/Map in the center

  final List<Widget> _pages = [
    const ReelsScreen(),            // Index 0: Reels
    const ProjectsScreen(),         // Index 1: My Tasks/Projects
    const SmartMapScreen(),         // Index 2: Animated Search Map (CENTRAL)
    const ChatListScreen(),         // Index 3: Real Chat System
    const ProfileSettingsScreen(),  // Index 4: Profile / Logout
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, // Dark foundation
      body: _pages[_selectedIndex],
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      height: 80,
      margin: const EdgeInsets.only(bottom: 24, left: 24, right: 24),
      decoration: BoxDecoration(
        color: const Color(0xFF151515).withOpacity(0.95),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(30),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (index) => setState(() => _selectedIndex = index),
          backgroundColor: Colors.transparent,
          selectedItemColor: AppTheme.primary,
          unselectedItemColor: Colors.grey,
          showSelectedLabels: false,
          showUnselectedLabels: false,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.video_collection_outlined), activeIcon: Icon(Icons.video_collection), label: ''),
            BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), activeIcon: Icon(Icons.assignment), label: ''),
            BottomNavigationBarItem(icon: Icon(Icons.search, size: 45, color: AppTheme.primary), label: ''),
            BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline), activeIcon: Icon(Icons.chat_bubble), label: ''),
            BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: ''),
          ],
        ),
      ),
    );
  }
}
