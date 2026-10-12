import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import IconPhoto from '@tabler/icons-react-native/IconPhoto';
import IconFileText from '@tabler/icons-react-native/IconFileText';
import IconUpload from '@tabler/icons-react-native/IconUpload';
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck';
import IconX from '@tabler/icons-react-native/IconX';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import Button from './Button';
import Icon from './Icon';
import ProgressBar from './ProgressBar';
import { FieldFrame, type FieldProps } from './TextField';

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

/** POST a picked file as multipart/form-data through apiClient (auth + refresh included), reporting progress 0–100. */
export async function uploadFile<T = unknown>(url: string, fieldName: string, file: PickedFile, fields: Record<string, string>, onProgress: (pct: number) => void): Promise<T> {
  const body = new FormData();
  Object.entries(fields).forEach(([k, v]) => body.append(k, v));
  body.append(fieldName, { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob); // RN FormData file part
  const res = await apiClient.post(url, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => e.total && onProgress(Math.round((e.loaded / e.total) * 100)),
  });
  return res.data;
}

const DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const sizeLabel = (b?: number) => (b == null ? '' : b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

interface Props<T> extends FieldProps {
  accept: 'image' | 'document';
  /** Sends the file; must report progress and reject on failure. */
  upload: (file: PickedFile, onProgress: (pct: number) => void) => Promise<T>;
  /** Server response after a successful upload, or null when the user removes the file. */
  onChange?: (result: T | null) => void;
  maxSizeMB?: number;
}

type State<T> = { file: PickedFile; status: 'uploading' | 'done' | 'error'; progress: number; error?: string; result?: T };

/** Pick an image or document, upload it immediately with progress; failed uploads keep the file and offer Retry. */
export default function FileField<T>({ accept, upload, onChange, maxSizeMB = 10, ...field }: Props<T>) {
  const { colors, spacing, radius, typography } = useTheme();
  const [state, setState] = useState<State<T> | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  const send = async (file: PickedFile) => {
    setState({ file, status: 'uploading', progress: 0 });
    try {
      const result = await upload(file, (progress) => setState((s) => (s && s.status === 'uploading' ? { ...s, progress } : s)));
      setState({ file, status: 'done', progress: 100, result });
      onChange?.(result);
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setState({ file, status: 'error', progress: 0, error: msg || tr('Upload failed. Check your connection and try again.') });
    }
  };

  const pick = async () => {
    setPickError(null);
    let file: PickedFile | null = null;
    if (accept === 'image') {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      const a = r.canceled ? null : r.assets[0];
      if (a) file = { uri: a.uri, name: a.fileName || a.uri.split('/').pop() || 'image.jpg', mimeType: a.mimeType || 'image/jpeg', size: a.fileSize };
    } else {
      const r = await DocumentPicker.getDocumentAsync({ type: DOC_TYPES, copyToCacheDirectory: true });
      const a = r.canceled ? null : r.assets[0];
      if (a) file = { uri: a.uri, name: a.name, mimeType: a.mimeType || 'application/octet-stream', size: a.size };
    }
    if (!file) return;
    if (file.size != null && file.size > maxSizeMB * 1024 * 1024) return setPickError(tr('The file is larger than {{size}} MB', { size: maxSizeMB }));
    send(file);
  };

  const remove = () => {
    setState(null);
    onChange?.(null);
  };

  const label = accept === 'image' ? tr('Choose an image') : tr('Choose a file');
  return (
    <FieldFrame {...field} error={state?.status === 'error' ? state.error : pickError ?? field.error} hint={field.hint ?? (accept === 'image' ? `JPG, PNG · ≤ ${maxSizeMB} MB` : `PDF, Word · ≤ ${maxSizeMB} MB`)}>
      {!state ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={field.label ? `${field.label}: ${label}` : label}
          onPress={pick}
          style={({ pressed }) => ({
            minHeight: 72,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: field.error ? colors.danger : colors.borderStrong,
            backgroundColor: pressed ? colors.primarySoft : colors.surface,
          })}
        >
          <Icon icon={IconUpload} color={colors.primary} />
          <Text style={[typography.label, { color: colors.link }]}>{label}</Text>
        </Pressable>
      ) : (
        <View
          accessibilityLabel={`${state.file.name}, ${state.status === 'uploading' ? tr('Uploading… {{pct}}%', { pct: state.progress }) : state.status === 'done' ? tr('Uploaded') : tr('Upload failed')}`}
          style={{ borderRadius: radius.md, borderWidth: 1, borderColor: state.status === 'error' ? colors.danger : colors.border, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.sm }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            {accept === 'image' ? (
              <Image source={{ uri: state.file.uri }} style={{ width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt }} />
            ) : (
              <View style={{ width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon={accept === 'document' ? IconFileText : IconPhoto} color={colors.primary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={[typography.body, typography.weights.medium, { color: colors.text }]}>
                {state.file.name}
              </Text>
              <Text style={[typography.caption, { color: state.status === 'done' ? colors.success : colors.textMuted }]}>
                {[sizeLabel(state.file.size), state.status === 'uploading' ? tr('Uploading… {{pct}}%', { pct: state.progress }) : state.status === 'done' ? tr('Uploaded') : null].filter(Boolean).join(' · ')}
              </Text>
            </View>
            {state.status === 'done' ? <Icon icon={IconCircleCheck} color={colors.success} /> : null}
            {state.status !== 'uploading' ? (
              <Pressable accessibilityRole="button" accessibilityLabel={tr('Remove file')} onPress={remove} hitSlop={8} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon={IconX} size={20} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
          {state.status === 'uploading' ? <ProgressBar value={state.progress} label={tr('Uploading…')} /> : null}
          {state.status === 'error' ? <Button title={tr('Retry')} variant="outline" size="sm" onPress={() => send(state.file)} /> : null}
        </View>
      )}
    </FieldFrame>
  );
}
