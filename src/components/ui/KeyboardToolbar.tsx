import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Keyboard } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/layout';

interface KeyboardToolbarProps {
  visible: boolean;
  onDone?: () => void;
  bottomOffset?: number; // Distance from bottom (default: 0, use 94 for tab screens)
}

export function KeyboardToolbar({ visible, onDone, bottomOffset = 0 }: KeyboardToolbarProps) {
  if (!visible) return null;

  const handleDone = () => {
    onDone?.();
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.toolbar, { bottom: bottomOffset }]}>
      <TouchableOpacity onPress={handleDone} style={styles.button}>
        <Text style={styles.text}>Terminé</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 20,
  },
  button: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
