// Funções para Salvar e Carregar o Jogo

// Função auxiliar para inicializar os dados financeiros com as novas regras
function inicializarFinancas() {
    const fin = {
        saldo: 40000000,
        receitas: {
            patrocinio: 0,
            ingressos: 0,
            premios: 0,
            transferencias: 0
        },
        despesas: {
            salarios: 0,
            manutencao: 0,
            transferencias: 0
        }
    };
    return fin;
}

// Limpa todos os dados de jogo individuais do localStorage
function limparTodosDados() {
    console.log("Iniciando limpeza de dados...");
    
    // Lista de chaves específicas que devem ser removidas
    // ADICIONEI MAIS CHAVES PROVÁVEIS AQUI
    const keysToClear = [
        'coachName',
        'selectedTeam',
        'currentDate',
        'currentRound',
        'financas',
        'brasileiraoCalendar',
        'leagueTableData',
        'currentRoundOpponent',
        'currentRoundIsHomeMatch',
        'currentOpponent',
        'currentMatchIsHome',
        'matchResults',
        'lastMatchResult',
        'transferMarket',
        'artilheiros',      // Adicionado
        'artilharia',       // Adicionado
        'gols',             // Adicionado
        'playerGoals',      // Adicionado
        'estatisticas_jogadores' // Adicionado
    ];
    
    // Remove todas as chaves da lista
    keysToClear.forEach(key => localStorage.removeItem(key));
    
    // Itera sobre todas as chaves do localStorage para remover as estatísticas
    // e os elencos de todos os times, que são salvos com prefixos.
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        // Remove qualquer chave que comece com os prefixos.
        if (key.startsWith('playerStats_') || key.startsWith('squad_') || key.startsWith('elenco_') || key.startsWith('customSquad_')) {
            localStorage.removeItem(key);
            console.log(`Chave removida: ${key}`);
        }
    }
    
    console.log("Limpeza de dados concluída.");
}

// Salva o estado atual do jogo em uma lista de saves no localStorage
function salvarJogo() {
    const gameState = {
        coachName: localStorage.getItem('coachName'),
        selectedTeam: localStorage.getItem('selectedTeam'),
        currentDate: localStorage.getItem('currentDate'),
        currentRound: localStorage.getItem('currentRound'),
        financas: JSON.parse(localStorage.getItem('financas')),
        brasileiraoCalendar: JSON.parse(localStorage.getItem('brasileiraoCalendar')),
        leagueTableData: JSON.parse(localStorage.getItem('leagueTableData')),
        // Armazena as estatísticas de jogadores separadamente para cada time
        playerStats: {},
        // === NOVO: Adiciona o elenco personalizado ao gameState para salvar ===
        customSquad: JSON.parse(localStorage.getItem(`customSquad_${localStorage.getItem('selectedTeam')}`))
    };

    if (gameState.coachName && gameState.selectedTeam) {
        // Coleta todos os dados de estatísticas de jogadores
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('playerStats_')) {
                gameState.playerStats[key] = localStorage.getItem(key);
            }
        }
        
        let gameSaves = JSON.parse(localStorage.getItem('gameSaves')) || [];

        // Verifica se já existe um save para este time e treinador e o substitui
        const existingSaveIndex = gameSaves.findIndex(save =>
            save.coachName === gameState.coachName && save.selectedTeam === gameState.selectedTeam
        );

        if (existingSaveIndex !== -1) {
            gameSaves[existingSaveIndex] = gameState;
        } else {
            gameSaves.push(gameState);
        }

        localStorage.setItem('gameSaves', JSON.stringify(gameSaves));
        console.log('Jogo salvo com sucesso.');
    } else {
        console.error('Não foi possível salvar o jogo. Dados do treinador ou time não encontrados.');
    }
}

// Carrega um jogo salvo do localStorage pelo índice
function carregarJogo(index) {
    const gameSaves = JSON.parse(localStorage.getItem('gameSaves'));
    if (gameSaves && gameSaves[index]) {
        const gameState = gameSaves[index];

        // 1. Limpa todos os dados de jogo individuais antes de carregar
        limparTodosDados();

        // 2. Carrega os dados do save selecionado
        localStorage.setItem('coachName', gameState.coachName);
        localStorage.setItem('selectedTeam', gameState.selectedTeam);
        localStorage.setItem('currentDate', gameState.currentDate);
        localStorage.setItem('currentRound', gameState.currentRound);
        localStorage.setItem('financas', JSON.stringify(gameState.financas));
        localStorage.setItem('brasileiraoCalendar', JSON.stringify(gameState.brasileiraoCalendar));
        localStorage.setItem('leagueTableData', JSON.stringify(gameState.leagueTableData));

        // Carrega as estatísticas de jogadores salvas
        if (gameState.playerStats) {
            for (const key in gameState.playerStats) {
                localStorage.setItem(key, gameState.playerStats[key]);
            }
        }
        
        // === NOVO: Carrega o elenco personalizado do save se existir ===
        if (gameState.customSquad) {
            localStorage.setItem(`customSquad_${gameState.selectedTeam}`, JSON.stringify(gameState.customSquad));
        }

        // 3. Redireciona para o jogo
        window.location.href = 'game.html';
        return true;
    }
    return false;
}

// Retorna a lista de jogos salvos
function listarJogosSalvos() {
    return JSON.parse(localStorage.getItem('gameSaves')) || [];
}

// Exclui um jogo salvo pelo índice
function excluirJogoSalvo(index) {
    let gameSaves = JSON.parse(localStorage.getItem('gameSaves'));
    if (gameSaves && gameSaves[index]) {
        gameSaves.splice(index, 1);
        localStorage.setItem('gameSaves', JSON.stringify(gameSaves));
        console.log('Jogo excluído com sucesso.');
        return true;
    }
    return false;
}

// Verifica se existe algum jogo salvo (múltiplos saves)
function verificarMultiplosSaves() {
    const gameSaves = JSON.parse(localStorage.getItem('gameSaves'));
    return gameSaves && gameSaves.length > 0;
}

// Limpa todos os dados de saves
function limparSaves() {
    localStorage.removeItem('gameSaves');
}

// ---

// Função que inicia um novo jogo
// ATENÇÃO: Adicione essa função no local onde o jogador clica em "Novo Jogo"
function iniciarNovoJogo(coachName, selectedTeam) {
    // 1. Limpa todos os dados do jogo anterior.
    // Isso é crucial para que um novo jogo comece do zero.
    limparTodosDados();

    // 2. Coleta os novos dados do jogador.
    localStorage.setItem('coachName', coachName);
    localStorage.setItem('selectedTeam', selectedTeam);

    // 3. Inicializa o jogo com os novos dados.
    localStorage.setItem('currentDate', new Date().toISOString());
    localStorage.setItem('currentRound', '1');
    localStorage.setItem('financas', JSON.stringify(inicializarFinancas()));
    // Outras inicializações necessárias...

    // 4. Redireciona para a página do jogo.
    window.location.href = 'game.html';
}

// ---

// === FUNÇÕES FINANCEIRAS ===

// Adiciona o patrocínio mensal
function adicionarPatrocinioMensal() {
    let financas = JSON.parse(localStorage.getItem('financas'));
    if (!financas) {
        financas = inicializarFinancas();
    }
    const valorPatrocinio = 3000000;

    financas.saldo += valorPatrocinio;
    financas.receitas.patrocinio += valorPatrocinio;

    localStorage.setItem('financas', JSON.stringify(financas));
}

// Adiciona a receita de ingressos, 45 reais por torcedor
function adicionarReceitaIngressos(publicoPresente) {
    let financas = JSON.parse(localStorage.getItem('financas'));
    if (!financas) {
        financas = inicializarFinancas();
    }
    const valorIngresso = 45;
    const receitaJogo = publicoPresente * valorIngresso;

    financas.saldo += receitaJogo;
    financas.receitas.ingressos += receitaJogo;

    localStorage.setItem('financas', JSON.stringify(financas));
}

// Adiciona o prêmio por posição no Brasileirão
function adicionarPremioBrasileirao(posicaoFinal) {
    let financas = JSON.parse(localStorage.getItem('financas'));
    if (!financas) {
        financas = inicializarFinancas();
    }
    let valorPremio = 0;

    if (posicaoFinal === 1) {
        valorPremio = 47800000;
    } else if (posicaoFinal >= 2 && posicaoFinal <= 20) {
        valorPremio = 22600000;
    }

    financas.saldo += valorPremio;
    financas.receitas.premios += valorPremio;

    localStorage.setItem('financas', JSON.stringify(financas));
}

// Adiciona o prêmio por vitória (R$ 12 mil)
function adicionarPremioVitoria(valor) {
    let financas = JSON.parse(localStorage.getItem('financas'));
    if (!financas) {
        financas = inicializarFinancas();
    }

    financas.saldo += valor;
    financas.receitas.premios += valor;

    localStorage.setItem('financas', JSON.stringify(financas));
}

// Adiciona valor de transferência de jogador ao saldo
function adicionarReceitaTransferencia(valorTransferencia) {
    let financas = JSON.parse(localStorage.getItem('financas'));
    if (!financas) {
        financas = inicializarFinancas();
    }

    financas.saldo += valorTransferencia;
    financas.receitas.transferencias += valorTransferencia;

    localStorage.setItem('financas', JSON.stringify(financas));
}

// Retira o valor de transferência de jogador do saldo
function adicionarDespesaTransferencia(valorTransferencia) {
    let financas = JSON.parse(localStorage.getItem('financas'));
    if (!financas) {
        financas = inicializarFinancas();
    }

    financas.saldo -= valorTransferencia;
    financas.despesas.transferencias += valorTransferencia;

    localStorage.setItem('financas', JSON.stringify(financas));
}

// === NOVAS FUNÇÕES PARA O CALENDÁRIO ===

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function gerarCalendarioBrasileirao(equipes, meuTime) {
    const calendario = [];
    const timesRestantes = equipes.filter(t => t !== meuTime);
    shuffle(timesRestantes);

    const jogosDoTurno = [];
    const jogosDoReturno = [];

    for (let i = 0; i < 19; i++) {
        const adversario = timesRestantes[i];
        jogosDoTurno.push({
            timeCasa: meuTime,
            timeFora: adversario,
            placar: null,
            data: null
        });
    }

    for (let i = 0; i < 19; i++) {
        const adversario = timesRestantes[i];
        jogosDoReturno.push({
            timeCasa: adversario,
            timeFora: meuTime,
            placar: null,
            data: null
        });
    }

    const todosOsJogos = [...jogosDoTurno, ...jogosDoReturno];
    shuffle(todosOsJogos);
    
    let dataPartida = new Date('2025-02-15T12:00:00');
    for (let i = 0; i < 38; i++) {
        const jogoDaRodada = todosOsJogos[i];
        jogoDaRodada.data = dataPartida.toISOString();
        
        calendario.push({
            numero: i + 1,
            partidas: [jogoDaRodada]
        });
        
        dataPartida.setDate(dataPartida.getDate() + 7);
    }

    return calendario;
}

