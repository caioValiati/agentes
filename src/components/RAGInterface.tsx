import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MessageSquare, Brain, Database } from "lucide-react";
import { ragService, RAGResponse } from "@/services/ragService";

export default function RAGInterface() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState<RAGResponse | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [metodoAtivo, setMetodoAtivo] = useState<"simples" | "embeddings">(
    "simples"
  );

  const exemplosPerguntas = [
    "Quais são os clientes ativos?",
    "Mostre as últimas notas fiscais.",
    "Quais são as principais classificações utilizadas?",
  ];

  const handlePerguntar = async () => {
    if (!pergunta.trim()) {
      setErro("Por favor, digite uma pergunta");
      return;
    }

    setCarregando(true);
    setErro(null);
    setResposta(null);

    try {
      let resultado: RAGResponse;

      if (metodoAtivo === "simples") {
        resultado = await ragService.perguntarRAGSimples(pergunta);
      } else {
        resultado = await ragService.perguntarRAGEmbeddings(pergunta);
      }

      if (resultado.sucesso) {
        setResposta(resultado);
      } else {
        setErro(resultado.erro || "Erro ao processar pergunta");
      }
    } catch (error) {
      setErro("Erro ao conectar com o servidor");
      console.error("Erro:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleExemploClick = (exemplo: string) => {
    setPergunta(exemplo);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader></CardHeader>
          <CardContent>
            {/* Seletor de Método */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Método de Busca:
              </label>
              <div className="flex gap-4">
                <Button
                  variant={metodoAtivo === "simples" ? "default" : "outline"}
                  onClick={() => setMetodoAtivo("simples")}
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  RAG Simples
                </Button>
                <Button
                  variant={metodoAtivo === "embeddings" ? "default" : "outline"}
                  onClick={() => setMetodoAtivo("embeddings")}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  RAG Embeddings
                </Button>
              </div>
            </div>

            {/* Campo de Pergunta */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Sua Pergunta:
              </label>
              <Textarea
                placeholder="Digite sua pergunta sobre os dados do banco..."
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                className="min-h-[100px]"
                disabled={carregando}
              />
            </div>

            {/* Exemplos de Perguntas */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Exemplos:
              </label>
              <div className="flex flex-wrap gap-2">
                {exemplosPerguntas.map((exemplo, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExemploClick(exemplo)}
                    disabled={carregando}
                    className="text-xs"
                  >
                    {exemplo}
                  </Button>
                ))}
              </div>
            </div>

            {/* Botão de Enviar */}
            <Button
              onClick={handlePerguntar}
              disabled={carregando || !pergunta.trim()}
              className="w-full"
            >
              {carregando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Perguntar
                </>
              )}
            </Button>

            {/* Mensagem de Erro */}
            {erro && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Resposta */}
        {resposta && (
          <Card>
            <CardHeader>
              <CardTitle>Resposta</CardTitle>
              <CardDescription>
                Processado com{" "}
                {metodoAtivo === "simples" ? "RAG Simples" : "RAG Embeddings"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pergunta */}
                <div>
                  <h4 className="font-semibold mb-2">Sua Pergunta:</h4>
                  <p className="text-gray-700 bg-gray-100 p-3 rounded-lg">
                    {resposta.pergunta}
                  </p>
                </div>

                {/* Resposta */}
                <div>
                  <h4 className="font-semibold mb-2">Resposta:</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-line">
                      {resposta.resposta}
                    </p>
                  </div>
                </div>

                {/* Dados Consultados (RAG Simples) */}
                {resposta.dados_consultados && (
                  <div>
                    <h4 className="font-semibold mb-2">Dados Consultados:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p className="mb-2">
                        {resposta.dados_consultados.contexto}
                      </p>
                      <p>
                        Total de registros:{" "}
                        {resposta.dados_consultados.total_registros}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dados Relevantes (RAG Embeddings) */}
                {resposta.dados_relevantes && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Dados Mais Relevantes:
                    </h4>
                    <div className="space-y-2">
                      {resposta.dados_relevantes.map((dado, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded-lg text-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p>
                                <strong>Tipo:</strong> {dado.tipo}
                              </p>
                              <p>
                                <strong>Descrição:</strong> {dado.descricao}
                              </p>
                              <p>
                                <strong>Valor:</strong> R$ {dado.valor_total}
                              </p>
                              <p>
                                <strong>Data:</strong>{" "}
                                {new Date(dado.data_emissao).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500">
                              {(dado.similaridade * 100).toFixed(1)}% similar
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500 text-right">
                  Processado em:{" "}
                  {new Date(resposta.timestamp).toLocaleString("pt-BR")}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
