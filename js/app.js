const btnNovo = document.getElementById("btnNovo");
const btnAndamento = document.getElementById("btnAndamento");

btnNovo.addEventListener("click", () => {
    renderNovoOrcamento();
});

btnAndamento.addEventListener("click", () => {
    renderOrcamentosEmAndamento();
});