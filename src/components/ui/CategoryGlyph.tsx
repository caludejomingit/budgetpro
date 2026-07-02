import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

import { CATEGORY_ICON_SHAPES, categoryColor } from '@/lib/constants/categories';

interface CategoryGlyphProps {
  name: string;
  size?: number;
  color?: string;
}

export function CategoryGlyph({ name, size = 16, color }: CategoryGlyphProps) {
  const shapes = CATEGORY_ICON_SHAPES[name] ?? CATEGORY_ICON_SHAPES.Miscellaneous;
  const stroke = color ?? categoryColor(name);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {shapes.map((shape, i) => {
        if (shape.path) {
          return <Path key={i} d={shape.path} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
        }
        if (shape.rect) {
          return (
            <Rect
              key={i}
              x={shape.rect.x}
              y={shape.rect.y}
              width={shape.rect.width}
              height={shape.rect.height}
              rx={shape.rect.rx ?? 0}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        }
        if (shape.polygon) {
          return <Polygon key={i} points={shape.polygon} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
        }
        if (shape.circles) {
          return (
            <Svg key={i}>
              {shape.circles.map((c, j) => (
                <Circle key={j} cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke={stroke} strokeWidth={2} />
              ))}
            </Svg>
          );
        }
        return null;
      })}
    </Svg>
  );
}
