const btnDashboard =
    document.getElementById("btnDashboard");

const btnNovo =
    document.getElementById("btnNovo");

const btnAndamento =
    document.getElementById("btnAndamento");

const btnFinalizados =
    document.getElementById("btnFinalizados");

function safeAddListener(element, handler) {
    if (!element) return;
    element.addEventListener('click', handler);
}

safeAddListener(btnDashboard, () => {
    renderDashboard();
});

safeAddListener(btnNovo, () => {
    renderNovoOrcamento();
});

safeAddListener(btnAndamento, () => {
    renderOrcamentosEmAndamento();
});

safeAddListener(btnFinalizados, () => {
    renderOrcamentosFinalizados();
});

renderDashboard();