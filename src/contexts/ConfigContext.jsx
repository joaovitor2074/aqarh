import { createContext, useContext, useState } from "react";

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [configuracoesGerais, setConfiguracoesGerais] = useState({
    nomeSistema: "Sistema Administrativo",
    descricao: "Plataforma de gerenciamento",
    modoManutencao: false,
    idioma: "pt-BR",
    timezone: "America/Sao_Paulo",
    limiteSessoes: 5,
    // 👇 no futuro entram as outras configs
  });

  return (
    <ConfigContext.Provider
      value={{ configuracoesGerais, setConfiguracoesGerais }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
