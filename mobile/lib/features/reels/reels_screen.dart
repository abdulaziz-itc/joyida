import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/theme.dart';

class ReelsScreen extends StatelessWidget {
  const ReelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Background Placeholder Graphic
          Center(
             child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                   Icon(Icons.video_collection_outlined, size: 80, color: Colors.grey.withOpacity(0.3)),
                   const SizedBox(height: 20),
                   Text("Reels (Koming Soon)", style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 20, fontWeight: FontWeight.bold)),
                   const SizedBox(height: 10),
                   Padding(
                     padding: const EdgeInsets.symmetric(horizontal: 40.0),
                     child: Text("Mutaxassislarning qisqa videolari va ish jarayonlari shu yerda chiqadi.", 
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey.withOpacity(0.5))),
                   )
                ],
             )
          ),
          
          // Floating Top Bar
          Positioned(
             top: MediaQuery.of(context).padding.top + 20,
             left: 20,
             right: 20,
             child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                   Text("Joyida Reels", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                   IconButton(icon: Icon(Icons.camera_alt_outlined, color: Colors.white), onPressed: (){})
                ],
             )
          )
        ],
      ),
    );
  }
}
