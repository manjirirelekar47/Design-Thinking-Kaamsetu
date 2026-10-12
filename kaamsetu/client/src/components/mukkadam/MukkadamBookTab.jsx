import Card from '../common/Card';
import LargeIconButton from '../common/LargeIconButton';
import PainPointTag from '../common/PainPointTag';
import EmptyState from '../common/EmptyState';
import { MapPin, Users, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function MukkadamBookTab({ crewJobs, presentCrewCount, onBookCrewJob }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
            <span>🤝</span>
            <span>Group Booking for Entire Crew</span>
          </h2>
          <p className="text-xs text-slate-500">
            Book contract work for your {presentCrewCount} present crew members
          </p>
        </div>
      </div>

      {presentCrewCount === 0 && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900">
          ⚠️ No crew members are marked present today. Go to the "Crew" tab and mark attendance first before booking jobs.
        </div>
      )}

      {/* Empty State */}
      {(!crewJobs?.jobs || crewJobs.jobs.length === 0) && (
        <EmptyState
          icon="📋"
          title="No open crew jobs"
          description="Contractors post group requirements for full masonry and plastering squads."
        />
      )}

      {/* Jobs cards */}
      <div className="space-y-3">
        {crewJobs?.jobs?.map((j) => {
          const totalCrewDailyWage = j.wage * (presentCrewCount || 4);

          return (
            <Card key={j.id} highlight={j.booked} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-navy-950">{j.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-0.5">
                    <MapPin size={13} className="text-rose-500" />
                    <span>{j.site}</span>
                    <span>·</span>
                    <span className="text-navy-900 font-bold">{j.contractor?.name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-navy-950 block">₹{j.wage}/day</span>
                  <span className="text-[10px] text-slate-400 font-semibold">per worker</span>
                </div>
              </div>

              {/* Total payout calculation for crew */}
              <div className="p-2.5 bg-slate-50 rounded-xl border flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Total Crew Daily Payout ({presentCrewCount} workers):</span>
                <span className="text-emerald-700 text-sm font-black">₹{totalCrewDailyWage}</span>
              </div>

              <LargeIconButton
                icon={j.booked ? '✓' : '👥'}
                label={j.booked ? '✓ Crew Booked & Confirmed' : `Accept for Crew (${presentCrewCount} workers)`}
                sublabel={j.booked ? 'Contractor notified' : 'Locks full crew booking in escrow'}
                variant={j.booked ? 'success' : 'yellow'}
                disabled={j.booked || presentCrewCount === 0}
                onClick={() => onBookCrewJob(j.id)}
              />
            </Card>
          );
        })}
      </div>

      <PainPointTag text="Mukkadams negotiate informally on the road, with no contract lock or guaranteed crew wages" persona="mukkadam" />
    </div>
  );
}
