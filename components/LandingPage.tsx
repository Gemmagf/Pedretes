import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import {
  Gem, Clock, BarChart2, FileText, Users, ChevronRight,
  Timer, TrendingUp, Star, ArrowRight, Sparkles
} from 'lucide-react';
import DemoQuestionnaire from './DemoQuestionnaire';

interface Props {
  onLogin: () => void;
}

const features = [
  {
    icon: <Timer className="w-6 h-6" />,
    title: 'Live-Zeiterfassung',
    desc: 'Starte den Timer pro Auftrag. Sieh in Echtzeit, wie viel Zeit und Kosten anfallen.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: 'Finanzanalyse',
    desc: 'Umsatz nach Tag, Monat und Jahr. Rentabilität nach Auftragstyp in CHF/Stunde.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Smarte Vorhersage',
    desc: 'Die App lernt aus deinen Daten und schlägt automatisch Preise und Zeitaufwand vor.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'PDF-Offerte Zürich',
    desc: 'Exportiere professionelle Offerten im Schweizer Format — direkt aus der App.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Teamverwaltung',
    desc: 'Arbeitstage, Urlaub und Auslastung für jede Person im Atelier im Blick.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: <Gem className="w-6 h-6" />,
    title: 'Jeder Auftrag, alles klar',
    desc: 'Kunden, Materialien, Steine, Status — alle Details an einem Ort.',
    color: 'bg-orange-50 text-orange-600',
  },
];

const testimonial = {
  quote: 'Endlich weiss ich, welche Aufträge sich wirklich lohnen. Die Zeiterfassung hat mir gezeigt, dass ich Fassungsarbeiten 30% zu günstig angeboten habe.',
  author: 'Goldschmiedin, Zürich',
};

const LandingPage: React.FC<Props> = ({ onLogin }) => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-sm border-b border-amber-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-jewelry-gold to-jewelry-copper flex items-center justify-center">
              <Gem className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-amber-700 text-xl tracking-wider">PEDRETES</span>
          </div>
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm font-semibold text-jewelry-copper border border-jewelry-copper/30 rounded-xl hover:bg-amber-50 transition"
          >
            Anmelden
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Atelier-Management für Handwerksbetriebe
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 leading-tight mb-6">
              Dein Atelier.<br />
              <span className="text-jewelry-copper">Vollständig im Griff.</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Pedretes hilft Handwerksbetrieben, Aufträge zu verwalten, Zeit zu erfassen,
              Kosten zu kontrollieren und professionelle Offerten zu erstellen — alles in einer App.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowQuestionnaire(true)}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-jewelry-gold to-jewelry-copper text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition"
              >
                <Sparkles className="w-5 h-5" />
                Demo entdecken
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <button
                onClick={onLogin}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold text-base border border-gray-200 hover:border-jewelry-gold hover:bg-amber-50 transition"
              >
                Anmelden
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Alles was du brauchst</h2>
            <p className="text-gray-400">Entwickelt für kleine Ateliers und Handwerksbetriebe in der Schweiz.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#FDFBF7] rounded-2xl p-6 border border-gray-100 hover:border-jewelry-gold/40 hover:shadow-sm transition"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <blockquote className="text-xl font-serif text-gray-700 italic leading-relaxed mb-6">
            "{testimonial.quote}"
          </blockquote>
          <p className="text-sm text-gray-400 font-medium">— {testimonial.author}</p>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-20 px-6 bg-gradient-to-br from-amber-50 to-orange-50 border-t border-amber-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Bereit es auszuprobieren?
          </h2>
          <p className="text-gray-500 mb-8">
            Probiere die Demo mit deinen eigenen Ateliertyp-Daten — keine Registrierung nötig.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowQuestionnaire(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-jewelry-gold to-jewelry-copper text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition"
          >
            <Sparkles className="w-5 h-5" />
            Demo starten
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          Pedretes · Schmuckatelier Zürich · <span className="text-jewelry-copper">pedretes-one.vercel.app</span>
        </p>
      </footer>

      {/* Questionnaire Modal */}
      <AnimatePresence>
        {showQuestionnaire && (
          <DemoQuestionnaire onClose={() => setShowQuestionnaire(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
