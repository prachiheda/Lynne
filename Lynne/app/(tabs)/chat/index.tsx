import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EXPO_PUBLIC_GEMINI_API_KEY } from '@env';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(EXPO_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

const INITIAL_PROMPT = `You are Lynne, a friendly and educational AI assistant focused on birth control pill education. Your main goals are:

• Help users understand different oral contraceptives (birth control pills) work
• Share reliable, evidence-based information about birth control pills
• Keep the focus on birth control pill education and usage
• Track the user's symptoms and side effects from birth control pills

Key guidelines:
• Use *italics* for emphasis and **bold** for important points
• Keep responses concise and easy to understand for a regular person
• Always include bullet points for clarity
• If asked about other birth control methods, politely redirect to birth control pill topics
• Remind users that this is for educational purposes only

Remember to use:
• **bold** for important warnings
• _underline_ for medical advice disclaimers
• *italics* for emphasis

Example redirection: "While I understand your interest in [other method], I'm specialized in birth control pill education. Would you like to learn about:
• Different types of birth control pills
• How birth control pills work
• Common side effects of birth control pills
• Tips for taking birth control pills effectively"

Remember: Always encourage consulting healthcare providers for personalized medical advice.

How can I help you learn about birth control pills today?`;

interface Message {
  text: string;
  isUser: boolean;
}

// Function to parse markdown-style formatting
const parseFormatting = (text: string) => {
  // Clean up any malformed formatting and normalize spacing
  text = text
    // Normalize newlines and remove excessive spacing
    .replace(/\n{2,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    // Fix malformed asterisks and underscores
    .replace(/(\w)[\*_]/g, '$1')
    .replace(/[\*_](\w)/g, '$1')
    // Fix bullet points with proper spacing
    .replace(/(?:^|\n)[\s]*[•\*][\s]*/g, '\n• ')
    .replace(/\n{2,}•/g, '\n•')
    // Fix numbered lists
    .replace(/(?:^|\n)[\s]*(\d+)\.[\s]*/g, '\n$1. ')
    // Remove extra whitespace
    .replace(/[ \t]+/g, ' ')
    .trim();

  // Replace **text** with bold style
  text = text.replace(/\*\*(.*?)\*\*/g, (_, p1) => `[b]${p1}[/b]`);
  // Replace *text* with italic style
  text = text.replace(/\*((?!\*).+?)\*/g, (_, p1) => `[i]${p1}[/i]`);
  // Replace _text_ with underline style
  text = text.replace(/_((?!_).+?)_/g, (_, p1) => `[u]${p1}[/u]`);
  
  // Split into segments
  const segments = text.split(/\[(\/?(b|i|u))\]/);
  
  return segments.map((segment, index) => {
    if (segment === 'b') return null;
    if (segment === 'i') return null;
    if (segment === 'u') return null;
    if (segment === '/b') return null;
    if (segment === '/i') return null;
    if (segment === '/u') return null;
    
    const style: Array<{ fontWeight?: 'bold'; fontStyle?: 'italic'; textDecorationLine?: 'underline' }> = [];
    if (index > 0) {
      const tag = segments[index - 1];
      if (tag === 'b') style.push(styles.boldText);
      if (tag === 'i') style.push(styles.italicText);
      if (tag === 'u') style.push(styles.underlineText);
    }
    
    // Handle bullet points and numbered lists with proper indentation
    const lines = segment.split('\n').filter(line => line.trim()).map((line, lineIndex) => {
      if (line.startsWith('• ') || /^\d+\.\s/.test(line)) {
        return (
          <View key={lineIndex} style={styles.listItemContainer}>
            <Text style={[styles.messageText, ...style, styles.botText]}>
              {line.trim()}
            </Text>
          </View>
        );
      }
      
      // Regular text
      return (
        <Text key={lineIndex} style={[styles.messageText, ...style, styles.botText]}>
          {line.trim()}
        </Text>
      );
    });

    return <View key={index} style={styles.textContainer}>{lines}</View>;
  });
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<any>(null);

  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      try {
        const newChat = model.startChat({
          history: [
            {
              role: 'user',
              parts: [{ text: INITIAL_PROMPT }],
            },
          ],
        });
        setChat(newChat);
        
        const result = await newChat.sendMessage([{ text: INITIAL_PROMPT }]);
        const response = await result.response;
        setMessages([{ text: response.text(), isUser: false }]);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setMessages([{ 
          text: 'Hi! I\'m Lynne, your birth control education assistant. How can I help you learn about birth control options today?',
          isUser: false 
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || !chat) return;

    const userMessage = { text: inputText.trim(), isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await chat.sendMessage([{ text: inputText.trim() }]);
      const response = await result.response;
      const botMessage = { text: response.text(), isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        text: 'I apologize, but I encountered an error. Please try asking your question again.',
        isUser: false 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.messagesContainer}>
          {messages.map((message, index) => (
            <View 
              key={index} 
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.botBubble
              ]}
            >
              {message.isUser ? (
                <Text style={[styles.messageText, styles.userText]}>
                  {message.text}
                </Text>
              ) : (
                parseFormatting(message.text)
              )}
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageBubble, styles.botBubble]}>
              <Text style={[styles.messageText, styles.botText]}>Typing...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about birth control options..."
            multiline
            placeholderTextColor="#666"
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]} 
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
    marginVertical: 5,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#E9E9EB',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#000',
  },
  boldText: {
    fontWeight: 'bold',
  },
  italicText: {
    fontStyle: 'italic',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listItemContainer: {
    paddingLeft: 16,
    marginVertical: 4,
  },
  textContainer: {
    marginBottom: 4,
  },
}); 