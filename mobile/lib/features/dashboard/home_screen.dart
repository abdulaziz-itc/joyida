import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/theme.dart';
import '../projects/projects_screen.dart';
import '../marketplace/expert_explorer_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    const HomeView(),
    const ProjectsScreen(),
    Center(child: Text('dashboard.add_new'.tr(), style: const TextStyle(color: Colors.white))),
    const ExpertExplorerScreen(),
    Center(child: Text('dashboard.settings'.tr(), style: const TextStyle(color: Colors.white))),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
            BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: ''),
            BottomNavigationBarItem(icon: Icon(Icons.bar_chart_rounded), label: ''),
            BottomNavigationBarItem(icon: Icon(Icons.add_circle, size: 40, color: AppTheme.primary), label: ''),
            BottomNavigationBarItem(icon: Icon(Icons.explore_outlined), label: ''),
            BottomNavigationBarItem(icon: Icon(Icons.settings_outlined), label: ''),
          ],
        ),
      ),
    );
  }
}

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Background Glows
        Positioned(
          top: -150,
          right: -100,
          child: Container(
            width: 350,
            height: 350,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.primary.withOpacity(0.12),
            ),
            child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80), child: Container()),
          ),
        ),
        
        SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Profile Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('dashboard.hello'.tr(args: ['Alex']), style: TextStyle(color: Colors.grey.shade400, fontSize: 16)),
                        Text('dashboard.good_morning'.tr(), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.glassBorder),
                      ),
                      child: const Badge(
                        label: Text('3'),
                        child: Icon(Icons.notifications_outlined, color: Colors.white),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                
                // KPI Grid
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 1.1,
                  children: [
                    _buildKpiCard('dashboard.total_users'.tr(), '67.4k', '+12%', true, Icons.people_outline),
                    _buildKpiCard('dashboard.revenue'.tr(), '\$1.2M', '+24%', true, Icons.monetization_on_outlined),
                    _buildKpiCard('projects.title'.tr(), '815', '-3%', false, Icons.work_outline),
                    _buildKpiCard('dashboard.growth'.tr(), '4.8%', '+7%', true, Icons.trending_up),
                  ],
                ),
                const SizedBox(height: 32),
                
                // Main Chart Card
                _buildGlassContainer(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('dashboard.performance'.tr(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const Icon(Icons.more_horiz, color: Colors.grey),
                        ],
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        height: 200,
                        child: LineChart(
                          LineChartData(
                            gridData: const FlGridData(show: false),
                            titlesData: const FlTitlesData(show: false),
                            borderData: FlBorderData(show: false),
                            lineBarsData: [
                              LineChartBarData(
                                spots: [
                                  const FlSpot(0, 3),
                                  const FlSpot(1, 1),
                                  const FlSpot(2, 4),
                                  const FlSpot(3, 2),
                                  const FlSpot(4, 5),
                                  const FlSpot(5, 3),
                                  const FlSpot(6, 4),
                                ],
                                isCurved: true,
                                color: AppTheme.primary,
                                barWidth: 4,
                                isStrokeCapRound: true,
                                dotData: const FlDotData(show: false),
                                belowBarData: BarAreaData(
                                  show: true,
                                  color: AppTheme.primary.withOpacity(0.1),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                
                Text('dashboard.activity'.tr(), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _buildActivityList(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildKpiCard(String title, String value, String trend, bool isPositive, IconData icon) {
    return _buildGlassContainer(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (isPositive ? Colors.green : Colors.red).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: isPositive ? Colors.greenAccent : Colors.redAccent, size: 20),
              ),
              Text(trend, style: TextStyle(color: isPositive ? Colors.greenAccent : Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
          const Spacer(),
          Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildGlassContainer({required Widget child, EdgeInsets padding = const EdgeInsets.all(24)}) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.glassBorder),
      ),
      child: child,
    );
  }

  Widget _buildActivityList() {
    return Column(
      children: List.generate(3, (index) => Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.flash_on, color: Colors.blueAccent),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('dashboard.new_project'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
                  const Text('Sarah updated the design file', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
            const Text('2h ago', style: TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      )),
    );
  }
}
