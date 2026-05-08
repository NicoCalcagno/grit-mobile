import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GREEN = '#00FF87';
const TEAL = '#00D4A0';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const SIZE_PY: Record<Size, number> = { sm: 10, md: 14, lg: 18 };
const SIZE_PX: Record<Size, number> = { sm: 16, md: 24, lg: 28 };
const SIZE_FS: Record<Size, number> = { sm: 13, md: 15, lg: 16 };
const SIZE_H: Record<Size, number>  = { sm: 36, md: 48, lg: 56 };

const VARIANT_BG: Record<Exclude<Variant, 'primary'>, string> = {
  secondary: 'rgba(255,255,255,0.06)',
  ghost: 'transparent',
  danger: '#EF5350',
};
const VARIANT_COLOR: Record<Variant, string> = {
  primary: '#000',
  secondary: '#fff',
  ghost: GREEN,
  danger: '#fff',
};

export default function GritButton({ label, onPress, variant = 'primary', size = 'md', loading = false, disabled = false, style, textStyle }: Props) {
  const isDisabled = disabled || loading;
  const py = SIZE_PY[size];
  const px = SIZE_PX[size];
  const fs = SIZE_FS[size];
  const minH = SIZE_H[size];

  const inner = loading
    ? <ActivityIndicator color={VARIANT_COLOR[variant]} size="small" />
    : <Text style={[{ fontSize: fs, fontWeight: '800', color: VARIANT_COLOR[variant], letterSpacing: 0.5 }, textStyle]}>{label}</Text>;

  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.85} style={[{ opacity: isDisabled ? 0.4 : 1 }, style]}>
        <LinearGradient
          colors={[GREEN, TEAL]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ borderRadius: 14, paddingVertical: py, paddingHorizontal: px, minHeight: minH, alignItems: 'center', justifyContent: 'center' }}
        >
          {inner}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress} disabled={isDisabled} activeOpacity={0.8}
      style={[{
        backgroundColor: VARIANT_BG[variant as Exclude<Variant, 'primary'>],
        borderRadius: 14, paddingVertical: py, paddingHorizontal: px,
        minHeight: minH, alignItems: 'center', justifyContent: 'center',
        borderWidth: variant === 'secondary' ? 1 : 0,
        borderColor: variant === 'secondary' ? 'rgba(255,255,255,0.12)' : 'transparent',
        opacity: isDisabled ? 0.4 : 1,
      }, style]}
    >
      {inner}
    </TouchableOpacity>
  );
}
