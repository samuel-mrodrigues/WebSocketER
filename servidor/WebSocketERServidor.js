import { EmissorDeEvento } from "../utils/EmissorDeEvento.js";
import { ServidorWS } from "./ServidorWS/ServidorWS.js"
import * as TIpagensWebSocketER from "./Tipagem.js";
import * as TipagensCliente from "../comunicacao/Tipagem.js";


export class WebSocketERServidor {
    /**
     * @type {ServidorWS}
     */
    #servidorGerenciaConexoes;

    /**
     * Comandos cadastrados no servidor
     * @type {TipagensCliente.Comando[]}
     */
    #comandos = []

    #parametros = {
        porta: 5005
    }

    #emissorEvento = new EmissorDeEvento('WebSocketERServidor');

    /**
     * Instanciar um novo servidor
     * @param {Number} porta - Porta para iniciar o servidor
     */
    constructor(porta) {
        this.#parametros.porta = porta;
        this.#servidorGerenciaConexoes = new ServidorWS(this, { porta: porta });
    }

    /**
     * Iniciar o servidor WebSocket
     */
    iniciarServidor() {
        return this.#servidorGerenciaConexoes.abrirWebSocket();
    }

    /**
     * Adicionar um novo comando ao servidor
     * @param {String} comando - Nome do comando
     * @param {TIpagensWebSocketER.CallbackExecutarComando} callback - Função a ser executada quando o comando for solicitado
     */
    adicionadComando(comando, callback) {
        /**
         * @type {TIpagensWebSocketER.Comando}
         */
        const novoComando = {
            comando: comando,
            callback: callback
        }

        this.#comandos.push(novoComando);
    }

    /**
     * Escutar quando um novo cliente se conecta ao servidor
     * @param {TIpagensWebSocketER.OnClienteConectado} callback - Função a ser executada quando um novo cliente se conecta
     */
    onClienteConectado(callback) {
        this.#emissorEvento.addEvento('cliente-conectado', callback);
    }

    /**
     * Retorna o emissor de eventos do servidor
     */
    getEmissorEventos() {
        return this.#emissorEvento;
    }

    /**
     * Retorna a lista de comandos cadastrados
     */
    getComandos() {
        return this.#comandos;
    }
}