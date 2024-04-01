import { iniciarServidor } from "./teste_servidor.js";
import { iniciarCliente } from "./teste_cliente.js";

async function iniciarTeste() {
    await iniciarServidor();
    iniciarCliente();
}

iniciarTeste();