import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaBuilding,
  FaCalendarAlt,
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaImage,
  FaPlus,
  FaSpinner,
  FaSync,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import AdminLayout from "../../layout/AdminLayout";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Modal from "../../ui/Modal";
import { projetosService } from "../../services/projetos.service";
import { api } from "../../utils/api";
import styles from "../../styles/adminPages/projetos.module.css";

const STATUS_OPTIONS = ["Planejado", "Em andamento", "Finalizado"];

const emptyForm = {
  titulo: "",
  descricao: "",
  status: "Planejado",
  ano: new Date().getFullYear(),
  area: "",
  linha_pesquisa_id: "",
  coordenador_id: "",
  parceiros_texto: "",
  estudante_ids: [],
  orcamento: "",
  mostrar_orcamento_publico: false,
  imagem: null,
  link_externo: "",
  resultados: "",
  ativo: true,
};

function truncate(text, max = 120) {
  if (!text) return "Sem descricao cadastrada";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function parceirosToText(parceiros = []) {
  return parceiros.map((parceiro) => parceiro.nome).filter(Boolean).join(", ");
}

function parseParceirosText(value) {
  return String(value || "")
    .split(",")
    .map((nome) => nome.trim())
    .filter(Boolean)
    .map((nome) => ({ nome }));
}

function statusClass(status) {
  if (status === "Finalizado") return styles.badgeFinalizado;
  if (status === "Planejado") return styles.badgePlanejado;
  return styles.badgeActive;
}

export default function Admprojetos() {
  const [projetos, setProjetos] = useState([]);
  const [membros, setMembros] = useState([]);
  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroVisibilidade, setFiltroVisibilidade] = useState("todos");

  const pesquisadores = useMemo(
    () =>
      membros.filter(
        (membro) => membro.ativo && (membro.tipo_vinculo || "pesquisador") === "pesquisador"
      ),
    [membros]
  );

  const estudantes = useMemo(
    () => membros.filter((membro) => membro.ativo && membro.tipo_vinculo === "estudante"),
    [membros]
  );

  const totais = useMemo(
    () => ({
      total: projetos.length,
      publicados: projetos.filter((projeto) => projeto.ativo).length,
      andamento: projetos.filter((projeto) => projeto.status === "Em andamento").length,
      finalizados: projetos.filter((projeto) => projeto.status === "Finalizado").length,
    }),
    [projetos]
  );

  const projetosFiltrados = useMemo(() => {
    const busca = filtroBusca.trim().toLowerCase();

    return projetos.filter((projeto) => {
      const texto = [
        projeto.titulo,
        projeto.descricao,
        projeto.area,
        projeto.linha_nome,
        projeto.coordenador_nome,
        parceirosToText(projeto.parceiros),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const buscaOk = !busca || texto.includes(busca);
      const statusOk = filtroStatus === "todos" || projeto.status === filtroStatus;
      const visibilidadeOk =
        filtroVisibilidade === "todos" ||
        (filtroVisibilidade === "publicados" && projeto.ativo) ||
        (filtroVisibilidade === "ocultos" && !projeto.ativo);

      return buscaOk && statusOk && visibilidadeOk;
    });
  }, [filtroBusca, filtroStatus, filtroVisibilidade, projetos]);

  const carregarDados = useCallback(async (showToast = false) => {
    try {
      showToast ? setRefreshing(true) : setLoading(true);

      const [projetosRes, membrosRes, linhasRes] = await Promise.allSettled([
        projetosService.buscarAdmin(),
        api.get("/membros"),
        api.get("/linhas-pesquisa"),
      ]);

      if (projetosRes.status === "fulfilled") {
        setProjetos(projetosRes.value?.projetos || []);
      } else {
        throw projetosRes.reason;
      }

      if (membrosRes.status === "fulfilled") {
        setMembros(Array.isArray(membrosRes.value) ? membrosRes.value : []);
      }

      if (linhasRes.status === "fulfilled") {
        setLinhas(Array.isArray(linhasRes.value) ? linhasRes.value : []);
      }

      if (showToast) toast.success("Projetos atualizados.");
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
      toast.error(error.message || "Erro ao carregar projetos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function abrirNovoProjeto() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function abrirEdicao(projeto) {
    setEditing(projeto);
    setForm({
      titulo: projeto.titulo || "",
      descricao: projeto.descricao || "",
      status: projeto.status || "Planejado",
      ano: projeto.ano || new Date().getFullYear(),
      area: projeto.area || "",
      linha_pesquisa_id: projeto.linha_pesquisa_id || "",
      coordenador_id: projeto.coordenador_id || "",
      parceiros_texto: parceirosToText(projeto.parceiros),
      estudante_ids: (projeto.estudantes || []).map((estudante) => String(estudante.id)),
      orcamento: projeto.orcamento || "",
      mostrar_orcamento_publico: Boolean(projeto.mostrar_orcamento_publico),
      imagem: null,
      link_externo: projeto.link_externo || "",
      resultados: projeto.resultados || "",
      ativo: Boolean(projeto.ativo),
    });
    setModalOpen(true);
  }

  function fecharModal(force = false) {
    if (saving && !force) return;
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value, type, checked, files } = event.target;

    if (name === "imagem") {
      setForm((prev) => ({ ...prev, imagem: files?.[0] || null }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleEstudantesChange(event) {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    setForm((prev) => ({ ...prev, estudante_ids: selected }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.titulo.trim()) {
      toast.error("Informe o titulo do projeto.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        parceiros: parseParceirosText(form.parceiros_texto),
      };

      if (editing) {
        await projetosService.atualizar(editing.id, payload);
        toast.success("Projeto atualizado com sucesso.");
      } else {
        await projetosService.criar(payload);
        toast.success("Projeto criado com sucesso.");
      }

      fecharModal(true);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      toast.error(error.message || "Erro ao salvar projeto.");
    } finally {
      setSaving(false);
    }
  }

  async function alternarVisibilidade(projeto) {
    try {
      await projetosService.alterarVisibilidade(projeto.id, !projeto.ativo);
      toast.success(projeto.ativo ? "Projeto ocultado do site." : "Projeto publicado no site.");
      await carregarDados();
    } catch (error) {
      toast.error(error.message || "Erro ao alterar visibilidade.");
    }
  }

  async function deletarProjeto(projeto) {
    if (!confirm(`Deseja excluir o projeto "${projeto.titulo}"?`)) return;

    try {
      await projetosService.deletar(projeto.id);
      toast.success("Projeto excluido com sucesso.");
      await carregarDados();
    } catch (error) {
      toast.error(error.message || "Erro ao excluir projeto.");
    }
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Projetos</h1>
            <p className={styles.subtitle}>
              Cadastre projetos reais e controle o que aparece na pagina publica.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button variant="outline" onClick={() => carregarDados(true)} disabled={refreshing}>
              <FaSync className={refreshing ? styles.spinnerButton : ""} />
              {refreshing ? "Atualizando..." : "Atualizar"}
            </Button>
            <Button onClick={abrirNovoProjeto}>
              <FaPlus /> Novo Projeto
            </Button>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statIcon}>
              <FaBuilding />
            </span>
            <div>
              <strong>{totais.total}</strong>
              <span>Projetos cadastrados</span>
            </div>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statIcon}>
              <FaEye />
            </span>
            <div>
              <strong>{totais.publicados}</strong>
              <span>Publicados no site</span>
            </div>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statIcon}>
              <FaCalendarAlt />
            </span>
            <div>
              <strong>{totais.andamento}</strong>
              <span>Em andamento</span>
            </div>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statIcon}>
              <FaCheckCircle />
            </span>
            <div>
              <strong>{totais.finalizados}</strong>
              <span>Finalizados</span>
            </div>
          </div>
        </div>

        <Card className={styles.filtersCard}>
          <div className={styles.filtersHeader}>
            <FaFilter />
            <h3>Filtros</h3>
          </div>

          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label>Busca</label>
              <input
                className={styles.searchInput}
                value={filtroBusca}
                onChange={(event) => setFiltroBusca(event.target.value)}
                placeholder="Buscar por titulo, area, linha, coordenador ou parceiro"
              />
            </div>

            <div className={styles.filterGroup}>
              <label>Status</label>
              <select
                className={styles.select}
                value={filtroStatus}
                onChange={(event) => setFiltroStatus(event.target.value)}
              >
                <option value="todos">Todos</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Visibilidade</label>
              <select
                className={styles.select}
                value={filtroVisibilidade}
                onChange={(event) => setFiltroVisibilidade(event.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="publicados">Publicados</option>
                <option value="ocultos">Ocultos</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          {loading ? (
            <div className={styles.loading}>
              <FaSpinner className={styles.spinner} />
              <p>Carregando projetos...</p>
            </div>
          ) : projetosFiltrados.length === 0 ? (
            <div className={styles.emptyState}>
              <FaBuilding size={42} />
              <p>Nenhum projeto encontrado.</p>
              <Button onClick={abrirNovoProjeto}>
                <FaPlus /> Criar primeiro projeto
              </Button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Projeto</th>
                    <th>Status</th>
                    <th>Ano</th>
                    <th>Linha/Area</th>
                    <th>Coordenador</th>
                    <th>Participantes</th>
                    <th>Site</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {projetosFiltrados.map((projeto) => (
                    <tr key={projeto.id}>
                      <td>
                        <div className={styles.projectCell}>
                          {projeto.imagem_url ? (
                            <img
                              className={styles.thumb}
                              src={projeto.imagem_url}
                              alt=""
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className={styles.thumbFallback}>
                              <FaImage />
                            </span>
                          )}
                          <div>
                            <strong className={styles.projectTitle}>{projeto.titulo}</strong>
                            <span className={styles.projectDescription}>
                              {truncate(projeto.descricao)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${statusClass(projeto.status)}`}>
                          {projeto.status}
                        </span>
                      </td>
                      <td>{projeto.ano || "Nao informado"}</td>
                      <td>
                        <div className={styles.metaLine}>
                          <FaBuilding />
                          <span>{projeto.linha_nome || projeto.area || "Nao informado"}</span>
                        </div>
                      </td>
                      <td>{projeto.coordenador_nome || "Nao informado"}</td>
                      <td>
                        <div className={styles.metaLine}>
                          <FaUsers />
                          <span>
                            {projeto.total_estudantes} estudante(s)
                            {projeto.total_parceiros ? `, ${projeto.total_parceiros} parceiro(s)` : ""}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            projeto.ativo ? styles.badgeActive : styles.badgeHidden
                          }`}
                        >
                          {projeto.ativo ? "Publicado" : "Oculto"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Button
                            size="sm"
                            variant="outline"
                            title="Editar"
                            onClick={() => abrirEdicao(projeto)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant={projeto.ativo ? "warning" : "success"}
                            title={projeto.ativo ? "Ocultar do site" : "Publicar no site"}
                            onClick={() => alternarVisibilidade(projeto)}
                          >
                            {projeto.ativo ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            title="Excluir"
                            onClick={() => deletarProjeto(projeto)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Modal
          isOpen={modalOpen}
          onClose={fecharModal}
          title={editing ? "Editar Projeto" : "Novo Projeto"}
          size="lg"
        >
          <form className={styles.modalForm} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Titulo *</label>
                <Input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  placeholder="Ex: Sistema de monitoramento agricola"
                  disabled={saving}
                  required
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Descricao</label>
                <textarea
                  className={styles.textarea}
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  placeholder="Resumo do projeto para exibicao publica"
                  disabled={saving}
                />
              </div>

              <div className={styles.field}>
                <label>Status</label>
                <select
                  className={styles.select}
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Ano</label>
                <Input
                  type="number"
                  name="ano"
                  value={form.ano}
                  onChange={handleChange}
                  min="1900"
                  max="2100"
                  disabled={saving}
                />
              </div>

              <div className={styles.field}>
                <label>Area</label>
                <Input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="Tecnologia, Educacao, Pesquisa..."
                  disabled={saving}
                />
              </div>

              <div className={styles.field}>
                <label>Linha de pesquisa</label>
                <select
                  className={styles.select}
                  name="linha_pesquisa_id"
                  value={form.linha_pesquisa_id}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">Sem linha vinculada</option>
                  {linhas.map((linha) => (
                    <option key={linha.id} value={linha.id}>
                      {linha.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Coordenador</label>
                <select
                  className={styles.select}
                  name="coordenador_id"
                  value={form.coordenador_id}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">Sem coordenador definido</option>
                  {pesquisadores.map((pesquisador) => (
                    <option key={pesquisador.id} value={pesquisador.id}>
                      {pesquisador.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Orcamento</label>
                <Input
                  name="orcamento"
                  value={form.orcamento}
                  onChange={handleChange}
                  placeholder="Ex: R$ 5.000,00"
                  disabled={saving}
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Estudantes participantes</label>
                <select
                  multiple
                  className={styles.multiSelect}
                  value={form.estudante_ids}
                  onChange={handleEstudantesChange}
                  disabled={saving}
                >
                  {estudantes.map((estudante) => (
                    <option key={estudante.id} value={estudante.id}>
                      {estudante.nome}
                    </option>
                  ))}
                </select>
                <small className={styles.helpText}>
                  Segure Ctrl para selecionar mais de um estudante.
                </small>
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Parceiros</label>
                <Input
                  name="parceiros_texto"
                  value={form.parceiros_texto}
                  onChange={handleChange}
                  placeholder="IFMA, Prefeitura, Empresa X"
                  disabled={saving}
                />
                <small className={styles.helpText}>Separe os parceiros por virgula.</small>
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Imagem/Banner</label>
                <Input
                  type="file"
                  name="imagem"
                  accept="image/*"
                  onChange={handleChange}
                  disabled={saving}
                />
                {editing?.imagem_url && !form.imagem && (
                  <div className={styles.imagePreview}>
                    <img src={editing.imagem_url} alt="" />
                    <span>Imagem atual do projeto.</span>
                  </div>
                )}
                {form.imagem && (
                  <small className={styles.helpText}>Arquivo selecionado: {form.imagem.name}</small>
                )}
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Link externo</label>
                <Input
                  name="link_externo"
                  value={form.link_externo}
                  onChange={handleChange}
                  placeholder="GitHub, artigo, site do projeto..."
                  disabled={saving}
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Resultados</label>
                <textarea
                  className={styles.textarea}
                  name="resultados"
                  value={form.resultados}
                  onChange={handleChange}
                  placeholder="Resultados, entregas ou produtos do projeto"
                  disabled={saving}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="mostrar_orcamento_publico"
                    checked={form.mostrar_orcamento_publico}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  Mostrar orcamento no site
                </label>
              </div>

              <div className={styles.field}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="ativo"
                    checked={form.ativo}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  Publicar no site
                </label>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button variant="outline" onClick={fecharModal} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || !form.titulo.trim()}>
                {saving ? (
                  <>
                    <FaSpinner className={styles.spinnerButton} />
                    Salvando...
                  </>
                ) : editing ? (
                  <>
                    <FaCheckCircle /> Atualizar
                  </>
                ) : (
                  <>
                    <FaPlus /> Criar Projeto
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
