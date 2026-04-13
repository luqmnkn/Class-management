import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function AssignLesson({ onBack }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sabaq, setSabaq] = useState('');
  const [manzilJuz, setManzilJuz] = useState('');

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
    } catch (error) {
      Alert.alert('Error', 'Could not fetch students!');
    }
  };

  const handleAssignLesson = async () => {
    if (!selectedStudent || !sabaq || !manzilJuz) {
      Alert.alert('Error', 'Please fill all fields!');
      return;
    }
    try {
      const studentRef = doc(db, 'users', selectedStudent.id);
      const today = new Date().toISOString().split('T')[0];
      await updateDoc(studentRef, {
        currentSabaq: sabaq,
        currentManzilJuz: manzilJuz,
        lessonDate: today
      });
      Alert.alert('Success', `Lesson assigned to ${selectedStudent.name}!`);
      setSabaq('');
      setManzilJuz('');
      setSelectedStudent(null);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Assign Lesson</Text>

      <Text style={styles.label}>Select Student:</Text>
      {students.map(student => (
        <TouchableOpacity
          key={student.id}
          style={[styles.studentButton, selectedStudent?.id === student.id && styles.selectedStudent]}
          onPress={() => setSelectedStudent(student)}>
          <Text style={styles.studentButtonText}>{student.name}</Text>
        </TouchableOpacity>
      ))}

      {selectedStudent && (
        <View style={styles.formContainer}>
          <Text style={styles.selectedText}>Selected: {selectedStudent.name}</Text>
          <TextInput
            style={styles.input}
            placeholder="Sabaq (e.g. Al-Baqarah Ayah 1-5)"
            value={sabaq}
            onChangeText={setSabaq}/>
          <TextInput
            style={styles.input}
            placeholder="Manzil Juz (e.g. Juz 3)"
            value={manzilJuz}
            onChangeText={setManzilJuz}
            keyboardType="numeric"/>
          <TouchableOpacity style={styles.button} onPress={handleAssignLesson}>
            <Text style={styles.buttonText}>Assign Lesson</Text>
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
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a5276', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  studentButton: { backgroundColor: '#eaf0fb', padding: 12, borderRadius: 8, marginBottom: 10 },
  selectedStudent: { backgroundColor: '#1a5276' },
  studentButtonText: { fontSize: 16, color: '#1a5276', fontWeight: 'bold' },
  selectedText: { fontSize: 16, color: '#1a5276', fontWeight: 'bold', marginBottom: 15 },
  formContainer: { marginTop: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#1a5276', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});