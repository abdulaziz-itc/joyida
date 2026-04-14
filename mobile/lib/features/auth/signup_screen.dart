import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../core/auth_provider.dart';
import '../../core/theme.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  int _currentStep = 0;
  bool _isExpert = false;
  bool _isLoading = false;

  // Step 1: Basic Info
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  // Step 2: Professional Info
  int? _selectedBirthYear;
  String? _selectedGender;
  String? _selectedEducation;
  final _workplaceController = TextEditingController();
  List<dynamic> _availableServices = [];
  final List<int> _selectedServiceIds = [];

  // Step 3: Location & Files
  String? _profileImagePath;
  String? _diplomaPath;
  double? _latitude;
  double? _longitude;
  String? _locationName;

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    final services = await Provider.of<AuthProvider>(context, listen: false).getServices();
    setState(() => _availableServices = services);
  }

  Future<void> _pickImage(bool isProfile) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        if (isProfile) _profileImagePath = image.path;
        else _diplomaPath = image.path;
      });
    }
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isLoading = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      
      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        Position position = await Geolocator.getCurrentPosition();
        setState(() {
          _latitude = position.latitude;
          _longitude = position.longitude;
          _locationName = "Current Location Detected";
        });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Location acquired!')));
      }
    } catch (e) {
      print('Location error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _handleSignUp() async {
    setState(() => _isLoading = true);
    
    String? profileUrl;
    if (_profileImagePath != null) {
      profileUrl = await Provider.of<AuthProvider>(context, listen: false).uploadFile(_profileImagePath!);
    }

    String? diplomaUrl;
    if (_diplomaPath != null) {
       diplomaUrl = await Provider.of<AuthProvider>(context, listen: false).uploadFile(_diplomaPath!);
       // Note: In a real app, we'd store the diploma URL in verification_data
    }

    final errorMessage = await Provider.of<AuthProvider>(context, listen: false).register(
      fullName: _fullNameController.text,
      email: _emailController.text,
      password: _passwordController.text,
      isExpert: _isExpert,
      birthYear: _selectedBirthYear,
      gender: _selectedGender,
      educationLevel: _selectedEducation,
      workplace: _workplaceController.text,
      serviceIds: _selectedServiceIds,
      latitude: _latitude,
      longitude: _longitude,
      locationName: _locationName,
      profilePictureUrl: profileUrl,
    );
    
    if (mounted) setState(() => _isLoading = false);
    
    if (errorMessage == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Registration Successful!')));
        Navigator.of(context).pop(); 
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMessage)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Glows
          Positioned(top: -100, right: -100, child: _GlowCircle(color: AppTheme.primary.withOpacity(0.15))),
          Positioned(bottom: -100, left: -100, child: _GlowCircle(color: Colors.blue.withOpacity(0.1))),
          
          SafeArea(
            child: Column(
              children: [
                _buildHeader(),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24.0),
                    child: _buildCurrentStep(),
                  ),
                ),
                _buildFooterActions(),
              ],
            ),
          ),
          if (_isLoading) const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.arrow_back, color: Colors.white)),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Create Account', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
              Text('Step ${_currentStep + 1} of ${_isExpert ? 4 : 2}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 0: return _buildStep0Selection();
      case 1: return _buildStep1Basic();
      case 2: return _buildStep2Professional();
      case 3: return _buildStep3Uploads();
      default: return const SizedBox();
    }
  }

  Widget _buildStep0Selection() {
    return Column(
      children: [
        const Text("I want to use Joyida as a...", style: TextStyle(fontSize: 18, color: Colors.white70)),
        const SizedBox(height: 32),
        _SelectionCard(
          title: "Regular User",
          subtitle: "Looking for specialist services",
          icon: Icons.person_outline,
          isSelected: !_isExpert,
          onTap: () => setState(() => _isExpert = false),
        ),
        const SizedBox(height: 16),
        _SelectionCard(
          title: "Specialist / Expert",
          subtitle: "Offering my professional services",
          icon: Icons.handyman_outlined,
          isSelected: _isExpert,
          onTap: () => setState(() => _isExpert = true),
        ),
      ],
    );
  }

  Widget _buildStep1Basic() {
    return Column(
      children: [
        _buildGlassField(_fullNameController, 'Full Name', Icons.person_outline),
        const SizedBox(height: 16),
        _buildGlassField(_emailController, 'Email Address', Icons.mail_outline),
        const SizedBox(height: 16),
        _buildGlassField(_passwordController, 'Password', Icons.lock_outline, obscure: true),
      ],
    );
  }

  Widget _buildStep2Professional() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Service Categories", style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _availableServices.map((s) {
            final isSelected = _selectedServiceIds.contains(s['id']);
            return FilterChip(
              label: Text(s['name']),
              selected: isSelected,
              onSelected: (val) {
                setState(() {
                  if (val) _selectedServiceIds.add(s['id']);
                  else _selectedServiceIds.remove(s['id']);
                });
              },
              selectedColor: AppTheme.primary.withOpacity(0.3),
              checkmarkColor: Colors.white,
              labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.grey),
            );
          }).toList(),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(child: _buildDropdown('Birth Year', List.generate(50, (i) => 2010 - i), _selectedBirthYear, (v) => setState(() => _selectedBirthYear = v))),
            const SizedBox(width: 16),
            Expanded(child: _buildDropdown('Gender', ['Male', 'Female'], _selectedGender, (v) => setState(() => _selectedGender = v))),
          ],
        ),
        const SizedBox(height: 16),
        _buildDropdown('Education', ['High School', 'Bachelor', 'Master', 'PhD', 'DS'], _selectedEducation, (v) => setState(() => _selectedEducation = v)),
        const SizedBox(height: 16),
        _buildGlassField(_workplaceController, 'Current Workplace', Icons.business_outlined),
      ],
    );
  }

  Widget _buildStep3Uploads() {
    return Column(
      children: [
        _buildUploadTile('Profile Picture', _profileImagePath, () => _pickImage(true), Icons.add_a_photo_outlined),
        const SizedBox(height: 16),
        _buildUploadTile('Diploma / Certificate', _diplomaPath, () => _pickImage(false), Icons.description_outlined),
        const SizedBox(height: 32),
        ElevatedButton.icon(
          onPressed: _getCurrentLocation,
          icon: const Icon(Icons.my_location),
          label: Text(_locationName ?? "Get Current Location"),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white10,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 50),
          ),
        ),
      ],
    );
  }

  Widget _buildFooterActions() {
    final bool isLast = (_isExpert && _currentStep == 3) || (!_isExpert && _currentStep == 1);
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _currentStep--),
                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), side: const BorderSide(color: Colors.white24)),
                child: const Text('Back', style: TextStyle(color: Colors.white)),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: 16),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: isLast ? _handleSignUp : () => setState(() => _currentStep++),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
              ),
              child: Text(isLast ? 'Complete Registration' : 'Continue'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassField(TextEditingController controller, String hint, IconData icon, {bool obscure = false}) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.grey),
        prefixIcon: Icon(icon, color: Colors.grey),
        filled: true,
        fillColor: Colors.white.withOpacity(0.05),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
      ),
    );
  }

  Widget _buildDropdown(String hint, List<dynamic> items, dynamic selected, Function(dynamic) onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton(
          hint: Text(hint, style: const TextStyle(color: Colors.grey)),
          value: selected,
          items: items.map((i) => DropdownMenuItem(value: i, child: Text(i.toString()))).toList(),
          onChanged: onChanged,
          dropdownColor: Colors.grey[900],
          style: const TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildUploadTile(String label, String? path, VoidCallback onTap, IconData icon) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: path != null ? AppTheme.primary : Colors.white.withOpacity(0.1)),
        ),
        child: Row(
          children: [
            Icon(icon, color: path != null ? AppTheme.primary : Colors.grey),
            const SizedBox(width: 16),
            Expanded(child: Text(path != null ? 'File selected' : label, style: TextStyle(color: path != null ? Colors.white : Colors.grey))),
            if (path != null) const Icon(Icons.check_circle, color: AppTheme.primary),
          ],
        ),
      ),
    );
  }
}

class _SelectionCard extends StatelessWidget {
  final String title, subtitle;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _SelectionCard({required this.title, required this.subtitle, required this.icon, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary.withOpacity(0.1) : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: isSelected ? AppTheme.primary : Colors.white.withOpacity(0.1), width: 2),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: isSelected ? AppTheme.primary : Colors.white10, borderRadius: BorderRadius.circular(16)),
              child: Icon(icon, color: Colors.white),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),
            if (isSelected) const Icon(Icons.radio_button_checked, color: AppTheme.primary)
            else const Icon(Icons.radio_button_off, color: Colors.white24),
          ],
        ),
      ),
    );
  }
}

class _GlowCircle extends StatelessWidget {
  final Color color;
  const _GlowCircle({required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 300,
      height: 300,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color),
      child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container()),
    );
  }
}
