function renderNovoOrcamento() {

    const content = document.querySelector(".content");

    content.innerHTML = `
        <header>
            <h1>Novo Orçamento</h1>
            <p>Cadastre um novo orçamento.</p>
        </header>

        <div class="form-container">

            <h3>Cliente</h3>

            <input type="text" placeholder="Nome do Cliente">

            <input type="text" placeholder="Telefone">

            <h3>Veículo</h3>

            <input type="text" placeholder="Modelo">

            <input type="text" placeholder="Placa">

            <input type="number" placeholder="Ano">

            <br><br>

            <button>
                Salvar Orçamento
            </button>

        </div>
    `;
}