import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import '../../core/theme.dart';

class ReelsScreen extends StatefulWidget {
  const ReelsScreen({super.key});

  @override
  State<ReelsScreen> createState() => _ReelsScreenState();
}

class _ReelsScreenState extends State<ReelsScreen> {
  final List<String> _videoUrls = [
    'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lighting-in-the-city-at-night-11-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-over-a-silent-lake-1650-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-white-sand-on-the-beach-near-the-ocean-1175-large.mp4',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: PageView.builder(
        scrollDirection: Axis.vertical,
        itemCount: _videoUrls.length,
        itemBuilder: (context, index) {
          return ReelVideoPlayer(videoUrl: _videoUrls[index], index: index);
        },
      ),
    );
  }
}

class ReelVideoPlayer extends StatefulWidget {
  final String videoUrl;
  final int index;
  const ReelVideoPlayer({super.key, required this.videoUrl, required this.index});

  @override
  State<ReelVideoPlayer> createState() => _ReelVideoPlayerState();
}

class _ReelVideoPlayerState extends State<ReelVideoPlayer> {
  late VideoPlayerController _controller;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl))
      ..initialize().then((_) {
        setState(() {
          _isInitialized = true;
          _controller.setLooping(true);
          _controller.play();
        });
      });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        if (_isInitialized)
          GestureDetector(
            onTap: () {
              setState(() {
                _controller.value.isPlaying ? _controller.pause() : _controller.play();
              });
            },
            child: VideoPlayer(_controller),
          )
        else
          const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
        
        // Right side actions
        Positioned(
          right: 16,
          bottom: 120,
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
          bottom: 40,
          right: 80,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const CircleAvatar(radius: 16, backgroundColor: AppTheme.primary, child: Icon(Icons.person, size: 16, color: Colors.white)),
                  const SizedBox(width: 8),
                  Text("@expert_user_${widget.index}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 8),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(4)), child: const Text("PRO", style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))),
                ],
              ),
              const SizedBox(height: 12),
              const Text("Mening bugungi bajargan ishimdan lavha! Yaqin atrofdagi eng yaxshi xizmat. #joyida #uzbekistan", maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.white70)),
            ],
          ),
        ),
        
        if (_isInitialized)
           Positioned(
             bottom: 0,
             left: 0,
             right: 0,
             child: VideoProgressIndicator(_controller, allowScrubbing: true, colors: const VideoProgressColors(playedColor: AppTheme.primary)),
           ),
      ],
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
