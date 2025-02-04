import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EXPO_PUBLIC_GEMINI_API_KEY } from '@env';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(EXPO_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const INITIAL_PROMPT = `You are Lynne, a friendly and educational AI assistant focused on birth control pill education. Your main goals are:
• Help users understand different oral contraceptives (birth control pills) work
• Share reliable, evidence-based information about birth control pills
• Keep the focus on birth control pill education and usage
• Track the user's symptoms and side effects from birth control pills

Key guidelines:
• Keep responses around a few sentences
• Break responses into bullet point format
• Any symptoms or side effects that a user inputs should be treated as if they are logging them. Remember what symptoms they have as they can ask for the trends of their symptoms later.
• Use easy to understand language
• For the past 2 months, the user has been taking birth control and has been experiencing side effects such as nausea, cramping, headaches, and spotting. The headaches appeared last month. You may only talk about this when the user asks about it
• If asked about other birth control methods or random topics, politely redirect to birth control pill topics. Don't answer their questions
• Remind users that this is for educational purposes only and that they should consult with a healthcare provider for personalized medical advice

Example redirection: "While I understand your interest in [other method], I'm specialized in birth control pill education. Would you like to learn about:
• Different types of birth control pills
• How birth control pills work
• Common side effects of birth control pills
• Tips for taking birth control pills effectively"

Remember: Always encourage consulting healthcare providers for personalized medical advice.`;

interface Message {
  text: string;
  isUser: boolean;
}

// Function to convert asterisks to bullet points
const formatMessageText = (text: string) => {
  // First handle bullet points at start of lines
  return text.replace(/^\s*\*\s*/gm, '• ');
};

// Function to render text with bold sections
const renderFormattedText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // This is bold text, remove the asterisks
      const boldText = part.slice(2, -2);
      return <Text key={index} style={{ fontWeight: 'bold' }}>{boldText}</Text>;
    }
    return <Text key={index}>{part}</Text>;
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
        setMessages([{ text: formatMessageText(response.text()), isUser: false }]);
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
      const botMessage = { text: formatMessageText(response.text()), isUser: false };
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <View style={styles.innerContainer}>
          <ScrollView 
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message, index) => (
              <View 
                key={index} 
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.botBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.botText
                ]}>
                  {message.isUser ? message.text : renderFormattedText(formatMessageText(message.text))}
                </Text>
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
              placeholder="Ask about birth control pills..."
              multiline
              maxLength={500}
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
  innerContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
    marginBottom: 20,
  },
  messagesContent: {
    flexGrow: 1,
    paddingBottom: 5,
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
  inputContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 6,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: Platform.OS === 'ios' ? 8 : 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 80,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 