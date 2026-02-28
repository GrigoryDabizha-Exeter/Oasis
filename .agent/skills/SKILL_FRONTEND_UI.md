---
name: Frontend UI & Accessibility Standards
description: Enforces "Liquid Glass" aesthetics, Tailwind CSS/NativeWind usage, and universal accessibility for the Gatwick Oasis Hub application.
---

## When to use this skill

Whenever generating or modifying React Native UI components, layouts, screens, or stylesheets within the Oasis project.

## How to use it

### Styling Engine
- **Exclusively** use NativeWind to map Tailwind CSS utility classes to React Native StyleSheet objects.
- Never write raw `StyleSheet.create()` — always use className-based NativeWind utilities.

### Liquid Glass Aesthetic (2026 Design Language)
- Use `react-native-reanimated` for all animations: fluid entrance transitions, parallax scrolling, and interactive depth shadows.
- Use `expo-blur` `BlurView` for frosted glass card backgrounds with `intensity={40}` and `tint="dark"`.
- Cards must have translucent borders (`border border-white/10`), subtle inner glow, and layered depth via shadow utilities.
- Backgrounds should use gradient overlays on top of the Cod Gray base.

### Gatwick Brand Palette (Strict Adherence)
| Token          | Value              | Usage                                       |
|----------------|--------------------|---------------------------------------------|
| `bondi`        | `#00A0B2`          | Primary CTAs, active nav states, highlights |
| `cod-gray`     | `#111111`          | Dark mode background base                  |
| `cod-gray-800` | `#1A1A1A`          | Elevated card surfaces                      |
| `cod-gray-600` | `#2A2A2A`          | Secondary surfaces, dividers                |
| `white`        | `#FFFFFF`          | Primary text on dark backgrounds            |
| `white/60`     | `rgba(255,255,255,0.6)` | Secondary/muted text               |

### Typography
- Use geometric sans-serif font (Inter as web-safe fallback for Gilroy).
- Minimum body text size: 16px. Minimum tap target: 44x44px.
- Headings: bold weight, generous letter spacing.

### Accessibility (W3C WCAG 2.1 AA Compliance)
- All interactive elements must have `accessibilityLabel` and `accessibilityRole` props.
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text.
- All images must have `accessibilityLabel` descriptions.
- Support dynamic font scaling via `allowFontScaling={true}`.
- Navigation must be fully operable via screen readers (VoiceOver/TalkBack).
- Use semantic grouping with `accessibilityRole="header"` for section titles.
