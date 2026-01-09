
import React, { useState } from 'react';
import { FuelEntry, FuelEntryFormData } from '../types';
import { ArrowRight, Plus } from 'lucide-react';

interface FuelFormProps {
  initialData?: FuelEntry;
  onSubmit: (data: FuelEntryFormData, shouldClose?: boolean) => void;
  onCancel: () => void;
}

const InputWrapper = ({ label, children, className = "" }: { label: string, children?: React.ReactNode, className?: string }) => (
  <div className={`space-y-1 w-full flex flex-col ${className}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative w-full flex items-center group">
      {children}
    </div>
  </div>
);

const FuelForm: React.FC<FuelFormProps> = ({ initialData, onSubmit, onCancel }) => {
  // Função para obter a data local no formato YYYY-MM-DD corretamente
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getEmptyState = (): FuelEntryFormData => ({
    data: getTodayString(),
    carro: '',
    combustivel: 'Gasolina',
    litros: 0,
    valor: 0,
    odometroParcial: 0,
    odometroTotal: 0,
  });

  const [formData, setFormData] = useState<FuelEntryFormData>(
    initialData ? {
      data: initialData.data,
      carro: initialData.carro,
      combustivel: initialData.combustivel,
      litros: initialData.litros,
      valor: initialData.valor,
      odometroParcial: initialData.odometroParcial,
      odometroTotal: initialData.odometroTotal,
    } : getEmptyState()
  );

  const [shouldCloseOnSubmit, setShouldCloseOnSubmit] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, shouldCloseOnSubmit);
    
    if (!shouldCloseOnSubmit) {
      // Ao resetar para um novo registro, recalculamos a data de "hoje"
      setFormData(prev => ({
        ...getEmptyState(),
        carro: prev.carro,
        data: getTodayString()
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  // Ajustado: removido pl-12 (padding-left para o ícone) para px-4 (padding horizontal equilibrado)
  const inputClasses = "w-full px-4 min-h-[46px] bg-slate-950 border border-slate-800 rounded-2xl focus:bg-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-slate-100 font-medium placeholder:text-slate-700 flex items-center";

  return (
    <form className="p-0 flex flex-col" onSubmit={handleSubmit}>
      <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] scrollbar-hide bg-slate-900">
        <div className="grid grid-cols-2 gap-4">
          <InputWrapper label="Data de Abastecimento" className="col-span-2">
            <input 
              type="date" 
              name="data" 
              value={formData.data} 
              onChange={handleChange}
              className={inputClasses}
              required
              title="Data do abastecimento (padrão: hoje)"
            />
          </InputWrapper>

          <InputWrapper label="Veículo" className="col-span-1">
            <select 
              name="carro" 
              value={formData.carro} 
              onChange={handleChange}
              className={inputClasses}
              required
            >
              <option value="" disabled className="bg-slate-900">Selecione</option>
              <option value="Fastback" className="bg-slate-900">Fastback</option>
              <option value="Palio" className="bg-slate-900">Palio</option>
              <option value="Bros" className="bg-slate-900">Bros</option>
            </select>
          </InputWrapper>

          <InputWrapper label="Combustível" className="col-span-1">
            <select 
              name="combustivel" 
              value={formData.combustivel} 
              onChange={handleChange}
              className={inputClasses}
              required
            >
              <option value="Gasolina" className="bg-slate-900">Gasolina</option>
              <option value="Etanol" className="bg-slate-900">Etanol</option>
              <option value="Diesel" className="bg-slate-900">Diesel</option>
              <option value="GNV" className="bg-slate-900">GNV</option>
            </select>
          </InputWrapper>

          <InputWrapper label="Litros" className="col-span-1">
            <input 
              type="number" 
              name="litros" 
              step="0.01" 
              placeholder="0.00" 
              value={formData.litros || ''} 
              onChange={handleChange}
              className={inputClasses}
              required
              min="0.01"
            />
          </InputWrapper>

          <InputWrapper label="Valor Total (R$)" className="col-span-1">
            <input 
              type="number" 
              name="valor" 
              step="0.01" 
              placeholder="0.00" 
              value={formData.valor || ''} 
              onChange={handleChange}
              className={inputClasses}
              required
              min="0.01"
            />
          </InputWrapper>

          <InputWrapper label="KM Parcial" className="col-span-1">
            <input 
              type="number" 
              name="odometroParcial" 
              step="0.1"
              placeholder="0.0" 
              value={formData.odometroParcial || ''} 
              onChange={handleChange}
              className={inputClasses}
              required
              min="0.1"
            />
          </InputWrapper>

          <InputWrapper label="KM Total" className="col-span-1">
            <input 
              type="number" 
              name="odometroTotal" 
              step="0.1"
              placeholder="0.0" 
              value={formData.odometroTotal || ''} 
              onChange={handleChange}
              className={inputClasses}
              required
              min="0"
            />
          </InputWrapper>
        </div>
      </div>

      <div className="p-6 pt-4 flex flex-col sm:flex-row items-center gap-4 border-t border-slate-800 bg-slate-900">
        <button 
          type="button" 
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-2.5 bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 rounded-2xl transition-all active:scale-[0.98] order-3 sm:order-1"
        >
          Cancelar
        </button>
        
        <div className="flex-1 flex gap-3 w-full order-2">
          {!initialData && (
            <button 
              type="submit" 
              onClick={() => setShouldCloseOnSubmit(false)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 font-bold rounded-2xl transition-all active:scale-[0.98]"
              title="Salvar e continuar adicionando hoje"
            >
              <Plus size={18} strokeWidth={3} />
              <span className="hidden sm:inline">Salvar e Novo</span>
              <span className="sm:hidden">Novo</span>
            </button>
          )}

          <button 
            type="submit"
            onClick={() => setShouldCloseOnSubmit(true)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/10 transition-all active:scale-[0.98]"
          >
            <span>{initialData ? 'Salvar Registro' : 'Adicionar registro'}</span>
            <ArrowRight size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default FuelForm;
