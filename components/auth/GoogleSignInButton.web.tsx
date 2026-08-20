import { GoogleLogin } from '@react-oauth/google';
import React from 'react';
import { Text } from 'react-native';

interface Props { onCredential: (credential: string) => void; onError: () => void; }

export default function GoogleSignInButton({ onCredential, onError }: Props) {
  if (!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
    return <Text>Falta configurar EXPO_PUBLIC_GOOGLE_CLIENT_ID.</Text>;
  }
  return <GoogleLogin onSuccess={response => response.credential ? onCredential(response.credential) : onError()} onError={onError} />;
}
