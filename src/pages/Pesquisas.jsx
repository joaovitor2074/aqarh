import styles from '../styles/pesquisa.module.css';

export default function Pesquisas() {
    return (
        <div className={styles.page}>
            
            {/* HERO IGUAL AO DOS PROJETOS */}
            <header className={styles.hero}>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Pesquisas do Centro GIEPI – IFMA</h1>
                    <p className={styles.heroSubtitle}>
                        Nesta seção você encontrará os projetos de pesquisa desenvolvidos pelo grupo,
                        abordando temas em alimentos, química, agronomia e recursos hídricos.
                    </p>
                </div>
            </header>

            {/* Conteúdo da página */}
            <section className={styles.grid}>

                {/* Card 1 */}
                <div className={styles.card}>
                    <h2 className="text-xl font-semibold text-[#006A4E]">
                        Análise de Qualidade da Água em Comunidades Rurais
                    </h2>
                    <p className="text-gray-700 mt-3">
                        Estudo voltado para avaliar a potabilidade e presença de contaminantes em fontes hídricas da região.
                    </p>
                    <button className={styles.button}>
                        Ver mais
                    </button>
                </div>

                {/* Card 2 */}
                <div className={styles.card}>
                    <h2 className="text-xl font-semibold text-[#006A4E]">
                        Avaliação de Produtos Alimentícios Regionais
                    </h2>
                    <p className="text-gray-700 mt-3">
                        Projetos focados em segurança alimentar, qualidade nutricional e desenvolvimento de produtos.
                    </p>
                    <button className={styles.button}>
                        Ver mais
                    </button>
                </div>

                {/* Card 3 */}
                <div className={styles.card}>
                    <h2 className="text-xl font-semibold text-[#006A4E]">
                        Pesquisa em Química Aplicada
                    </h2>
                    <p className="text-gray-700 mt-3">
                        Trabalhos sobre reações químicas, análises laboratoriais e práticas industriais.
                    </p>
                    <button className={styles.button}>
                        Ver mais
                    </button>
                </div>

            </section>
        </div>
    );
}
