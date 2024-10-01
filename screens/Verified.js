import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Styled Components
import {
  StyledContainer,
  InnerContainer,
  PageTitle,
  SubTitle,
  StyledButton,
  ButtonText,
} from '../components/styles.js';

// Colors
import { Colors } from '../components/styles.js'; // Ensure this import is correct
const { brand, primary } = Colors;

const Verified = () => {
  const navigation = useNavigation();

  return (
    <StyledContainer>
      <InnerContainer>
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Ionicons name="checkmark-circle" size={100} color={brand} />
          <PageTitle>User Verified</PageTitle>
          <SubTitle style={{ textAlign: 'center' }}>
            Your account has been successfully verified.
          </SubTitle>
          <StyledButton onPress={() => navigation.navigate('Login')}>
            <ButtonText>Go to Login Page</ButtonText>
          </StyledButton>
        </View>
      </InnerContainer>
    </StyledContainer>
  );
};

export default Verified;