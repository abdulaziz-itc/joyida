import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthProvider with ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  String? _token;
  bool _isAuthenticated = false;
  bool _profileCompleted = false;

  String? get token => _token;
  bool get isAuthenticated => _isAuthenticated;
  bool get profileCompleted => _profileCompleted;

  Future<bool> login(String email, String password) async {
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
        // In a real app, we'd fetch the user profile here to check profileCompleted
        _profileCompleted = false; 
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  Future<bool> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return false;

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) return false;

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
        return true;
      }
      return false;
    } catch (e) {
      print('Google Login error: $e');
      return false;
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
