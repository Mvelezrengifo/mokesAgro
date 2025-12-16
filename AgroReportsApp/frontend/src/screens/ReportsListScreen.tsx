import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { reportAPI } from '../services/api';
import { AuthService } from '../services/auth';
import { Report, User } from '../types';
import { COLORS, SPACING } from '../utils/constants';

interface ReportsListScreenProps {
  navigation: any;
}

const ReportsListScreen: React.FC<ReportsListScreenProps> = ({ navigation }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getReports();
      setReports(response.reports);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los informes');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    const user = await AuthService.getUser();
    setCurrentUser(user);
  };

  useFocusEffect(
    useCallback(() => {
      loadCurrentUser();
      loadReports();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleGeneratePDF = async (reportId: string) => {
    try {
      Alert.alert(
        'Generar PDF',
        '¿Deseas generar el PDF de este informe?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Generar',
            onPress: async () => {
              try {
                await reportAPI.generatePDF(reportId);
                Alert.alert('Éxito', 'PDF generado exitosamente');
                loadReports(); // Recargar para actualizar el estado
              } catch (error: any) {
                Alert.alert('Error', 'No se pudo generar el PDF');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Error al generar PDF');
    }
  };

  const handleShareWhatsApp = async (reportId: string) => {
    try {
      const response = await reportAPI.getWhatsAppShareLink(reportId);
      // En una implementación real, aquí abrirías WhatsApp
      Alert.alert('Compartir', 'Funcionalidad de WhatsApp lista para implementar');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo generar el enlace de WhatsApp');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (currentUser?.role !== 'engineer') {
      Alert.alert('Error', 'Solo los ingenieros pueden eliminar informes');
      return;
    }

    Alert.alert(
      'Eliminar Informe',
      '¿Estás seguro de que deseas eliminar este informe?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportAPI.deleteReport(reportId);
              Alert.alert('Éxito', 'Informe eliminado exitosamente');
              loadReports();
            } catch (error: any) {
              Alert.alert('Error', 'No se pudo eliminar el informe');
            }
          }
        }
      ]
    );
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
          <Text style={styles.statusText}>
            {item.status === 'draft' ? 'Borrador' : 
             item.status === 'completed' ? 'Completado' : 'Revisado'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.reportAuthor}>Autor: {item.authorName}</Text>
      <Text style={styles.reportDate}>
        Fecha: {new Date(item.date).toLocaleDateString('es-ES')}
      </Text>
      {item.location && (
        <Text style={styles.reportLocation}>Ubicación: {item.location}</Text>
      )}
      
      <View style={styles.reportStats}>
        <Text style={styles.statText}>
          Problemas: {item.problems?.length || 0}
        </Text>
        <Text style={styles.statText}>
          Materiales: {item.materials?.length || 0}
        </Text>
        <Text style={styles.statText}>
          Imágenes: {item.images?.length || 0}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
        >
          <Text style={styles.actionButtonText}>Ver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.pdfButton]}
          onPress={() => handleGeneratePDF(item.id)}
        >
          <Text style={styles.actionButtonText}>PDF</Text>
        </TouchableOpacity>
        
        {item.pdfPath && (
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={() => handleShareWhatsApp(item.id)}
          >
            <Text style={styles.actionButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        )}
        
        {currentUser?.role === 'engineer' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteReport(item.id)}
          >
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Informes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateReport')}
        >
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay informes disponibles</Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => navigation.navigate('CreateReport')}
            >
              <Text style={styles.createFirstButtonText}>Crear primer informe</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: SPACING.md,
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusdraft: {
    backgroundColor: COLORS.warning,
  },
  statuscompleted: {
    backgroundColor: COLORS.success,
  },
  statusreviewed: {
    backgroundColor: COLORS.primary,
  },
  statusText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportAuthor: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  pdfButton: {
    backgroundColor: COLORS.warning,
  },
  shareButton: {
    backgroundColor: '#25D366', // WhatsApp green
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  createFirstButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReportsListScreen;