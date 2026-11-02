import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

const LOGO = require('../../../assets/logo.png');
const LOGO_RATIO = 1153 / 774;
const NAVY = '#17407A';
const ORANGE = '#ED7D31';

/**
 * Brand intro shown on every cold start: the logo springs in, an accent line sweeps
 * underneath, the tagline fades up, then the whole screen fades away.
 */
export const AnimatedSplash: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const lineScale = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagShift = useRef(new Animated.Value(10)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(lineScale, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(tagOpacity, { toValue: 1, duration: 500, delay: 150, useNativeDriver: true }),
        Animated.timing(tagShift, { toValue: 0, duration: 500, delay: 150, useNativeDriver: true }),
      ]),
      Animated.delay(450),
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(({ finished }) => finished && onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]} pointerEvents="auto">
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <View style={styles.lineTrack}>
        <Animated.View style={[styles.line, { transform: [{ scaleX: lineScale }] }]} />
      </View>

      <Animated.Text style={[styles.tagline, { opacity: tagOpacity, transform: [{ translateY: tagShift }] }]}>
        MANUFACTURING ERP
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  logo: { width: 260, height: 260 / LOGO_RATIO },
  lineTrack: { width: 180, height: 4, borderRadius: 2, backgroundColor: '#E8ECF3', marginTop: 28, overflow: 'hidden' },
  line: { flex: 1, backgroundColor: ORANGE, borderRadius: 2 },
  tagline: { marginTop: 16, fontSize: 12, fontWeight: '800', letterSpacing: 3, color: NAVY },
});
