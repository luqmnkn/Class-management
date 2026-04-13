import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import AssignLesson from './AssignLesson';
import StudentTracker from './StudentTracker';

export default function TeacherDashboard({ onLogout }) {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  if (currentScreen === 'assignLesson') return <AssignLesson onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'studentTracker') return <StudentTracker onBack={() => setCurrentScreen('dashboard')} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Dashboard</Text>
      <Text style={styles.subtitle}>Welcome Teacher!</Text>

      <TouchableOpacity style={styles.menuButton} onPress={() => setCurrentScreen('assignLesson')}>
        <Text style={styles.menuButtonText}>📚 Assign Lesson</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={() => setCurrentScreen('studentTracker')}>
        <Text style={styles.menuButtonText}>📊 Student Tracker</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a5276', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 40 },
  menuButton: { backgroundColor: '#1a5276', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 15 },
  menuButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 20 },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});