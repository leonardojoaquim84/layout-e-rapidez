
import React, { useState, useEffect } from 'react';
import { Plus, Table, Trash2, Edit2, Car, Fuel, Calendar, Hash, DollarSign, Gauge, LogOut, ChevronRight, X, TrendingUp, Share2, CheckCircle2 } from 'lucide-react';
import { FuelEntry, FuelEntryFormData } from './types';
import FuelForm from './components/FuelForm';
import FuelTable from './components/FuelTable';
import { jsPDF } from 'jspdf';

const STORAGE_KEY = 'ecodrive_refuels';
const TARGET_PHONE = '5521997391448';
const SPLASH_IMAGE = 'https://i.postimg.cc/7Lv39fpP/Whats_App_Image_2026_01_08_at_15_43_34_(1).jpg';

const App: React.FC = () => {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [lastSavedEntry, setLastSavedEntry] = useState<FuelEntry | null>(null);
  
  // Estados para a tela de Splash e controle de visibilidade do App
  const [showSplash, setShowSplash] = useState(true);
  const [splashOpacity, setSplashOpacity] = useState(0); 
  const [contentOpacity, setContentOpacity] = useState(0);

  useEffect(() => {
    // 1. Inicia o Fade In da imagem de splash
    const fadeInSplash = setTimeout(() => {
      setSplashOpacity(1);
    }, 100);

    // 2. Inicia o Fade Out da imagem de splash após 1.5s (dando tempo para o fade in terminar)
    const fadeOutSplash = setTimeout(() => {
      setSplashOpacity(0);
      
      // 3. Inicia o Fade In do conteúdo principal sincronizado com o sumiço do splash
      setContentOpacity(1);

      // 4. Remove o overlay de splash do DOM após a animação de fade out
      setTimeout(() => {
        setShowSplash(false);
      }, 700); 
    }, 1800); 

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load entries", e);
      }
    }

    return () => {
      clearTimeout(fadeInSplash);
      clearTimeout(fadeOutSplash);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = (formData: FuelEntryFormData, shouldClose: boolean = true) => {
    const newEntry: FuelEntry = {
      ...formData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setEntries(prev => [newEntry, ...prev]);
    
    if (shouldClose) {
      setLastSavedEntry(newEntry);
    }
  };

  const handleUpdateEntry = (formData: FuelEntryFormData) => {
    if (!editingEntry) return;
    const updated = { ...formData, id: editingEntry.id, timestamp: editingEntry.timestamp };
    setEntries(prev => prev.map(e => e.id === editingEntry.id ? updated : e));
    setEditingEntry(null);
    setLastSavedEntry(updated);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleEditClick = (entry: FuelEntry) => {
    setLastSavedEntry(null);
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleShare = async (entry: FuelEntry) => {
    const doc = new jsPDF();
    
    const [year, month, day] = entry.data.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dateStr = dateObj.toLocaleDateString('pt-BR');
    
    const consumo = entry.litros > 0 ? (entry.odometroParcial / entry.litros).toFixed(2) : "0.00";
    
    doc.setFontSize(22);
    doc.setTextColor(249, 115, 22);
    doc.text('CAR DATA', 105, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('RELATÓRIO DE ABASTECIMENTO COMPLETO', 105, 32, { align: 'center' });
    
    const startY = 60;
    const data = [
      ['Data:', dateStr],
      ['Veículo:', entry.carro],
      ['Combustível:', entry.combustivel],
      ['Litros:', `${entry.litros.toFixed(2)} L`],
      ['Valor Total:', `R$ ${entry.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['KM Parcial:', `${entry.odometroParcial.toFixed(1)} km`],
      ['KM Total:', `${entry.odometroTotal.toFixed(1)} km`],
      ['Consumo Médio:', `${consumo} km/L`],
    ];

    data.forEach((row, i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(row[0], 30, startY + (i * 12));
      doc.setFont('helvetica', 'normal');
      doc.text(row[1], 90, startY + (i * 12));
    });

    const blob = doc.output('blob');
    const fileName = `abastecimento-${entry.carro}-${entry.data}.pdf`;
    const file = new File([blob], fileName, { type: 'application/pdf' });
    
    const message = `*CarData - Novo Abastecimento*\n` +
      `🚗 Veículo: ${entry.carro}\n` +
      `📅 Data: ${dateStr}\n` +
      `⛽ Combustível: ${entry.combustivel}\n` +
      `💧 Litros: ${entry.litros.toFixed(2)} L\n` +
      `💰 Valor: R$ ${entry.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `📏 KM Parcial: ${entry.odometroParcial} km\n` +
      `🏁 KM Total: ${entry.odometroTotal} km\n` +
      `📈 Consumo: ${consumo} km/L\n\n` +
      `Relatório detalhado em anexo.`;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'CarData', text: message });
        return;
      } catch (e) {
        console.error("Erro ao compartilhar via Navigator API", e);
      }
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${TARGET_PHONE}?text=${encodedMessage}`, '_blank');
  };

  const lastEntry = entries[0];
  const lastConsumption = lastEntry && lastEntry.litros > 0 
    ? (lastEntry.odometroParcial / lastEntry.litros) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white relative">
      {/* Splash Screen Overlay */}
      {showSplash && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-700 ease-in-out pointer-events-none"
          style={{ opacity: splashOpacity }}
        >
          <img 
            src={SPLASH_IMAGE} 
            alt="CarData" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Main Content Wrapper with separate opacity control */}
      <div 
        className="flex-1 flex flex-col transition-opacity duration-700 ease-in-out"
        style={{ opacity: contentOpacity }}
      >
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-xl">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-lg text-white shadow-lg shadow-orange-500/20">
                <Car size={24} />
              </div>
              <h1 className="text-xl font-black tracking-tight">Car<span className="text-orange-500 underline decoration-orange-500/40 decoration-4 underline-offset-4">Data</span></h1>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 min-w-[280px] shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/10 p-4 rounded-2xl text-orange-500">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Último Consumo</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-slate-100">
                      {lastConsumption > 0 ? lastConsumption.toFixed(2) : '--'}
                    </p>
                    <p className="text-sm font-bold text-slate-500">km/L</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setEditingEntry(null); setLastSavedEntry(null); setIsFormOpen(true); }}
              className="flex items-center gap-3 bg-white hover:bg-slate-200 text-slate-950 px-8 py-7 rounded-[2rem] font-black shadow-2xl shadow-orange-500/5 transition-all active:scale-95 group h-full self-stretch sm:self-auto"
            >
              <div className="bg-orange-500 p-2 rounded-xl group-hover:rotate-90 transition-transform text-white">
                <Plus size={24} strokeWidth={3} />
              </div>
              <span className="text-lg uppercase tracking-tight">Novo Registro</span>
            </button>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h2 className="text-lg font-black text-orange-500 tracking-widest uppercase">HISTÓRICO</h2>
            </div>
            <div className="overflow-x-auto">
              <FuelTable entries={entries} onDelete={handleDeleteEntry} onEdit={handleEditClick} onShare={handleShare} />
            </div>
          </div>
        </main>

        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl">
            <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
              
              {lastSavedEntry ? (
                <div className="p-10 flex flex-col items-center text-center space-y-6">
                  <div className="bg-orange-500/10 p-6 rounded-full text-orange-500 animate-bounce">
                    <CheckCircle2 size={64} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-100 tracking-tight">Registro Salvo!</h3>
                    <p className="text-slate-400 font-medium">O que deseja fazer agora?</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                    <button 
                      onClick={() => handleShare(lastSavedEntry)}
                      className="flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-orange-500/20 transition-all active:scale-95"
                    >
                      <Share2 size={24} />
                      COMPARTILHAR WHATSAPP
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => { setLastSavedEntry(null); setEditingEntry(null); }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-2xl font-bold transition-all"
                      >
                        NOVO REGISTRO
                      </button>
                      <button 
                        onClick={() => { setIsFormOpen(false); setLastSavedEntry(null); }}
                        className="bg-white hover:bg-slate-200 text-slate-950 py-4 rounded-2xl font-bold transition-all"
                      >
                        VER HISTÓRICO
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div>
                      <h3 className="text-2xl font-black text-slate-100 tracking-tight">
                        {editingEntry ? 'Editar Registro' : 'Novo Abastecimento'}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">ENTRADA RÁPIDA</p>
                    </div>
                    <button 
                      onClick={() => { setIsFormOpen(false); setEditingEntry(null); }}
                      className="p-3 hover:bg-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all border border-slate-800"
                    >
                      <X size={24} strokeWidth={2.5} />
                    </button>
                  </div>
                  
                  <FuelForm 
                    initialData={editingEntry || undefined}
                    onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry}
                    onCancel={() => { setIsFormOpen(false); setEditingEntry(null); }}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
