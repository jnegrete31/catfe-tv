import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const isTV = Platform.isTV;

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Catfé TV',
            // For TV, we want full screen without any chrome
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="admin" 
          options={{ 
            title: 'Admin',
            headerShown: !isTV,
            presentation: 'modal',
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}
