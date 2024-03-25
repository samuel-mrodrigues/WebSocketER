import { WebSocketERServidor } from "./servidor/WebSocketERServidor.js";
import { ClienteWebSocketER } from "./cliente/ClienteWebSocketER.js";

console.log(`Iniciando index.js...`);
const testeServidor = new WebSocketERServidor(5004);

testeServidor.adicionadComando('ping', (cliente, solicitacao, transmissao) => {
    console.log(`Recebi uma solicitação de ping. Transmissão ID: ${transmissao.id}`)

    return 'pong';
})

testeServidor.onClienteConectado(async (cliente) => {
    console.log(`Novo cliente está conectado ao servidor!`);

    const solicitaCmd = await cliente.enviarComando('ping');
    console.log(solicitaCmd);
})

const statusAbreServidor = await testeServidor.iniciarServidor();
if (statusAbreServidor.sucesso) {
    console.log(`Servidor aberto na porta ${statusAbreServidor.porta}`);

    const conexaoCliente = new ClienteWebSocketER('localhost', 5004)
    conexaoCliente.cadastrarComando('ping', (solicitacao, transmissao) => {
        return 'pong porra'
    })

    const statusConectaCliente = await conexaoCliente.conectar();
    if (statusConectaCliente.sucesso) {
        console.log(`Cliente conectado com sucesso`);

    } else {
        console.log(`Èrro ao conectar-se ao servidor`);
    }
} else {
    console.log(`Não foi possível abrir o`);
}

