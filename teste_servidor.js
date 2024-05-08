import { WebSocketERServidor } from "./servidor/WebSocketERServidor.js";
import { createServer } from "http"
import fs from "fs";

async function testarServidor() {
    console.log(`Iniciando testes`);

    const servidorWs = new WebSocketERServidor({ porta: 5005 });
    servidorWs.onClienteConectado(async (cliente) => {
        console.log(`Novo cliente foi conectado ao servidor.`);

        cliente.onClienteDesconectado((codigo, razao) => {
            console.log(`O cliente foi desconectado do servidor. Código: ${codigo}, razao: ${razao}`);
        })

        console.log(`Segue os headers recebidos:`);
        console.log(cliente.headersRecebidos);

    });

    const statusAbreServidor = await servidorWs.iniciarServidor();
}

testarServidor();

// export async function iniciarServidor() {
//     console.log(`Iniciando teste servidor...`);

//     const servidorWs = new WebSocketERServidor(5005);

//     // Comando de ping
//     servidorWs.adicionadComando('ping', (cliente, solicitacao, transmissao) => {
//         return 'pong'
//     })

//     // Comando que devolve exatamente ao cliente o payload que ele enviar
//     servidorWs.adicionadComando('reflexo', (cliente, solicitacao, transmissao) => {

//         return solicitacao.payload
//     });

//     // Quando um novo cliente se conectar
//     servidorWs.onClienteConectado(async (cliente) => {
//         console.log(`Novo cliente se conectou ao servidor.`);

//         const copiarArquivo = async (origemRemota, destinoLocal) => {
//             console.log(`Executando copia de arquivo remoto ${origemRemota} para destino local ${destinoLocal}`);

//             // Executar um comando de transferir arquivo só pra testar
//             const leArquivo = await cliente.enviarComando('solicita_arquivo_computador', { caminho: origemRemota })

//             // O comando não alcançou o cliente
//             if (!leArquivo.sucesso) {
//                 console.log(`Erro ao solicitar execução do arquivo. Erros: ${JSON.stringify(leArquivo.erro)}`);
//                 return;
//             }

//             // Se o comando foi sucesso, o cliente deve ter retornado o payload do comando

//             // Payload customizado customizado no lado do cliente
//             if (leArquivo.retorno.payload.sucesso) {

//                 const payloadRetorno = leArquivo.retorno.payload;
//                 const bufferRecebidoBytes = Buffer.from(payloadRetorno.arquivo.conteudoBase64, 'base64');

//                 // Gravar arquivo pra testar
//                 fs.writeFileSync(destinoLocal, bufferRecebidoBytes);
//                 console.log(`O arquivo foi gravado com sucesso.`);
//             } else {
//                 console.log(`Erro ao solicitar execução do arquivo. Erros: ${JSON.stringify(leArquivo.retorno.payload.erro)}`);
//             }
//         }

//         // Copia um video
//         copiarArquivo("E:\\Downloads\\kuraika.png", 'C:\\Users\\samuk\\Desktop\\ja podeh excluir\\kurapika fodao.png');
//         copiarArquivo("E:\\Downloads\\Bôa - Duvet  (Slowed + Reverb).mp4", 'C:\\Users\\samuk\\Desktop\\ja podeh excluir\\AND YOU DONT UNDEERSTAAAAND.mp4');
//         copiarArquivo("E:\\Downloads\\SamsungDeXSetupWin.exe", 'C:\\Users\\samuk\\Desktop\\ja podeh excluir\\instalador dex.exe');
//         copiarArquivo("E:\\Downloads\\Orange3-3.32.0-Miniconda-x86_64.exe", 'C:\\Users\\samuk\\Desktop\\ja podeh excluir\\laranjo kkkkk.exe');
//     })

//     const statusAbreWs = await servidorWs.iniciarServidor();
//     if (statusAbreWs.sucesso) {
//         console.log(`Servidor aberto na porta ${statusAbreWs.porta}`);
//     } else {
//         console.log(`Não foi possível realizar a abertura do servidor.`);
//     }
// }