import { WebSocket } from "ws"

import * as Tipagem from './Tipagem.js'
import * as TipagemCliente from "../comunicacao/Tipagem.js";


import { ClienteWS } from "../comunicacao/Cliente.js";
import { EmissorDeEvento } from "../utils/EmissorDeEvento.js";

export class ClienteWebSocketER extends ClienteWS {

    /**
     * Conexão com o servidor WebSocket
     * @type {WebSocket}
     */
    #conexaoWebSocket;

    /**
     * Parametros de configuração
     */
    #parametros = {
        host: '',
        porta: ''
    }

    /**
     * Estado atual da cliente
     */
    #estado = {
        /**
         * Se a conexão com o servidor está estabelecida
         */
        isConectado: false
    }

    /**
     * @type {TipagemCliente.Comando[]}
     */
    #comandos = []

    #emissorEventos = new EmissorDeEvento('Cliente');


    /**
     * Iniciar a conexão com um servidor WebSocketER
     * @param {String} host - Endereço do servidor
     * @param {Number} porta - Porta
     */
    constructor(host, porta) {
        super();

        this.#parametros.host = host;
        this.#parametros.porta = porta;

        // Quando o servidor quiser enviar uma mensagem para o cliente
        this.getEmissorEventos().addEvento('enviar-mensagem', (webSocketMensagem) => {
            this.processaEnviarMensagemServidor(webSocketMensagem);
        })

        this.getComandos = () => {
            return this.#comandos;
        }

        this.executorDeComando = async (solicitacao, transmissao) => {
            return await this.#processarExecucaoComando(solicitacao, transmissao);
        }
    }

    /**
     * Conectar ao servidor WebSocketER
     * @return {Promise<Tipagem.PromiseConectarWebSocketER>}
     */
    async conectar() {
        /**
         * @type {Tipagem.PromiseConectarWebSocketER}
         */
        const retornoConectar = {
            sucesso: false,
            porta: -1
        }

        const novaConexao = new WebSocket(`ws://${this.#parametros.host}:${this.#parametros.porta}`)
        novaConexao.on('message', (mensagemBuffer) => {
            this.processaMensagemWebSocket(mensagemBuffer);
        })

        novaConexao.on('close', (codigo, razao) => {
            this.getEmissorEventos().disparaEvento('desconectado', codigo, razao);
        })

        this.#conexaoWebSocket = novaConexao;

        return new Promise(resolve => {
            novaConexao.on('close', (codigo) => {
                this.#estado.isConectado = false;
                resolve(retornoConectar);
            });

            novaConexao.on('error', (erro) => {
            });

            novaConexao.on('open', () => {
                this.#estado.isConectado = true;
                retornoConectar.sucesso = true;
                retornoConectar.porta = this.#parametros.porta;
                resolve(retornoConectar);
            });
        })
    }

    /**
     * Adicionar um novo comando para ser executado
     * @param {String} comando - Nome do comando
     * @param {Tipagem.CallbackExecutarComando} callback - Função a ser executada quando o comando for solicitado
     */
    cadastrarComando(comando, callback) {
        /**
         * @type {TipagemCliente.Comando}
         */
        const novoComando = {
            comando: comando,
            callback: callback
        }

        this.#comandos.push(novoComando);
    }

    /**
     * Realiza a ação de enviar mensagem ao cliente conectado no servidor
     * @param {TipagemCliente.WebSocketMensagem} webSocketMensagem
     */
    processaEnviarMensagemServidor(webSocketMensagem) {
        this.#conexaoWebSocket.send(JSON.stringify(webSocketMensagem));
    }


    /**
     * Processar uma execução de um comando
     * @param {TipagemCliente.SolicitaComando} solicitacao
     * @param {TipagemCliente.TransmissaoWebSocket} transmissao
     */
    async #processarExecucaoComando(solicitacao, transmissao) {
        const comandoSolicitado = this.#comandos.find(comando => comando.comando === solicitacao.comando);

        if (comandoSolicitado != undefined) {
            return await comandoSolicitado.callback(solicitacao, transmissao);
        } else {
            return;
        }
    }
}