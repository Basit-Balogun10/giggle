declare module 'input-otp-native' {
  import * as React from 'react';
  import { ViewStyle } from 'react-native';

  export interface OTPInputViewProps {
    pinCount?: number;
    code?: string;
    autoFocusOnLoad?: boolean;
    containerStyle?: ViewStyle | any;
    codeInputFieldStyle?: ViewStyle | any;
    codeInputHighlightStyle?: ViewStyle | any;
    onCodeChanged?: (code: string) => void;
    onCodeFilled?: (code: string) => void;
    // allow additional props
    [key: string]: any;
  }

  const OTPInputView: React.ComponentType<OTPInputViewProps>;
  export default OTPInputView;
}
