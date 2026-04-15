import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/theme.dart';

class SmartMapScreen extends StatefulWidget {
  const SmartMapScreen({super.key});

  @override
  State<SmartMapScreen> createState() => _SmartMapScreenState();
}

class _SmartMapScreenState extends State<SmartMapScreen> with TickerProviderStateMixin {
  final MapController _mapController = MapController();
  final TextEditingController _searchController = TextEditingController();
  
  LatLng? _currentPosition;
  bool _isSearching = false;
  double _currentSearchRadius = 500; // in meters
  List<Marker> _expertMarkers = [];
  
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _mapController.dispose();
    _searchController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }
    
    if (permission == LocationPermission.deniedForever) return;

    final position = await Geolocator.getCurrentPosition();
    setState(() {
      _currentPosition = LatLng(position.latitude, position.longitude);
    });
    
    _mapController.move(_currentPosition!, 15.0);
  }

  // Animates the radar expansion over time
  void _startSearchAnimation() async {
    if (_searchController.text.trim().isEmpty) return;
    
    setState(() {
      _isSearching = true;
      _expertMarkers.clear();
      _currentSearchRadius = 500;
    });

    final thresholds = [500.0, 1000.0, 3000.0, 5000.0, 10000.0];
    final zooms = [15.0, 14.0, 12.5, 11.5, 10.5];
    
    for (int i = 0; i < thresholds.length; i++) {
        if (!mounted || !_isSearching) break;
        
        setState(() {
          _currentSearchRadius = thresholds[i];
        });
        
        // Slightly zoom out dynamically
        if (_currentPosition != null) {
           _mapController.move(_currentPosition!, zooms[i]);
        }
        
        // In a real app! Call backend API here:
        // final results = await backend.searchNearby(radius: _currentSearchRadius/1000, category: _searchController.text);
        
        // Mocking fake delay for searching
        await Future.delayed(const Duration(seconds: 2));
        
        // Mock finding an expert at 3000 meters
        if (thresholds[i] == 3000.0) {
            _handleFoundExperts();
            break;
        }
    }
    
    if (mounted) setState(() => _isSearching = false);
  }
  
  void _handleFoundExperts() {
      // Mock Data: Place random nearby markers
      if (_currentPosition == null) return;
      setState(() {
         _isSearching = false;
         _expertMarkers = [
            Marker(
              point: LatLng(_currentPosition!.latitude + 0.01, _currentPosition!.longitude + 0.01),
              width: 60,
              height: 60,
              builder: (ctx) => _buildExpertMarker("AT", "\$25/soat"),
            ),
             Marker(
              point: LatLng(_currentPosition!.latitude - 0.015, _currentPosition!.longitude + 0.005),
              width: 60,
              height: 60,
              builder: (ctx) => _buildExpertMarker("NK", "\$15/soat"),
            ),
         ];
      });
  }
  
  Widget _buildExpertMarker(String initials, String price) {
      return GestureDetector(
        onTap: () {
            // Show BottomSheet with details
        },
        child: Container(
            decoration: BoxDecoration(
               color: AppTheme.primary,
               shape: BoxShape.circle,
               border: Border.all(color: Colors.white, width: 2),
               boxShadow: [
                  BoxShadow(color: AppTheme.primary.withOpacity(0.5), blurRadius: 10, spreadRadius: 2)
               ]
            ),
            child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                    Text(initials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    Text(price, style: const TextStyle(color: Colors.white70, fontSize: 10)),
                ]
            )
        )
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. The Map Layer
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              center: _currentPosition ?? const LatLng(41.2995, 69.2401), // Tashkent Default
              zoom: 13.0,
              interactiveFlags: InteractiveFlag.all & ~InteractiveFlag.rotate,
            ),
            children: [
              TileLayer(
                // OpenStreetMap Dark Theme equivalent using CartoDB
                urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
                userAgentPackageName: 'com.joyida.mobile',
              ),
              if (_currentPosition != null)
                CircleLayer(
                  circles: [
                    if (_isSearching)
                      CircleMarker(
                        point: _currentPosition!,
                        color: AppTheme.primary.withOpacity(0.2),
                        borderStrokeWidth: 2,
                        borderColor: AppTheme.primary.withOpacity(0.5),
                        useRadiusInMeter: true,
                        radius: _currentSearchRadius, // Expands
                      ),
                  ],
                ),
              MarkerLayer(
                markers: [
                  // User Location Pin
                  if (_currentPosition != null)
                    Marker(
                      point: _currentPosition!,
                      width: 50,
                      height: 50,
                      builder: (ctx) => const Icon(
                        Icons.my_location_rounded,
                        color: Colors.blueAccent,
                        size: 30,
                      ),
                    ),
                  // Expert Markers
                  ..._expertMarkers
                ],
              ),
            ],
          ),
          
          // Radar pulsing animation inside the map center when searching
          if (_isSearching && _currentPosition != null)
             Center(
               child: SpinKitPulse(
                  color: AppTheme.primary.withOpacity(0.6),
                  size: 200.0,
               )
             ),

          // 2. The Floating Search Bar (Glassmorphism)
          Positioned(
            top: MediaQuery.of(context).padding.top + 20,
            left: 20,
            right: 20,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: Row(
                    children: [
                      const SizedBox(width: 16),
                      const Icon(Icons.search, color: Colors.grey),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            hintText: 'smart_map.search_hint'.tr(), // Needs localization
                            hintStyle: const TextStyle(color: Colors.grey),
                            border: InputBorder.none,
                          ),
                          onSubmitted: (_) => _startSearchAnimation(),
                        ),
                      ),
                      if (_isSearching)
                         Padding(
                           padding: const EdgeInsets.all(12.0),
                           child: SpinKitFadingCircle(color: AppTheme.primary, size: 24),
                         )
                      else
                        IconButton(
                           icon: const Icon(Icons.filter_list, color: Colors.white),
                           onPressed: () {
                               // Open Filter logic
                           },
                        )
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
         backgroundColor: AppTheme.primary,
         onPressed: () => _getCurrentLocation(),
         child: const Icon(Icons.my_location, color: Colors.white),
      ),
    );
  }
}
