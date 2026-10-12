import { useState } from 'react';
import Card from '../common/Card';
import PainPointTag from '../common/PainPointTag';
import { useToast } from '../../context/ToastContext';
import { Users, UserPlus, CheckCircle2, XCircle, Phone } from 'lucide-react';

export default function MukkadamCrewTab({ crew, onToggleCrew, onAddCrew }) {
  const { addToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Helper');
  const [days, setDays] = useState('5');

  const presentCount = crew?.filter((c) => c.present).length || 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Please enter crew member name', 'warning');
      return;
    }
    try {
      await onAddCrew({ name, role, days: Number(days) });
      setName('');
      setShowAddForm(false);
      addToast(`${name} added to crew!`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Present Count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
            <span>👥</span>
            <span>Your Crew Profile ({crew?.length || 0})</span>
          </h2>
          <p className="text-xs text-slate-500">Group profile for entire labour team</p>
        </div>

        <div className="text-right">
          <span className="text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full">
            {presentCount} of {crew?.length || 0} Present Today
          </span>
        </div>
      </div>

      {/* Add Crew Member toggle */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-xs font-bold text-navy-900 transition flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <UserPlus size={15} />
          <span>+ Add New Worker to Crew</span>
        </button>
      ) : (
        <Card className="border-2 border-safety-400 bg-safety-50/50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-extrabold text-navy-950 uppercase tracking-wider">
              Add Crew Member
            </h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-500 font-bold"
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleAdd} className="space-y-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Worker Name</label>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Trade Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="Mason">Mason (1.3x)</option>
                  <option value="Helper">Helper (1.0x)</option>
                  <option value="Painter">Painter (1.2x)</option>
                  <option value="Electrician">Electrician (1.4x)</option>
                  <option value="Plumber">Plumber (1.3x)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Days Worked</label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-navy-800 hover:bg-navy-700 text-white font-bold rounded-xl text-xs transition"
            >
              Add Member
            </button>
          </form>
        </Card>
      )}

      {/* Crew list cards */}
      <div className="space-y-2.5">
        {crew?.map((c) => (
          <Card key={c.id} className="flex items-center justify-between gap-3 p-3.5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {c.role === 'Mason' ? '🧱' : c.role === 'Painter' ? '🎨' : '📦'}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-navy-950">{c.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border">
                    {c.role || 'Worker'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  <span>{c.days || 1} shifts completed</span>
                  {c.phone && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{c.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => onToggleCrew(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-2xs ${
                c.present
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              {c.present ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
              <span>{c.present ? 'Present' : 'Absent'}</span>
            </button>
          </Card>
        ))}
      </div>

      <PainPointTag text="Mukkadam manages individual and group profiles, attendance, and earnings manually" persona="mukkadam" />
    </div>
  );
}
