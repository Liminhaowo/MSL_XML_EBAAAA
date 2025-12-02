import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { parseStringPromise, Builder } from "xml2js";

const app = express();
app.use(cors());
app.use(bodyParser.text({ type: "*/*" }));

const jsonParaXml = (obj, root = "response") => {
  const builder = new Builder({
    rootName: root,
    xmldec: { version: "1.0", encoding: "UTF-8" },
  });
  return builder.buildObject(obj);
};

let clientes = [];
let idClientes = 1;

let compras = [];
let idCompras = 1;

app.get("/", (req, res) => {
  const mensagem = {
    message: "Hello World: Servidor XML funcionando",
    autor: "Vitor Lima",
    linguagem: "XML",
  };
  res.type("application/xml").send(jsonParaXml(mensagem));
});

app.post("/clientes", async (req, res) => {
  try {
    const xmlDados = await parseStringPromise(req.body);
    const cliente = xmlDados?.cliente || {};

    const nome = cliente.nome?.[0];
    const email = cliente.email?.[0];

    const novoCliente = {
      id: idClientes++,
      nome,
      email,
    };

    clientes.push(novoCliente);

    res
      .type("application/xml")
      .send(
        jsonParaXml({ message: "Cliente cadastrado", cliente: novoCliente })
      );
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .type("application/xml")
      .send(jsonParaXml({ error: "XML inválido" }));
  }
});

app.get("/clientes", (req, res) => {
  res
    .type("application/xml")
    .send(jsonParaXml({ clientes: { cliente: clientes } }));
});

app.post("/compras", async (req, res) => {
  try {
    const xmlData = await parseStringPromise(req.body);
    const compra = xmlData?.compra || {};

    const produto = compra.produto?.[0];
    const valor = compra.valor?.[0];
    const clienteId = Number(compra.clienteId?.[0]);

    const cliente = clientes.find((c) => c.id === clienteId);

    if (!cliente) {
      return res
        .status(404)
        .type("application/xml")
        .send(jsonParaXml({ error: "Cliente não encontrado" }));
    }

    const novaCompra = { id: idCompras++, produto, valor, clienteId };
    compras.push(novaCompra);

    res
      .status(201)
      .type("application/xml")
      .send(
        jsonParaXml({
          message: "Compra cadastrada com sucesso",
          compra: novaCompra,
        })
      );
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .type("application/xml")
      .send(jsonParaXml({ error: "XML inválido" }));
  }
});

app.get("/compras", (requisicao, resposta) => {
  resposta.type("application/xml").send(jsonParaXml({ compras: { compras } }));
});

const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
