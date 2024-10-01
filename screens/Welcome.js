import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native'; // For displaying alerts
import { getSession, logout } from '../utils/SupabaseClient.js'; // Import the logout function
import {
  WelcomeImage,
  PageTitle,
  SubTitle,
  StyledFormArea,
  StyledButton,
  InnerContainer,
  WelcomeContainer,
  ButtonText,
  Line,
} from '../components/styles.js';

const Welcome = ({ route, navigation}) => {

  const { name } = route.params;

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function
      navigation.navigate('Login'); // Navigate to Login screen
    } catch (error) {
      Alert.alert('Logout Error', 'There was an error logging out. Please try again.');
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <InnerContainer>
        <WelcomeContainer>
          <PageTitle welcome={true}>Welcome {name} !</PageTitle>
          <StyledFormArea>
            <Line />
            <StyledButton onPress={handleLogout}>
              <ButtonText>Logout</ButtonText>
            </StyledButton>
            <StyledButton onPress={() => navigation.navigate('Game')}>
              <ButtonText>Enter Game</ButtonText>
            </StyledButton>
          </StyledFormArea>
        </WelcomeContainer>
      </InnerContainer>
    </>
  );
};

export default Welcome;
