import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function ParentDashboard({ onLogout }) {
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildData();
  }, []);

  const fetchChildData = async () => {
    try {
      const user = auth.currentUser;
      const parentRef = doc(db, 'users', user.uid);
      const parentSnap = await getDoc(parentRef);
      if (parentSnap.exists()) {
        const parentData = parentSnap.data();
        const childRef = doc(db, 'users', parentData.studentId);
        const childSnap = await getDoc(childRef);
        if (childSnap.exists()) {
          setChildData(childSnap.data());
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
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
  const practiced = childData?.lastPracticeDate === today;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Parent Dashboard</Text>
      <Text style={styles.subtitle}>Monitoring: {childData?.name}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📖 Today's Sabaq</Text>
        <Text style={styles.cardValue}>{childData?.currentSabaq || 'Not assigned yet'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🗂️ Today's Manzil</Text>
        <Text style={styles.cardValue}>{childData?.currentManzilJuz ? `Juz ${childData.currentManzilJuz}` : 'Not assigned yet'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Current Streak</Text>
        <Text style={styles.cardValue}>{childData?.streak || 0} days</Text>
      </View>

      <View style={[styles.statusBadge, practiced ? styles.practiced : styles.notPracticed]}>
        <Text style={styles.statusText}>
          {practiced ? '✅ Child Practiced Today!' : '❌ Child Has Not Practiced Yet!'}
        </Text>
      </View>

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
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 3 },
  cardTitle: { fontSize: 14, color: '#666', marginBottom: 5 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#1a5276' },
  statusBadge: { padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  practiced: { backgroundColor: '#d4efdf' },
  notPracticed: { backgroundColor: '#fadbd8' },
  statusText: { fontSize: 16, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 8, alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});