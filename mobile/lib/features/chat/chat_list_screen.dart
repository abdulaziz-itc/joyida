import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:easy_localization/easy_localization.dart';
import '../../core/auth_provider.dart';
import '../../core/theme.dart';
import 'chat_room_screen.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  List<dynamic> _rooms = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRooms();
  }

  Future<void> _fetchRooms() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;
    if (token == null) return;

    try {
      final response = await http.get(
        Uri.parse('https://backend.joida.uz/api/v1/chat/rooms'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        if (mounted) {
          setState(() {
            _rooms = json.decode(response.body);
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        title: Text('chat.title'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _rooms.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _fetchRooms,
                  child: ListView.builder(
                    itemCount: _rooms.length,
                    itemBuilder: (context, index) {
                      final room = _rooms[index];
                      final otherUser = room['other_user'];
                      final lastMsg = room['last_message'];
                      
                      return ListTile(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ChatRoomScreen(
                                roomId: room['id'],
                                otherUserName: otherUser['full_name'],
                                otherUserProfession: otherUser['profession'],
                              ),
                            ),
                          ).then((_) => _fetchRooms());
                        },
                        leading: CircleAvatar(
                          radius: 28,
                          backgroundColor: AppTheme.primary.withOpacity(0.1),
                          backgroundImage: otherUser['profile_picture_url'] != null
                              ? NetworkImage(otherUser['profile_picture_url'])
                              : null,
                          child: otherUser['profile_picture_url'] == null
                              ? const Icon(Icons.person, color: AppTheme.primary)
                              : null,
                        ),
                        title: Text(otherUser['full_name'],
                            style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(
                          lastMsg['text'],
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              _formatTime(lastMsg['created_at']),
                              style: const TextStyle(color: Colors.grey, fontSize: 10),
                            ),
                            const Icon(Icons.chevron_right, size: 16, color: Colors.grey),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildEmptyState() {
     return Center(
       child: Column(
         mainAxisAlignment: MainAxisAlignment.center,
         children: [
            Icon(Icons.chat_bubble_outline, size: 80, color: Colors.grey.withOpacity(0.3)),
            const SizedBox(height: 20),
            Text("Hali suhbatlar yo'q", style: TextStyle(color: Colors.grey.shade600, fontSize: 16)),
         ],
       ),
     );
  }

  String _formatTime(String? dateStr) {
    if (dateStr == null) return "";
    try {
      final date = DateTime.parse(dateStr);
      return "${date.hour}:${date.minute.toString().padLeft(2, '0')}";
    } catch (e) {
      return "";
    }
  }
}
