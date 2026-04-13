import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import AddTeacher from './AddTeacher';
import AddStudent from './AddStudent';
import AddParent from './AddParent';

export default function AdminDashboard({ onLogout }) {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  if (currentScreen === 'addTeacher') return <AddTeacher onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'addStudent') return <AddStudent onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'addParent') return <AddParent onBack={() => setCurrentScreen('dashboard')} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome Admin!</Text>

      <TouchableOpacity style={styles.menuButton} onPress={() => setCurrentScreen('addTeacher')}>
        <Text style={styles.menuButtonText}>➕ Add Teacher</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={() => setCurrentScreen('addStudent')}>
        <Text style={styles.menuButtonText}>➕ Add Student</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={() => setCurrentScreen('addParent')}>
        <Text style={styles.menuButtonText}>➕ Add Parent</Text>
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