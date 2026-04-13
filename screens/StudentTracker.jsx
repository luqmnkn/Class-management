import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function StudentTracker({ onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const user = auth.currentUser;
      const q = query(collection(db, 'users'), where('role', '==', 'student'), where('teacherId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const studentList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentList);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1a5276"/>
      <Text>Loading students...</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Student Tracker</Text>
      <Text style={styles.date}>Today: {today}</Text>

      {students.map(student => (
        <View key={student.id} style={styles.studentCard}>
          <Text style={styles.studentName}>{student.name}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>📖 Sabaq:</Text>
            <Text style={styles.value}>{student.currentSabaq || 'Not assigned'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>🗂️ Manzil:</Text>
            <Text style={styles.value}>{student.currentManzilJuz ? `Juz ${student.currentManzilJuz}` : 'Not assigned'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>🔥 Streak:</Text>
            <Text style={styles.value}>{student.streak || 0} days</Text>
          </View>

          <View style={[styles.statusBadge, student.lastPracticeDate === today ? styles.practiced : styles.notPracticed]}>
            <Text style={styles.statusText}>
              {student.lastPracticeDate === today ? '✅ Practiced Today' : '❌ Not Practiced Yet'}
            </Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a5276', marginBottom: 5, textAlign: 'center' },
  date: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  studentCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 3 },
  studentName: { fontSize: 18, fontWeight: 'bold', color: '#1a5276', marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', width: 90 },
  value: { fontSize: 14, color: '#555', flex: 1 },
  statusBadge: { padding: 8, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  practiced: { backgroundColor: '#d4efdf' },
  notPracticed: { backgroundColor: '#fadbd8' },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  backButton: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});