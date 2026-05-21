// src/components/ui/FormGroup.jsx
import React from "react";

export default function FormGroup({
  label,
  error,
  children,
  required = false,
  className = ""
}) {
  return (
    <div className={`w-full space-y-1 ${className}`}>
      
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Campo (Input, Select, etc) */}
      {children}

      {/* Erro */}
      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
// Uso exemplo

/* <FormGroup label="Nome do Projeto" required>
  <Input
    placeholder="Digite o nome"
    value={nome}
    onChange={(e) => setNome(e.target.value)}
  />
</FormGroup>

<FormGroup label="Email" error="Email inválido">
  <Input
    placeholder="exemplo@email.com"
    error
  />
</FormGroup>

*/