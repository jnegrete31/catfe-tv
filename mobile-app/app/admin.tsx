import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { screensApi, settingsApi, Screen, Settings, ScreenType } from '@/lib/api';
import { colors, typography, shadows, spacing } from '@/lib/theme';

const SCREEN_TYPES: { value: ScreenType; label: string; emoji: string }[] = [
  { value: 'SNAP_AND_PURR', label: 'Snap & Purr', emoji: '📸' },
  { value: 'EVENT', label: 'Event', emoji: '🎉' },
  { value: 'TODAY_AT_CATFE', label: 'Today at Catfé', emoji: '📅' },
  { value: 'MEMBERSHIP', label: 'Membership', emoji: '🐱' },
  { value: 'REMINDER', label: 'Reminder', emoji: '💡' },
  { value: 'ADOPTION', label: 'Adoption', emoji: '🏠' },
  { value: 'THANK_YOU', label: 'Thank You', emoji: '❤️' },
];

export default function AdminScreen() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    screenType: 'EVENT' as ScreenType,
    title: '',
    subtitle: '',
    body: '',
    qrUrl: '',
    durationSeconds: 10,
    priority: 1,
    isActive: true,
  });

  const fetchData = async () => {
    try {
      const [screensData, settingsData] = await Promise.all([
        screensApi.list(),
        settingsApi.get(),
      ]);
      setScreens(screensData);
      setSettings(settingsData);
    } catch (e) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleToggleActive = async (screen: Screen) => {
    try {
      await screensApi.update(screen.id, { isActive: !screen.isActive });
      setScreens(prev =>
        prev.map(s => (s.id === screen.id ? { ...s, isActive: !s.isActive } : s))
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to update screen');
    }
  };

  const handleDelete = (screen: Screen) => {
    if (screen.isProtected) {
      Alert.alert('Protected', 'This screen cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Screen',
      `Are you sure you want to delete "${screen.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await screensApi.delete(screen.id);
              setScreens(prev => prev.filter(s => s.id !== screen.id));
            } catch (e) {
              Alert.alert('Error', 'Failed to delete screen');
            }
          },
        },
      ]
    );
  };

  const openCreateModal = () => {
    setEditingScreen(null);
    setFormData({
      screenType: 'EVENT',
      title: '',
      subtitle: '',
      body: '',
      qrUrl: '',
      durationSeconds: settings?.defaultDurationSeconds || 10,
      priority: 1,
      isActive: true,
    });
    setIsModalVisible(true);
  };

  const openEditModal = (screen: Screen) => {
    setEditingScreen(screen);
    setFormData({
      screenType: screen.screenType,
      title: screen.title,
      subtitle: screen.subtitle || '',
      body: screen.body || '',
      qrUrl: screen.qrUrl || '',
      durationSeconds: screen.durationSeconds,
      priority: screen.priority,
      isActive: screen.isActive,
    });
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingScreen) {
        await screensApi.update(editingScreen.id, formData);
      } else {
        await screensApi.create(formData);
      }
      setIsModalVisible(false);
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Failed to save screen');
    } finally {
      setIsSaving(false);
    }
  };

  const getScreenTypeInfo = (type: ScreenType) => {
    return SCREEN_TYPES.find(t => t.value === type) || SCREEN_TYPES[1];
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catfé TV Admin</Text>
        <Pressable style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      {/* Screen List */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {screens.map(screen => {
          const typeInfo = getScreenTypeInfo(screen.screenType);
          return (
            <Pressable
              key={screen.id}
              style={styles.screenCard}
              onPress={() => openEditModal(screen)}
            >
              <View style={styles.screenHeader}>
                <Text style={styles.screenEmoji}>{typeInfo.emoji}</Text>
                <View style={styles.screenInfo}>
                  <Text style={styles.screenTitle} numberOfLines={1}>
                    {screen.title}
                  </Text>
                  <Text style={styles.screenType}>{typeInfo.label}</Text>
                </View>
                <Switch
                  value={screen.isActive}
                  onValueChange={() => handleToggleActive(screen)}
                  trackColor={{ false: '#ccc', true: colors.primary }}
                />
              </View>
              {screen.subtitle && (
                <Text style={styles.screenSubtitle} numberOfLines={1}>
                  {screen.subtitle}
                </Text>
              )}
              <View style={styles.screenMeta}>
                <Text style={styles.metaText}>
                  {screen.durationSeconds}s • Priority {screen.priority}
                </Text>
                {!screen.isProtected && (
                  <Pressable onPress={() => handleDelete(screen)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Edit/Create Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {editingScreen ? 'Edit Screen' : 'New Screen'}
            </Text>
            <Pressable onPress={handleSave} disabled={isSaving}>
              <Text style={[styles.saveText, isSaving && styles.disabledText]}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.form}>
            {/* Screen Type */}
            <Text style={styles.label}>Screen Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeSelector}>
                {SCREEN_TYPES.map(type => (
                  <Pressable
                    key={type.value}
                    style={[
                      styles.typeOption,
                      formData.screenType === type.value && styles.typeOptionActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, screenType: type.value }))}
                  >
                    <Text style={styles.typeEmoji}>{type.emoji}</Text>
                    <Text
                      style={[
                        styles.typeLabel,
                        formData.screenType === type.value && styles.typeLabelActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Title */}
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Enter title"
              placeholderTextColor={colors.textSecondary}
            />

            {/* Subtitle */}
            <Text style={styles.label}>Subtitle</Text>
            <TextInput
              style={styles.input}
              value={formData.subtitle}
              onChangeText={text => setFormData(prev => ({ ...prev, subtitle: text }))}
              placeholder="Enter subtitle"
              placeholderTextColor={colors.textSecondary}
            />

            {/* Body */}
            <Text style={styles.label}>Body Text</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.body}
              onChangeText={text => setFormData(prev => ({ ...prev, body: text }))}
              placeholder="Enter body text"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />

            {/* QR URL */}
            <Text style={styles.label}>QR Code URL</Text>
            <TextInput
              style={styles.input}
              value={formData.qrUrl}
              onChangeText={text => setFormData(prev => ({ ...prev, qrUrl: text }))}
              placeholder="https://..."
              placeholderTextColor={colors.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
            />

            {/* Duration */}
            <Text style={styles.label}>Duration (seconds)</Text>
            <TextInput
              style={styles.input}
              value={String(formData.durationSeconds)}
              onChangeText={text =>
                setFormData(prev => ({
                  ...prev,
                  durationSeconds: parseInt(text) || 10,
                }))
              }
              keyboardType="number-pad"
            />

            {/* Priority */}
            <Text style={styles.label}>Priority (1-10)</Text>
            <TextInput
              style={styles.input}
              value={String(formData.priority)}
              onChangeText={text =>
                setFormData(prev => ({
                  ...prev,
                  priority: Math.min(10, Math.max(1, parseInt(text) || 1)),
                }))
              }
              keyboardType="number-pad"
            />

            {/* Active Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Active</Text>
              <Switch
                value={formData.isActive}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, isActive: value }))
                }
                trackColor={{ false: '#ccc', true: colors.primary }}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.mobile.title,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  list: {
    flex: 1,
    padding: spacing.md,
  },
  screenCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenEmoji: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  screenInfo: {
    flex: 1,
  },
  screenTitle: {
    ...typography.mobile.subtitle,
    color: colors.text,
  },
  screenType: {
    ...typography.mobile.caption,
    color: colors.textSecondary,
  },
  screenSubtitle: {
    ...typography.mobile.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: 48,
  },
  screenMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaText: {
    ...typography.mobile.caption,
    color: colors.textSecondary,
  },
  deleteText: {
    ...typography.mobile.caption,
    color: colors.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.mobile.subtitle,
    color: colors.text,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  saveText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  form: {
    flex: 1,
    padding: spacing.md,
  },
  label: {
    ...typography.mobile.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  typeOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 80,
  },
  typeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeLabel: {
    ...typography.mobile.caption,
    color: colors.textSecondary,
  },
  typeLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
