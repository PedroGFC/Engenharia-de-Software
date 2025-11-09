async function salvarONGEOportunidade() {
  const payload = {
    ong_nome: "GreenLeaf",
    endereco: "Avenida blalaal 112, SP",
    titulo: "AAA",
    descricao: "BBBBBB",
  };

  try {
    const resp = await fetch("http://localhost:8000/ongs/oportunidades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (resp.ok) {
      console.log("Sucesso:", data);
      alert("Oportunidade criada!");
    } else {
      console.error("Erro:", data);
      alert("Falha ao criar oportunidade: " + text);
    }
  } catch (err) {
    console.error("Erro de rede:", err);
    alert("Erro de rede. Veja o console.");
  }
}

salvarONGEOportunidade();
