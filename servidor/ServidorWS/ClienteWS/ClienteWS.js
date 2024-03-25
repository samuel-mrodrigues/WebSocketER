import { ServidorWS } from "../ServidorWS.js";
import { WebSocket } from "ws";
import { validate as validaUUID } from "uuid"

import * as TipagemClienteWS from "./Tipagem.js";

import { EmissorDeEvento } from "../../../utils/EmissorDeEvento.js";
import { copiarParaObjeto } from "../../../utils/utils.js";

export class ClienteWS {

    /**
     * Instancia do Servidor WebSocket que esse cliente pertence
     * @type {ServidorWS}
     */
    #instanciaServidorWS;

    /**
     * Instancia do Socket que é a conexão fisica com o dispositivo final
     * @type {WebSocket}
     */
    #instanciaSocket;

    #emissorEventos = new EmissorDeEvento('Cliente');

    /**
     * Instanciar um novo cliente
     * @param {ServidorWS} servidor - Servidor Websocket para vincular 
     * @param {WebSocket} socket - Socket para comunicação com o dispositivo cliente
     */
    constructor(servidor, socket) {

        this.#instanciaServidorWS = servidor;
        this.#instanciaSocket = socket;

        this.#cadastrarListeners();
    }

    /**
     * Cadastra os listeners do websocket para receber todos os tipos de eventos
     */
    #cadastrarListeners() {
        this.#instanciaSocket.on('message', (mensagem) => {
            this.#processaMensagemWebSocket(mensagem);
        })

        this.#instanciaSocket.on('close', () => {
        })

        this.#instanciaSocket.on('error', (erro) => {
        })

        this.#instanciaSocket.on('headers', (headers, requisicao) => {
        })

        this.#instanciaSocket.on('ping', () => {
        })

        this.#instanciaSocket.on('pong', () => {
        })

        this.#instanciaSocket.on('unexpected-response', () => {
        })

        this.#instanciaSocket.on('upgrade', (requisicao) => {
        })
    }

    /**
     * Retorna uma transmissão vazia
     * @param {'responde_comando' | 'solicita_comando' | 'transmissao_invalida'} tipo - Filtrar os campos do objeto retornado
     */
    #getTemplateDeTransmissao(tipo) {
        /**
          * @type {TipagemClienteWS.TransmissaoWebSocket}
          */
        let transmissao = {
            id: '',
            tipo: '',
            responde_comando: {
                solicitacao: {
                    comando: {
                        comando: '',
                        payload: {}
                    },
                    idTransmissaoComando: 0
                },
                resposta: {
                    sucesso: false,
                    payload: '',
                    erro: {
                        isComandoNaoExiste: false,
                        isErroExecucaoComando: false,
                        erroExecucaoComando: {
                            descricao: ''
                        }
                    }
                }
            },
            solicita_comando: {
                comando: '',
                payload: ''
            },
            transmissao_invalida: {
                erro: {
                    isJSONInvalido: false,
                    isIdInvalido: false,
                    isTipoInvalido: false,
                    isErroFaltandoTipoCorpo: false
                },
                mensagem: ''
            }
        }

        if (tipo != undefined) {
            switch (tipo) {
                case 'responde_comando': {
                    transmissao.solicita_comando = undefined;
                    transmissao.transmissao_invalida = undefined;
                    transmissao.transmissao_recebida = undefined;
                    break;
                }
                case 'solicita_comando': {
                    transmissao.responde_comando = undefined;
                    transmissao.transmissao_invalida = undefined;
                    transmissao.transmissao_recebida = undefined;
                    break;
                }
                case 'transmissao_invalida': {
                    transmissao.responde_comando = undefined;
                    transmissao.solicita_comando = undefined;
                    transmissao.transmissao_recebida = undefined;
                    break;
                }
            }
        }

        return transmissao;
    }

    /**
     * Enviar uma transmissão ao cliente
     * @param {TipagemClienteWS.TransmissaoWebSocket} transmissao 
     */
    #enviarTransmissao(transmissao) {
        this.#instanciaSocket.send(JSON.stringify(transmissao));
    }

    /**
     * Processar uma mensagem recebida do cliente
     * @param {import("ws").RawData} mensagem - Dados brutos recebidos via WebSocket
     */
    #processaMensagemWebSocket(mensagem) {
        const transmissaoRecebida = this.#getTemplateDeTransmissao();

        // Preparar uma transmissão para devolver caso a transmissão seja inválida
        const transmissaoParaDevolver = this.#getTemplateDeTransmissao();
        transmissaoParaDevolver.id = this.#instanciaServidorWS.getProximoIDTransmissao();
        transmissaoParaDevolver.tipo = TipagemClienteWS.TiposDeTransmissao.TRANSMISSAO_INVALIDA;
        transmissaoParaDevolver.responde_comando = undefined;
        transmissaoParaDevolver.solicita_comando = undefined;

        try {
            const jsonDaTransmissao = JSON.parse(mensagem.toString());

            // Atribuir os dados da transmissão no objeto de transmissão
            copiarParaObjeto(transmissaoRecebida, jsonDaTransmissao);
        } catch (ex) {
            transmissaoParaDevolver.transmissao_invalida.erro.isJSONInvalido = true;
            transmissaoParaDevolver.transmissao_invalida.mensagem = `O JSON informado é invalido. Erro causado: ${ex.message}`;
            this.#enviarTransmissao(transmissaoParaDevolver);
            return;
        }

        // ID da transmissão inválido
        if (!validaUUID(transmissaoRecebida.id)) {
            transmissaoParaDevolver.transmissao_invalida.erro.isIdInvalido = true;
            transmissaoParaDevolver.transmissao_invalida.mensagem = 'ID da transmissão inválido';
            this.#enviarTransmissao(transmissaoParaDevolver);
            return;
        }

        // Verificar qual o tipo de transmissão
        switch (transmissaoRecebida.tipo) {
            // Recebendo a solicitação de comando para o servidor
            case TipagemClienteWS.TiposDeTransmissao.SOLICITA_COMANDO: {

                // Não especificado o corpo da solicitação de comando
                if (transmissaoRecebida.solicita_comando == undefined || typeof transmissaoRecebida.solicita_comando != 'object') {
                    transmissaoParaDevolver.transmissao_invalida.erro.isErroFaltandoTipoCorpo = true;
                    transmissaoParaDevolver.transmissao_invalida.mensagem = `Corpo da solicitação de comando inválido, esperado uma chave 'soliciata_comando' com os dados do comando`
                    this.#enviarTransmissao(transmissaoParaDevolver);
                    return;
                }

                // Não especificado o comando desejado
                if (transmissaoRecebida.solicita_comando.comando == undefined || transmissaoRecebida.solicita_comando.comando == '') {
                    transmissaoParaDevolver.transmissao_invalida.erro.isErroFaltandoDadosDoCorpo = true;
                    transmissaoParaDevolver.transmissao_invalida.mensagem = `O comando solicitado não foi especificado com a chave 'comando'`
                    this.#enviarTransmissao(transmissaoParaDevolver);
                    return;
                }

                // Nenhum payload, definir como vazio
                if (transmissaoRecebida.solicita_comando.payload == undefined) {
                    transmissaoRecebida.solicita_comando.payload = '';
                }

                this.#processarComandoSolicitado(transmissaoRecebida.solicita_comando, transmissaoRecebida);
                break;
            }
            // Recebendo a resposta de um cliente
            case TipagemClienteWS.TiposDeTransmissao.RESPONDE_COMANDO: {

                // Corpo da resposta não especificado
                if (transmissaoRecebida.responde_comando == undefined || typeof transmissaoRecebida.responde_comando != 'object') {
                    transmissaoParaDevolver.transmissao_invalida.erro.isErroFaltandoTipoCorpo = true;
                    transmissaoParaDevolver.transmissao_invalida.mensagem = `Corpo da resposta de comando inválido, esperado uma chave 'responde_comando' com os dados da resposta`
                    this.#enviarTransmissao(transmissaoParaDevolver);
                    return;
                }

                // Solicitação do comando inicial não especificado 
                if (transmissaoRecebida.responde_comando.solicitacao == undefined || typeof transmissaoRecebida.responde_comando.solicitacao != 'object') {
                    transmissaoParaDevolver.transmissao_invalida.erro.isErroFaltandoDadosDoCorpo = true;
                    transmissaoParaDevolver.transmissao_invalida.mensagem = `Dados da solicitação do comando não especificados`
                    this.#enviarTransmissao(transmissaoParaDevolver);
                    return;
                } else {

                    // ID da transmissão original da resposta não é valido
                    if (!validaUUID(transmissaoRecebida.responde_comando.solicitacao.idTransmissaoComando)) {
                        transmissaoParaDevolver.transmissao_invalida.erro.isErroFaltandoDadosDoCorpo = true;
                        transmissaoParaDevolver.transmissao_invalida.mensagem = `ID da transmissão original ${transmissaoRecebida.responde_comando.solicitacao.idTransmissaoComando} não é valido`
                        this.#enviarTransmissao(transmissaoParaDevolver);
                        return;
                    }
                }

                // Resposta do comando não especificado
                if (transmissaoRecebida.responde_comando.resposta == undefined || typeof transmissaoRecebida.responde_comando.resposta != 'object') {
                    transmissaoParaDevolver.transmissao_invalida.erro.isErroFaltandoDadosDoCorpo = true;
                    transmissaoParaDevolver.transmissao_invalida.mensagem = `Dados da resposta do comando não especificados`
                    this.#enviarTransmissao(transmissaoParaDevolver);
                    return;
                } else {

                    // Se o status de sucesso da resposta não estiver presente
                    if (transmissaoRecebida.responde_comando.resposta.sucesso == undefined) {
                        transmissaoParaDevolver.transmissao_invalida.erro.isErroFaltandoDadosDoCorpo = true;
                        transmissaoParaDevolver.transmissao_invalida.mensagem = `A chave 'sucesso' não foi especificada na resposta do comando`
                        this.#enviarTransmissao(transmissaoParaDevolver);
                        return;
                    }
                }

                // Se tudo estiver certo, notificar o servidor que uma resposta foi recebida
                this.#emissorEventos.disparaEvento(`comando-respondido-${transmissaoRecebida.responde_comando.solicitacao.idTransmissaoComando}`, transmissaoRecebida.responde_comando, transmissaoRecebida);
                break;
            }
            case TipagemClienteWS.TiposDeTransmissao.TRANSMISSAO_INVALIDA: {

                if (transmissaoRecebida.transmissao_invalida == undefined || typeof transmissaoRecebida.transmissao_invalida != 'object') {
                    return;
                }

                // Recebido uma transmissão inválida
                break;
            }
            default: {
                console.error(`Tipo de transmissão inválido: ${transmissaoRecebida.tipo}`);

                // transmissaoParaDevolver.transmissao_invalida.erro.isTipoInvalido = true;
                // transmissaoParaDevolver.transmissao_invalida.mensagem = `Tipo de transmissão inválido: ${transmissaoRecebida.tipo}`;
                // this.#enviarTransmissao(transmissaoParaDevolver);
                break;
            }
        }

    }

    /**
     * Processar um comando solicitado por um cliente
     * @param {TipagemClienteWS.SolicitaComando} comando - Comando solicitado
     * @param {TipagemClienteWS.TransmissaoWebSocket} transmissao - Transmissão original recebida
     */
    async #processarComandoSolicitado(comando, transmissao) {

        /**
         * Preparar a transmissão de resposta
         * @type {TipagemClienteWS.TransmissaoWebSocket}
         */
        const respostaTransmissao = this.#getTemplateDeTransmissao();
        respostaTransmissao.solicita_comando = undefined;
        respostaTransmissao.transmissao_invalida = undefined;

        respostaTransmissao.id = this.#instanciaServidorWS.getProximoIDTransmissao();
        respostaTransmissao.tipo = TipagemClienteWS.TiposDeTransmissao.RESPONDE_COMANDO;
        respostaTransmissao.responde_comando = {
            solicitacao: {
                comando: comando,
                idTransmissaoComando: transmissao.id
            },
            resposta: {
                sucesso: false,
                payload: {},
                erro: {
                    isComandoNaoExiste: false,
                    isErroExecucaoComando: false,
                    erroExecucaoComando: {
                        descricao: ''
                    }
                }
            }
        }

        // Validar se existe o comando solicitado
        const comandoEncontrado = this.#instanciaServidorWS.getComandosCadastrados().find(comandoObj => comandoObj.comando == comando.comando);
        if (comandoEncontrado == undefined) {
            respostaTransmissao.responde_comando.resposta.erro.isComandoNaoExiste = true;

            this.#enviarTransmissao(respostaTransmissao);
            return;
        }

        let respostaDaExecucao = {};

        // Se o comando existir, processar a execução dele
        try {
            respostaDaExecucao = await comandoEncontrado.callback(this, comando, transmissao);
        } catch (ex) {
            respostaTransmissao.responde_comando.resposta.erro.isErroExecucaoComando = true;
            respostaTransmissao.responde_comando.resposta.erro.erroExecucaoComando.descricao = ex.message;

            this.#enviarTransmissao(respostaTransmissao);
            return;
        }

        // Se o comando processou com sucesso, retornar a resposta;
        respostaTransmissao.responde_comando.resposta.sucesso = true;
        respostaTransmissao.responde_comando.resposta.payload = respostaDaExecucao;
        respostaTransmissao.responde_comando.resposta.erro = undefined;

        this.#enviarTransmissao(respostaTransmissao);
    }

    /**
     * Enviar a execução de um comando no cliente
     * @param {String} comando - Comando
     * @param {*} payload - Algum payload adicional
     * @returns {Promise<TipagemClienteWS.PromiseEnviarComando>}
     */
    async enviarComando(comando, payload) {
        /**
         * Estado do comando retornado
         * @type {TipagemClienteWS.PromiseEnviarComando}
         */
        const retornoComando = {
            sucesso: false,
            retorno: {
                payload: {},
            },
            transmissoes: {
                solicitacao: {
                    idTransmissao: '',
                    comando: {
                        nome: '',
                        payload: {}
                    }
                },
                resposta: {
                    idTransmissao: ''
                }
            },
            erro: {
                isComandoNaoExiste: false,
                isErroExecucaoComando: false,
                erroExecucaoComando: {
                    descricao: ''
                },
                isDemorouResponder: false
            }
        }

        const novaTransmissao = this.#getTemplateDeTransmissao();
        novaTransmissao.id = this.#instanciaServidorWS.getProximoIDTransmissao();
        novaTransmissao.tipo = TipagemClienteWS.TiposDeTransmissao.SOLICITA_COMANDO;
        novaTransmissao.responde_comando = undefined;
        novaTransmissao.transmissao_invalida = undefined;

        novaTransmissao.solicita_comando = {
            comando: comando,
            payload: payload
        }

        retornoComando.transmissoes.solicitacao = {
            ...retornoComando.transmissoes.solicitacao,
            comando: {
                nome: comando,
                payload: payload
            },
            idTransmissao: novaTransmissao.id
        }

        return new Promise((resolve) => {
            const eventoComandoRespondido = this.#emissorEventos.addEvento(`comando-respondido-${novaTransmissao.id}`,
                /**
                 * Escutar a resposta quando ela chegar
                 * @param {TipagemClienteWS.RespondeComando} respostaComando 
                 * @param {TipagemClienteWS.TransmissaoWebSocket} transmissao 
                 */
                async (respostaComando, transmissao) => {
                    // Cliente devolveu alguma resposta

                    // Anexar o ID da transmissão da resposta
                    retornoComando.transmissoes.resposta.idTransmissao = transmissao.id;
                    if (respostaComando.resposta.sucesso) {
                        retornoComando.sucesso = true;
                        retornoComando.retorno.payload = respostaComando.resposta.payload;
                    } else {
                        // Ocorreu algum erro na execução do comando

                        if (respostaComando.resposta.erro.isComandoNaoExiste) {
                            retornoComando.erro.isComandoNaoExiste = true;
                        } else if (respostaComando.resposta.erro.isErroExecucaoComando) {
                            retornoComando.erro.isErroExecucaoComando = true;
                            retornoComando.erro.erroExecucaoComando.descricao = respostaComando.resposta.erro.erroExecucaoComando.descricao;
                        }
                    }

                    resolve(retornoComando);
                }, {
                excluirAposExecutar: true,
                expirarAposMs: {
                    expirarAposMs: 99999999,
                    // Cliente demorou para responder
                    callback: () => {
                        retornoComando.erro.isDemorouResponder = true;
                        resolve(retornoComando);
                    }
                }
            });

            this.#enviarTransmissao(novaTransmissao);
        })
    }
}   