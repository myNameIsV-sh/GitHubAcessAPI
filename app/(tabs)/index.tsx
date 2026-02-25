import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

interface Repo {
    id: number;
    full_name: string;
    stargazers_count: number;
    language: string;
    owner: {
        login: string;
        avatar_url: string;
    };
}

export default function HomeScreen() {
    const [repositories, setRepositories] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Função para carregar os dados do AsyncStorage
    const loadRepos = async () => {
        try {
            setLoading(true);
            const saved = await AsyncStorage.getItem('@github_repos');
            if (saved) {
                setRepositories(JSON.parse(saved));
            }
        } catch (e) {
            Alert.alert("Erro", "Falha ao carregar repositórios salvos.");
        } finally {
            setLoading(false);
        }
    };

    // Recarrega os dados sempre que a tela ganha foco (ex: ao fechar o modal)
    useFocusEffect(
        useCallback(() => {
            loadRepos();
        }, [])
    );

    // Função para limpar todos os dados salvos
    const clearAll = async () => {
        if (Platform.OS === 'web') {
            const confirmou = window.confirm("Tem certeza que deseja remover todos os repositórios salvos?");
            if (confirmou) {
                await AsyncStorage.removeItem('@github_repos');
                setRepositories([]);
            }
            return;
        }

        // Código original para celular
        Alert.alert("Limpar Tudo", "Tem certeza que deseja remover todos os repositórios salvos?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Sim, limpar",
                style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem('@github_repos');
                    setRepositories([]);
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: Repo }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.owner.avatar_url }} style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.repoName}>{item.full_name}</Text>
                <Text style={styles.ownerName}>@{item.owner.login}</Text>
                <View style={styles.stats}>
                    <Text style={styles.badge}>⭐ {item.stargazers_count}</Text>
                    {item.language && <Text style={styles.badge}>💻 {item.language}</Text>}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Meus Repos</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={() => router.push('/modal')} style={styles.btnIcon}>
                        <Text style={styles.btnText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clearAll} style={[styles.btnIcon, styles.btnRemove]}>
                        <Text style={styles.btnText}>-</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Listagem ou Loading */}
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            ) : repositories.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum repositório salvo ainda.</Text>
            ) : (
                <FlatList
                    data={repositories}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, paddingTop: 60, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#ddd'
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    headerButtons: { flexDirection: 'row', gap: 10 },
    btnIcon: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF',
        justifyContent: 'center', alignItems: 'center'
    },
    btnRemove: { backgroundColor: '#FF3B30' },
    btnText: { color: '#fff', fontSize: 24, fontWeight: 'bold', lineHeight: 26 },
    loader: { marginTop: 50 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#666', fontSize: 16 },
    listContainer: { padding: 15 },
    card: {
        flexDirection: 'row', backgroundColor: '#fff', padding: 15,
        borderRadius: 10, marginBottom: 15, elevation: 2, shadowColor: '#000',
        shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4
    },
    avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
    info: { flex: 1, justifyContent: 'center' },
    repoName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 2 },
    ownerName: { fontSize: 14, color: '#666', marginBottom: 8 },
    stats: { flexDirection: 'row', gap: 10 },
    badge: { fontSize: 12, backgroundColor: '#eee', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' }
});