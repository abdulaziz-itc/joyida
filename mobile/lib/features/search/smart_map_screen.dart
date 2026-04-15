import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
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
  bool _hasSearched = false;
  double _currentSearchRadius = 500; // in meters
  String _searchStatusText = "";
  List<Marker> _expertMarkers = [];
  
  late AnimationController _pulseController;
  Timer? _backgroundMoveTimer;
  double _bgAngle = 0.0;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    
    _startBackgroundAnimation();
    _getCurrentLocation(silent: true);
  }

  @override
  void dispose() {
    _mapController.dispose();
    _searchController.dispose();
    _pulseController.dispose();
    _backgroundMoveTimer?.cancel();
    super.dispose();
  }

  // Slowly moves the map in the background for "cinematic" effect
  void _startBackgroundAnimation() {
    _backgroundMoveTimer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      if (_hasSearched) {
        timer.cancel();
        return;
      }
      _bgAngle += 0.002;
      final offsetLat = 0.005 * (1 + 0.1 * (1.0)); // subtle movement
      _mapController.move(
        LatLng(41.2995 + 0.01 * (1.0 * (1.0)), 69.2401 + 0.01 * (1.0 * (1.0))), // Dummy subtle loop logic
        13.5
      );
    });
  }

  Future<void> _getCurrentLocation({bool silent = false}) async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      if (silent) return;
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }
    
    if (permission == LocationPermission.deniedForever) return;

    final position = await Geolocator.getCurrentPosition();
    if (mounted) {
      setState(() {
        _currentPosition = LatLng(position.latitude, position.longitude);
      });
      if (_hasSearched) {
        _mapController.move(_currentPosition!, 15.0);
      }
    }
  }

  void _triggerSearch() async {
    if (_searchController.text.trim().isEmpty) return;
    
    // Switch UI state from "Initial/Centered" to "Active Map"
    setState(() {
      _hasSearched = true;
      _isSearching = true;
      _expertMarkers.clear();
      _currentSearchRadius = 500;
    });

    FocusScope.of(context).unfocus();
    await _getCurrentLocation();
    
    if (_currentPosition != null) {
      _mapController.move(_currentPosition!, 15.5);
    }

    final thresholds = [500.0, 1000.0, 5000.0, 10000.0];
    final zooms = [15.5, 14.5, 12.0, 10.5];
    
    for (int i = 0; i < thresholds.length; i++) {
        if (!mounted || !_isSearching) break;
        
        setState(() {
          _currentSearchRadius = thresholds[i];
          _searchStatusText = "Searching in ${thresholds[i] >= 1000 ? (thresholds[i]/1000).toInt() : thresholds[i].toInt()}${thresholds[i] >= 1000 ? 'km' : 'm'}...";
        });
        
        if (_currentPosition != null) {
           _mapController.move(_currentPosition!, zooms[i]);
        }
        
        // Fetch real experts from backend
        await _fetchRealExperts(thresholds[i] / 1000.0);
        
        if (_expertMarkers.isNotEmpty) {
            break;
        }
        
        await Future.delayed(const Duration(seconds: 1));
    }
    
    if (mounted) setState(() => _isSearching = false);
  }
  
  Future<void> _fetchRealExperts(double radiusKm) async {
      if (_currentPosition == null) return;
      
      try {
        final query = _searchController.text.trim();
        final url = 'https://backend.joida.uz/api/v1/experts/nearby?lat=${_currentPosition!.latitude}&lon=${_currentPosition!.longitude}&radius=$radiusKm&category=$query';
        
        final response = await http.get(Uri.parse(url));
        if (response.statusCode == 200) {
          final List<dynamic> data = json.decode(response.body);
          if (data.isNotEmpty) {
            setState(() {
              _isSearching = false;
              _expertMarkers = data.map((exp) {
                return Marker(
                  point: LatLng(exp['latitude'], exp['longitude']),
                  width: 70,
                  height: 70,
                  child: _buildExpertMarker(
                    exp['full_name'].substring(0, 1), 
                    "\$${exp['hourly_rate']?.toInt() ?? 0}", 
                    exp['profession'] ?? "Mutaxassis", 
                    exp['full_name'],
                    exp['rating']?.toDouble() ?? 0.0,
                    exp['review_count'] ?? 0,
                  ),
                );
              }).toList();
            });
          }
        }
      } catch (e) {
        print("Search error: $e");
      }
  }
  
  Widget _buildExpertMarker(String initials, String price, String prof, String name, double rating, int reviews) {
      return GestureDetector(
        onTap: () => _showExpertCard(name, prof, price, rating, reviews),
        child: Column(
          children: [
            Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                   color: AppTheme.primary,
                   borderRadius: BorderRadius.circular(12),
                   border: Border.all(color: Colors.white, width: 2),
                   boxShadow: [
                      BoxShadow(color: AppTheme.primary.withOpacity(0.4), blurRadius: 8, spreadRadius: 1)
                   ]
                ),
                child: Text(price, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10)),
            ),
            const Icon(Icons.location_on, color: AppTheme.primary, size: 30),
          ],
        )
      );
  }

  void _showExpertCard(String name, String profession, String price, double rating, int reviews) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade700, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 24),
            Row(
              children: [
                CircleAvatar(radius: 35, backgroundColor: AppTheme.primary.withOpacity(0.1), child: const Icon(Icons.person, color: AppTheme.primary, size: 40)),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                      Text(profession, style: TextStyle(color: Colors.grey.shade400, fontSize: 16)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.star, color: Colors.amber, size: 16),
                          Text(" $rating ($reviews reviews)", style: const TextStyle(color: Colors.grey, fontSize: 13)),
                        ],
                      )
                    ],
                  ),
                ),
                Text(price, style: const TextStyle(color: AppTheme.primary, fontSize: 20, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15))),
                    child: const Text("Bog'lanish", style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(15)),
                  child: const Icon(Icons.chat_bubble_outline, color: Colors.white),
                )
              ],
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Map Layer
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              center: const LatLng(41.311081, 69.240562),
              zoom: 13.5,
              interactiveFlags: _hasSearched 
                  ? (InteractiveFlag.all & ~InteractiveFlag.rotate) 
                  : InteractiveFlag.none,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
                userAgentPackageName: 'com.joyida.mobile',
              ),
              if (_isSearching && _currentPosition != null)
                CircleLayer(
                  circles: [
                    CircleMarker(
                      point: _currentPosition!,
                      color: AppTheme.primary.withOpacity(0.15),
                      borderStrokeWidth: 1,
                      borderColor: AppTheme.primary.withOpacity(0.3),
                      useRadiusInMeter: true,
                      radius: _currentSearchRadius,
                    ),
                  ],
                ),
              MarkerLayer(
                markers: [
                  if (_currentPosition != null && _hasSearched)
                    Marker(
                      point: _currentPosition!,
                      width: 40,
                      height: 40,
                      child: const Icon(Icons.my_location, color: Colors.blueAccent, size: 24),
                    ),
                  ..._expertMarkers
                ],
              ),
            ],
          ),
          
          // Background Overlay when NOT searched (Blurred/Dimmed)
          if (!_hasSearched)
            IgnorePointer(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withOpacity(0.5),
                      Colors.black.withOpacity(0.3),
                      Colors.black.withOpacity(0.6),
                    ],
                  ),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 4, sigmaY: 4),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),

          // 2. Animated Search UI
          AnimatedAlign(
            duration: const Duration(milliseconds: 800),
            curve: Curves.easeInOutExpo,
            alignment: _hasSearched ? const Alignment(0, -0.85) : Alignment.center,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (!_hasSearched) ...[
                    const Text("Joyida", style: TextStyle(color: Colors.white, fontSize: 44, fontWeight: FontWeight.bold, letterSpacing: -2)),
                    const SizedBox(height: 8),
                    Text("O'z mahallangizdan mutaxassis toping", style: TextStyle(color: Colors.grey.shade400, fontSize: 16)),
                    const SizedBox(height: 40),
                  ],
                  ClipRRect(
                    borderRadius: BorderRadius.circular(22),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: Colors.white.withOpacity(0.1)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.search, color: AppTheme.primary),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextField(
                                controller: _searchController,
                                style: const TextStyle(color: Colors.white, fontSize: 18),
                                onSubmitted: (_) => _triggerSearch(),
                                decoration: InputDecoration(
                                  hintText: "smart_map.search_hint".tr(),
                                  hintStyle: const TextStyle(color: Colors.grey),
                                  border: InputBorder.none,
                                  contentPadding: const EdgeInsets.symmetric(vertical: 20),
                                ),
                              ),
                            ),
                            if (_isSearching)
                               const SpinKitRing(color: AppTheme.primary, size: 20, lineWidth: 2)
                            else if (_hasSearched)
                               IconButton(icon: const Icon(Icons.close, color: Colors.grey), onPressed: () {
                                  setState(() {
                                    _hasSearched = false;
                                    _searchController.clear();
                                    _expertMarkers.clear();
                                    _startBackgroundAnimation();
                                  });
                               })
                          ],
                        ),
                      ),
                    ),
                  ),
                  if (_isSearching) ...[
                    const SizedBox(height: 20),
                    Text(_searchStatusText, style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                  ],
                ],
              ),
            ),
          ),
          
          // Radar pulsing animation center
          if (_isSearching && _currentPosition != null)
             Center(child: SpinKitPulse(color: AppTheme.primary.withOpacity(0.4), size: 180)),
        ],
      ),
      floatingActionButton: _hasSearched 
        ? FloatingActionButton(
            mini: true,
            backgroundColor: AppTheme.primary,
            onPressed: () => _getCurrentLocation(),
            child: const Icon(Icons.my_location, color: Colors.white, size: 20),
          )
        : null,
    );
  }
}
