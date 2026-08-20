import React from 'react';
import { Text } from 'react-native';

interface Props {
  onCredential: (credential: string) => void | Promise<void>;
  onError?: () => void;
}

export default function GoogleSignInButton(_props: Props) {
  return <Text>El acceso con Google se habilitará inicialmente en la versión web.</Text>;
}
