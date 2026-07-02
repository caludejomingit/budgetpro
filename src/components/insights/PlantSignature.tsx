import Svg, { Ellipse, Line, Path, Rect } from 'react-native-svg';

/** Ported from the reference app's renderPlant(rate) — more leaves unlock as the savings rate climbs. */
export function PlantSignature({ rate }: { rate: number }) {
  const clamped = Math.max(0, Math.min(100, rate));
  const leafOpacity = (i: number) => (clamped >= i * 20 ? 1 : 0.18);
  const stemH = 8 + Math.min(30, clamped * 0.3);

  return (
    <Svg viewBox="0 0 56 64" width={56} height={64}>
      <Ellipse cx={28} cy={58} rx={16} ry={4} fill="#E4F1E7" />
      <Path d="M16 58 L20 40 L36 40 L40 58 Z" fill="#1E6B4E" />
      <Rect x={16} y={36} width={24} height={6} rx={2} fill="#164F3A" />
      <Line x1={28} y1={40 - stemH} x2={28} y2={40} stroke="#2F9160" strokeWidth={2.4} strokeLinecap="round" />
      <Path opacity={leafOpacity(1)} d={`M28 ${37 - stemH * 0.3} q-9 -2 -11 -9 q9 -1 12 6 z`} fill="#3E9E6F" />
      <Path opacity={leafOpacity(2)} d={`M28 ${34 - stemH * 0.55} q9 -2 11 -9 q-9 -1 -12 6 z`} fill="#2F9160" />
      <Path opacity={leafOpacity(3)} d={`M28 ${30 - stemH * 0.8} q-8 -1 -10 -7 q8 -1 11 5 z`} fill="#57B187" />
      <Path opacity={leafOpacity(4)} d={`M28 ${40 - stemH} q0 -6 4 -9 q3 5 -1 10 z`} fill="#2F9160" />
      <Path opacity={leafOpacity(5)} d={`M28 ${40 - stemH} q0 -6 -4 -9 q-3 5 1 10 z`} fill="#3E9E6F" />
    </Svg>
  );
}
