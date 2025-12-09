import styles from '../styles/equipe.module.css'

export default function Equipe(){
    return (
        <div className="section-team">
            <div className="team-text">
                <h2 className="section-title">Equipe</h2>
                <p className="section-text">
                    Nossa equipe é composta por pesquisadores dedicados, incluindo professores e alunos do IFMA – Campus Codó,
                    que trabalham juntos para alcançar avanços significativos nas áreas de Alimentos, Química, Agronomia e Recursos Hídricos.
                </p>
                <button className="btn section-btn">Conheça a Equipe</button>
            </div>
        </div>
    );
}