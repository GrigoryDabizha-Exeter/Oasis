import { create } from 'zustand';

export type FontSize = 'small' | 'default' | 'large';

interface SettingsState {
    fontSize: FontSize;
    voiceGuidance: boolean;
    hapticFeedback: boolean;
    highContrast: boolean;
    cycleFontSize: () => void;
    toggleVoiceGuidance: () => void;
    toggleHapticFeedback: () => void;
    toggleHighContrast: () => void;
}

const FONT_CYCLE: FontSize[] = ['small', 'default', 'large'];

export const useSettingsStore = create<SettingsState>()((set, get) => ({
    fontSize: 'default',
    voiceGuidance: false,
    hapticFeedback: true,
    highContrast: false,

    cycleFontSize: () => {
        const idx = FONT_CYCLE.indexOf(get().fontSize);
        set({ fontSize: FONT_CYCLE[(idx + 1) % FONT_CYCLE.length] });
    },
    toggleVoiceGuidance:  () => set((s) => ({ voiceGuidance:  !s.voiceGuidance  })),
    toggleHapticFeedback: () => set((s) => ({ hapticFeedback: !s.hapticFeedback })),
    toggleHighContrast:   () => set((s) => ({ highContrast:   !s.highContrast   })),
}));
