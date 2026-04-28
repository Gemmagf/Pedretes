import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemo } from '../context/DemoContext';
import { CraftType, TeamSize, MainChallenge, DemoAnswers } from '../utils/demoData';
import { X, ChevronRight, Gem, Watch, Layers, Package, Scissors, Wrench } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const crafts: { value: CraftType; label: string; sub: string; icon: React.ReactNode }[] = [
  { value: 'jewelry', label: 'Schmuck', sub: 'Ring, Collier, Armband…', icon: <Gem className="w-6 h-6" /> },
  { value: 'watchmaking', label: 'Uhren', sub: 'Revision, Restauration…', icon: <Watch className="w-6 h-6" /> },
  { value: 'ceramics', label: 'Keramik', sub: 'Serie, Unikat, Installation…', icon: <Layers className="w-6 h-6" /> },
  { value: 'leather', label: 'Leder', sub: 'Taschen, Gürtel, Accessoires…', icon: <Package className="w-6 h-6" /> },
  { value: 'textiles', label: 'Textil', sub: 'Couture, Maßschneiderei…', icon: <Scissors className="w-6 h-6" /> },
  { value: 'other', label: 'Anderes', sub: 'Eigenes Handwerk', icon: <Wrench className="w-6 h-6" /> },
];

const teamSizes: { value: TeamSize; label: string; sub: string }[] = [
  { value: 'solo', label: 'Allein', sub: 'Ich bin der einzige' },
  { value: 'small', label: '2–3 Personen', sub: 'Kleines Team' },
  { value: 'medium', label: '4–10 Personen', sub: 'Mittleres Atelier' },
  { value: 'large', label: 'Mehr als 10', sub: 'Grosser Betrieb' },
];

const challenges: { value: MainChallenge; label: string; sub: string }[] = [
  { value: 'time', label: 'Zeiterfassung', sub: 'Ich weiss nie genau wie viel Zeit ein Auftrag braucht' },
  { value: 'clients', label: 'Kundenverwaltung', sub: 'Den Überblick über alle Aufträge behalten' },
  { value: 'costs', label: 'Kostenkontrolle', sub: 'Preise richtig kalkulieren und Margen kennen' },
  { value: 'all', label: 'Alles davon', sub: 'Ich brauche einen vollständigen Überblick' },
];

const DemoQuestionnaire: React.FC<Props> = ({ onClose }) => {
  const { enterDemo } = useDemo();
  const [step, setStep] = useState(0);
  const [craft, setCraft] = useState<CraftType | null>(null);
  const [teamSize, setTeamSize] = useState<TeamSize | null>(null);
  const [challenge, setChallenge] = useState<MainChallenge | null>(null);
  const [workshopName, setWorkshopName] = useState('');

  const handleStart = () => {
    if (!craft || !teamSize || !challenge) return;
    const answers: DemoAnswers = {
      craft,
      teamSize,
      challenge,
      workshopName: workshopName.trim() || 'Mein Atelier',
    };
    enterDemo(answers);
    onClose();
  };

  const steps = [
    {
      title: 'Was für ein Atelier hast du?',
      sub: 'Wir passen die Demo an dein Handwerk an.',
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {crafts.map(c => (
            <button
              key={c.value}
              onClick={() => { setCraft(c.value); setStep(1); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center hover:border-jewelry-gold hover:bg-amber-50/50 ${
                craft === c.value ? 'border-jewelry-copper bg-amber-50' : 'border-gray-200'
              }`}
            >
              <span className="text-jewelry-copper">{c.icon}</span>
              <span className="font-semibold text-sm text-gray-800">{c.label}</span>
              <span className="text-xs text-gray-400 leading-tight">{c.sub}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Wie gross ist dein Team?',
      sub: 'So generieren wir realistische Teamdaten.',
      content: (
        <div className="flex flex-col gap-3">
          {teamSizes.map(t => (
            <button
              key={t.value}
              onClick={() => { setTeamSize(t.value); setStep(2); }}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left hover:border-jewelry-gold hover:bg-amber-50/50 ${
                teamSize === t.value ? 'border-jewelry-copper bg-amber-50' : 'border-gray-200'
              }`}
            >
              <div>
                <p className="font-semibold text-gray-800">{t.label}</p>
                <p className="text-xs text-gray-400">{t.sub}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Was ist deine grösste Herausforderung?',
      sub: 'Wir heben die relevantesten Features für dich hervor.',
      content: (
        <div className="flex flex-col gap-3">
          {challenges.map(c => (
            <button
              key={c.value}
              onClick={() => setChallenge(c.value)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left hover:border-jewelry-gold hover:bg-amber-50/50 ${
                challenge === c.value ? 'border-jewelry-copper bg-amber-50' : 'border-gray-200'
              }`}
            >
              <div>
                <p className="font-semibold text-gray-800">{c.label}</p>
                <p className="text-xs text-gray-400">{c.sub}</p>
              </div>
            </button>
          ))}
          {challenge && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-3">
              <input
                type="text"
                placeholder="Name deines Ateliers (optional)"
                value={workshopName}
                onChange={e => setWorkshopName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-jewelry-gold focus:bg-white outline-none"
              />
              <button
                onClick={handleStart}
                className="w-full py-3 bg-gradient-to-r from-jewelry-gold to-jewelry-copper text-white rounded-xl font-bold shadow-md hover:shadow-lg transition"
              >
                Demo starten →
              </button>
            </motion.div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif font-bold text-xl text-gray-800">{steps[step].title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{steps[step].sub}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 px-5 pt-4">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-jewelry-copper' : 'bg-gray-100'}`} />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-5"
          >
            {steps[step].content}
          </motion.div>
        </AnimatePresence>

        {/* Back */}
        {step > 0 && (
          <div className="px-5 pb-4">
            <button onClick={() => setStep(s => s - 1)} className="text-xs text-gray-400 hover:text-gray-600 transition">
              ← Zurück
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DemoQuestionnaire;
