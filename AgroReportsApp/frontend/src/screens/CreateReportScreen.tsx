import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CheckboxList from '../components/CheckboxList';
import ImagePickerComponent from '../components/ImagePicker';
import { reportAPI } from '../services/api';
import { PROBLEMS_LIST, MATERIALS_LIST, COLORS, SPACING } from '../utils/constants';

interface CreateReportScreenProps {
  navigation: any;
}

const CreateReportScreen: React.FC<CreateReportScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [observations, setObservations] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !authorName) {
      Alert.alert('Error', 'Por favor completa al menos el título y el nombre del autor');
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        title,
        authorName,
        location,
        problems: selectedProblems,
        materials: selectedMaterials,
        observations,
        recommendations,
      };

      await reportAPI.createReport(reportData, images);
      
      Alert.alert('Éxito', 'Informe creado exitosamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al crear el informe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Nuevo Informe</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título del Informe *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ej: Inspección Cultivo de Maíz - Lote 5"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Autor *</Text>
            <TextInput
              style={styles.input}
              value={authorName}
              onChangeText={setAuthorName}
              placeholder="Nombre completo del ingeniero"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ubicación</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Ej: Finca La Esperanza, Sector Norte"
            />
          </View>

          <CheckboxList
            title="Problemas Identificados"
            items={PROBLEMS_LIST}
            selectedItems={selectedProblems}
            onSelectionChange={setSelectedProblems}
          />

          <CheckboxList
            title="Materiales Utilizados/Recomendados"
            items={MATERIALS_LIST}
            selectedItems={selectedMaterials}
            onSelectionChange={setSelectedMaterials}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observaciones</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={observations}
              onChangeText={setObservations}
              placeholder="Describe las observaciones detalladas del campo..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recomendaciones</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={recommendations}
              onChangeText={setRecommendations}
              placeholder="Proporciona recomendaciones técnicas..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <ImagePickerComponent
            images={images}
            onImagesChange={setImages}
            maxImages={5}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creando...' : 'Crear Informe'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.surface,
    textAlign: 'center',
  },
  form: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: COLORS.surface,
  },
  textArea: {
    height: 100,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateReportScreen;