// test/__mocks__/react-native-vector-icons/FontAwesome.js
import React from 'react';
import { Text } from 'react-native';

const MockIconComponent = ({ name, size, color, style }) => {
  return (
    <Text testID={`mock-icon-${name}`} style={[{ fontSize: size, color }, style]}>
      {name}
    </Text>
  );
};

export default MockIconComponent;