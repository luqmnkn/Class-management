import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function RecordRecitation({ onBack, studentData }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow microphone access!');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Could not start recording!');
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      setIsRecording(false);
      setRecordingDone(true);
    } catch (error) {
      Alert.alert('Error', 'Could not stop recording!');
    }
  };

  const playRecording = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      setSound(sound);
      setIsPlaying(true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setIsPlaying(false);
      });
    } catch (error) {
      Alert.alert('Error', 'Could not play recording!');
    }
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const newStreak = studentData?.lastPracticeDate === yesterdayStr
        ? (studentData?.streak || 0) + 1 : 1;
      await updateDoc(doc(db, 'users', user.uid), {
        lastPracticeDate: today,
        streak: newStreak,
        lastRecordingUri: recordingUri
      });
      Alert.alert('Success', 'Recitation submitted successfully!');
      setRecordingDone(false);
      setRecordingUri(null);
      onBack();
    } catch (error) {
      Alert.alert('Error', 'Could not submit recitation!');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Record Recitation</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📖 Today's Sabaq</Text>
        <Text style={styles.infoValue}>{studentData?.currentSabaq || 'Not assigned'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🗂️ Today's Manzil</Text>
        <Text style={styles.infoValue}>{studentData?.currentManzilJuz ? `Juz ${studentData.currentManzilJuz}` : 'Not assigned'}</Text>
      </View>

      {!isRecording && !recordingDone && (
        <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
          <Text style={styles.recordButtonText}>🎙️ Start Recording</Text>
        </TouchableOpacity>
      )}

      {isRecording && (
        <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
          <Text style={styles.stopButtonText}>⏹️ Stop Recording</Text>
        </TouchableOpacity>
      )}

      {recordingDone && (
        <View>
          <TouchableOpacity style={styles.playButton} onPress={playRecording}>
            <Text style={styles.playButtonText}>{isPlaying ? '⏸️ Playing...' : '▶️ Play Recording'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>✅ Submit Recitation</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a5276', textAlign: 'center', marginBottom: 20 },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 3 },
  infoTitle: { fontSize: 14, color: '#666', marginBottom: 5 },
  infoValue: { fontSize: 18, fontWeight: 'bold', color: '#1a5276' },
  recordButton: { backgroundColor: '#1a5276', padding: 20, borderRadius: 50, alignItems: 'center', marginBottom: 15 },
  recordButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  stopButton: { backgroundColor: '#e74c3c', padding: 20, borderRadius: 50, alignItems: 'center', marginBottom: 15 },
  stopButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  playButton: { backgroundColor: '#27ae60', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  playButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  submitButton: { backgroundColor: '#1a5276', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});