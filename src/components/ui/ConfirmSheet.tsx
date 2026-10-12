import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import BottomSheet from './BottomSheet';
import Button from './Button';

interface Props {
  visible: boolean;
  title: string;
  /** Say exactly what will happen (what is deleted/replaced). */
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation for destructive or irreversible actions; cancel and confirm get equal size, the destructive one is red. */
export default function ConfirmSheet({ visible, title, message, confirmLabel, cancelLabel = tr('Cancel'), destructive, loading, onConfirm, onCancel }: Props) {
  const { colors, typography } = useTheme();
  return (
    <BottomSheet
      visible={visible}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button title={cancelLabel} variant="outline" onPress={onCancel} style={{ flex: 1 }} disabled={loading} />
          <Button title={confirmLabel} variant={destructive ? 'danger' : 'primary'} onPress={onConfirm} loading={loading} style={{ flex: 1 }} />
        </>
      }
    >
      <Text style={[typography.body, { color: colors.text }]}>{message}</Text>
    </BottomSheet>
  );
}
