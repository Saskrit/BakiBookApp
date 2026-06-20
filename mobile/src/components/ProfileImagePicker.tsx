import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, type UploadType } from '../api/upload';
import { appAlert } from '../contexts/DialogContext';
import { colors } from '../theme/colors';
import { getInitials } from '../utils/format';

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onError?: (message: string) => void;
  uploadType: UploadType;
  fallbackName?: string;
  shape?: 'circle' | 'rounded';
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
};

async function pickFromLibrary(aspect: [number, number]) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library access is required to choose an image');
  }

  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.85,
  });
}

async function pickFromCamera(aspect: [number, number]) {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Camera access is required to take a photo');
  }

  return ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect,
    quality: 0.85,
  });
}

export default function ProfileImagePicker({
  label,
  value,
  onChange,
  onError,
  uploadType,
  fallbackName = '',
  shape = 'circle',
  size = 88,
  style,
  disabled,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState('');
  const aspect: [number, number] = shape === 'circle' ? [1, 1] : [4, 3];

  const displayUri = previewUri || value;
  const radius = shape === 'circle' ? size / 2 : 14;

  const handleUpload = async (localUri: string) => {
    setPreviewUri(localUri);
    setUploading(true);
    onError?.('');
    try {
      const url = await uploadImage(localUri, uploadType);
      onChange(url);
      setPreviewUri('');
    } catch (err) {
      setPreviewUri('');
      onError?.(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const chooseSource = () => {
    if (disabled || uploading) return;

    appAlert(label, 'Choose a photo source', [
      {
        text: 'Photo Library',
        onPress: async () => {
          try {
            const result = await pickFromLibrary(aspect);
            if (!result.canceled && result.assets[0]?.uri) {
              await handleUpload(result.assets[0].uri);
            }
          } catch (err) {
            onError?.(err instanceof Error ? err.message : 'Failed to pick image');
          }
        },
      },
      {
        text: 'Camera',
        onPress: async () => {
          try {
            const result = await pickFromCamera(aspect);
            if (!result.canceled && result.assets[0]?.uri) {
              await handleUpload(result.assets[0].uri);
            }
          } catch (err) {
            onError?.(err instanceof Error ? err.message : 'Failed to take photo');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const clearImage = () => {
    if (disabled || uploading) return;
    onChange('');
    setPreviewUri('');
  };

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          onPress={chooseSource}
          disabled={disabled || uploading}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <View
            style={[
              styles.imageBox,
              {
                width: size,
                height: size,
                borderRadius: radius,
              },
            ]}
          >
            {displayUri ? (
              <Image source={{ uri: displayUri }} style={[styles.image, { borderRadius: radius }]} />
            ) : (
              <View style={[styles.placeholder, { borderRadius: radius }]}>
                <Text style={styles.initials}>{getInitials(fallbackName || label)}</Text>
              </View>
            )}
            {uploading ? (
              <View style={[styles.overlay, { borderRadius: radius }]}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            ) : null}
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            onPress={chooseSource}
            disabled={disabled || uploading}
            style={[styles.actionBtn, (disabled || uploading) && styles.actionBtnDisabled]}
          >
            <Text style={styles.actionBtnText}>{uploading ? 'Uploading…' : 'Change Photo'}</Text>
          </Pressable>
          {value ? (
            <Pressable onPress={clearImage} disabled={disabled || uploading}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  imageBox: {
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#FFFFFF', fontWeight: '800', fontSize: 24 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flex: 1, gap: 8 },
  actionBtn: {
    backgroundColor: '#F3F7EC',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  removeText: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  pressed: { opacity: 0.85 },
});
