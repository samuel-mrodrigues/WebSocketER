import { ClienteWebSocketER } from "./cliente/ClienteWebSocketER.js";
import fs from "fs"
import path from "path"
import { pausar } from "./utils/EmissorDeEvento.js";

export async function iniciarCliente() {
    console.log(`Iniciando teste cliente...`);

    const clienteWs = new ClienteWebSocketER('localhost', '5005');
    clienteWs.cadastrarComando('ping', () => {
        return 'pong'
    })

    clienteWs.cadastrarComando('reflexo', (solicitacao, transmissao) => {
        return solicitacao.payload;
    })

    // Cadastrar um comando que envia um arquivo solicitado
    clienteWs.cadastrarComando('solicita_arquivo_computador', async (solicitacao, transmissao) => {
        const retornoComando = {
            sucesso: false,
            arquivo: {
                caminhos: {
                    nomeSemExtensao: '',
                    nomeComExtensao: '',
                    diretorio: '',
                    diretorioCompleto: ''
                },
                conteudoBase64: ''
            },
            erro: {
                isCaminhoNaoExiste: false,
                isCaminhoNaoEArquivo: false
            }
        }
        const caminhoSolicitado = solicitacao.payload.caminho;
        if (!fs.existsSync(caminhoSolicitado)) {
            retornoComando.erro.isCaminhoNaoExiste = true;
            return retornoComando;
        }

        console.log(`Servidor solicitou leitura de arquivo ${caminhoSolicitado}`);

        const statCaminho = fs.statSync(caminhoSolicitado);
        if (statCaminho.isDirectory()) {
            retornoComando.erro.isCaminhoNaoEArquivo = true;
            return retornoComando;
        }

        // Se for um arquivo.
        retornoComando.arquivo.caminhos = {
            ...retornoComando.arquivo.caminhos,
            nomeSemExtensao: path.basename(caminhoSolicitado, path.extname(caminhoSolicitado)),
            nomeComExtensao: path.basename(caminhoSolicitado),
            diretorio: path.dirname(caminhoSolicitado),
            diretorioCompleto: caminhoSolicitado
        }

        console.log(`Criando buffer de leitura..`);
        const bufferDeLeitura = fs.createReadStream(caminhoSolicitado, { highWaterMark: 1 * 1024 * 1024 });
        let bufferDoArquivo = Buffer.alloc(statCaminho.size);

        let offset = 0; // Contador de offset no bufferDoArquivo

        // A cada 1MB lido de dados
        bufferDeLeitura.on('data', async (bufferdata) => {
            console.log(`Lido ${bufferdata.length} bytes do arquivo`);
            bufferdata.copy(bufferDoArquivo, offset)

            offset += bufferdata.length;
        })

        return new Promise((resolve) => {
            bufferDeLeitura.on('end', () => {
                console.log(`Leitura finalizada com sucesso`);
                retornoComando.arquivo.conteudoBase64 = bufferDoArquivo.toString('base64');
                retornoComando.sucesso = true;
                resolve(retornoComando);
            });
        })
    });

    const statusConecta = await clienteWs.conectar();

    if (!statusConecta.sucesso) {
        console.log(`Sem sucesso ao conectar-se ao servidor`);
        return;
    }

    console.log(`Cliente conectado`);
}