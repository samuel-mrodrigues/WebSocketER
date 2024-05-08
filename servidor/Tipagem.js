import { ClienteConectado } from "./ServidorWS/ClienteWS/ClienteWS.js";

/**
 * @callback OnClienteConectado - Uma função a ser executada quando um novo cliente se conecta ao servidor
 * @param {ClienteConectado} cliente - Cliente que se conectou
 */

/**
 * @callback CallbackExecutarComando - Uma função a ser executada quando o comando for solicitado
 * @param {ClienteWS} cliente - Cliente que solicitou o comando
 * @param {TipagemCliente.SolicitaComando} solicitacao - A solicitação de comando
 * @param {TipagemCliente.TransmissaoWebSocket} transmissao - Transmissão original recebida
 */

export const a = 1;
