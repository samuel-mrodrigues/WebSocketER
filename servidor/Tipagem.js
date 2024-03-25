import { ClienteWS } from "./ServidorWS/ClienteWS/ClienteWS.js";
import * as TipagensClienteWS from "./ServidorWS/ClienteWS/Tipagem.js";
import * as TipagensServidorWS from "./ServidorWS/Tipagem.js";

/**
 * @typedef Comando - Um comando que pode ser solicitado por clientes
 * @property {String} comando - Nome do comando
 * @property {CallbackExecutarComando} callback - Função a ser executada quando o comando for solicitado
 */

/**
 * @callback CallbackExecutarComando - Uma função a ser executada quando o comando for solicitado
 * @param {ClienteWS} cliente - Cliente que solicitou o comando
 * @param {TipagensClienteWS.SolicitaComando} solicitacao - A solicitação de comando
 * @param {TipagensClienteWS.TransmissaoWebSocket} transmissao - Transmissão original recebida
 */

/**
 * @callback OnClienteConectado - Uma função a ser executada quando um novo cliente se conecta ao servidor
 * @param {ClienteWS} cliente - Cliente que se conectou
 */

export const a = 1;