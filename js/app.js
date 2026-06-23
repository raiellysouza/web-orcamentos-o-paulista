const btnDashboard =
    document.getElementById("btnDashboard");

const btnNovo =
    document.getElementById("btnNovo");

const btnAndamento =
    document.getElementById("btnAndamento");

btnDashboard.addEventListener("click", () => {
    renderDashboard();
});

btnNovo.addEventListener("click", () => {
    renderNovoOrcamento();
});

btnAndamento.addEventListener("click", () => {
    renderOrcamentosEmAndamento();
});