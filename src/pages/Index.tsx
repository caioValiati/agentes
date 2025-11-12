import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { InvoiceResults } from "@/components/InvoiceResults";
import { analyzeInvoicePDF } from "@/services/agente1";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Zap, FileText, Brain, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setInvoiceData(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const data = await analyzeInvoicePDF(selectedFile);
      setInvoiceData(data);
      toast({
        title: "Análise concluída!",
        description: "A nota fiscal foi processada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na análise",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setInvoiceData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-card shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AgriNF Analyzer
                </h1>
                <p className="text-muted-foreground">
                  Análise inteligente de notas fiscais agrícolas
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/rag">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Consulta RAG
                </Button>
              </Link>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Brain className="h-4 w-4" />
                <span>Powered by Gemini AI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!invoiceData ? (
          <div className="max-w-2xl mx-auto space-y-8">
            <Card className="shadow-medium bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Upload da Nota Fiscal
                </CardTitle>
                <CardDescription>
                  Faça upload do arquivo PDF da nota fiscal para análise
                  automática
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FileUpload onFileSelect={handleFileSelect} />

                {selectedFile && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-primary hover:bg-primary-light shadow-soft"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Analisar com IA
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={isProcessing}
                    >
                      Limpar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-foreground">
                Resultados da Análise
              </h2>
              <Button
                variant="outline"
                onClick={handleReset}
                className="shadow-soft"
              >
                Nova Análise
              </Button>
            </div>
            <InvoiceResults data={invoiceData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
