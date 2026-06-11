import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";

export default function HomeScreen() {
  const [mensagem, setMensagem] = useState("");
  const [data, setData] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [loading, setLoading] = useState(false);
  const [autenticado, setAutenticado] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Lógica de Biometria
  const verificarBiometria = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      setAutenticado(true);
      return;
    }

    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: "Autentique-se para acessar o LembreGram",
      fallbackLabel: "Usar senha",
    });

    if (resultado.success) {
      setAutenticado(true);
    } else {
      Alert.alert("Erro", "Autenticação falhou ou foi cancelada.");
    }
  };

  useEffect(() => {
    verificarBiometria();
  }, []);

  const openPicker = (mode: "date" | "time") => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "set" && selectedDate) setData(selectedDate);
  };

  const handleEnviarLembrete = async () => {
    if (!mensagem.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Atenção", "Por favor, digite a mensagem.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem: mensagem.trim(),
          data_agendada: data.toISOString(),
        }),
      });

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Sucesso 🎉", "Lembrete agendado no Telegram!");
        setMensagem("");
        setData(new Date());
      } else {
        throw new Error("Erro no servidor");
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Não foi possível conectar à API.");
    } finally {
      setLoading(false);
    }
  };

  // Tela de Bloqueio (se não autenticado)
  if (!autenticado) {
    return (
      <View style={styles.containerLock}>
        <Text style={styles.logo}>LembreGram 🔒</Text>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={verificarBiometria}>
          <Text style={styles.submitButtonText}>Tocar para Desbloquear</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Tela Principal (após autenticação)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.logo}>LembreGram</Text>
        <Text style={styles.subtitle}>Agende para o seu Telegram</Text>

        <View style={styles.card}>
          <Text style={styles.label}>O que você quer lembrar?</Text>
          <TextInput
            style={styles.input}
            value={mensagem}
            onChangeText={setMensagem}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Quando quer receber?</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => openPicker("date")}>
              <Text style={styles.dateText}>
                {data.toLocaleDateString("pt-BR")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => openPicker("time")}>
              <Text style={styles.dateText}>
                {data.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={data}
              mode={pickerMode}
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeDate}
            />
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleEnviarLembrete}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Agendar Lembrete</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb" },
  containerLock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
  },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#24292e",
    textAlign: "center",
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    color: "#6a737d",
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
  },
  label: { fontSize: 15, fontWeight: "600", color: "#444", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e1e4e8",
    borderRadius: 10,
    padding: 12,
    height: 100,
    backgroundColor: "#fafbfc",
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e1e4e8",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#fafbfc",
    alignItems: "center",
    marginHorizontal: 4,
  },
  dateText: { fontSize: 16, color: "#0366d6" },
  submitButton: {
    backgroundColor: "#2ea44f",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
