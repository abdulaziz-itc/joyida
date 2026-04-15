import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/auth_provider.dart';
import '../../core/theme.dart';

class ProfileImageGalleryScreen extends StatefulWidget {
  const ProfileImageGalleryScreen({super.key});

  @override
  State<ProfileImageGalleryScreen> createState() => _ProfileImageGalleryScreenState();
}

class _ProfileImageGalleryScreenState extends State<ProfileImageGalleryScreen> {
  bool _isLoading = false;
  List<dynamic> _images = [];

  @override
  void initState() {
    super.initState();
    _loadImages();
  }

  Future<void> _loadImages() async {
    setState(() => _isLoading = true);
    final images = await Provider.of<AuthProvider>(context, listen: false).fetchUserImages();
    setState(() {
      _images = images;
      _isLoading = false;
    });
  }

  Future<void> _pickAndUploadImage() async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery, imageQuality: 70);
    
    if (image == null) return;

    setState(() => _isLoading = true);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    final url = await authProvider.uploadFile(image.path);
    if (url != null) {
      await authProvider.addUserImage(url);
      await _loadImages();
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Rasm yuklashda xatolik yuz berdi")));
      }
    }
    setState(() => _isLoading = false);
  }

  Future<void> _setMain(int id) async {
    setState(() => _isLoading = true);
    await Provider.of<AuthProvider>(context, listen: false).setMainImage(id);
    await _loadImages();
    setState(() => _isLoading = false);
  }

  Future<void> _deleteImage(int id) async {
    setState(() => _isLoading = true);
    await Provider.of<AuthProvider>(context, listen: false).deleteUserImage(id);
    await _loadImages();
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0A0A0A) : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text("Mening rasmlarim", style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_a_photo_outlined, color: AppTheme.primary),
            onPressed: _pickAndUploadImage,
          )
        ],
      ),
      body: _isLoading && _images.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1,
                ),
                itemCount: _images.length + 1,
                itemBuilder: (ctx, index) {
                  if (index == _images.length) {
                    return GestureDetector(
                      onTap: _pickAndUploadImage,
                      child: Container(
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.primary.withOpacity(0.2), style: BorderStyle.none),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.add, color: AppTheme.primary, size: 32),
                            const SizedBox(height: 4),
                            Text("Qo'shish", style: TextStyle(fontSize: 10, color: Colors.grey.shade500)),
                          ],
                        ),
                      ),
                    );
                  }

                  final img = _images[index];
                  return Stack(
                    children: [
                      GestureDetector(
                        onTap: () => _showFullImage(index),
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            image: DecorationImage(image: NetworkImage(img['url']), fit: BoxFit.cover),
                            border: img['is_main'] ? Border.all(color: AppTheme.primary, width: 2) : null,
                          ),
                        ),
                      ),
                      if (img['is_main'])
                        Positioned(
                          top: 4,
                          right: 4,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
                            child: const Icon(Icons.check, color: Colors.white, size: 10),
                          ),
                        ),
                      Positioned(
                        bottom: 0,
                        left: 0,
                        right: 0,
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(begin: Alignment.bottomCenter, end: Alignment.topCenter, colors: [Colors.black.withOpacity(0.6), Colors.transparent]),
                            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.star, color: Colors.amber, size: 18),
                                onPressed: img['is_main'] ? null : () => _setMain(img['id']),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 18),
                                onPressed: () => _deleteImage(img['id']),
                              ),
                            ],
                          ),
                        ),
                      )
                    ],
                  );
                },
              ),
            ),
    );
  }

  void _showFullImage(int initialIndex) {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (ctx) => FullImageGallery(images: _images.map((e) => e['url'] as String).toList(), initialIndex: initialIndex),
    ));
  }
}

class FullImageGallery extends StatelessWidget {
  final List<String> images;
  final int initialIndex;

  const FullImageGallery({super.key, required this.images, required this.initialIndex});

  @override
  Widget build(BuildContext context) {
    final PageController controller = PageController(initialPage: initialIndex);
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(backgroundColor: Colors.transparent, iconTheme: const IconThemeData(color: Colors.white)),
      body: PageView.builder(
        controller: controller,
        itemCount: images.length,
        itemBuilder: (ctx, index) => Center(
          child: InteractiveViewer(
            child: Image.network(images[index], fit: BoxFit.contain),
          ),
        ),
      ),
    );
  }
}
