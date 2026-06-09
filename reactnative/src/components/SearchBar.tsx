// SearchBar.tsx — inline iOS-style search field used by the list screens.
import { useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { Icon } from './Icon';

export function SearchBar({
  value,
  onChange,
  onCancel,
  placeholder = 'Search',
}: {
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  const ref = useRef<TextInput>(null);
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 2, paddingBottom: 10, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: T.surface2,
          borderWidth: 1,
          borderColor: T.hairline,
          borderRadius: 12,
          paddingLeft: 12,
          paddingRight: 10,
          height: 42,
        }}
      >
        <Icon name="search" size={18} color={T.muted} />
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={T.faint}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={{ flex: 1, color: T.text, fontSize: 16, fontWeight: '500', padding: 0 }}
        />
        {value ? (
          <Pressable
            onPress={() => {
              haptic();
              onChange('');
            }}
            hitSlop={8}
            style={{ width: 22, height: 22, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="close" size={13} color={T.text} stroke={2.4} />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={() => {
          haptic();
          onCancel();
        }}
      >
        <Text style={{ color: T.accent, fontSize: 16, fontWeight: '600' }}>Cancel</Text>
      </Pressable>
    </View>
  );
}
