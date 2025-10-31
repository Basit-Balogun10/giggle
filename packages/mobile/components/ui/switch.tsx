import * as React from "react";
import { 
  Platform, 
  Switch as RNSwitch, 
  type SwitchProps as RNSwitchProps,
  Pressable,
  View,
  type PressableProps 
} from "react-native";
import { cn } from "./utils/cn";
import { useThemeTokens } from "./theme";

interface SwitchProps extends Omit<PressableProps, "onPress"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Switch = React.forwardRef<
  any,
  SwitchProps
>(({ className, checked = false, onCheckedChange, disabled, children, ...props }, ref) => {
  const tokens = useThemeTokens();
  const handlePress = React.useCallback(() => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  }, [checked, onCheckedChange, disabled]);

  // Use native Switch on Android, custom on Web
  if (Platform.OS === "android") {
    // Extract only style to forward to native switch
    const { style } = props as any;
    return (
      <RNSwitch
        ref={ref}
        value={checked}
        onValueChange={onCheckedChange}
        disabled={disabled}
        trackColor={{
          false: tokens.colors.surface,
          true: tokens.colors.secondary,
        }}
        thumbColor={checked ? tokens.colors.surface : tokens.colors.muted}
        style={style}
      />
    );
  }

  // Web implementation

  return (
    <Pressable
      ref={ref}
      className={cn(
        "flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled && "cursor-not-allowed opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
      onPress={handlePress}
      accessible={true}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      {...props}
    >
      <View
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </Pressable>
  );
});
Switch.displayName = "Switch";

export { Switch };