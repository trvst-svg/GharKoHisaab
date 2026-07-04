import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../constants/colors';

interface SignaturePadProps {
  onSaveSignature: (svgPath: string | null) => void;
}

export default function SignaturePad({ onSaveSignature }: SignaturePadProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');

  const onTouchStart = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    // Start a new SVG path segment
    const startPoint = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
    setCurrentPath(startPoint);
  };

  const onTouchMove = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    if (!currentPath) return;
    
    // Append line segments
    const nextPoint = ` L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
    setCurrentPath((prev) => prev + nextPoint);
  };

  const onTouchEnd = () => {
    if (currentPath) {
      const updatedPaths = [...paths, currentPath];
      setPaths(updatedPaths);
      onSaveSignature(updatedPaths.join(' '));
      setCurrentPath('');
    }
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath('');
    onSaveSignature(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.helpText}>Tenant signs below with finger *</Text>
      
      <View
        style={styles.canvasContainer}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={onTouchStart}
        onResponderMove={onTouchMove}
        onResponderRelease={onTouchEnd}
      >
        <Svg style={StyleSheet.absoluteFill}>
          {/* Render all finished stroke paths */}
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke={COLORS.primary}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* Render active stroke path */}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke={COLORS.primary}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
      </View>

      <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
        <Text style={styles.clearText}>Clear Signature</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  helpText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 6,
  },
  canvasContainer: {
    height: 140,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  clearBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: '600',
  },
});
