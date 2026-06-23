let itensOrcamento = [];

function renderNovoOrcamento() {

    const content = document.querySelector(".content");

    content.innerHTML = `
        <header>
            <h1>Novo Orçamento</h1>
            <p>Cadastre um novo orçamento.</p>
        </header>

        <div class="form-container">

            <h3>Cliente</h3>

            <input id="cliente" type="text" placeholder="Nome do Cliente">

            <input id="telefone" type="text" placeholder="Telefone">

            <h3>Veículo</h3>

            <input id="veiculo" type="text" placeholder="Modelo">

            <input id="placa" type="text" placeholder="Placa">

            <input id="ano" type="number" placeholder="Ano">

            <hr>

            <h3>Adicionar Item</h3>

            <input id="descricaoItem" type="text" placeholder="Descrição">

            <select id="categoriaItem">
                <option value="Peça">Peça</option>
                <option value="Serviço">Serviço</option>
            </select>

            <input id="valorItem" type="number" placeholder="Valor">

            <button id="btnAdicionarItem">
                Adicionar Item
            </button>

            <div id="listaItens"></div>

            <div id="resumoValores">
                <h3>Total: R$ 0,00</h3>
            </div>

            <button id="btnSalvar">
                Salvar Orçamento
            </button>

        </div>
    `;

    configurarEventosItens();
    configurarEventoSalvar();
}

// Adicionar itens ao orçamento

function configurarEventosItens() {

    const btnAdicionar = document.getElementById("btnAdicionarItem");

    btnAdicionar.addEventListener("click", () => {

        const descricao = document.getElementById("descricaoItem").value;
        const categoria = document.getElementById("categoriaItem").value;
        const valor = parseFloat(
            document.getElementById("valorItem").value
        );

        if (!descricao || isNaN(valor)) {
            alert("Preencha descrição e valor.");
            return;
        }

        itensOrcamento.push({
            descricao,
            categoria,
            valor
        });

        atualizarListaItens();

        document.getElementById("descricaoItem").value = "";
        document.getElementById("valorItem").value = "";
    });
}

// Atualizar lista de itens

function atualizarListaItens() {

    const lista = document.getElementById("listaItens");

    let html = `
        <table class="tabela-itens">
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
    `;

    let total = 0;

    itensOrcamento.forEach(item => {

        total += item.valor;

        html += `
            <tr>
                <td>${item.descricao}</td>
                <td>${item.categoria}</td>
                <td>R$ ${item.valor.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    lista.innerHTML = html;

    document.getElementById("resumoValores").innerHTML = `
    <h3>Total: R$ ${total.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}</h3>
`;
}

//evento de salvar orçamento

function configurarEventoSalvar() {

    const btnSalvar = document.getElementById("btnSalvar");

    btnSalvar.addEventListener("click", salvarOrcamento);

}

// Salvar orçamento

function salvarOrcamento() {

    const cliente =
        document.getElementById("cliente").value;

    const telefone =
        document.getElementById("telefone").value;

    const veiculo =
        document.getElementById("veiculo").value;

    const placa =
        document.getElementById("placa").value;

    const ano =
        document.getElementById("ano").value;

    if (
        !cliente ||
        !veiculo ||
        itensOrcamento.length === 0
    ) {
        alert(
            "Preencha cliente, veículo e adicione ao menos um item."
        );
        return;
    }

    const total = itensOrcamento.reduce(
        (soma, item) => soma + item.valor,
        0
    );

    const orcamento = {
        id: Date.now(),
        cliente,
        telefone,
        veiculo,
        placa,
        ano,
        status: "Em Andamento",
        itens: [...itensOrcamento],
        total
    };

    const orcamentos =
        JSON.parse(
            localStorage.getItem("orcamentos")
        ) || [];

    orcamentos.push(orcamento);

    localStorage.setItem(
        "orcamentos",
        JSON.stringify(orcamentos)
    );

    alert("Orçamento salvo com sucesso!");

    itensOrcamento = [];

    renderDashboard();
}

//orçamentos em andamento

function renderOrcamentosEmAndamento() {

    const content = document.querySelector(".content");

    const orcamentos =
        JSON.parse(localStorage.getItem("orcamentos"))
        || [];

    const emAndamento = orcamentos.filter(
        orcamento => orcamento.status === "Em Andamento"
    );

    let html = `
        <header>
            <h1>Orçamentos em Andamento</h1>
            <p>Gerencie os orçamentos ativos.</p>
        </header>
    `;

    if (emAndamento.length === 0) {

        html += `
            <div class="card-lista">
                Nenhum orçamento encontrado.
            </div>
        `;

    } else {

        emAndamento.forEach(orcamento => {

            html += `
                <div class="card-lista">

                    <h3>${orcamento.cliente}</h3>

                    <p>
                        ${orcamento.veiculo}
                    </p>

                    <p>
                        Total: R$ ${orcamento.total.toFixed(2)}
                    </p>

                    <button
                        onclick="visualizarOrcamento(${orcamento.id})"
                    >
                        Ver Detalhes
                    </button>

                    <button
                        onclick="finalizarOrcamento(${orcamento.id})"
                    >
                        Finalizar
                    </button>

                </div>
            `;
        });
    }

    content.innerHTML = html;
}

// Finalizar orçamento

function finalizarOrcamento(id) {

    const confirmar = confirm(
        "Deseja realmente finalizar este orçamento?"
    );

    if (!confirmar) {
        return;
    }

    const orcamentos =
        JSON.parse(localStorage.getItem("orcamentos"))
        || [];

    const atualizado = orcamentos.map(orcamento => {

        if (orcamento.id === id) {
            orcamento.status = "Finalizado";
        }

        return orcamento;
    });

    localStorage.setItem(
        "orcamentos",
        JSON.stringify(atualizado)
    );

    alert("Orçamento finalizado com sucesso!");

    renderDashboard();
}

// Visualizar orçamento

function visualizarOrcamento(id) {

    const orcamentos =
        JSON.parse(localStorage.getItem("orcamentos"))
        || [];

    const orcamento = orcamentos.find(
        item => item.id === id
    );

    if (!orcamento) {
        alert("Orçamento não encontrado.");
        return;
    }

    let itensHTML = "";

    orcamento.itens.forEach(item => {

        itensHTML += `
            <tr>
                <td>${item.descricao}</td>
                <td>${item.categoria}</td>
                <td>R$ ${item.valor.toFixed(2)}</td>
            </tr>
        `;
    });

    const content = document.querySelector(".content");

    content.innerHTML = `
        <header>
            <h1>Detalhes do Orçamento</h1>
            <p>Visualização completa do orçamento.</p>
        </header>

        <div class="detalhes-container">

            <div class="detalhes-card">

                <h3>Cliente</h3>

                <p><strong>Nome:</strong> ${orcamento.cliente}</p>

                <p><strong>Telefone:</strong> ${orcamento.telefone}</p>

            </div>

            <div class="detalhes-card">

                <h3>Veículo</h3>

                <p><strong>Modelo:</strong> ${orcamento.veiculo}</p>

                <p><strong>Placa:</strong> ${orcamento.placa}</p>

                <p><strong>Ano:</strong> ${orcamento.ano}</p>

            </div>

            <div class="detalhes-card">

                <h3>Itens do Orçamento</h3>

                <table class="tabela-itens">

                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Valor</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${itensHTML}
                    </tbody>

                </table>

            </div>

            <div class="detalhes-card">

                <h2>
                    Total: R$ ${orcamento.total.toFixed(2)}
                </h2>

            </div>

           <div class="acoes-detalhes">

    <button onclick="renderDashboard()">
        Voltar
    </button>

    <button onclick="finalizarOrcamento(${orcamento.id})">
        Finalizar
    </button>

    <button
        onclick="excluirOrcamento(${orcamento.id})"
        class="btn-excluir"
    >
        Excluir
    </button>

</div>

        </div>
    `;
    renderOrcamentosEmAndamento()
}

//dashboard

function renderDashboard() {

    const content = document.querySelector(".content");

    const orcamentos =
        JSON.parse(localStorage.getItem("orcamentos"))
        || [];

    const totalOrcamentos = orcamentos.length;

    const emAndamento = orcamentos.filter(
        item => item.status === "Em Andamento"
    ).length;

    const finalizados = orcamentos.filter(
        item => item.status === "Finalizado"
    ).length;

    const valorTotal = orcamentos.reduce(
        (soma, item) => soma + item.total,
        0
    );

    content.innerHTML = `
        <header>
            <h1>Dashboard</h1>
            <p>Resumo geral dos orçamentos.</p>
        </header>

        <section class="cards">

            <div class="card">
                <h3>Total</h3>
                <span>${totalOrcamentos}</span>
            </div>

            <div class="card">
                <h3>Em Andamento</h3>
                <span>${emAndamento}</span>
            </div>

            <div class="card">
                <h3>Finalizados</h3>
                <span>${finalizados}</span>
            </div>

            <div class="card">
                <h3>Valor Total</h3>
                <span>
                    R$ ${valorTotal.toFixed(2)}
                </span>
            </div>

        </section>

        <section class="welcome">

            <h2>Visão Geral</h2>

            <p>
                Sistema de gerenciamento de orçamentos da Oficina O Paulista.
            </p>

        </section>
    `;
}

function renderOrcamentosFinalizados() {

    const content = document.querySelector(".content");

    const orcamentos =
        JSON.parse(localStorage.getItem("orcamentos"))
        || [];

    const finalizados = orcamentos.filter(
        item => item.status === "Finalizado"
    );

    let html = `
        <header>
            <h1>Orçamentos Finalizados</h1>
            <p>Histórico de orçamentos concluídos.</p>
        </header>
    `;

    if (finalizados.length === 0) {

        html += `
            <div class="card-lista">
                Nenhum orçamento finalizado.
            </div>
        `;

    } else {

        finalizados.forEach(orcamento => {

            html += `
                <div class="card-lista">

                    <h3>${orcamento.cliente}</h3>

                    <p>
                        ${orcamento.veiculo}
                    </p>

                    <p>
                        Total: R$
                        ${orcamento.total.toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 2
                }
            )}
                    </p>

                    <button
                        onclick="visualizarOrcamento(${orcamento.id})"
                    >
                        Ver Detalhes
                    </button>

                </div>
            `;
        });
    }

    content.innerHTML = html;
}

// Excluir orçamento

function excluirOrcamento(id) {

    const confirmar = confirm(
        "Deseja realmente excluir este orçamento?"
    );

    if (!confirmar) {
        return;
    }

    const orcamentos =
        JSON.parse(localStorage.getItem("orcamentos"))
        || [];

    const atualizados = orcamentos.filter(
        item => item.id !== id
    );

    localStorage.setItem(
        "orcamentos",
        JSON.stringify(atualizados)
    );

    renderDashboard();
}