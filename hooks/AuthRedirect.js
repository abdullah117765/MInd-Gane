import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';

export function useAuthRedirect() {
  const navigation = useNavigation();
  const url = Linking.useURL(); // Call the hook directly here

  useEffect(() => {
    const handleRedirect = async () => {
      if (url) {
        console.log('Redirect URL:', url);
        const accessToken = extractAccessToken(url); // Extract the access token from the URL
        if (accessToken) {
          navigation.navigate('Verified');
        } else {
          navigation.navigate('Login');
        }
      }
    };

    handleRedirect();
  }, [url, navigation]); // Add url to the dependency array
}

// Function to extract access token from URL
function extractAccessToken(url) {
  const urlParams = new URLSearchParams(url.split('#')[1]);
  return urlParams.get('access_token');
}