import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AdminDashboard from '../../screens/AdminDashboard';
import ParentDashboard from '../../screens/ParentDashboard';
import StudentDashboard from '../../screens/StudentDashboard';
import TeacherDashboard from '../../screens/TeacherDashboard';
import { auth, db } from '../../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState(null);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserRole(docSnap.data().role);
      } else {
        Alert.alert('Error', 'User role not found!');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid email or password!');
    }
  };

if (userRole === 'admin') return <AdminDashboard onLogout={() => setUserRole(null)} />;
if (userRole === 'teacher') return <TeacherDashboard onLogout={() => setUserRole(null)} />;
if (userRole === 'parent') return <ParentDashboard onLogout={() => setUserRole(null)} />;
if (userRole === 'student') return <StudentDashboard onLogout={() => setUserRole(null)} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hifz Tutor</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#1a5276' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#1a5276', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
