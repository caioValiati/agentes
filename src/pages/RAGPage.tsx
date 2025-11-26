import RAGInterface from "@/components/RAGInterface";
import { Header } from "@/components/ui/header";
import { Layout } from "@/components/ui/layout";

export default function RAGPage() {
  return (
    <Layout>
      <Header
        title="Consulta Inteligente com RAG"
        description="Faça perguntas sobre os dados do banco e receba respostas inteligentes geradas por IA"
      />
      <RAGInterface />
    </Layout>
  );
}
