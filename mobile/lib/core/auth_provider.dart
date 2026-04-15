import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthProvider with ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    serverClientId: '596799584146-vfqh5kfpr3imiq7evjaq6e5pifuhcfci.apps.googleusercontent.com',
  );
  String? _token;
  bool _isAuthenticated = false;
  bool _profileCompleted = false;

  String? get token => _token;
  bool get isAuthenticated => _isAuthenticated;
  bool get profileCompleted => _profileCompleted;

  Future<String?> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('https://backend.joida.uz/api/v1/auth/login/access-token'),
        body: {
          'username': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['access_token'];
        await _storage.write(key: 'token', value: _token);
        _isAuthenticated = true;
        _profileCompleted = false; 
        notifyListeners();
        return null; // Success
      } else {
        try {
          final data = json.decode(response.body);
          return data['detail'] ?? 'Login failed with status: ${response.statusCode}';
        } catch (e) {
          // If response is HTML (like 500 error), show a descriptive message
          return 'Server Error (${response.statusCode}): The backend is currently unavailable.';
        }
      }
    } catch (e) {
      print('Login error: $e');
      return 'Connection Error: Please check your internet.';
    }
  }

  Future<List<dynamic>> getServices() async {
    try {
      final response = await http.get(Uri.parse('https://backend.joida.uz/api/v1/utils/services'));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return [];
    } catch (e) {
      print('Error fetching services: $e');
      return [];
    }
  }

  Future<String?> uploadFile(String filePath) async {
    try {
      var request = http.MultipartRequest('POST', Uri.parse('https://backend.joida.uz/api/v1/utils/upload'));
      request.files.add(await http.MultipartFile.fromPath('file', filePath));
      
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['url'];
      }
      return null;
    } catch (e) {
      print('Upload error: $e');
      return null;
    }
  }

  Future<String?> register({
    required String fullName,
    required String email,
    required String password,
    bool isExpert = false,
    int? birthYear,
    String? gender,
    String? educationLevel,
    String? workplace,
    List<int>? serviceIds,
    double? latitude,
    double? longitude,
    String? locationName,
    String? profilePictureUrl,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('https://backend.joida.uz/api/v1/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
          'full_name': fullName,
          'is_expert': isExpert,
          'birth_year': birthYear,
          'gender': gender,
          'education_level': educationLevel,
          'workplace': workplace,
          'service_ids': serviceIds ?? [],
          'latitude': latitude,
          'longitude': longitude,
          'service_location_name': locationName,
          'profile_picture_url': profilePictureUrl,
        }),
      );

      if (response.statusCode == 200) {
        return await login(email, password);
      } else {
        final data = json.decode(response.body);
        return data['detail'] ?? 'Registration failed with status: ${response.statusCode}';
      }
    } catch (e) {
      print('Registration detailed error: $e');
      return 'Registration Error: ${e.toString().split(':').last.trim()}';
    }
  }

  Future<String?> signInWithGoogle() async {
    try {
      await _googleSignIn.signOut();
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return "User cancelled Google Sign-In";

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        return 'Google ID Token is null. Platform might not support it.';
      }

      final response = await http.post(
        Uri.parse('https://backend.joida.uz/api/v1/google-auth/google'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'idToken': idToken}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['access_token'];
        await _storage.write(key: 'token', value: _token);
        _isAuthenticated = true;
        _profileCompleted = false;
        notifyListeners();
        return null; // Success
      }
      return 'Server error during Google auth: ${response.statusCode}';
    } catch (e) {
      print('Google Login error: $e');
      return 'Google Provider Error: ${e.toString()}';
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'token');
    await _googleSignIn.signOut();
    _token = null;
    _isAuthenticated = false;
    _profileCompleted = false;
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    _token = await _storage.read(key: 'token');
    if (_token != null) {
      _isAuthenticated = true;
      // In a real app, we'd fetch the user profile here
      _profileCompleted = true; // For demo purposes, assuming auto-login users are completed
      notifyListeners();
    }
  }

  void completeProfile() {
    _profileCompleted = true;
    notifyListeners();
  }
}
