import React from 'react';
import { DEFAULT_PASSAGE } from '../types';
import { 
  FONT_SIZES, 
  PHASE_BOUNDARIES, 
  DYSLEXIC_TYPOGRAPHY, 
  NORMAL_TYPOGRAPHY,
  ANIMATION_DURATIONS 
} from '../constants';

interface ReadingPassageProps {
  elapsedTime: number;
  dyslexicMode: boolean;
}

export const ReadingPassage: React.FC<ReadingPassageProps> = ({ elapsedTime, dyslexicMode }) => {
  const getFontSize = (): string => {
    if (elapsedTime < PHASE_BOUNDARIES.PHASE_1_END) return FONT_SIZES.PHASE_1;
    if (elapsedTime < PHASE_BOUNDARIES.PHASE_2_END) return FONT_SIZES.PHASE_2;
    return FONT_SIZES.PHASE_3;
  };

  const getTypographyStyles = () => {
    if (dyslexicMode) {
      return {
        fontFamily: DYSLEXIC_TYPOGRAPHY.FONT_FAMILY,
        letterSpacing: DYSLEXIC_TYPOGRAPHY.LETTER_SPACING,
        lineHeight: DYSLEXIC_TYPOGRAPHY.LINE_HEIGHT,
        fontWeight: DYSLEXIC_TYPOGRAPHY.FONT_WEIGHT
      };
    }
    return {
      fontFamily: NORMAL_TYPOGRAPHY.FONT_FAMILY,
      letterSpacing: NORMAL_TYPOGRAPHY.LETTER_SPACING,
      lineHeight: NORMAL_TYPOGRAPHY.LINE_HEIGHT,
      fontWeight: NORMAL_TYPOGRAPHY.FONT_WEIGHT
    };
  };

  const typography = getTypographyStyles();
  const fontSize = getFontSize();

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-6 md:px-12">
      <div className="max-w-4xl w-full bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200/50">
        <p
          className="text-center text-gray-900 leading-relaxed"
          style={{
            ...typography,
            fontSize,
            transition: `font-size ${ANIMATION_DURATIONS.FONT_TRANSITION}ms ease-in-out`,
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        >
          {DEFAULT_PASSAGE.text}
        </p>
      </div>
    </div>
  );
};
