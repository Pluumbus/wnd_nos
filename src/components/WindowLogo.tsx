import React from "react";
import Svg, {
  Rect,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
  Line,
} from "react-native-svg";

interface WindowLogoProps {
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

const WindowLogo: React.FC<WindowLogoProps> = ({
  size = 130,
  primaryColor = "#e94560",
  secondaryColor = "#0f3460",
}) => {
  const scale = size / 130;

  return (
    <Svg width={size} height={size} viewBox="0 0 130 130">
      <Defs>
        {/* Градиент для стекла */}
        <LinearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#87CEEB" stopOpacity="0.9" />
          <Stop offset="50%" stopColor="#5BA8D0" stopOpacity="0.85" />
          <Stop offset="100%" stopColor="#4A9BC7" stopOpacity="0.9" />
        </LinearGradient>
        
        {/* Градиент для блика на стекле */}
        <LinearGradient id="glassHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <Stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </LinearGradient>

        {/* Градиент для рамы */}
        <LinearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#ffffff" />
          <Stop offset="50%" stopColor="#f5f5f5" />
          <Stop offset="100%" stopColor="#e8e8e8" />
        </LinearGradient>

        {/* Градиент для внутренней рамы */}
        <LinearGradient id="innerFrameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#f8f8f8" />
          <Stop offset="100%" stopColor="#e0e0e0" />
        </LinearGradient>

        {/* Градиент для подоконника */}
        <LinearGradient id="sillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#ffffff" />
          <Stop offset="100%" stopColor="#d0d0d0" />
        </LinearGradient>

        {/* Градиент для фона */}
        <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={primaryColor} />
          <Stop offset="100%" stopColor={secondaryColor} />
        </LinearGradient>
      </Defs>

      {/* Фон */}
      <Rect x="0" y="0" width="130" height="130" rx="20" fill="url(#bgGradient)" />

      {/* Тень окна */}
      <Rect
        x="22"
        y="22"
        width="90"
        height="95"
        rx="3"
        fill="rgba(0,0,0,0.2)"
      />

      {/* Внешняя рама окна */}
      <Rect
        x="18"
        y="15"
        width="94"
        height="90"
        rx="4"
        fill="url(#frameGradient)"
        stroke="#c0c0c0"
        strokeWidth="1"
      />

      {/* Внутренняя область с импостом */}
      <G>
        {/* Левая створка - рама */}
        <Rect
          x="24"
          y="21"
          width="38"
          height="78"
          rx="2"
          fill="url(#innerFrameGradient)"
          stroke="#b0b0b0"
          strokeWidth="0.5"
        />
        
        {/* Левая створка - стекло */}
        <Rect
          x="28"
          y="25"
          width="30"
          height="70"
          rx="1"
          fill="url(#glassGradient)"
        />
        
        {/* Левая створка - блик */}
        <Path
          d="M28 25 L58 25 L58 35 L38 95 L28 95 Z"
          fill="url(#glassHighlight)"
          opacity="0.6"
        />

        {/* Правая створка - рама */}
        <Rect
          x="68"
          y="21"
          width="38"
          height="78"
          rx="2"
          fill="url(#innerFrameGradient)"
          stroke="#b0b0b0"
          strokeWidth="0.5"
        />
        
        {/* Правая створка - стекло */}
        <Rect
          x="72"
          y="25"
          width="30"
          height="70"
          rx="1"
          fill="url(#glassGradient)"
        />
        
        {/* Правая створка - блик */}
        <Path
          d="M72 25 L102 25 L102 35 L82 95 L72 95 Z"
          fill="url(#glassHighlight)"
          opacity="0.6"
        />

        {/* Импост (центральная перегородка) */}
        <Rect
          x="62"
          y="21"
          width="6"
          height="78"
          fill="url(#innerFrameGradient)"
          stroke="#b0b0b0"
          strokeWidth="0.5"
        />
      </G>

      {/* Ручка левая */}
      <G>
        <Rect
          x="54"
          y="56"
          width="2"
          height="12"
          rx="1"
          fill="#909090"
        />
        <Rect
          x="53"
          y="55"
          width="4"
          height="3"
          rx="1"
          fill="#a0a0a0"
        />
      </G>

      {/* Ручка правая */}
      <G>
        <Rect
          x="74"
          y="56"
          width="2"
          height="12"
          rx="1"
          fill="#909090"
        />
        <Rect
          x="73"
          y="55"
          width="4"
          height="3"
          rx="1"
          fill="#a0a0a0"
        />
      </G>

      {/* Подоконник */}
      <Path
        d="M12 105 L18 99 L112 99 L118 105 L118 112 L12 112 Z"
        fill="url(#sillGradient)"
        stroke="#c0c0c0"
        strokeWidth="0.5"
      />
      
      {/* Тень под подоконником */}
      <Path
        d="M15 112 L115 112 L118 115 L12 115 Z"
        fill="rgba(0,0,0,0.15)"
      />
    </Svg>
  );
};

export default WindowLogo;
