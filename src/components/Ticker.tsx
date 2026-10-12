import { useContent } from '../lib/useContent';

export default function Ticker() {
  const { tickerItems } = useContent();
  const row = [...tickerItems, ...tickerItems, ...tickerItems];
  return (
    <div className="ticker-mask">
      <div className="ticker-track py-4 font-mono text-[12px] tracking-mega text-mist">
        {[...row, ...row].map((item, i) => (
          <span key={i} className="mx-7 inline-flex items-center gap-7 whitespace-nowrap">
            <span>{item}</span>
            <span className="text-blaze">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
