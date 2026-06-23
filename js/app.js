const btnDashboard =
    document.getElementById("btnDashboard");

const btnNovo =
    document.getElementById("btnNovo");

const btnAndamento =
    document.getElementById("btnAndamento");

const btnFinalizados =
    document.getElementById("btnFinalizados");


btnDashboard.addEventListener("click", () => {
    renderDashboard();
});


btnNovo.addEventListener("click", () => {
    renderNovoOrcamento();
});


btnAndamento.addEventListener("click", () => {
    renderOrcamentosEmAndamento();
});


btnFinalizados.addEventListener("click", () => {
    renderOrcamentosFinalizados();
});

renderDashboard();