import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  gigId: string;
  onSubmit: (payload: { amount: number; message?: string }) => Promise<void> | void;
};

export default function BidModal({ visible, onClose, gigId, onSubmit }: Props) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    try {
      setLoading(true);
      await onSubmit({ amount: parsed, message: message || undefined });
      setAmount('');
      setMessage('');
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={{ flex: 1, justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Place a bid</Text>
          <Text style={{ marginBottom: 4 }}>Amount</Text>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 8 }} />
          <Text style={{ marginBottom: 4 }}>Message (optional)</Text>
          <TextInput value={message} onChangeText={setMessage} style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 12 }} multiline />

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable onPress={onClose} style={{ marginRight: 8, padding: 8 }}>
              <Text>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} style={{ padding: 8 }} disabled={loading}>
              <Text style={{ color: 'blue' }}>{loading ? 'Sending...' : 'Send bid'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
