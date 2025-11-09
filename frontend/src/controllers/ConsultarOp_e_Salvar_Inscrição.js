async function consultar_oportunidades() {
    try {
        const response = await fetch('http://localhost:8000/consultar_oportunidades/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data; 
        } else {
            const errorText = await response.text();
            console.error('Erro ao consultar:', errorText);
        }
    } catch (err) {
        console.error('Erro de rede ou outro:', err);
    }
}

async function salvarInscricao(oportunidade_id) {
    const DadosInscricao = {
        nome: "Petrônio Brás de Cunha",
        nascimento: "1967-02-19", 
        cpf: "81909010",
        mensagem: "Eu sou Petrônio \"Petrobras\" Bras de Cunha",
        oportunidade_id: oportunidade_id
    };

    try {
        const response = await fetch('http://localhost:8000/salvar_Inscricao/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(DadosInscricao)
        });

        const text = await response.text();

        if (response.ok) {
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text };
            }
            console.log('Sucesso:', data.message);
        } else {
            console.error('Erro:', text);
        }

    } catch (err) {
        console.error('Erro de rede ou outro:', err);
    }
}

// Iniciar todo o processo
consultar_oportunidades().then(oportunidades => {
    if (oportunidades && oportunidades.length > 0) {
        const primeiraOportunidade = oportunidades[0];
        salvarInscricao(primeiraOportunidade.id);
    } else {
        console.log("Nenhuma oportunidade encontrada.");
    }
});
