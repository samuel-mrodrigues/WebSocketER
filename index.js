import { iniciarServidor } from "./teste_servidor.js";
import { iniciarCliente } from "./teste_cliente.js";

<<<<<<< HEAD
export { WebSocketERServidor, ClienteWebSocketER }
=======
async function iniciarTeste() {
    await iniciarServidor();
    iniciarCliente();
}

iniciarTeste();
>>>>>>> eb177c4076e916f9d59f859ed219c721597a4802
