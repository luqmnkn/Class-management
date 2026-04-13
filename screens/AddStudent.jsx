import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function AddStudent({ onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const querySnapshot = await getDocs(q);
      const teacherList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeachers(teacherList);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch teachers!');
    }
  };

  const handleAddStudent = async () => {
    if (!name || !email || !password || !phone || !parentName || !selectedTeacher) {
      Alert.alert('Error', 'Please fill all fields and select a teacher!');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        phone: phone,
        parentName: parentName,
        role: 'student',
        teacherId: selectedTeacher.id,
        currentSabaq: '',
        currentJuz: 1,
        streak: 0,
        lastPracticeDate: '',
        createdAt: new Date()
      });
      Alert.alert('Success', 'Student added successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setParentName('');
      setSelectedTeacher(null);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Student</Text>
      <TextInput style={styles.input} placeholder="Student Full Name" value={name} onChangeText={setName}/>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail}/>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>
      <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad"/>
      <TextInput style={styles.input} placeholder="Parent Name" value={parentName} onChangeText={setParentName}/>
      <Text style={styles.label}>Select Teacher:</Text>
      {teachers.map(teacher => (
        <TouchableOpacity
          key={teacher.id}
          style={[styles.teacherButton, selectedTeacher?.id === teacher.id && styles.selectedTeacher]}
          onPress={() => setSelectedTeacher(teacher)}>
          <Text style={styles.teacherButtonText}>{teacher.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleAddStudent}>
        <Text style={styles.buttonText}>Add Student</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a5276', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
  teacherButton: { backgroundColor: '#eaf0fb', padding: 12, borderRadius: 8, marginBottom: 10 },
  selectedTeacher: { backgroundColor: '#1a5276' },
  teacherButtonText: { fontSize: 16, color: '#1a5276', fontWeight: 'bold' },
  button: { backgroundColor: '#1a5276', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 8, alignItems: 'center' },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});