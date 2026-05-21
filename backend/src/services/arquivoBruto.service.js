// services/arquivoBruto.service.js
import fs from 'fs/promises';
import path from 'path';
import { normalizarNome } from './normalizacao.service.js';

const ARQUIVOS_BRUTOS = {
  pesquisador: path.join(process.cwd(), 'data', 'resultado_linha_pesquisadores.json'),
  estudante: path.join(process.cwd(), 'data', 'resultado_linha_estudantes.json')
};

// Cache dos arquivos para melhor performance
let cacheArquivos = {
  pesquisador: null,
  estudante: null,
  ultimaAtualizacao: null
};

async function carregarArquivoBruto(tipo) {
  try {
    const filePath = ARQUIVOS_BRUTOS[tipo];
    if (!filePath) {
      console.warn(`Tipo de arquivo não encontrado: ${tipo}`);
      return [];
    }
    
    // Verificar se o cache é recente (últimos 5 minutos)
    const agora = new Date();
    if (cacheArquivos[tipo] && cacheArquivos.ultimaAtualizacao && 
        (agora - cacheArquivos.ultimaAtualizacao) < 300000) {
      return cacheArquivos[tipo];
    }
    
    const dados = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(dados);
    const arrayDados = Array.isArray(json) ? json : [json];
    
    // Cache os dados
    cacheArquivos[tipo] = arrayDados;
    cacheArquivos.ultimaAtualizacao = agora;
    
    console.log(`✅ Arquivo bruto ${tipo} carregado: ${arrayDados.length} registros`);
    return arrayDados;
    
  } catch (error) {
    console.error(`❌ Erro ao carregar arquivo bruto (${tipo}):`, error.message);
    
    // Se houver cache antigo, usa ele
    if (cacheArquivos[tipo]) {
      console.log(`⚠️ Usando cache antigo para ${tipo}`);
      return cacheArquivos[tipo];
    }
    
    return [];
  }
}

export async function buscarDadosCompletosPorNome(nome, tipo = 'pesquisador') {
  if (!nome || !nome.trim()) {
    console.warn('⚠️ Nome vazio ou inválido para busca');
    return null;
  }
  
  const dados = await carregarArquivoBruto(tipo);
  const nomeBuscado = normalizarNome(nome);
  
  // Busca exata
  const resultadoExato = dados.find(item => {
    const nomeItem = normalizarNome(item.nome);
    return nomeItem === nomeBuscado;
  });
  
  if (resultadoExato) {
    console.log(`✅ Encontrado no arquivo bruto: ${nome} (${tipo})`);
    return resultadoExato;
  }
  
  // Busca parcial (para nomes com variações)
  const resultadoParcial = dados.find(item => {
    const nomeItem = normalizarNome(item.nome);
    return nomeItem.includes(nomeBuscado) || nomeBuscado.includes(nomeItem);
  });
  
  if (resultadoParcial) {
    console.log(`🔍 Encontrado parcialmente: ${nome} -> ${resultadoParcial.nome}`);
    return resultadoParcial;
  }
  
  console.warn(`⚠️ Não encontrado no arquivo bruto: ${nome} (${tipo})`);
  return null;
}

export async function obterLinhasDePessoa(nome, tipo = 'pesquisador') {
  const dadosCompletos = await buscarDadosCompletosPorNome(nome, tipo);
  
  if (!dadosCompletos) {
    return [];
  }
  
  // Extrai e formata as linhas
  const linhas = dadosCompletos.linhas_pesquisa || [];
  
  return linhas.map(linha => ({
    linha_pesquisa: linha.linha_pesquisa?.trim() || linha.nome?.trim() || '',
    grupo: linha.grupo?.trim() || 'Grupo Interdisciplinar em Ensino, Pesquisa e Inovação- GIEPI'
  })).filter(linha => linha.linha_pesquisa);
}

export function limparCache() {
  cacheArquivos = {
    pesquisador: null,
    estudante: null,
    ultimaAtualizacao: null
  };
  console.log('🧹 Cache de arquivos brutos limpo');
}