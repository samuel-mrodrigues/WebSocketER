export const a = 1;

/**
 * @typedef PromiseConectarWebSocketER
 * @property {Boolean} sucesso - Se a conexão com o servidor WebSocket está estabelecida
 * @property {Number} porta - Se estabelecida a conexão, contém a porta sendo utilizada na conexão.
 */

/**
 * @typedef Comando - Um comando que pode ser solicitado pelo servidor
 * @property {String} comando - Nome do comando
 * @property {CallbackExecutarComando} callback - Função a ser executada quando o comando for solicitado
 */

/**
 * @callback CallbackExecutarComando - Uma função a ser executada quando o comando for solicitado
 * @param {SolicitaComando} solicitacao - A solicitação de comando
 * @param {TransmissaoWebSocket} transmissao - Transmissão original recebida
 */

export const TiposDeTransmissao = {
    SOLICITA_COMANDO: 'solicita_comando',
    RESPONDE_COMANDO: 'responde_comando',
    TRANSMISSAO_INVALIDA: 'transmissao_invalida'
}

/**
 * @typedef TransmissaoWebSocketInvalida - Uma transmissão que não é valida
 * @property {String} mensagem - Mensagem para devolver  
 * @property {Object} erro - Erro da transmissão não ser valida
 * @property {Boolean} erro.isJSONInvalido - Se o JSON da transmissão é inválido
 * @property {Boolean} erro.isIdInvalido - Se o ID da transmissão é inválido
 * @property {Boolean} erro.isTipoInvalido - Tipo da transmissão é inválido
 * @property {Boolean} erro.isErroFaltandoTipoCorpo - Corpo dos dados do tipo informado é invalido
 * @property {Boolean} erro.isErroFaltandoDadosDoCorpo - Tipo do corpo foi informado, porém está faltando informações importantes nele
 */

/**
 * @typedef SolicitaComando - Solicitação de um comando
 * @property {String} comando - O comando solicitado
 * @property {Any} payload - Payload customizado do comando
 */

/**
 * @typedef RespondeComando - Resposta de um comando
 * @property {Object} solicitacao - Informações da solicitação que gerou essa resposta
 * @property {SolicitaComando} solicitacao.comando - Comando original que essa resposta está respondendo
 * @property {Number} solicitacao.idTransmissaoComando - ID da transmissão original que foi enviada com o comando
 * @property {Object} resposta - Resposta do comando solicitado
 * @property {Boolean} resposta.sucesso - Se a execução do comando foi bem sucedida
 * @property {Any} resposta.payload - Qualquer payload para enviar com a resposta
 * @property {Object} resposta.erro - Se a execução do comando falhou, contém detalhes do erro
 * @property {Boolean} resposta.erro.isComandoNaoExiste - Se o comando solicitado não existe
 * @property {Boolean} resposta.erro.isErroExecucaoComando - O servidor retornou um erro ao executar o comando
 * @property {Object} resposta.erro.erroExecucaoComando - Se o erro for de execução de comando, contém detalhes do erro
 * @property {String} resposta.erro.erroExecucaoComando.descricao - Descrição do erro pego no try-catch
 */

/**
 * @typedef TransmissaoWebSocket - A transmissão de dados entre cliente e servidor
 * @property {String} id - Identificador da transmissão único (UUID de 36 caracteres)
 * @property {TiposDeTransmissao} tipo - O tipo da transmissão
 * @property {SolicitaComando} solicita_comando - Se o tipo da transmissão for a solicitação de um comando, contém os detalhes do comando
 * @property {RespondeComando} responde_comando - Se o tipo da transmissão for uma resposta de um comando, contém os detalhes da resposta
 * @property {TransmissaoWebSocketInvalida} transmissao_invalida - Se a transmissão for inválida, contém detalhes do erro
 */

/**
 * @typedef PromiseEnviarComando - Promise que é resolvida quando o comando solicitado for executado
 * @property {Boolean} sucesso - Se o comando foi executado com sucesso
 * @property {Object} retorno - Se o comando foi executado, contém a resposta do comando
 * @property {Object} retorno.payload - Payload retornado da execução do comando pelo servidor
 * @property {Object} transmissoes - Detalhes das transmissões envolvidas na execução do comando
 * @property {Object} transmissoes.solicitacao - Detalhes da transmissão de solicitação do comando
 * @property {String} transmissoes.solicitacao.idTransmissao - ID da transmissão original que solicitou o comando
 * @property {Object} transmissoes.solicitacao.comando - Detalhes do comando que foi solicitado
 * @property {String} transmissoes.solicitacao.comando.nome - Nome do comando que foi solicitado
 * @property {String} transmissoes.solicitacao.comando.payload - Payload que foi enviado junto com o comando
 * @property {Object} transmissoes.resposta - Detalhes da transmissão de resposta do comando(se pelo menos chegou ao servidor o comando)
 * @property {String} transmissoes.resposta.idTransmissao - ID da transmissão de resposta do comando 
 * @property {Object} erro - Se o comando falhou, contém detalhes do erro
 * @property {Boolean} erro.isComandoNaoExiste - Se o comando solicitado não existe no servidor
 * @property {Boolean} erro.isErroExecucaoComando - Se o comando solicitado falhou ao ser executado
 * @property {Object} erro.erroExecucaoComando - Se o erro foi de execução de comando, contém detalhes do erro
 * @property {String} erro.erroExecucaoComando.descricao - Descrição do erro pego no try-catch
 * @property {String} erro.isDemorouResponder - O servidor demorou demais para responder ao comando
 */