import { useState, useEffect } from 'react';
import AdminLayout from "../../layout/AdminLayout";
import '../../styles/adminPages/Config.css';

export default function Config() {
    // Estados para diferentes seções de configurações
    const [configuracoesGerais, setConfiguracoesGerais] = useState({
        nomeSistema: 'Sistema Administrativo',
        descricao: 'Plataforma de gerenciamento',
        modoManutencao: false,
        idioma: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        limiteSessoes: 5,
    });

    const [funcionalidades, setFuncionalidades] = useState({
        moduloUsuarios: true,
        moduloRelatorios: true,
        moduloExportacao: true,
        auditoriaAtiva: true,
        backupAutomatico: false,
        apiPublica: false,
        modoDebug: false,
    });

    const [scrapingConfig, setScrapingConfig] = useState({
        status: 'parado', // parado, rodando, pausado
        frequencia: 'diario',
        limiteRequisicoes: 100,
        timeout: 30,
        notificarErros: true,
        agendamento: {
            hora: '02:00',
            dias: ['segunda', 'quarta', 'sexta']
        },
        ultimaExecucao: null,
        proximaExecucao: null,
    });

    const [notificacoes, setNotificacoes] = useState({
        emailAtivo: true,
        pushAtivo: false,
        webhookAtivo: false,
        notificarNovosUsuarios: true,
        notificarErrosSistema: true,
        notificarAlteracoesCriticas: true,
        notificarBackup: true,
        aprovarConteudoManual: true,
        delayPublicacao: 24,
    });

    const [usuariosAdmin, setUsuariosAdmin] = useState([
        { id: 1, nome: 'Admin Principal', email: 'admin@dominio.com', nivel: 'superadmin', status: 'ativo', ultimoAcesso: '2024-01-18 10:30' },
        { id: 2, nome: 'Moderador', email: 'mod@dominio.com', nivel: 'moderador', status: 'ativo', ultimoAcesso: '2024-01-17 15:45' },
    ]);

    const [seguranca, setSeguranca] = useState({
        autenticacaoDoisFatores: true,
        tempoExpiracaoSessao: 8,
        limiteTentativasLogin: 5,
        ipWhitelist: [],
        bloqueioAutomatico: true,
        criptografiaSSL: true,
        logsDetalhados: true,
    });

    const [logsConfig, setLogsConfig] = useState({
        retencaoDias: 90,
        nivelLog: 'info',
        alertasPerformance: true,
        monitoramentoTempoReal: false,
        metricasAtivas: true,
    });

    // Estados para UI
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
    const [abasAtivas, setAbasAtivas] = useState({
        geral: true,
        funcionalidades: false,
        scraping: false,
        notificacoes: false,
        usuarios: false,
        seguranca: false,
        logs: false,
    });

    // Simulação de dados de logs
    const [logsSistema, setLogsSistema] = useState([
        { id: 1, data: '2024-01-18 10:30:00', usuario: 'admin@dominio.com', acao: 'Login realizado', nivel: 'info' },
        { id: 2, data: '2024-01-18 09:15:00', usuario: 'sistema', acao: 'Backup automático executado', nivel: 'info' },
        { id: 3, data: '2024-01-17 22:00:00', usuario: 'scraping', acao: 'Rotina de coleta concluída', nivel: 'sucesso' },
        { id: 4, data: '2024-01-17 18:30:00', usuario: 'mod@dominio.com', acao: 'Conteúdo aprovado manualmente', nivel: 'aviso' },
    ]);

    // Simulação de dados de scraping
    const [estatisticasScraping, setEstatisticasScraping] = useState({
        totalExecucoes: 156,
        sucesso: 142,
        falhas: 14,
        ultimaColeta: '500 registros',
        tempoMedio: '2min 30s',
    });

    // Handlers
    const handleSalvarConfiguracoes = (secao) => {
        setLoading(true);
        setMensagem({ tipo: 'info', texto: `Salvando configurações de ${secao}...` });
        
        // Simulação de requisição
        setTimeout(() => {
            setMensagem({ tipo: 'sucesso', texto: `Configurações de ${secao} salvas com sucesso!` });
            setLoading(false);
        }, 1000);
    };

    const handleScrapingAction = (acao) => {
        setMensagem({ tipo: 'info', texto: `Executando ação: ${acao}` });
        
        const novosStatus = {
            iniciar: 'rodando',
            pausar: 'pausado',
            parar: 'parado',
        };
        
        setScrapingConfig(prev => ({
            ...prev,
            status: novosStatus[acao],
            ultimaExecucao: new Date().toISOString(),
        }));
    };

    const handleToggleModoManutencao = () => {
        const novoEstado = !configuracoesGerais.modoManutencao;
        setConfiguracoesGerais(prev => ({ ...prev, modoManutencao: novoEstado }));
        setMensagem({ 
            tipo: novoEstado ? 'aviso' : 'sucesso', 
            texto: `Modo manutenção ${novoEstado ? 'ativado' : 'desativado'}` 
        });
    };

    const handleAdicionarAdmin = () => {
        const novoUsuario = {
            id: usuariosAdmin.length + 1,
            nome: `Novo Admin ${usuariosAdmin.length + 1}`,
            email: `admin${usuariosAdmin.length + 1}@dominio.com`,
            nivel: 'moderador',
            status: 'pendente',
            ultimoAcesso: null,
        };
        
        setUsuariosAdmin([...usuariosAdmin, novoUsuario]);
        setMensagem({ tipo: 'sucesso', texto: 'Novo administrador adicionado' });
    };

    // Componentes de UI
    const CardConfig = ({ titulo, children, acaoSalvar }) => (
        <div className="config-card">
            <div className="config-card-header">
                <h3>{titulo}</h3>
                {acaoSalvar && (
                    <button 
                        className="btn-salvar"
                        onClick={() => handleSalvarConfiguracoes(titulo.toLowerCase())}
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                )}
            </div>
            <div className="config-card-content">
                {children}
            </div>
        </div>
    );

    const SwitchToggle = ({ label, checked, onChange, descricao }) => (
        <div className="switch-container">
            <div className="switch-label">
                <span className="switch-title">{label}</span>
                {descricao && <span className="switch-desc">{descricao}</span>}
            </div>
            <label className="switch">
                <input type="checkbox" checked={checked} onChange={onChange} />
                <span className="slider"></span>
            </label>
        </div>
    );

    const StatusBadge = ({ status }) => {
        const cores = {
            rodando: 'success',
            parado: 'error',
            pausado: 'warning',
            ativo: 'success',
            inativo: 'error',
            pendente: 'warning',
        };
        
        const textos = {
            rodando: 'Em execução',
            parado: 'Parado',
            pausado: 'Pausado',
            ativo: 'Ativo',
            inativo: 'Inativo',
            pendente: 'Pendente',
        };
        
        return (
            <span className={`status-badge ${cores[status]}`}>
                {textos[status] || status}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="config-page">
                <div className="config-header">
                    <h1>⚙️ Configurações do Sistema</h1>
                    <p className="config-subtitle">
                        Central de controle e gerenciamento da plataforma
                    </p>
                </div>

                {mensagem.texto && (
                    <div className={`mensagem-alerta ${mensagem.tipo}`}>
                        {mensagem.texto}
                    </div>
                )}

                {/* Navegação por abas */}
                <div className="config-tabs">
                    {Object.keys(abasAtivas).map((aba) => (
                        <button
                            key={aba}
                            className={`config-tab ${abasAtivas[aba] ? 'active' : ''}`}
                            onClick={() => setAbasAtivas({ ...abasAtivas, [aba]: true })}
                        >
                            {aba.charAt(0).toUpperCase() + aba.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="config-content">
                    {/* Seção: Configurações Gerais */}
                    {abasAtivas.geral && (
                        <div className="config-section">
                            <CardConfig titulo="Configurações Gerais" acaoSalvar>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nome do Sistema</label>
                                        <input 
                                            type="text" 
                                            value={configuracoesGerais.nomeSistema}
                                            onChange={(e) => setConfiguracoesGerais({...configuracoesGerais, nomeSistema: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Descrição</label>
                                        <textarea 
                                            value={configuracoesGerais.descricao}
                                            onChange={(e) => setConfiguracoesGerais({...configuracoesGerais, descricao: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <SwitchToggle 
                                            label="Modo Manutenção"
                                            checked={configuracoesGerais.modoManutencao}
                                            onChange={handleToggleModoManutencao}
                                            descricao="Bloqueia o acesso de usuários comuns ao sistema"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Idioma Padrão</label>
                                        <select 
                                            value={configuracoesGerais.idioma}
                                            onChange={(e) => setConfiguracoesGerais({...configuracoesGerais, idioma: e.target.value})}
                                        >
                                            <option value="pt-BR">Português (BR)</option>
                                            <option value="en-US">Inglês (US)</option>
                                            <option value="es-ES">Espanhol</option>
                                        </select>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Fuso Horário</label>
                                        <select 
                                            value={configuracoesGerais.timezone}
                                            onChange={(e) => setConfiguracoesGerais({...configuracoesGerais, timezone: e.target.value})}
                                        >
                                            <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                                            <option value="America/New_York">Nova York (GMT-5)</option>
                                            <option value="Europe/Lisbon">Lisboa (GMT+0)</option>
                                        </select>
                                    </div>
                                </div>
                            </CardConfig>
                        </div>
                    )}

                    {/* Seção: Controle de Funcionalidades */}
                    {abasAtivas.funcionalidades && (
                        <div className="config-section">
                            <CardConfig titulo="Controle de Funcionalidades" acaoSalvar>
                                <div className="switches-grid">
                                    <SwitchToggle 
                                        label="Módulo de Usuários"
                                        checked={funcionalidades.moduloUsuarios}
                                        onChange={(e) => setFuncionalidades({...funcionalidades, moduloUsuarios: e.target.checked})}
                                        descricao="Controle completo de usuários e permissões"
                                    />
                                    
                                    <SwitchToggle 
                                        label="Módulo de Relatórios"
                                        checked={funcionalidades.moduloRelatorios}
                                        onChange={(e) => setFuncionalidades({...funcionalidades, moduloRelatorios: e.target.checked})}
                                        descricao="Geração e visualização de relatórios analíticos"
                                    />
                                    
                                    <SwitchToggle 
                                        label="Backup Automático"
                                        checked={funcionalidades.backupAutomatico}
                                        onChange={(e) => setFuncionalidades({...funcionalidades, backupAutomatico: e.target.checked})}
                                        descricao="Realiza backup diário automático"
                                    />
                                    
                                    <SwitchToggle 
                                        label="Auditoria Ativa"
                                        checked={funcionalidades.auditoriaAtiva}
                                        onChange={(e) => setFuncionalidades({...funcionalidades, auditoriaAtiva: e.target.checked})}
                                        descricao="Registra todas as ações no sistema"
                                    />
                                    
                                    <SwitchToggle 
                                        label="API Pública"
                                        checked={funcionalidades.apiPublica}
                                        onChange={(e) => setFuncionalidades({...funcionalidades, apiPublica: e.target.checked})}
                                        descricao="Disponibiliza API para integração externa"
                                    />
                                    
                                    <SwitchToggle 
                                        label="Modo Debug"
                                        checked={funcionalidades.modoDebug}
                                        onChange={(e) => setFuncionalidades({...funcionalidades, modoDebug: e.target.checked})}
                                        descricao="Ativa logs detalhados para desenvolvimento"
                                    />
                                </div>
                            </CardConfig>
                        </div>
                    )}

                    {/* Seção: Controle de Scraping */}
                    {abasAtivas.scraping && (
                        <div className="config-section">
                            <CardConfig titulo="Controle de Scraping" acaoSalvar>
                                <div className="scraping-dashboard">
                                    <div className="scraping-status">
                                        <h4>Status do Sistema</h4>
                                        <div className="status-display">
                                            <StatusBadge status={scrapingConfig.status} />
                                            <div className="status-actions">
                                                <button 
                                                    className="btn-action start"
                                                    onClick={() => handleScrapingAction('iniciar')}
                                                    disabled={scrapingConfig.status === 'rodando'}
                                                >
                                                    ▶ Iniciar
                                                </button>
                                                <button 
                                                    className="btn-action pause"
                                                    onClick={() => handleScrapingAction('pausar')}
                                                    disabled={scrapingConfig.status !== 'rodando'}
                                                >
                                                    ⏸️ Pausar
                                                </button>
                                                <button 
                                                    className="btn-action stop"
                                                    onClick={() => handleScrapingAction('parar')}
                                                    disabled={scrapingConfig.status === 'parado'}
                                                >
                                                    ⏹️ Parar
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {scrapingConfig.ultimaExecucao && (
                                            <div className="last-execution">
                                                <strong>Última execução:</strong> 
                                                {new Date(scrapingConfig.ultimaExecucao).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="scraping-stats">
                                        <h4>Estatísticas</h4>
                                        <div className="stats-grid">
                                            <div className="stat-item">
                                                <span className="stat-value">{estatisticasScraping.totalExecucoes}</span>
                                                <span className="stat-label">Total Execuções</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-value success">{estatisticasScraping.sucesso}</span>
                                                <span className="stat-label">Sucessos</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-value error">{estatisticasScraping.falhas}</span>
                                                <span className="stat-label">Falhas</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-value">{estatisticasScraping.tempoMedio}</span>
                                                <span className="stat-label">Tempo Médio</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="scraping-config">
                                        <h4>Configurações de Execução</h4>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Frequência</label>
                                                <select 
                                                    value={scrapingConfig.frequencia}
                                                    onChange={(e) => setScrapingConfig({...scrapingConfig, frequencia: e.target.value})}
                                                >
                                                    <option value="hora">A cada hora</option>
                                                    <option value="diario">Diário</option>
                                                    <option value="semanal">Semanal</option>
                                                </select>
                                            </div>
                                            
                                            <div className="form-group">
                                                <label>Limite de Requisições</label>
                                                <input 
                                                    type="number" 
                                                    value={scrapingConfig.limiteRequisicoes}
                                                    onChange={(e) => setScrapingConfig({...scrapingConfig, limiteRequisicoes: parseInt(e.target.value)})}
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <SwitchToggle 
                                                    label="Notificar Erros"
                                                    checked={scrapingConfig.notificarErros}
                                                    onChange={(e) => setScrapingConfig({...scrapingConfig, notificarErros: e.target.checked})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardConfig>
                        </div>
                    )}

                    {/* Seção: Configurações de Notificações */}
                    {abasAtivas.notificacoes && (
                        <div className="config-section">
                            <CardConfig titulo="Configurações de Notificações" acaoSalvar>
                                <div className="notifications-config">
                                    <h4>Canais de Notificação</h4>
                                    <div className="switches-grid">
                                        <SwitchToggle 
                                            label="Notificações por Email"
                                            checked={notificacoes.emailAtivo}
                                            onChange={(e) => setNotificacoes({...notificacoes, emailAtivo: e.target.checked})}
                                            descricao="Envia notificações por email"
                                        />
                                        
                                        <SwitchToggle 
                                            label="Notificações Push"
                                            checked={notificacoes.pushAtivo}
                                            onChange={(e) => setNotificacoes({...notificacoes, pushAtivo: e.target.checked})}
                                            descricao="Notificações em tempo real no navegador"
                                        />
                                        
                                        <SwitchToggle 
                                            label="Webhooks"
                                            checked={notificacoes.webhookAtivo}
                                            onChange={(e) => setNotificacoes({...notificacoes, webhookAtivo: e.target.checked})}
                                            descricao="Integração com sistemas externos"
                                        />
                                    </div>
                                    
                                    <h4>Tipos de Notificação</h4>
                                    <div className="switches-grid">
                                        <SwitchToggle 
                                            label="Novos Usuários"
                                            checked={notificacoes.notificarNovosUsuarios}
                                            onChange={(e) => setNotificacoes({...notificacoes, notificarNovosUsuarios: e.target.checked})}
                                            descricao="Notificar quando novos usuários se registram"
                                        />
                                        
                                        <SwitchToggle 
                                            label="Erros do Sistema"
                                            checked={notificacoes.notificarErrosSistema}
                                            onChange={(e) => setNotificacoes({...notificacoes, notificarErrosSistema: e.target.checked})}
                                            descricao="Alertas sobre erros críticos"
                                        />
                                        
                                        <SwitchToggle 
                                            label="Aprovação Manual"
                                            checked={notificacoes.aprovarConteudoManual}
                                            onChange={(e) => setNotificacoes({...notificacoes, aprovarConteudoManual: e.target.checked})}
                                            descricao="Exigir aprovação administrativa para conteúdo"
                                        />
                                        
                                        <div className="form-group">
                                            <label>Delay para Publicação (horas)</label>
                                            <input 
                                                type="number" 
                                                value={notificacoes.delayPublicacao}
                                                onChange={(e) => setNotificacoes({...notificacoes, delayPublicacao: parseInt(e.target.value)})}
                                            />
                                            <small>Tempo que o conteúdo fica pendente antes da publicação automática</small>
                                        </div>
                                    </div>
                                </div>
                            </CardConfig>
                        </div>
                    )}

                    {/* Seção: Gerenciamento de Usuários Admin */}
                    {abasAtivas.usuarios && (
                        <div className="config-section">
                            <CardConfig titulo="Administradores do Sistema" acaoSalvar>
                                <div className="admin-management">
                                    <div className="section-header">
                                        <h4>Usuários Administrativos</h4>
                                        <button className="btn-add" onClick={handleAdicionarAdmin}>
                                            + Adicionar Admin
                                        </button>
                                    </div>
                                    
                                    <div className="admin-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Nome</th>
                                                    <th>Email</th>
                                                    <th>Nível de Acesso</th>
                                                    <th>Status</th>
                                                    <th>Último Acesso</th>
                                                    <th>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {usuariosAdmin.map(usuario => (
                                                    <tr key={usuario.id}>
                                                        <td>{usuario.nome}</td>
                                                        <td>{usuario.email}</td>
                                                        <td>
                                                            <select 
                                                                value={usuario.nivel}
                                                                onChange={(e) => {
                                                                    const novosUsuarios = usuariosAdmin.map(u => 
                                                                        u.id === usuario.id ? {...u, nivel: e.target.value} : u
                                                                    );
                                                                    setUsuariosAdmin(novosUsuarios);
                                                                }}
                                                            >
                                                                <option value="superadmin">Super Admin</option>
                                                                <option value="admin">Admin</option>
                                                                <option value="moderador">Moderador</option>
                                                                <option value="visualizador">Visualizador</option>
                                                            </select>
                                                        </td>
                                                        <td><StatusBadge status={usuario.status} /></td>
                                                        <td>{usuario.ultimoAcesso || 'Nunca acessou'}</td>
                                                        <td>
                                                            <button className="btn-action small">Editar</button>
                                                            <button className="btn-action small danger">Remover</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div className="permissions-info">
                                        <h5>Níveis de Permissão:</h5>
                                        <ul>
                                            <li><strong>Super Admin:</strong> Acesso completo a todas as funcionalidades</li>
                                            <li><strong>Admin:</strong> Acesso administrativo, exceto configurações de segurança</li>
                                            <li><strong>Moderador:</strong> Pode gerenciar conteúdo e usuários comuns</li>
                                            <li><strong>Visualizador:</strong> Apenas visualização de relatórios e logs</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardConfig>
                        </div>
                    )}

                    {/* Seção: Segurança */}
                    {abasAtivas.seguranca && (
                        <div className="config-section">
                            <CardConfig titulo="Configurações de Segurança" acaoSalvar>
                                <div className="security-config">
                                    <div className="switches-grid">
                                        <SwitchToggle 
                                            label="Autenticação em Dois Fatores"
                                            checked={seguranca.autenticacaoDoisFatores}
                                            onChange={(e) => setSeguranca({...seguranca, autenticacaoDoisFatores: e.target.checked})}
                                            descricao="Exige 2FA para todos os administradores"
                                        />
                                        
                                        <SwitchToggle 
                                            label="Bloqueio Automático"
                                            checked={seguranca.bloqueioAutomatico}
                                            onChange={(e) => setSeguranca({...seguranca, bloqueioAutomatico: e.target.checked})}
                                            descricao="Bloqueia IP após tentativas falhas"
                                        />
                                        
                                        <SwitchToggle 
                                            label="Criptografia SSL"
                                            checked={seguranca.criptografiaSSL}
                                            onChange={(e) => setSeguranca({...seguranca, criptografiaSSL: e.target.checked})}
                                            descricao="Força conexões seguras"
                                        />
                                        
                                        <SwitchToggle 
                                            label="Logs Detalhados"
                                            checked={seguranca.logsDetalhados}
                                            onChange={(e) => setSeguranca({...seguranca, logsDetalhados: e.target.checked})}
                                            descricao="Registra todas as atividades de segurança"
                                        />
                                    </div>
                                    
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Tempo de Expiração da Sessão (horas)</label>
                                            <input 
                                                type="number" 
                                                value={seguranca.tempoExpiracaoSessao}
                                                onChange={(e) => setSeguranca({...seguranca, tempoExpiracaoSessao: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>Limite de Tentativas de Login</label>
                                            <input 
                                                type="number" 
                                                value={seguranca.limiteTentativasLogin}
                                                onChange={(e) => setSeguranca({...seguranca, limiteTentativasLogin: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>IP Whitelist (um por linha)</label>
                                        <textarea 
                                            placeholder="Exemplo: 192.168.1.1\n10.0.0.0/24"
                                            rows={4}
                                        />
                                        <small>IPs que têm acesso irrestrito ao sistema</small>
                                    </div>
                                </div>
                            </CardConfig>
                        </div>
                    )}

                    {/* Seção: Logs e Monitoramento */}
                    {abasAtivas.logs && (
                        <div className="config-section">
                            <div className="logs-section">
                                <CardConfig titulo="Logs do Sistema" acaoSalvar>
                                    <div className="logs-config">
                                        <div className="form-group">
                                            <label>Retenção de Logs (dias)</label>
                                            <input 
                                                type="number" 
                                                value={logsConfig.retencaoDias}
                                                onChange={(e) => setLogsConfig({...logsConfig, retencaoDias: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>Nível de Log</label>
                                            <select 
                                                value={logsConfig.nivelLog}
                                                onChange={(e) => setLogsConfig({...logsConfig, nivelLog: e.target.value})}
                                            >
                                                <option value="debug">Debug (Mais detalhado)</option>
                                                <option value="info">Info</option>
                                                <option value="warn">Avisos</option>
                                                <option value="error">Erros</option>
                                            </select>
                                        </div>
                                        
                                        <div className="switches-grid">
                                            <SwitchToggle 
                                                label="Alertas de Performance"
                                                checked={logsConfig.alertasPerformance}
                                                onChange={(e) => setLogsConfig({...logsConfig, alertasPerformance: e.target.checked})}
                                            />
                                            
                                            <SwitchToggle 
                                                label="Monitoramento em Tempo Real"
                                                checked={logsConfig.monitoramentoTempoReal}
                                                onChange={(e) => setLogsConfig({...logsConfig, monitoramentoTempoReal: e.target.checked})}
                                            />
                                        </div>
                                    </div>
                                </CardConfig>
                                
                                <CardConfig titulo="Últimas Atividades">
                                    <div className="logs-list">
                                        <div className="logs-filters">
                                            <select>
                                                <option>Todos os Níveis</option>
                                                <option>Info</option>
                                                <option>Aviso</option>
                                                <option>Erro</option>
                                            </select>
                                            <input type="text" placeholder="Buscar..." />
                                        </div>
                                        
                                        <div className="logs-entries">
                                            {logsSistema.map(log => (
                                                <div key={log.id} className={`log-entry ${log.nivel}`}>
                                                    <div className="log-time">{log.data}</div>
                                                    <div className="log-user">{log.usuario}</div>
                                                    <div className="log-action">{log.acao}</div>
                                                    <div className="log-level">
                                                        <StatusBadge status={log.nivel} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="logs-pagination">
                                            <button className="btn-action small">← Anterior</button>
                                            <span>Página 1 de 5</span>
                                            <button className="btn-action small">Próxima →</button>
                                        </div>
                                    </div>
                                </CardConfig>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}