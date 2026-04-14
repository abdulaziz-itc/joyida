import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/theme.dart';
import 'safety_dialog.dart';

class ExpertDetailsScreen extends StatefulWidget {
  final int expertId;
  const ExpertDetailsScreen({super.key, required this.expertId});

  @override
  State<ExpertDetailsScreen> createState() => _ExpertDetailsScreenState();
}

class _ExpertDetailsScreenState extends State<ExpertDetailsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  final List<Map<String, String>> _portfolio = [
    {'type': 'video', 'url': 'https://assets.mixkit.co/videos/preview/mixkit-plumber-working-with-a-wrench-on-a-pipe-42352-large.mp4', 'thumb': 'https://images.unsplash.com/photo-1581242163695-19d0acfd486f?w=400&h=600&fit=crop'},
    {'type': 'image', 'url': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&fit=crop', 'thumb': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop'},
    {'type': 'video', 'url': 'https://assets.mixkit.co/videos/preview/mixkit-repairman-fixing-a-sink-drain-42358-large.mp4', 'thumb': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=600&fit=crop'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(isDark),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('marketplace.about'.tr(), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Text(
                    '10 yillik tajribaga ega santexnikman. Har qanday murakkablikdagi suv va kanalizatsiya tizimlarini ta\'mirlash, montaj qilish va servis xizmatlarini ko\'rsataman.',
                    style: TextStyle(color: isDark ? Colors.grey : Colors.grey.shade600, fontSize: 16, height: 1.5),
                  ),
                  const SizedBox(height: 32),
                  
                  TabBar(
                    controller: _tabController,
                    labelColor: AppTheme.primary,
                    unselectedLabelColor: Colors.grey,
                    indicatorColor: AppTheme.primary,
                    indicatorSize: TabBarIndicatorSize.label,
                    tabs: [
                      Tab(text: 'marketplace.portfolio'.tr()),
                      Tab(text: 'marketplace.reviews'.tr() + ' (124)'),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  SizedBox(
                    height: 500, // Fixed height for tab content in Sliver
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        _buildPortfolioGrid(),
                        _buildReviewsList(isDark),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomActions(isDark),
    );
  }

  Widget _buildAppBar(bool isDark) {
    return SliverAppBar(
      expandedHeight: 350,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            Image.network('https://images.unsplash.com/photo-1540560085459-0efa9c453421?w=800&h=800&fit=crop', fit: BoxFit.cover),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.black.withOpacity(0.1), Colors.black.withOpacity(0.8)],
                ),
              ),
            ),
            Positioned(
              bottom: 24,
              left: 24,
              right: 24,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Anvar Toshov', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Professional Santexnik', style: TextStyle(color: AppTheme.primary, fontSize: 18, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 20),
                      const SizedBox(width: 4),
                      const Text('4.9', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      Text('marketplace.reviews_count'.tr(namedArgs: {'count': '124'}), style: const TextStyle(color: Colors.white70)),
                      const Spacer(),
                      const Icon(Icons.location_on, color: Colors.white70, size: 16),
                      const SizedBox(width: 4),
                      const Text('Yunusobod', style: TextStyle(color: Colors.white70)),
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

  Widget _buildPortfolioGrid() {
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.8,
      ),
      itemCount: _portfolio.length,
      itemBuilder: (context, index) {
        final item = _portfolio[index];
        return GestureDetector(
          onTap: () {
            if (item['type'] == 'video') {
              _openReelsViewer(item['url']!);
            }
          },
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              image: DecorationImage(image: NetworkImage(item['thumb']!), fit: BoxFit.cover),
            ),
            child: item['type'] == 'video' 
              ? const Center(child: Icon(Icons.play_circle_fill, color: Colors.white, size: 48))
              : null,
          ),
        );
      },
    );
  }

  Widget _buildReviewsList(bool isDark) {
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 2,
      itemBuilder: (context, index) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.03),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const CircleAvatar(backgroundImage: NetworkImage('https://i.pravatar.cc/150?u=1')),
                  const SizedBox(width: 12),
                  const Expanded(child: Text('Jasur M.', style: TextStyle(fontWeight: FontWeight.bold))),
                  Row(children: List.generate(5, (i) => const Icon(Icons.star, color: Colors.amber, size: 14))),
                ],
              ),
              const SizedBox(height: 12),
              const Text('Juda tez va sifatli xizmat ko\'rsatishdi. Tavsiya qilaman!'),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBottomActions(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? Colors.black : Colors.white,
        border: Border(top: BorderSide(color: isDark ? Colors.white10 : Colors.black.withOpacity(0.1))),
      ),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () => _handleContactClick(),
              icon: const Icon(Icons.phone),
              label: Text('marketplace.call'.tr()),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () => _handleContactClick(),
              icon: const Icon(Icons.chat_bubble_outline),
              label: Text('marketplace.chat'.tr()),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppTheme.primary),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _handleContactClick() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => const SafetyDialog(),
    );

    if (confirmed == true) {
      // Execute contact logic (e.g. url_launcher for phone)
    }
  }

  void _openReelsViewer(String url) {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (context) => ReelsViewerScreen(videoUrl: url),
    ));
  }
}

class ReelsViewerScreen extends StatefulWidget {
  final String videoUrl;
  const ReelsViewerScreen({super.key, required this.videoUrl});

  @override
  State<ReelsViewerScreen> createState() => _ReelsViewerScreenState();
}

class _ReelsViewerScreenState extends State<ReelsViewerScreen> {
  late VideoPlayerController _controller;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl))
      ..initialize().then((_) => setState(() => _controller.play()));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          _controller.value.isInitialized
            ? Center(child: AspectRatio(aspectRatio: _controller.value.aspectRatio, child: VideoPlayer(_controller)))
            : const Center(child: CircularProgressIndicator()),
          
          Positioned(
            top: 40,
            right: 20,
            child: IconButton(icon: const Icon(Icons.close, color: Colors.white, size: 32), onPressed: () => Navigator.pop(context)),
          ),
          
          Positioned(
            bottom: 40,
            left: 20,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    CircleAvatar(radius: 20, backgroundImage: NetworkImage('https://images.unsplash.com/photo-1540560085459-0efa9c453421?w=100')),
                    SizedBox(width: 12),
                    Text('Anvar Toshov', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                  ],
                ),
                const SizedBox(height: 12),
                const Text('Yangi o\'rnatilgan radiator tizimi! #santexnika', style: TextStyle(color: Colors.white70)),
              ],
            ),
          ),
          
          Positioned(
            bottom: 100,
            right: 20,
            child: Column(
              children: [
                _buildAction(Icons.favorite, '1.2k'),
                const SizedBox(height: 24),
                _buildAction(Icons.comment, '45'),
                const SizedBox(height: 24),
                _buildAction(Icons.share, 'marketplace.share'.tr()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAction(IconData icon, String label) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 32),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 12)),
      ],
    );
  }
}
