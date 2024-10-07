import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import MyPicker from "../components/MyPicker";

// Icons
import { Ionicons, Octicons } from "@expo/vector-icons";

// Styled Components
import {
  ButtonText,
  ExtraText,
  ExtraView,
  InnerContainer,
  LeftIcon,
  Line,
  MsgBox,
  PageTitle,
  RightIcon,
  StyledButton,
  StyledContainer,
  StyledFormArea,
  StyledInputLabel,
  StyledTextInput,
  SubTitle,
  TextLink,
  TextLinkContent,
} from "../components/styles";

// Colors
import { Colors } from "../components/styles";
const { darkLight, brand, primary } = Colors;

// Supabase and AsyncStorage
import { signup } from "../utils/SupabaseClient.js"; // Updated import statement

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [nationality, setNationality] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState(null);
  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
  const [education, setEducation] = useState("");
  const [employment, setEmployment] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [residence, setResidence] = useState("");

  const handleSignup = async () => {
    if (
      email == "" ||
      password == "" ||
      fullName == "" ||
      username == "" ||
      nationality == "" ||
      age == "" ||
      gender == "" ||
      education == "" ||
      employment == "" ||
      maritalStatus == "" ||
      residence == ""
    ) {
      setError("please fill all the field"); // checking on both frontned and backend

      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const { user, error } = await signup(
      email,
      password,
      fullName,
      username,
      nationality,
      age,
      gender,
      education,
      employment,
      maritalStatus,
      residence
    );

    if (user) {
      // Handle successful signup
      Alert.alert("Success", "Account created successfully");
      navigation.navigate("Login");
    } else if (error) {
      setError(error.message);
    }
  };

  // Make useEffect to check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      console.log("Checking user...");
      console.log("Email:", email);
      console.log("Password:", password);
      console.log("Full Name:", fullName);
      console.log("Username:", username);
      console.log("Nationality: ", nationality);
      console.log("Age:", age);
      console.log("Gender: ", gender);
      console.log("Education: ", education);
      console.log("Employment: ", employment);
      console.log("Marital Status: ", maritalStatus);
      console.log("Residence: ", residence);
    };
    checkUser();
  }, [email, password]);

  return (
    <StyledContainer>
      <StatusBar style="dark" />
      <InnerContainer>
        <PageTitle>Memory Game</PageTitle>
        <SubTitle>Account SignUp</SubTitle>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          style={{ width: "100%" }}
        >
          <Formik
            initialValues={{
              name: "",
              email: "",
              username: "",
              password: "",
              confirmPassword: "",
              nationality: "",
              age: "",
              gender: "",
              education: "",
              employment: "",
              maritalStatus: "",
              residence: "",
            }}
            onSubmit={(values) => handleSignup(values)}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              setFieldValue,
            }) => (
              <StyledFormArea>
                <MyTextInput
                  label="Full Name"
                  placeholder="Full Name"
                  placeholderTextColor={darkLight}
                  onChangeText={(text) => {
                    handleChange("name")(text);
                    setFullName(text);
                  }}
                  onBlur={handleBlur("name")}
                  value={values.name}
                  icon="person"
                />
                <MyTextInput
                  label="Username"
                  placeholder="Username"
                  placeholderTextColor={darkLight}
                  onChangeText={(text) => {
                    handleChange("username")(text);
                    setUsername(text);
                  }}
                  onBlur={handleBlur("username")}
                  value={values.username}
                  icon="person"
                  keyboardType="default"
                />
                <MyTextInput
                  label="Email Address"
                  placeholder="Email@gmail.com"
                  placeholderTextColor={darkLight}
                  onChangeText={(text) => {
                    handleChange("email")(text);
                    setEmail(text);
                  }}
                  onBlur={handleBlur("email")}
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
                    handleChange("password")(text);
                    setPassword(text);
                  }}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  secureTextEntry={hidePassword}
                  isPassword={true}
                  hidePassword={hidePassword}
                  setHidePassword={setHidePassword}
                />
                <MyTextInput
                  label="Confirm Password"
                  placeholder="* * * * * * * *"
                  placeholderTextColor={darkLight}
                  icon="lock"
                  onChangeText={(text) => {
                    handleChange("confirmPassword")(text);
                    setConfirmPassword(text);
                  }}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  secureTextEntry={hidePassword}
                  isPassword={true}
                  hidePassword={hidePassword}
                  setHidePassword={setHidePassword}
                />
                <StyledInputLabel>Nationality</StyledInputLabel>
                <TouchableOpacity
                  onPress={() => setCountryPickerVisible(true)}
                  style={{ cursor: "pointer" }}
                >
                  <MyTextInput
                    placeholder="Nationality"
                    placeholderTextColor={darkLight}
                    value={nationality}
                    icon="globe"
                    editable={false}
                    style={{ cursor: "pointer" }}
                  ></MyTextInput>
                </TouchableOpacity>
                <CountryPicker
                  show={isCountryPickerVisible}
                  pickerButtonOnPress={(item) => {
                    setFieldValue("nationality", item["name"]["en"]);
                    setNationality(item["name"]["en"]);
                    setCountryPickerVisible(false);
                  }}
                  onBackdropPress={() => setCountryPickerVisible(false)}
                />
                <MyTextInput
                  label="Age"
                  placeholder="Age"
                  placeholderTextColor={darkLight}
                  onChangeText={(text) => {
                    handleChange("age")(text);
                    setAge(text);
                  }}
                  onBlur={handleBlur("age")}
                  value={values.age}
                  keyboardType="number-pad"
                  icon="calendar"
                />
                <View style={styles.genderContainer}>
                  <StyledInputLabel>Gender</StyledInputLabel>
                  <View style={styles.genderButtonContainer}>
                    <GenderButton
                      label="Male"
                      selected={values.gender === "Male"}
                      onPress={() => {
                        setFieldValue("gender", "Male");
                        setGender("Male");
                      }}
                    />
                    <GenderButton
                      label="Female"
                      selected={values.gender === "Female"}
                      onPress={() => {
                        setFieldValue("gender", "Female");
                        setGender("Female");
                      }}
                    />
                  </View>
                </View>
                <MyPicker
                  label="Educational Background"
                  icon="book"
                  items={[
                    { label: "BSc", value: "BSc" },
                    { label: "MSc", value: "MSc" },
                    { label: "PhD", value: "PhD" },
                    { label: "MD", value: "MD" },
                    { label: "PharmD", value: "PharmD" },
                  ]}
                  value={education}
                  setValue={setEducation}
                  zIndex={100}
                  last={false}
                />
                <MyPicker
                  label="Employment Status"
                  icon="briefcase"
                  items={[
                    { label: "Employed", value: "Employed" },
                    { label: "Unemployed", value: "Unemployed" },
                    { label: "Self-employed", value: "Self-employed" },
                  ]}
                  value={employment}
                  setValue={setEmployment}
                  zIndex={90}
                  last={false}
                />
                <MyPicker
                  label="Marital Status"
                  icon="heart"
                  items={[
                    { label: "Married", value: "Married" },
                    { label: "Single", value: "Single" },
                    { label: "Divorced", value: "Divorced" },
                    { label: "Widowed", value: "Widowed" },
                  ]}
                  value={maritalStatus}
                  setValue={setMaritalStatus}
                  zIndex={80}
                  last={false}
                />
                <MyPicker
                  label="Place of Residence"
                  icon="home"
                  items={[
                    { label: "Abu Dhabi", value: "Abu Dhabi" },
                    { label: "Dubai", value: "Dubai" },
                    { label: "Sharjah", value: "Sharjah" },
                    { label: "Ajman", value: "Ajman" },
                    { label: "Umm Al Quwain", value: "Umm Al Quwain" },
                    { label: "Ras Al Khaimah", value: "Ras Al Khaimah" },
                    { label: "Fujairah", value: "Fujairah" },
                    { label: "Northern Emirates", value: "Northern Emirates" },
                    { label: "Outside UAE", value: "Outside UAE" },
                  ]}
                  value={residence}
                  setValue={setResidence}
                  zIndex={70}
                  last={true}
                />
                <MsgBox>{error}</MsgBox>

                <StyledButton onPress={handleSubmit}>
                  <ButtonText>Sign Up</ButtonText>
                </StyledButton>
              </StyledFormArea>
            )}
          </Formik>
        </ScrollView>
        <Line />
        <ExtraView>
          <ExtraText>Already Have an account?</ExtraText>
          <TextLink onPress={() => navigation.navigate("Login")}>
            <TextLinkContent> Login</TextLinkContent>
          </TextLink>
        </ExtraView>
      </InnerContainer>
    </StyledContainer>
  );
};

// Gender Button Component
const GenderButton = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.genderButton,
      { backgroundColor: selected ? brand : darkLight },
    ]}
  >
    <Text style={{ color: selected ? primary : "#fff" }}>{label}</Text>
  </TouchableOpacity>
);

// MyTextInput Component
const MyTextInput = ({
  label,
  icon,
  isPassword,
  hidePassword,
  setHidePassword,
  style,
  ...props
}) => {
  return (
    <View>
      <StyledInputLabel>{label}</StyledInputLabel>
      <LeftIcon /*style={{ top: label ? 38 : 18 }}*/>
        <Octicons name={icon} size={30} color={brand} />
      </LeftIcon>
      <StyledTextInput style={style} {...props} />
      {isPassword && (
        <RightIcon onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons
            name={hidePassword ? "eye-off" : "eye"}
            size={30}
            color={darkLight}
          />
        </RightIcon>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  genderContainer: {
    marginVertical: 10,
  },
  genderButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default SignupScreen;
