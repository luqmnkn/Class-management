import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function StudentDashboard({ onLogout }) {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [practiced, setPracticed] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const user = auth.currentUser;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStudentData(data);
        const today = new Date().toISOString().split('T')[0];
        if (data.lastPracticeDate === today) setPracticed(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handlePracticed = async () => {
    try {
      const user = auth.currentUser;
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'users', user.uid);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const newStreak = studentData.lastPracticeDate === yesterdayStr ? (studentData.streak || 0) + 1 : 1;
      await updateDoc(docRef, {
        lastPracticeDate: today,
        streak: newStreak
      });
      setStudentData({ ...studentData, lastPracticeDate: today, streak: newStreak });
      setPracticed(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1a5276"/>
      <Text>Loading...</Text>
    </View>
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Hifz Dashboard</Text>
      <Text style={styles.name}>{studentData?.name}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📖 Today's Sabaq</Text>
        <Text style={styles.cardValue}>{studentData?.currentSabaq || 'Not assigned yet'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🗂️ Today's Manzil</Text>
        <Text style={styles.cardValue}>{studentData?.currentManzilJuz ? `Juz ${studentData.currentManzilJuz}` : 'Not assigned yet'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Current Streak</Text>
        <Text style={styles.cardValue}>{studentData?.streak || 0} days</Text>
      </View>

      {!practiced ? (
        <TouchableOpacity style={styles.practiceButton} onPress={handlePracticed}>
          <Text style={styles.practiceButtonText}>✅ Mark Practice Done</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.practicedBadge}>
          <Text style={styles.practicedText}>✅ Practice Done Today!</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a5276', textAlign: 'center', marginBottom: 5 },
  name: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 3 },
  cardTitle: { fontSize: 14, color: '#666', marginBottom: 5 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#1a5276' },
  practiceButton: { backgroundColor: '#1a5276', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  practiceButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  practicedBadge: { backgroundColor: '#d4efdf', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  practicedText: { color: '#1e8449', fontSize: 18, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 8, alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});