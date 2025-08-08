import { Alert } from 'react-native';
import warmupService from '../services/warmupService';

export const showNetworkDiagnostic = async () => {
    try {
        await warmupService.warmupBackend();
        const workingUrl = warmupService.getWorkingUrl();

        if (workingUrl) {
            Alert.alert(
                '✅ Conexión exitosa',
                `Backend funcionando en:\n${workingUrl}`,
                [{ text: 'OK' }]
            );
        } else {
            Alert.alert(
                '❌ Sin conexión',
                'No se pudo conectar con el backend.\n\nVerifica que:\n1. El backend esté corriendo\n2. La IP sea correcta',
                [{ text: 'OK' }]
            );
        }
    } catch (error) {
        Alert.alert(
            '⚠️ Error de red',
            'No se pudo establecer conexión con el backend.\n\nPasos para solucionar:\n1. Verificar que el backend esté corriendo\n2. Obtener la IP correcta con el comando ifconfig\n3. Actualizar apiClient.ts con la IP correcta',
            [{ text: 'OK' }]
        );
    }
};
