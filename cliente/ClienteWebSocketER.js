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
     * Comandos disponiveis no cliente
     * @type {TipagemCliente.Comando[]}
     */
    #comandos = []

    /**
     * Emissor de eventos do Cliente
     */
    #emissorEventos = new EmissorDeEvento('Cliente');

    /**
     * Headers opcionais que são enviados junto na requisição
     * @type {{nome: String, valor: String}[]}
     */
    #headers = []


    /**
     * Iniciar a conexão com um servidor WebSocketER
     * @param {String} host - Endereço do servidor
     * @param {{nome: String, valor: String}[]} headers - Headers opcionais para enviar na conexão com o servidor WebSocketER
     */
    constructor(host, headers) {
        super();

        this.#parametros.host = host;

        if (headers != undefined && Array.isArray(headers)) {
            this.#headers = headers;
        }

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
        }

        let headersParaEnviar = {};
        for (const headerObj of this.#headers) {
            headersParaEnviar[headerObj.nome] = headerObj.valor;
        }

        const novaConexao = new WebSocket(`ws://${this.#parametros.host}`, { headers: headersParaEnviar })
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
                resolve(retornoConectar);
            });
        })
    }

    /**
     * Desconectar do servidor WebSocketER
     */
    desconectar() {
        this.#conexaoWebSocket.close();
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