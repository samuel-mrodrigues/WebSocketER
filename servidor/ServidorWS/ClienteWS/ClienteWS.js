import { ClienteWS } from "../../../comunicacao/Cliente.js";
import * as TipagemComunicacaoCliente from "../../../comunicacao/Tipagem.js";
import { ServidorWS } from "../ServidorWS.js"
import { WebSocket } from "ws"

/**
 * Uma conexão do servidor com o cliente para comunicação
 */
export class ClienteConectado extends ClienteWS {

    /**
     * Instancia do servidor WebSocket que esse cliente está conectado
     * @type {ServidorWS}
     */
    #instanciaServidor;

    /**
     * Socket de comunicação com o cliente
     * @type {WebSocket}
     */
    #socket;

    /**
     * Instanciar um novo cliente WebSocket para o servidor
     * @param {ServidorWS} instanciaServidor 
     * @param {WebSocket} websocketSocket 
     */
    constructor(instanciaServidor, websocketSocket) {
        super();

        this.#instanciaServidor = instanciaServidor;
        this.#socket = websocketSocket;

        // Quando o servidor quiser enviar uma mensagem para o cliente
        this.getEmissorEventos().addEvento('enviar-mensagem', (webSocketMensagem) => {
            this.#processaClienteEnviaMensagem(webSocketMensagem);
        })

        // Quando o cliente devolver uma resposta ao servidor pra esse cara
        this.#socket.on('message', (bufferMensagem) => {
            this.processaMensagemWebSocket(bufferMensagem);
        })

        this.getComandos = () => {
            return this.#instanciaServidor.getComandosCadastrados();
        }

        this.executorDeComando = async (solicitacao, transmissao) => {
            return await this.#processarExecucaoComando(solicitacao, transmissao);
        }
    }

    /**
     * Realiza a ação de enviar mensagem ao cliente conectado no servidor
     * @param {TipagemComunicacaoCliente.WebSocketMensagem} webSocketMensagem
     */
    #processaClienteEnviaMensagem(webSocketMensagem) {
        this.#socket.send(JSON.stringify(webSocketMensagem));
    }

    /**
     * Processar uma execução de um comando
     * @param {TipagemComunicacaoCliente.SolicitaComando} solicitacao
     * @param {TipagemComunicacaoCliente.TransmissaoWebSocket} transmissao
     */
    async #processarExecucaoComando(solicitacao, transmissao) {
        const comandoSolicitado = this.#instanciaServidor.getComandosCadastrados().find(comando => comando.comando === solicitacao.comando);

        if (comandoSolicitado != undefined) {
            return await comandoSolicitado.callback(this, solicitacao, transmissao);
        } else {
            return;
        }
    }
}
