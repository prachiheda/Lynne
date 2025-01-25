import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';

const styles = StyleSheet.create<{[key: string]: ViewStyle | TextStyle | ImageStyle}>({
  circleDoneIcon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  recommendationContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  recommendationText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  recommendationOption: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 5,
    color: '#4CAF50',
  },
});