'use client';

import { cloneElement, createContext, useContext } from 'react';

const SheetContext = createContext({ open: false, onOpenChange: () => {} });

export function Sheet({ open, onOpenChange, children }) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ asChild = false, children }) {
  const { open, onOpenChange } = useContext(SheetContext);

  const handleClick = () => {
    onOpenChange(!open);
  };

  if (asChild && children) {
    return cloneElement(children, {
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export function SheetContent({ side = 'right', className = '', children }) {
  const { open, onOpenChange } = useContext(SheetContext);

  if (!open) return null;

  const positionClass = side === 'top'
    ? 'inset-x-0 top-0 rounded-b-2xl'
    : 'right-0 top-0 h-full rounded-l-2xl';

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className={`fixed z-50 bg-white shadow-2xl ${positionClass} ${className}`}>
        <div className="max-h-[90vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}