/**
 * OperatorContext — global active-operator state.
 *
 * Every page (Dashboard, History, New Test) scopes its data
 * to the currently selected operator.
 *
 * The Admin Panel bypasses this filter intentionally.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getOperators } from '../services/api';
import type { Operator } from '../services/api';

interface OperatorContextValue {
  currentOperator: Operator | null;
  setCurrentOperator: (op: Operator) => void;
  operators: Operator[];
  reloadOperators: () => Promise<void>;
  isLoading: boolean;
}

const OperatorContext = createContext<OperatorContextValue>({
  currentOperator: null,
  setCurrentOperator: () => {},
  operators: [],
  reloadOperators: async () => {},
  isLoading: true,
});

export function OperatorProvider({ children }: { children: ReactNode }) {
  const [operators, setOperators]               = useState<Operator[]>([]);
  const [currentOperator, setCurrentOpState]    = useState<Operator | null>(null);
  const [isLoading, setIsLoading]               = useState(true);

  const reloadOperators = async () => {
    try {
      const ops = await getOperators();
      setOperators(ops);
      // Restore saved operator or default to first
      const savedId = localStorage.getItem('nanotech-operator');
      const found   = ops.find(o => o.id === savedId) ?? ops[0] ?? null;
      setCurrentOpState(prev => {
        // If our current selection still exists, keep it
        if (prev && ops.find(o => o.id === prev.id)) return prev;
        return found;
      });
    } catch {
      setOperators([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { reloadOperators(); }, []);

  const setCurrentOperator = (op: Operator) => {
    setCurrentOpState(op);
    try { localStorage.setItem('nanotech-operator', op.id); } catch {}
  };

  return (
    <OperatorContext.Provider value={{ currentOperator, setCurrentOperator, operators, reloadOperators, isLoading }}>
      {children}
    </OperatorContext.Provider>
  );
}

export function useOperator() {
  return useContext(OperatorContext);
}
