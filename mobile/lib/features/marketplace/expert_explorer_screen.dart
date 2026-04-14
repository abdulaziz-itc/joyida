import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/theme.dart';
import '../../core/auth_provider.dart';
import '../auth/auth_guard_dialog.dart';
import 'expert_details_screen.dart';

class Expert {
  final int id;
  final String name;
  final String profession;
  final String distance;
  final double rating;
  final int reviews;
  final String image;
  final bool isVerified;
  final bool isPro;

  Expert({required this.id, required this.name, required this.profession, required this.distance, required this.rating, required this.reviews, required this.image, this.isVerified = false, this.isPro = false});
}

class ExpertExplorerScreen extends StatefulWidget {
  const ExpertExplorerScreen({super.key});

  @override
  State<ExpertExplorerScreen> createState() => _ExpertExplorerScreenState();
}

class _ExpertExplorerScreenState extends State<ExpertExplorerScreen> {
  bool _showMap = false;

  final List<Expert> _experts = [
    Expert(id: 1, name: 'Anvar Toshov', profession: 'Santexnik', distance: '450 metr', rating: 4.9, reviews: 124, image: 'https://images.unsplash.com/photo-1540560085459-0efa9c453421?w=400&h=400&fit=crop', isVerified: true, isPro: true),
    Expert(id: 2, name: 'Dilnoza Aliyeva', profession: 'Advokat', distance: '1200 metr', rating: 4.8, reviews: 89, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop', isVerified: true, isPro: false),
    Expert(id: 3, name: 'Aziz Rahmonov', profession: 'Elektrik', distance: '800 metr', rating: 4.7, reviews: 56, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', isVerified: false, isPro: false),
    Expert(id: 4, name: 'Nigora Karimova', profession: 'Ustoz (Matematika)', distance: '2500 metr', rating: 5.0, reviews: 210, image: 'https://images.unsplash.com/photo-1580894732444-8ecdead79733?w=400&h=400&fit=crop', isVerified: false, isPro: false),
  ];

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: Text('marketplace.explorer_title'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            onPressed: () => setState(() => _showMap = !_showMap),
            icon: Icon(_showMap ? Icons.list : Icons.map_outlined, color: AppTheme.primary),
          ),
        ],
      ),
      body: _showMap ? _buildMapView() : _buildListView(),
    );
  }

  Widget _buildListView() {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: _experts.length,
      itemBuilder: (context, index) {
        final expert = _experts[index];
        return _buildExpertCard(expert);
      },
    );
  }

  Widget _buildMapView() {
    return Stack(
      children: [
        Container(
          width: double.infinity,
          height: double.infinity,
          color: AppTheme.primary.withOpacity(0.05),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.location_on, size: 64, color: AppTheme.primary),
                const SizedBox(height: 16),
                Text('marketplace.loading'.tr(), style: const TextStyle(color: Colors.grey)),
              ],
            ),
          ),
        ),
        _buildMarker(expert: _experts[0], top: 200, left: 100),
        _buildMarker(expert: _experts[1], top: 400, left: 250),
        _buildMarker(expert: _experts[2], top: 150, left: 300),
      ],
    );
  }

  Widget _buildMarker({required Expert expert, required double top, required double left}) {
    return Positioned(
      top: top,
      left: left,
      child: GestureDetector(
        onTap: () => _handleExpertClick(expert.id),
        child: Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: AppTheme.primary, width: 2),
            boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 5))],
          ),
          child: CircleAvatar(
            radius: 20,
            backgroundImage: NetworkImage(expert.image),
          ),
        ),
      ),
    );
  }

  Widget _buildExpertCard(Expert expert) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => _handleExpertClick(expert.id),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withOpacity(0.05) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: isDark ? Colors.white10 : Colors.black.withOpacity(0.05)),
          boxShadow: isDark ? [] : [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 5))],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left: Portrait Image
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.network(expert.image, width: 110, height: 110, fit: BoxFit.cover),
            ),
            const SizedBox(width: 20),
            
            // Right: Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(expert.name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: expert.isPro ? Colors.amber : null)),
                      if (expert.isVerified) ...[
                        const SizedBox(width: 8),
                        const Icon(Icons.verified_user, color: AppTheme.primary, size: 18),
                      ],
                      if (expert.isPro) ...[
                        const SizedBox(width: 4),
                        const Icon(Icons.workspace_premium, color: Colors.amber, size: 18),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(expert.profession, style: TextStyle(color: isDark ? Colors.grey : Colors.grey.shade600, fontSize: 14)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.phone, color: AppTheme.primary, size: 14),
                      const SizedBox(width: 6),
                      Text('+998 90 *** ** **', style: TextStyle(color: isDark ? Colors.white70 : Colors.black87, fontWeight: FontWeight.bold, fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: AppTheme.primary, size: 14),
                      const SizedBox(width: 4),
                      Text('${"marketplace.distance".tr()}: ', style: TextStyle(color: isDark ? Colors.grey : Colors.grey.shade600, fontSize: 12)),
                      Text(expert.distance, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 14),
                      const SizedBox(width: 4),
                      Text('${"marketplace.rate".tr()}: ', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                      Text('${expert.rating} (${expert.reviews})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleExpertClick(int id) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      showDialog(
        context: context,
        builder: (context) => const AuthGuardDialog(),
      );
    } else {
      Navigator.of(context).push(MaterialPageRoute(
        builder: (context) => ExpertDetailsScreen(expertId: id),
      ));
    }
  }
}
