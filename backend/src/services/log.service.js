// services/log.service.js
class Logger {
  constructor() {
    this.logs = [];
    this.nivel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
  }

  debug(mensagem, dados = null) {
    if (this.nivel === 'debug') {
      console.log(`🔍 ${mensagem}`, dados ? dados : '');
      this.logs.push({ tipo: 'debug', mensagem, dados, timestamp: new Date() });
    }
  }

  info(mensagem, dados = null) {
    console.log(`ℹ️ ${mensagem}`, dados ? dados : '');
    this.logs.push({ tipo: 'info', mensagem, dados, timestamp: new Date() });
  }

  warn(mensagem, dados = null) {
    console.warn(`⚠️ ${mensagem}`, dados ? dados : '');
    this.logs.push({ tipo: 'warn', mensagem, dados, timestamp: new Date() });
  }

  error(mensagem, erro = null) {
    console.error(`❌ ${mensagem}`, erro ? erro : '');
    this.logs.push({ tipo: 'error', mensagem, erro, timestamp: new Date() });
  }

  success(mensagem, dados = null) {
    console.log(`✅ ${mensagem}`, dados ? dados : '');
    this.logs.push({ tipo: 'success', mensagem, dados, timestamp: new Date() });
  }

  getLogs(limite = 100) {
    return this.logs.slice(-limite);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();