import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../../api';
import { X, ShieldCheck, Star, Award, Calendar, CheckCircle, ExternalLink } from 'lucide-react';

export default function PassportInspectorModal({ workerId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!workerId) return;
    setLoading(true);
    setError('');
    api(`/passport/${workerId}`)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Worker passport not found');
        setLoading(false);
      });
  }, [workerId]);

  if (!workerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-safety relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-safety rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-500 uppercase">Fetching Verified Passport...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 space-y-3">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-base font-bold text-rose-800">Passport Not Found</h3>
            <p className="text-xs text-slate-500">{error}</p>
            <button
              onClick={onClose}
              className="py-2 px-4 bg-slate-200 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b pb-3">
              <img
                src="/logo.png"
                alt="KaamSetu Logo"
                className="h-9 w-auto object-contain bg-slate-100 rounded-lg p-0.5 border"
              />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-safety-600 block">
                  Official Verified Wage Passport
                </span>
                <h3 className="text-lg font-black text-navy-950 leading-none">
                  {data.name}
                </h3>
              </div>
            </div>

            {/* Top metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded-xl border">
                <span className="text-xl font-black text-navy-950 block">{data.days}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">Days Worked</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border">
                <span className="text-xl font-black text-emerald-700 block">
                  ₹{(data.totalWagesReceived || (data.days * 700)).toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">Earned & Settled</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border">
                <span className="text-xl font-black text-amber-500 block">⭐ {data.rating}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">Rating ({data.onTimePct || 96}%)</span>
              </div>
            </div>

            {/* QR code */}
            <div className="text-center p-3 bg-slate-50 rounded-2xl border">
              <div className="inline-block p-2 bg-white rounded-xl border shadow-sm">
                <QRCodeSVG value={`${window.location.origin}/api/passport/${data.id}`} size={120} />
              </div>
              <p className="text-[11px] font-bold text-navy-900 mt-1">
                Scan with any smartphone camera to verify credentials
              </p>
            </div>

            {/* Badges */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                Verified Skill Badges:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.badges?.map((b, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-bold bg-amber-50 text-navy-950 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle size={11} className="text-emerald-600" />
                    <span>{b}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {data.reviews && data.reviews.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                  Recent Contractor Reviews:
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {data.reviews.map((r, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded-lg border text-xs">
                      <div className="flex justify-between text-amber-500 font-bold">
                        <span>{'★'.repeat(r.stars)}</span>
                        <span className="text-[10px] text-slate-400">{r.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-navy-800 text-white font-bold rounded-xl text-xs hover:bg-navy-700 transition"
            >
              Close Passport
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
