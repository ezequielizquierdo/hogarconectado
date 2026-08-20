import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';

export default function GoogleOAuthRoot({ children }: React.PropsWithChildren) {
  return (
    <GoogleOAuthProvider clientId={process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'missing-google-client-id'}>
      {children}
    </GoogleOAuthProvider>
  );
}
