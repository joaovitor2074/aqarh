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
    lg: "max-w-2xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-xl shadow-lg w-full mx-4 ${sizes[size]}`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
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
