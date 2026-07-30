import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import Colors from '../theme/Colors';

const Footer = () => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text} onPress={() => Linking.openURL('https://qirotec.com')}>Powered By Qiro Tech</Text>
      <Text style={[styles.text, { marginTop: 4 }]}>Copyright © 2026</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  line: {
    width: '40%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 8,
  },
  text: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

export default Footer;
