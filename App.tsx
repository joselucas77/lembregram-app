import React, { useState } from "react";
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

export default function HomeScreen() {
  const [mensagem, setMensagem] = useState("");
  const [data, setData] = useState(new Date());

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const openPicker = (mode: "date" | "time") => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (event.type === "set" && selectedDate) {
      setData(selectedDate);
    }
  };

  const handleEnviarLembrete = async () => {
    if (!mensagem.trim()) {
      Alert.alert("Atenção", "Por favor, digite a mensagem do seu lembrete.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensagem: mensagem.trim(),
          // Envia a data no formato padrão UTC
          data_agendada: data.toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert(
          "Sucesso 🎉",
          "Seu lembrete foi agendado e será enviado no Telegram!",
        );
        setMensagem("");
        setData(new Date());
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Erro no Servidor",
          errorData.message || "Não foi possível salvar o lembrete.",
        );
      }
    } catch (error) {
      Alert.alert(
        "Erro de Conexão",
        "Não foi possível se comunicar com a API da Vercel.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>LembreGram</Text>
        <Text style={styles.subtitle}>
          Agende uma notificação para o seu Telegram
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>O que você quer lembrar?</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem aqui..."
            placeholderTextColor="#999"
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
            <View>
              <DateTimePicker
                value={data}
                mode={pickerMode}
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeDate}
              />
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.closeButtoniOS}
                  onPress={() => setShowPicker(false)}>
                  <Text style={styles.closeButtonTextiOS}>Confirmar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
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
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#24292e",
    textAlign: "center",
    marginBottom: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e4e8",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#24292e",
    height: 100,
    textAlignVertical: "top",
    backgroundColor: "#fafbfc",
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
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0366d6",
  },
  closeButtoniOS: {
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
  },
  closeButtonTextiOS: {
    color: "#0366d6",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#2ea44f",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#94d3a2",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
