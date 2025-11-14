import { StyleSheet, Text, View, Pressable, Alert, Image } from 'react-native';

export default function HomeScreen() {
  const handlePress = () => {
    Alert.alert(
      'Você me tocou!',
      'Este é um pop-up nativo. 👋'
    );
  };

  return (
    <View style={styles.container}>
      {/* CORREÇÃO FINAL! 
        O caminho precisa de DOIS PONTOS (..) para subir
        dois níveis e chegar na pasta raiz 'assets'.
      */}
      <Image
        style={styles.logo}
        source={require('../../assets/icon.png')}
      />

      <Text style={styles.title}>Olá, Mundo!</Text>
      <Text style={styles.subtitle}>Este é meu primeiro app em React Native!</Text

      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Me toque!</Text>
      </Pressable>
    </View>
  );
}

// Os estilos não mudam
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});