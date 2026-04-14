import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/theme.dart';

class Message {
  final int id;
  final String sender; // 'me', 'other', 'system'
  final String text;
  final String type; // 'text', 'offer', 'system'
  final String timestamp;
  final Map<String, dynamic>? metadata;

  Message({required this.id, required this.sender, required this.text, required this.type, required this.timestamp, this.metadata});
}

class ChatRoomScreen extends StatefulWidget {
  final String expertName;
  const ChatRoomScreen({super.key, required this.expertName});

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ExpertChatState extends State<ChatRoomScreen> {
  final TextEditingController _controller = TextEditingController();
  bool _isVerified = false; // Privacy Toggle

  final List<Message> _messages = [
    Message(id: 1, sender: 'other', text: 'Assalomu alaykum, quvurda qanday muammo bor?', type: 'text', timestamp: '10:30'),
    Message(id: 2, sender: 'me', text: 'Vaalaykum assalom. Suv sizib chiqyapti, tezroq tuzatish kerak.', type: 'text', timestamp: '10:32'),
    Message(
      id: 3, 
      sender: 'other', 
      text: 'Men borib ko\'rib, tuzatishim mumkin.', 
      type: 'offer', 
      timestamp: '10:35',
      metadata: {'price': '80,000 UZS', 'desc': 'Quvurni almashtirish va germetiklash'}
    ),
    Message(id: 4, sender: 'system', text: 'chat.safety_tip'.tr(), type: 'system', timestamp: '10:36'),
  ];

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: AppTheme.primary.withOpacity(0.1),
              child: Icon(_isVerified ? Icons.person : Icons.lock_outline, color: AppTheme.primary, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_isVerified ? widget.expertName : 'chat.expert_id'.tr(namedArgs: {'id': '382'}), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text('chat.online'.tr(), style: const TextStyle(color: Colors.greenAccent, fontSize: 12)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(_isVerified ? Icons.shield : Icons.shield_outlined, color: AppTheme.primary),
            onPressed: () => setState(() => _isVerified = !_isVerified),
          ),
          IconButton(icon: const Icon(Icons.phone_outlined), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: _messages.length,
              itemBuilder: (context, index) => _buildMessageBubble(_messages[index], isDark),
            ),
          ),
          _buildInputArea(isDark),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Message message, bool isDark) {
    if (message.type == 'system') {
      return Container(
        margin: const EdgeInsets.symmetric(vertical: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.orange.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.orange.withOpacity(0.1)),
        ),
        child: Row(
          children: [
            const Icon(Icons.info_outline, color: Colors.orangeAccent, size: 20),
            const SizedBox(width: 12),
            Expanded(child: Text(message.text, style: const TextStyle(color: Colors.orangeAccent, fontSize: 13, fontWeight: FontWeight.w500))),
          ],
        ),
      );
    }

    if (message.type == 'offer') {
      return Container(
        margin: const EdgeInsets.symmetric(vertical: 12),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withOpacity(0.05) : Colors.white,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: AppTheme.primary.withOpacity(0.3), width: 1),
          boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 5))],
        ),
        child: Column(
          children: [
            Row(
              children: [
                const Icon(Icons.verified_user_outlined, color: AppTheme.primary),
                const SizedBox(width: 8),
                Text('chat.official_offer'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              ],
            ),
            const SizedBox(height: 16),
            Text(message.metadata?['desc'] ?? '', style: TextStyle(color: isDark ? Colors.grey : Colors.grey.shade600)),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('chat.price'.tr(), style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
                Text(message.metadata?['price'] ?? '', style: const TextStyle(color: Colors.greenAccent, fontSize: 24, fontWeight: FontWeight.black)),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text('chat.reject'.tr()),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text('chat.accept'.tr(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    bool isMe = message.sender == 'me';
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isMe ? AppTheme.primary : (isDark ? Colors.white.withOpacity(0.08) : Colors.white),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
            bottomLeft: Radius.circular(isMe ? 20 : 0),
            bottomRight: Radius.circular(isMe ? 0 : 20),
          ),
          border: isMe ? null : Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(message.text, style: TextStyle(color: isMe ? Colors.white : (isDark ? Colors.white : Colors.black87), fontSize: 15)),
            const SizedBox(height: 4),
            Text(message.timestamp, style: TextStyle(color: isMe ? Colors.white70 : Colors.grey, fontSize: 10)),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(20),
      color: isDark ? Colors.white.withOpacity(0.02) : Colors.white,
      child: SafeArea(
        child: Row(
          children: [
            IconButton(icon: const Icon(Icons.attach_file, color: Colors.grey), onPressed: () {}),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.03),
                  borderRadius: BorderRadius.circular(25),
                ),
                child: TextField(
                  controller: _controller,
                  decoration: InputDecoration(hintText: 'chat.type_message'.tr(), border: InputDescription.none),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              decoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
              child: IconButton(
                onPressed: () {},
                icon: const Icon(Icons.send, color: Colors.white, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ChatRoomScreen extends StatefulWidget {
  final String expertName;
  const ChatRoomScreen({super.key, required this.expertName});

  @override
  State<ChatRoomScreen> createState() => _ExpertChatState();
}

// Add simple InputDescription for mocking behavior
class InputDescription {
  static const none = InputBorder.none;
}
