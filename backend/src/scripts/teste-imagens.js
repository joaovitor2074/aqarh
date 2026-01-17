// Execute este script no navegador console para testar

async function testarImagens() {
    console.log('🧪 Testando sistema de imagens...');
    
    // 1. Testar acesso às imagens defaults
    const defaults = [
        'http://localhost:3000/img/defaults/comunicado-estudante.png',
        'http://localhost:3000/img/defaults/comunicado-pesquisador.png',
        'http://localhost:3000/img/defaults/comunicado-linha.png'
    ];
    
    for (const url of defaults) {
        const img = new Image();
        await new Promise((resolve) => {
            img.onload = () => {
                console.log(`✅ ${url} - OK`);
                resolve();
            };
            img.onerror = () => {
                console.log(`❌ ${url} - FALHOU`);
                resolve();
            };
            img.src = url;
        });
    }
    
    // 2. Testar API de comunicados
    try {
        const response = await fetch('http://localhost:3000/api/comunicados?status=ativo');
        const data = await response.json();
        console.log('📊 Comunicados ativos:', data.comunicados?.length || 0);
        
        // Verificar imagens dos comunicados
        data.comunicados?.forEach((com, i) => {
            console.log(`\n📋 Comunicado ${i + 1}:`, {
                id: com.id,
                titulo: com.titulo,
                tipo: com.tipo,
                imagem: com.imagem,
                temImagem: !!com.imagem
            });
            
            if (com.imagem) {
                const img = new Image();
                img.onload = () => console.log(`   ✅ Imagem acessível: ${com.imagem}`);
                img.onerror = () => console.log(`   ❌ Imagem inacessível: ${com.imagem}`);
                img.src = com.imagem;
            }
        });
    } catch (error) {
        console.error('❌ Erro na API:', error);
    }
    
    // 3. Limpar localStorage para forçar mostrar modal
    localStorage.removeItem('comunicados_ultimo_visto');
    console.log('🧹 localStorage limpo - modal deve aparecer na próxima visita');
}

// Execute a função
testarImagens();