import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import styled from 'styled-components/native';
import { Octicons } from '@expo/vector-icons';
import { Colors } from './styles';

const { darkLight, brand, secondary, tertiary } = Colors;

const MyPicker = ({ label, icon, items, value, setValue, zIndex, last, ...props }) => {
    const [open, setOpen] = useState(false);
    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
        // Calculate the height based on the number of items
        const itemHeight = 40; // Adjust this value based on your item height
        setContainerHeight(items.length * itemHeight);
    }, [items]);

    return (
        <View
            style={{ zIndex: !last ? zIndex : !open ? zIndex : 1000 + zIndex }}
        >
            <StyledInputLabel>{label}</StyledInputLabel>
            <LeftIcon style={{ zIndex: Number.MAX_SAFE_INTEGER }}>
                <Octicons name={icon} size={30} color={brand} />
            </LeftIcon>
            <DropDownPicker
                zIndex={0}
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                style={[styles.picker]}
                dropDownContainerStyle={[styles.dropDownContainer, { maxHeight: containerHeight }]}
                closeAfterSelecting={true}
                listMode="SCROLLVIEW"
                {...props}
            />
        </View>
    );
};

// Styled Components
const StyledInputLabel = styled.Text`
  color: ${tertiary};
  font-size: 13px;
  text-align: left;
`;

const LeftIcon = styled.View`
  left: 15px;
  top: 38px;
  position: absolute;
`;

const styles = {
    picker: {
        backgroundColor: secondary,
        paddingLeft: 55,
        borderRadius: 5,
        height: 60,
        marginVertical: 3,
        marginBottom: 10,
        color: tertiary,
        borderColor: 'transparent'
    },
    dropDownContainer: {
        backgroundColor: secondary
    },
};

export default MyPicker;