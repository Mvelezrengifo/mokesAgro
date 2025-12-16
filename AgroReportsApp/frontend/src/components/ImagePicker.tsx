import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { COLORS, SPACING } from '../utils/constants';

interface ImagePickerProps {
  images: any[];
  onImagesChange: (images: any[]) => void;
  maxImages?: number;
}

const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 5
}) => {
  const selectImages = () => {
    if (images.length >= maxImages) {
      Alert.alert('Límite alcanzado', `Solo puedes seleccionar hasta ${maxImages} imágenes`);
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      selectionLimit: maxImages - images.length,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets) {
        const newImages = [...images, ...response.assets];
        onImagesChange(newImages);
      }
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Imágenes ({images.length}/{maxImages})</Text>
      
      <TouchableOpacity style={styles.addButton} onPress={selectImages}>
        <Text style={styles.addButtonText}>+ Agregar Imágenes</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesList}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '500',
  },
  imagesList: {
    marginTop: SPACING.md,
  },
  imageContainer: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ImagePickerComponent;