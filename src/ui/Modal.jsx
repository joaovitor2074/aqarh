// src/components/ui/Modal.jsx
import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md"
}) {
  // Bloqueia scroll do body quando o modal abre
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-3xl",
    xl: "max-w-5xl"
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center overflow-y-auto p-2 sm:items-center sm:p-6">
      
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        onClick={() => onClose()}
      />

      {/* Modal */}
      <div
        className={`relative flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-lg bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${sizes[size] || sizes.md}`}
        role="dialog"
        aria-modal="true"
      >
        
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="min-w-0 text-base font-semibold leading-tight text-gray-800 sm:text-lg">
            {title}
          </h3>
          <button
            type="button"
            onClick={() => onClose()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white p-0 text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

      </div>
    </div>
  );
}

/* 
const [open, setOpen] = useState(false);

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Novo Membro"
>
  <FormGroup label="Nome">
    <Input />
  </FormGroup>

  <div className="flex justify-end gap-2 mt-6">
    <Button variant="secondary" onClick={() => setOpen(false)}>
      Cancelar
    </Button>
    <Button>
      Salvar
    </Button>
  </div>
</Modal>
*/
