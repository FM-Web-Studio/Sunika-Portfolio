const LEAF = 'M0 0 C -7 -10 -7 -22 0 -32 C 7 -22 7 -10 0 0 Z';

const Sprig = () => (
  <g>
    <path d="M50 96 C 50 74 44 62 50 44 C 55 30 50 16 50 6" />
    {[[74, 38], [52, 30], [30, 22]].map(([y, angle]) => (
      <g key={y}>
        <g transform={`translate(50 ${y}) rotate(${angle})`}><path d={LEAF} /></g>
        <g transform={`translate(50 ${y}) rotate(${-angle}) scale(-1 1)`}><path d={LEAF} /></g>
      </g>
    ))}
    <circle cx="50" cy="7" r="3.4" />
  </g>
);

const Fern = () => (
  <g>
    <path d="M20 94 C 34 70 52 46 84 12" />
    {[0.18, 0.32, 0.46, 0.6, 0.74].map((t, i) => {
      const x = 20 + 64 * t;
      const y = 94 - 82 * t;
      const len = 22 - i * 3;
      return (
        <g key={t}>
          <path d={`M${x} ${y} q ${-len * 0.9} ${-len * 0.2} ${-len} ${-len * 0.9}`} />
          <path d={`M${x} ${y} q ${len * 0.3} ${len * 0.6} ${len * 0.95} ${len * 0.5}`} />
        </g>
      );
    })}
  </g>
);

const Bloom = () => (
  <g transform="translate(50 50)">
    {[0, 72, 144, 216, 288].map((deg) => (
      <ellipse key={deg} cx="0" cy="-23" rx="10" ry="18" transform={`rotate(${deg})`} />
    ))}
    <circle r="6.5" fill="currentColor" stroke="none" />
  </g>
);

const MOTIFS = { sprig: Sprig, fern: Fern, bloom: Bloom };

const Botanical = ({ variant = 'sprig', className = '', style }) => {
  const Motif = MOTIFS[variant] || Sprig;
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <Motif />
    </svg>
  );
};

export default Botanical;
