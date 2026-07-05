import { Ico } from './Ico';

export function Empty({ icon, title, desc, cta, onCta }) {
  const I = icon === 'heart' ? Ico.heart : Ico.bag;
  return (
    <div className="border border-line py-20 flex flex-col items-center text-center">
      <I className="w-12 h-12 text-muted/40 mb-5"/>
      <div className="font-display text-2xl mb-2">{title}</div>
      <p className="text-[13px] text-muted mb-6 max-w-xs">{desc}</p>
      <button onClick={onCta} className="bg-ink text-bg px-5 py-3 text-[13px] hover-lift">{cta}</button>
    </div>
  );
}
