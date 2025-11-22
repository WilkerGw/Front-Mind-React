import React from 'react';
import { ViewProps } from 'react-native';
import { GlassView } from './GlassView';

export function Card({ children, style, ...props }: ViewProps) {
  return (
    <GlassView
      style={[{ marginVertical: 8, padding: 16 }, style]}
      {...props}
    >
      {children}
    </GlassView>
  );
}