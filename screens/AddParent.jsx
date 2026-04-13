import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function AddParent({ onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  const handleAddParent = async () => {
    if (!name || !email || !password || !phone || !studentEmail) {
      Alert.alert('Error', 'Please fill all fields!');
      return;
    }
    try {
      const studentsRef = collection(db, 'users');
      const q = query(studentsRef, where('email', '==', studentEmail), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        Alert.alert('Error', 'Student email not found!');
        return;
      }
      const studentDoc = querySnapshot.docs[0];
      const studentId = studentDoc.id;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        phone: phone,
        role: 'parent',
        studentId: studentId,
        createdAt: new Date()
      });
      Alert.alert('Success', 'Parent added successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setStudentEmail('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Parent</Text>
      <TextInput style={styles.input} placeholder="Parent Full Name" value={name} onChangeText={setName}/>
      <TextInput style={styles.input} placeholder="Parent Email" value={email} onChangeText={setEmail}/>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>
      <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad"/>
      <TextInput style={styles.input} placeholder="Student Email (to link)" value={studentEmail} onChangeText={setStudentEmail}/>
      <TouchableOpacity style={styles.button} onPress={handleAddParent}>
        <Text style={styles.buttonText}>Add Parent</Text>
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
  button: { backgroundColor: '#1a5276', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 8, alignItems: 'center' },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});