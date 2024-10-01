import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Formik } from 'formik';

// Icons
import { Octicons, Ionicons } from '@expo/vector-icons';

// Styled Components
import {
  StyledContainer,
  InnerContainer,
  PageLogo,
  PageTitle,
  SubTitle,
  StyledFormArea,
  StyledInputLabel,
  StyledTextInput,
  LeftIcon,
  StyledButton,
  ButtonText,
  MsgBox,
  Line,
  ExtraText,
  ExtraView,
  TextLink,
  TextLinkContent,
  RightIcon
} from '../components/styles.js';

// Colors
import { Colors } from '../components/styles.js'; // Ensure this import is correct
const { darkLight, brand } = Colors;

// Supabase and AsyncStorage
import { login, syncGameData } from '../utils/SupabaseClient.js';

import { useAuthRedirect } from '../hooks/AuthRedirect.js';

const Login = ({ navigation }) => {
  const [hidePassword, setHidePassword] = useState(true);
  const [message, setMessage] = useState();
  const [messageType, setMessageType] = useState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useAuthRedirect();

  const handleLogin = async (values) => {
    setMessage(null);
    setMessageType(null);
    try {
      const { profile } = await login(values.email, values.password);
      console.log('Logged in user:', profile);
      await syncGameData(); // Sync any cached game data after login
      navigation.navigate("Welcome", { name: profile.full_name });
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  };

  // Make useEffect to check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      console.log('Checking user...');
      console.log('Email:', email);
      console.log('Password:', password);
    };
    checkUser();
  }, [email, password]);

  return (
    <StyledContainer>
      <StatusBar style="dark" />
      <InnerContainer>
        <PageLogo
          resizeMode="cover"
          source={require('../assets/image1.png')}
        />
        <PageTitle>Memory Game</PageTitle>
        <SubTitle>Account Login</SubTitle>

        <Formik
          initialValues={{ email: '', password: '' }}
          onSubmit={(values) => handleLogin(values)}
        >
          {({ handleChange, handleBlur, handleSubmit, values }) => (
            <StyledFormArea>
              <MyTextInput
                label="Email Address"
                placeholder="Email@gmail.com"
                placeholderTextColor={darkLight}
                onChangeText={(text) => {
                  handleChange('email')(text);
                  setEmail(text);
                }}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
                icon="mail"
              />
              <MyTextInput
                label="Password"
                placeholder="* * * * * * * *"
                placeholderTextColor={darkLight}
                icon="lock"
                onChangeText={(text) => {
                  handleChange('password')(text);
                  setPassword(text);
                }}
                onBlur={handleBlur('password')}
                value={values.password}
                secureTextEntry={hidePassword}
                isPassword={true}
                hidePassword={hidePassword}
                setHidePassword={setHidePassword}
              />
              <MsgBox>{message}</MsgBox>
              <StyledButton onPress={handleSubmit}>
                <ButtonText>Login</ButtonText>
              </StyledButton>
              <Line />
              <ExtraView>
                <ExtraText>Don't have an account?</ExtraText>
                <TextLink onPress={() => navigation.navigate("Signup")}>
                  <TextLinkContent>Sign Up</TextLinkContent>
                </TextLink>
              </ExtraView>
            </StyledFormArea>
          )}
        </Formik>
      </InnerContainer>
    </StyledContainer>
  );
};

// MyTextInput Component
const MyTextInput = ({ label, icon, isPassword, hidePassword, setHidePassword, ...props }) => {
  return (
    <View>
      <LeftIcon>
        <Octicons name={icon} size={30} color={brand} />
      </LeftIcon>
      <StyledInputLabel>{label}</StyledInputLabel>
      <StyledTextInput {...props} />
      {isPassword && (
        <RightIcon onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={darkLight} />
        </RightIcon>
      )}
    </View>
  );
};

export default Login;