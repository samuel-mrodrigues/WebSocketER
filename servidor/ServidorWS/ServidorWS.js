import { WebSocketServer } from "ws"
import { ClienteConectado } from "./ClienteWS/ClienteWS.js";
import { EmissorDeEvento } from "../../utils/EmissorDeEvento.js";

import { WebSocketERServidor } from "../WebSocketERServidor.js";

import * as TipagemServidorWS from "./Tipagem.js";

export class ServidorWS {

    /**
     * Instancia do WebSocketER que gerencia esse servidor
     * @type {WebSocketERServidor}
     */
    #websocketERInstancia

    /**
     * Instancia do servidor WebSocket que recebe as conexões
     * @type {WebSocketServer}
     */
    #servidorWebsocket;

    /**
     * Clientes que possuem conexão no WebSocket
     * @type {ClienteConectado[]}
     */
    #clientes = []

    /**
     * Estado atual do servidor
     */
    #estado = {
        /**
         * Se o WebSocket está aberto.
         */
        isConectado: false
    }

    /**
     * Configurações do servidor
     */
    #configuracoes = {
        /**
         * Porta para abrir o servidor
         */
        porta: 5005
    }

    /**
     * Instanciar um novo servidor WebSocket
     * @param {WebSocketERServidor} instanciaWebSocketER - Instancai WebSocket de comandos que este servidor pertence
     * @param {Object} propriedades - Propriedades da conexão
     * @param {Number} propriedades.porta - Porta para abrir o servidor
     */
    constructor(instanciaWebSocketER, propriedades) {
        this.#websocketERInstancia = instanciaWebSocketER;
        if (propriedades != undefined) {
            if (propriedades.porta != undefined && !isNaN(propriedades.porta)) {
                this.#configuracoes.porta = propriedades.porta;
            }
        }
    }

    /**
     * Abrir o servidor WebSocket para escutar por clientes
     * @returns {Promise<TipagemServidorWS.PromiseAbrirWebSocket>}
     */
    async abrirWebSocket() {
        const novoServidor = new WebSocketServer({ port: this.#configuracoes.porta });

        novoServidor.on('connection', (socket, requisicao) => {

            const novoCliente = new ClienteConectado(this, socket);
            this.#clientes.push(novoCliente);

            this.#websocketERInstancia.getEmissorEventos().disparaEvento('cliente-conectado', novoCliente);
        })

        this.#servidorWebsocket = novoServidor;

        return new Promise((resolve) => {
            /**
             * @type {TipagemServidorWS.PromiseAbrirWebSocket}
             */
            const estadoAbrir = {
                sucesso: false,
                porta: -1
            }

            novoServidor.on('close', () => {
                this.#estado.isConectado = false;
                resolve(estadoAbrir);
            })

            novoServidor.on('error', (erro) => {
            })

            novoServidor.on('listening', () => {
                this.#estado.isConectado = true;

                estadoAbrir.sucesso = true;
                estadoAbrir.porta = this.#configuracoes.porta;
                resolve(estadoAbrir);
            });
        })
    }

    /**
     * Retorna os comandos cadastrados
     */
    getComandosCadastrados() {
        return this.#websocketERInstancia.getComandos();
    }
}