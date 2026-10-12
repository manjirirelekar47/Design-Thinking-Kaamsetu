import { MessageSquareQuote } from 'lucide-react';

export default function PainPointTag({ text, persona = 'worker' }) {
  let badgeColor = 'bg-amber-50 border-amber-200 text-amber-900';
  let dotColor = 'bg-amber-500';

  if (persona === 'contractor') {
    badgeColor = 'bg-blue-50 border-blue-200 text-blue-900';
    dotColor = 'bg-blue-500';
  } else if (persona === 'mukkadam') {
    badgeColor = 'bg-purple-50 border-purple-200 text-purple-900';
    dotColor = 'bg-purple-500';
  }

  return (
    <div className={`flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium leading-relaxed my-1.5 shadow-2xs ${badgeColor}`}>
      <MessageSquareQuote size={13} className="flex-shrink-0 mt-0.5 opacity-80" />
      <span className="italic">
        <span className="font-semibold not-italic text-[11px] uppercase tracking-wider opacity-85 mr-1">
          {persona} testimony:
        </span>
        "{text}"
      </span>
    </div>
  );
}
