
import React from 'react';
import { FuelEntry } from '../types';
import { Trash2, Edit2, Calendar, Fuel as FuelIcon, Car as CarIcon, Share2 } from 'lucide-react';

interface FuelTableProps {
  entries: FuelEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: FuelEntry) => void;
  onShare: (entry: FuelEntry) => void;
}

const FuelTable: React.FC<FuelTableProps> = ({ entries, onDelete, onEdit, onShare }) => {
  
  const calculateConsumption = (entry: FuelEntry) => {
    if (!entry.litros || entry.litros === 0) return 0;
    return entry.odometroParcial / entry.litros;
  };

  if (entries.length === 0) {
    return (
      <div className="p-16 text-center bg-slate-900">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 text-slate-600 rounded-full mb-6">
          <Calendar size={40} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-slate-300">Tabela vazia</h3>
        <p className="text-slate-500 mt-2 max-w-xs mx-auto">Adicione registros para ver o histórico e consumo.</p>
      </div>
    );
  }

  const thClasses = "px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] bg-slate-900 border-b border-slate-800 whitespace-nowrap";
  const tdClasses = "px-4 py-3 whitespace-nowrap text-sm text-slate-400";

  return (
    <table className="w-full border-collapse bg-slate-900">
      <thead>
        <tr>
          <th className={thClasses}>Data</th>
          <th className={thClasses}>Veículo</th>
          <th className={thClasses}>Combustível</th>
          <th className={thClasses}>Litros</th>
          <th className={thClasses}>Consumo</th>
          <th className={thClasses}>Valor</th>
          <th className="px-4 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] bg-slate-900 border-b border-slate-800">Ação</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800">
        {entries.map((entry) => {
          const consumo = calculateConsumption(entry);
          return (
            <tr key={entry.id} className="hover:bg-slate-800/40 transition-all group">
              <td className={tdClasses}>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200">
                    {new Date(entry.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                  <span className="text-[9px] text-slate-600 font-bold uppercase">
                    {new Date(entry.data).toLocaleDateString('pt-BR', { year: 'numeric' })}
                  </span>
                </div>
              </td>
              <td className={tdClasses}>
                <div className="flex items-center gap-1.5">
                  <CarIcon size={12} className="text-slate-600" />
                  <span className="font-bold text-slate-300">{entry.carro}</span>
                </div>
              </td>
              <td className={tdClasses}>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider
                  ${entry.combustivel === 'Gasolina' ? 'bg-amber-500/10 text-amber-500' : 
                    entry.combustivel === 'Etanol' ? 'bg-emerald-500/10 text-emerald-500' : 
                    'bg-slate-700/50 text-slate-300'}`}>
                  {entry.combustivel}
                </span>
              </td>
              <td className={tdClasses}>
                <span className="font-mono text-slate-500 text-xs">{entry.litros.toFixed(2)}L</span>
              </td>
              <td className={tdClasses}>
                <div className="flex items-center gap-1">
                  <span className={`font-black text-base ${consumo > 12 ? 'text-emerald-500' : consumo > 8 ? 'text-amber-500' : 'text-slate-300'}`}>
                    {consumo.toFixed(2)}
                  </span>
                  <span className="text-[9px] font-bold text-slate-600 uppercase">km/L</span>
                </div>
              </td>
              <td className={tdClasses}>
                <span className="font-bold text-slate-200">R$ {entry.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2 transition-all">
                  <button 
                    onClick={() => onShare(entry)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                    title="Compartilhar"
                  >
                    <Share2 size={13} strokeWidth={3} />
                    <span className="hidden sm:inline uppercase">Enviar</span>
                  </button>
                  
                  <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
                      className="p-1.5 text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-all active:scale-90"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <div className="w-px h-3 bg-slate-800 mx-0.5"></div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                      className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all active:scale-90"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default FuelTable;
