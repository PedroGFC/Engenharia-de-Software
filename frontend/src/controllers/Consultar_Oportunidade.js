async function consultar_Oportunidade() {
    try {
        const response = await fetch('http://localhost:8000/consultar_oportunidades/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Oportunidades encontradas:', data);
            // Aqui você pode fazer algo com os dados, como exibir na página
        } else {
            const errorText = await response.text();
            console.error('Erro ao consultar:', errorText);
        }
    } catch (err) {
        console.error('Erro de rede ou outro:', err);
    }
}

// Chama a função para testar
consultar_Oportunidade();