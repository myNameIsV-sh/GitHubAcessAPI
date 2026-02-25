import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ModalScreen() {
    const [owner, setOwner] = useState('');
    const [repo, setRepo] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAddRepository = async () => {
        if (!owner.trim() || !repo.trim()) {
            Alert.alert("Atenção", "Preencha o nome do dono e do repositório.");
            return;
        }

        setLoading(true);
        try {
            // 1. Busca na API
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
            const newRepo = response.data;

            // 2. Recupera repositórios já salvos
            const saved = await AsyncStorage.getItem('@github_repos');
            const currentRepos = saved ? JSON.parse(saved) : [];

            // 3. Verifica se já não foi adicionado antes
            const isAlreadySaved = currentRepos.some((r: any) => r.id === newRepo.id);
            if (isAlreadySaved) {
                Alert.alert("Aviso", "Este repositório já está na sua lista!");
                setLoading(false);
                return;
            }

            // 4. Salva no AsyncStorage
            const updatedRepos = [...currentRepos, newRepo];
            await AsyncStorage.setItem('@github_repos', JSON.stringify(updatedRepos));

            Alert.alert("Sucesso", "Repositório salvo com sucesso!");
            router.back(); // Volta para a tela principal
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                Alert.alert("Erro", "Repositório não encontrado. Verifique o nome do dono e do repositório.");
            } else {
                Alert.alert("Erro", "Ocorreu um erro ao buscar os dados.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Adicionar Repositório</Text>

            <Text style={styles.label}>Dono do Repositório (Owner ID)</Text>
            <TextInput
                style={styles.input}
                placeholder="ex: facebook"
                value={owner}
                onChangeText={setOwner}
                autoCapitalize="none"
                autoCorrect={false}
            />

            <Text style={styles.label}>Nome do Repositório (Repo ID)</Text>
            <TextInput
                style={styles.input}
                placeholder="ex: react-native"
                value={repo}
                onChangeText={setRepo}
                autoCapitalize="none"
                autoCorrect={false}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            ) : (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleAddRepository}>
                        <Text style={styles.buttonText}>Adicionar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
    label: { fontSize: 16, marginBottom: 5, color: '#333', fontWeight: '500' },
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15,
        fontSize: 16, marginBottom: 20, backgroundColor: '#f9f9f9'
    },
    loader: { marginVertical: 20 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
    cancelButton: { backgroundColor: '#FF3B30' },
    addButton: { backgroundColor: '#007AFF' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});