import Svg, { Polyline } from 'react-native-svg';

type Props = {
  data: number[];
  color: string;
  width?: number;
  height?: number;
};

export default function Sparkline({ data, color, width = 120, height = 36 }: Props) {
  const values = data.length > 1 ? data : [0, ...data];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
