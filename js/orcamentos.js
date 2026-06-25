let itensOrcamento = [];
let currentEditIndex = null;

function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');
}

function loadOrcamentos() {
    try {
        return JSON.parse(localStorage.getItem('orcamentos')) || [];
    } catch (e) {
        console.warn('Erro ao ler orçamentos do localStorage:', e);
        return [];
    }
}

function sanitizeFilename(name) {
    const safe = escapeHtml(name || '').replace(/[^a-z0-9-_\.]/gi, '_');
    return (safe || 'orcamento').slice(0, 50);
}

function ensurePageSpace(doc, y, lineHeight = 8, bottomMargin = 20) {
    const pageHeight = doc.internal.pageSize.height || 297;
    if (y + lineHeight + bottomMargin > pageHeight) {
        doc.addPage();
        return 20;
    }
    return y;
}

function telefoneMaskHandler(e) {
    const input = e.target;
    let v = (input.value || '').replace(/\D/g, '');
    v = v.slice(0, 11);
    if (v.length <= 2) {
        input.value = v ? `(${v}` : '';
        return;
    }
    const area = v.slice(0,2);
    const rest = v.slice(2);
    if (rest.length === 0) {
        input.value = `(${area}`;
        return;
    }
    if (rest.length === 1) {
        input.value = `(${area}) ${rest}`;
        return;
    }
    if (rest.length <= 5) {
        input.value = `(${area}) ${rest.slice(0,1)} ${rest.slice(1)}`;
        return;
    }
    input.value = `(${area}) ${rest.slice(0,1)} ${rest.slice(1,5)}-${rest.slice(5,9)}`;
}

function placaHandler(e) {
    const input = e.target;
    if (!input) return;
    let v = (input.value || '').toUpperCase();
    v = v.replace(/[^A-Z0-9]/g, '');
    input.value = v;
}

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

            <h3>Observações</h3>
            <textarea id="observacoes" rows="4" placeholder="Observações do orçamento"></textarea>

            <button id="btnSalvar">
                Salvar Orçamento
            </button>

        </div>
    `;

    const tel = document.getElementById('telefone');
    if (tel) tel.addEventListener('input', telefoneMaskHandler);
    const placa = document.getElementById('placa');
    if (placa) placa.addEventListener('input', placaHandler);

    configurarEventosItens();
    configurarEventoSalvar();
}

//adiciona itens ao orcamento

function configurarEventosItens() {

    const btnAdicionar = document.getElementById("btnAdicionarItem");

    if (!btnAdicionar) return;

    btnAdicionar.addEventListener("click", () => {

        const descricaoEl = document.getElementById("descricaoItem");
        const categoriaEl = document.getElementById("categoriaItem");
        const valorEl = document.getElementById("valorItem");
        const descricao = descricaoEl ? descricaoEl.value.trim() : '';
        const categoria = categoriaEl ? categoriaEl.value : '';
        const valor = Number.parseFloat(valorEl ? valorEl.value : 0);

        if (!descricao || Number.isNaN(valor)) {
            alert("Preencha descrição e valor.");
            return;
        }

        if (currentEditIndex === null) {
            itensOrcamento.push({ descricao, categoria, valor });
        } else {
            itensOrcamento[currentEditIndex] = { descricao, categoria, valor };
            currentEditIndex = null;
            btnAdicionar.textContent = 'Adicionar Item';
        }

        atualizarListaItens();

        if (descricaoEl) descricaoEl.value = "";
        if (valorEl) valorEl.value = "";
    });
}

//atualizar itens

function atualizarListaItens() {

    const lista = document.getElementById("listaItens");
    if (!lista) return;

    let html = `
        <table class="tabela-itens">
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    let total = 0;

    itensOrcamento.forEach((item, index) => {

        total += item.valor;

        html += `
            <tr>
                <td>${escapeHtml(item.descricao)}</td>
                <td>${escapeHtml(item.categoria)}</td>
                <td>R$ ${Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>
                    <button type="button" onclick="editarItem(${index})">Editar</button>
                    <button type="button" onclick="removerItem(${index})">Remover</button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    lista.innerHTML = html;

    const resumo = document.getElementById("resumoValores");
    if (resumo) {
        resumo.innerHTML = `
        <h3>Total: R$ ${total.toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}</h3>
    `;
    }
}

function editarItem(index) {
    if (typeof index !== 'number') index = Number(index);
    if (!Number.isInteger(index)) return;
    const item = itensOrcamento[index];
    if (!item) return;
    const descricaoEl = document.getElementById('descricaoItem');
    const categoriaEl = document.getElementById('categoriaItem');
    const valorEl = document.getElementById('valorItem');
    const btnAdicionar = document.getElementById('btnAdicionarItem');
    if (descricaoEl) descricaoEl.value = item.descricao;
    if (categoriaEl) {
        for (let i = 0; i < categoriaEl.options.length; i++) {
            if (categoriaEl.options[i].value === item.categoria) { categoriaEl.selectedIndex = i; break; }
        }
    }
    if (valorEl) valorEl.value = item.valor;
    currentEditIndex = index;
    if (btnAdicionar) btnAdicionar.textContent = 'Salvar Edição';
}

//evento de salvar orçamento

function configurarEventoSalvar() {

    const btnSalvar = document.getElementById("btnSalvar");
    if (!btnSalvar) return;

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

    const observacoes = (document.getElementById("observacoes") || {}).value || '';

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
        observacoes,
        status: "Em Andamento",
        itens: [...itensOrcamento],
        total
    };

    openPreviewModal(orcamento);
}

function openPreviewModal(orcamento) {
    const existing = document.getElementById('previewModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'previewModal';
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');

    const box = document.createElement('div');
    box.className = 'modal-box';

    const title = document.createElement('h2');
    title.className = 'modal-title';
    title.textContent = 'Pré-visualização do Orçamento';
    box.appendChild(title);

    const info = document.createElement('div');
    info.className = 'modal-info';
    info.innerHTML = `
        <p><strong>Cliente:</strong> ${escapeHtml(orcamento.cliente)}</p>
        <p><strong>Telefone:</strong> ${escapeHtml(orcamento.telefone)}</p>
        <p><strong>Veículo:</strong> ${escapeHtml(orcamento.veiculo)}</p>
        <p><strong>Placa:</strong> ${escapeHtml(orcamento.placa)}</p>
        <p><strong>Ano:</strong> ${escapeHtml(orcamento.ano)}</p>
        <p><strong>Observações:</strong><br>${escapeHtml(orcamento.observacoes || '')}</p>
    `;
    box.appendChild(info);

    const table = document.createElement('table');
    table.className = 'modal-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th style="text-align:right">Valor</th>
            </tr>
        </thead>
    `;
    const tbody = document.createElement('tbody');
    (orcamento.itens || []).forEach(item => {
        const tr = document.createElement('tr');
        const tdDesc = document.createElement('td');
        tdDesc.textContent = item.descricao || '';
        const tdCat = document.createElement('td');
        tdCat.textContent = item.categoria || '';
        const tdVal = document.createElement('td');
        tdVal.textContent = `R$ ${Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits:2 })}`;
        tdVal.className = 'modal-valor';
        tr.appendChild(tdDesc);
        tr.appendChild(tdCat);
        tr.appendChild(tdVal);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    box.appendChild(table);

    const totalDiv = document.createElement('div');
    totalDiv.className = 'modal-total';
    totalDiv.innerHTML = `<strong>Total: R$ ${Number(orcamento.total || 0).toLocaleString('pt-BR', { minimumFractionDigits:2 })}</strong>`;
    box.appendChild(totalDiv);

    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    const back = document.createElement('button');
    back.className = 'btn-back';
    back.textContent = 'Voltar';
    back.onclick = () => { modal.remove(); };

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-save';
    saveBtn.textContent = 'Salvar';
    saveBtn.onclick = () => {
        const list = loadOrcamentos();
        orcamento.id = Date.now();
        list.push(orcamento);
        try { localStorage.setItem('orcamentos', JSON.stringify(list)); } catch (e) { console.warn(e); }
        itensOrcamento = [];
        modal.remove();
        renderDashboard();
    };

    const pdfBtn = document.createElement('button');
    pdfBtn.className = 'btn-pdf';
    pdfBtn.textContent = 'Gerar PDF';
    pdfBtn.onclick = () => { gerarPDFFromObject(orcamento); };

    actions.appendChild(back);
    actions.appendChild(saveBtn);
    actions.appendChild(pdfBtn);
    box.appendChild(actions);

    modal.appendChild(box);
    document.body.appendChild(modal);
}

function gerarPDFFromObject(orcamento) {
    const jspdf = globalThis.jspdf; if (!jspdf) return;
    const { jsPDF } = jspdf;
    if (!jsPDF) return;
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text('O PAULISTA', 20, y);
    y += 10;
    doc.setFontSize(14);
    doc.text('ORÇAMENTO AUTOMOTIVO', 20, y);
    y += 12;
    doc.setFontSize(12);
    doc.text(`Cliente: ${orcamento.cliente}`, 20, y); y += 8;
    doc.text(`Telefone: ${orcamento.telefone}`, 20, y); y += 8;
    doc.text(`Veículo: ${orcamento.veiculo}`, 20, y); y += 8;
    doc.text(`Placa: ${orcamento.placa}`, 20, y); y += 8;
    doc.text(`Ano: ${orcamento.ano}`, 20, y); y += 12;
    doc.text('Observações:', 20, y); y += 8;
    const obs = (orcamento.observacoes || '').split('\n');
    obs.forEach(line => { y = ensurePageSpace(doc, y); doc.text(escapeHtml(line), 20, y); y += 6; });
    y += 8;
    doc.text('ITENS', 20, y); y += 8;
    (orcamento.itens || []).forEach(item => { y = ensurePageSpace(doc, y); doc.text(`${item.descricao} - ${item.categoria}`, 20, y); doc.text(`R$ ${Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits:2 })}`, 160, y, { align: 'right' }); y += 8; });
    y += 8; y = ensurePageSpace(doc, y); doc.setFontSize(14); doc.text(`TOTAL: R$ ${Number(orcamento.total || 0).toLocaleString('pt-BR', { minimumFractionDigits:2 })}`, 20, y);
    const name = `ORCAMENTO_${sanitizeFilename((orcamento.cliente || '').toUpperCase())}.pdf`;
    doc.save(name);
}

//orcamentos em andamento

function renderOrcamentosEmAndamento() {

    const content = document.querySelector(".content");

    const orcamentos = loadOrcamentos();

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

                    <h3>${escapeHtml(orcamento.cliente)}</h3>

                    <p>
                        ${escapeHtml(orcamento.veiculo)}
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

    const orcamentos = loadOrcamentos();

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

    const orcamentos = loadOrcamentos();

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
                <td>${escapeHtml(item.descricao)}</td>
                <td>${escapeHtml(item.categoria)}</td>
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

                <p><strong>Nome:</strong> ${escapeHtml(orcamento.cliente)}</p>

                <p><strong>Telefone:</strong> ${escapeHtml(orcamento.telefone)}</p>

            </div>

            <div class="detalhes-card">

                <h3>Veículo</h3>

                <p><strong>Modelo:</strong> ${escapeHtml(orcamento.veiculo)}</p>

                <p><strong>Placa:</strong> ${escapeHtml(orcamento.placa)}</p>

                <p><strong>Ano:</strong> ${escapeHtml(orcamento.ano)}</p>

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

                <h3>Observações</h3>

                <p>${escapeHtml(orcamento.observacoes || '')}</p>

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
        onclick="gerarPDF(${orcamento.id})">
        Gerar PDF
    </button>

    <button
        onclick="excluirOrcamento(${orcamento.id})"
        class="btn-excluir">
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

    const orcamentos = loadOrcamentos();

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
        <header class="page-header">
            <h1>Dashboard</h1>
            <p>Resumo geral dos orçamentos.</p>
        </header>

        <section class="dashboard-cards" aria-label="Resumo dos orçamentos">

            <div class="dashboard-card card">
                <h3>Total</h3>
                <span class="metric total-count">${totalOrcamentos}</span>
            </div>

            <div class="dashboard-card card">
                <h3>Em Andamento</h3>
                <span class="metric andamento-count">${emAndamento}</span>
            </div>

            <div class="dashboard-card card">
                <h3>Finalizados</h3>
                <span class="metric finalizados-count">${finalizados}</span>
            </div>

            <div class="dashboard-card card value-card">
                <h3>Valor Total</h3>
                <span class="metric valor-total">R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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

    const orcamentos = loadOrcamentos();

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

                    <h3>${escapeHtml(orcamento.cliente)}</h3>

                    <p>
                        ${escapeHtml(orcamento.veiculo)}
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

    const orcamentos = loadOrcamentos();

    const atualizados = orcamentos.filter(
        item => item.id !== id
    );

    localStorage.setItem(
        "orcamentos",
        JSON.stringify(atualizados)
    );

    renderDashboard();
}

//fgeara pdf do orncamento

async function gerarPDF(id) {

    const orcamentos = loadOrcamentos();

    const orcamento = orcamentos.find(
        item => item.id === id
    );

    if (!orcamento) {
        return;
    }

    const jspdf = globalThis.jspdf;
    if (!jspdf) return;
    const { jsPDF } = jspdf;
    if (!jsPDF) return;

    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(18);
    doc.text("O PAULISTA", 20, y);

    y += 10;

    doc.setFontSize(14);
    doc.text("ORÇAMENTO AUTOMOTIVO", 20, y);

    y += 20;

    doc.setFontSize(12);

    doc.text(
        `Cliente: ${orcamento.cliente}`,
        20,
        y
    );

    y += 8;

    doc.text(
        `Telefone: ${orcamento.telefone}`,
        20,
        y
    );

    y += 15;

    doc.text(
        `Veículo: ${orcamento.veiculo}`,
        20,
        y
    );

    y += 8;

    doc.text(
        `Placa: ${orcamento.placa}`,
        20,
        y
    );

    y += 8;

    doc.text(
        `Ano: ${orcamento.ano}`,
        20,
        y
    );

    y += 20;

    doc.text("ITENS", 20, y);

    y += 10;

    orcamento.itens.forEach(item => {

        y = ensurePageSpace(doc, y);

        doc.text(
            `${item.descricao} - ${item.categoria}`,
            20,
            y
        );

        doc.text(
            `R$ ${item.valor.toFixed(2)}`,
            150,
            y
        );

        y += 8;
    });

    y += 15;

    y = ensurePageSpace(doc, y);

    doc.setFontSize(14);

    doc.text(
        `TOTAL: R$ ${orcamento.total.toFixed(2)}`,
        20,
        y
    );

    const filename = `orcamento-${sanitizeFilename(orcamento.cliente)}.pdf`;

    doc.save(filename);
}