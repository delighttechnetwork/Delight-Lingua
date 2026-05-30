import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delight Lingua</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type or paste text here..."
          multiline
          style={styles.input}
        />
        <Button title="Translate" onPress={() => {}} />
      </View>
      <ScrollView style={styles.history}>
        <Text style={styles.subtitle}>History</Text>
        {/* History items would go here */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    elevation: 3,
  },
  input: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  history: {
    flex: 1,
  }
});
