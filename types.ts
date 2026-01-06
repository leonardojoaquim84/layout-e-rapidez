
export interface FuelEntry {
  id: string;
  data: string;
  carro: string;
  combustivel: string;
  litros: number;
  valor: number;
  odometroParcial: number;
  odometroTotal: number;
  timestamp: number;
}

export type FuelEntryFormData = Omit<FuelEntry, 'id' | 'timestamp'>;
