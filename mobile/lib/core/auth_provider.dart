import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthProvider with ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    serverClientId: '492033662946-ilfn30ltnllvasg8no0622ragvnlk86j.apps.googleusercontent.com',
  );
  String? _token;
  bool _isAuthenticated = false;
  bool _profileCompleted = false;
  bool _isInitializing = true;
  Map<String, dynamic>? _currentUser;

  String? get token => _token;
  bool get isAuthenticated => _isAuthenticated;
  bool get profileCompleted => _profileCompleted;
  bool get isInitializing => _isInitializing;
  Map<String, dynamic>? get currentUser => _currentUser;

  AuthProvider() {
    tryAutoLogin();
  }

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
        await fetchUserInfo(); // Fetch user details after login
        _isAuthenticated = true;
        _profileCompleted = true; // Assuming profile is completed for standard login
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
      return [];
    }
  }

  Future<void> fetchUserInfo() async {
    if (_token == null) return;
    try {
      final response = await http.get(
        Uri.parse('https://backend.joida.uz/api/v1/auth/me'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (response.statusCode == 200) {
        _currentUser = json.decode(response.body);
      }
    } catch (e) {
      print('Fetch User Info error: $e');
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

  Future<Map<String, dynamic>?> signInWithGoogle() async {
    try {
      await _googleSignIn.signOut();
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return {'error': 'User cancelled Google Sign-In'};

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        return {'error': 'Google ID Token is null.'};
      }

      final response = await http.post(
        Uri.parse('https://backend.joida.uz/api/v1/google-auth/google'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'idToken': idToken}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['access_token'];
        final bool isNewUser = data['is_new_user'] ?? false;
        
        await _storage.write(key: 'token', value: _token);
        await fetchUserInfo();
        
        _isAuthenticated = true;
        _profileCompleted = !isNewUser; 
        notifyListeners();
        return {'is_new_user': isNewUser};
      } else {
        final errorData = json.decode(response.body);
        return {'error': errorData['detail'] ?? 'Server error: ${response.statusCode}'};
      }
    } catch (e) {
      print('Google Login error: $e');
      return {'error': e.toString()};
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'token');
    await _googleSignIn.signOut();
    _token = null;
    _currentUser = null;
    _isAuthenticated = false;
    _profileCompleted = false;
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    _token = await _storage.read(key: 'token');
    if (_token != null) {
      await fetchUserInfo();
      if (_currentUser != null) {
        _isAuthenticated = true;
        _profileCompleted = true; 
      } else {
        // Token might be expired
        await logout();
      }
    }
    _isInitializing = false;
    notifyListeners();
  }

  Future<List<dynamic>> fetchUserImages() async {
    if (_token == null) return [];
    try {
      final response = await http.get(
        Uri.parse('https://backend.joida.uz/api/v1/user-assets/me/images'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return [];
    } catch (e) {
      print('Fetch User Images error: $e');
      return [];
    }
  }

  Future<bool> addUserImage(String url, {bool isMain = false}) async {
    if (_token == null) return false;
    try {
      final response = await http.post(
        Uri.parse('https://backend.joida.uz/api/v1/user-assets/me/images'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token'
        },
        body: json.encode({'url': url, 'is_main': isMain}),
      );
      if (response.statusCode == 200) {
        await fetchUserInfo(); // Refresh user main photo
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteUserImage(int imageId) async {
    if (_token == null) return false;
    try {
      final response = await http.delete(
        Uri.parse('https://backend.joida.uz/api/v1/user-assets/me/images/$imageId'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (response.statusCode == 200) {
        await fetchUserInfo();
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> setMainImage(int imageId) async {
    if (_token == null) return false;
    try {
      final response = await http.put(
        Uri.parse('https://backend.joida.uz/api/v1/user-assets/me/images/$imageId/set-main'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (response.statusCode == 200) {
        await fetchUserInfo();
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  void completeProfile() {
    _profileCompleted = true;
    notifyListeners();
  }
}
