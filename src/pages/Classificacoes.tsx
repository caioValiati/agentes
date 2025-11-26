import { useState, useEffect } from "react";
import { Layout } from "@/components/ui/layout";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Classificacao } from "@/types/typ";
import {
  createClassificacao,
  deleteClassificacao,
  getClassificacoes,
  updateClassificacao,
} from "@/services/financeiroService";

const Classificacoes = () => {
  const [classificacoes, setClassificacoes] = useState<Classificacao[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClassificacao, setEditingClassificacao] =
    useState<Classificacao | null>(null);
  const [formData, setFormData] = useState<Classificacao>({
    tipo: "",
    descricao: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadClassificacoes();
  }, []);

  const loadClassificacoes = async () => {
    try {
      const data = await getClassificacoes();
      setClassificacoes(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar classificações",
        description: "Não foi possível carregar a lista de classificações",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClassificacao) {
        await updateClassificacao(editingClassificacao.id!, formData);
        toast({
          title: "Classificação atualizada",
          description: "Os dados foram atualizados com sucesso",
        });
      } else {
        await createClassificacao(formData);
        toast({
          title: "Classificação criada",
          description: "Nova classificação adicionada com sucesso",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadClassificacoes();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (classificacao: Classificacao) => {
    setEditingClassificacao(classificacao);
    setFormData(classificacao);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta classificação?")) {
      try {
        await deleteClassificacao(id);
        toast({
          title: "Classificação excluída",
          description: "A classificação foi removida com sucesso",
        });
        loadClassificacoes();
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a classificação",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: "",
      descricao: "",
    });
    setEditingClassificacao(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <Layout>
      <Header
        title="Classificações"
        description="Gerencie as classificações de movimentos e produtos"
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Classificação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingClassificacao
                      ? "Editar Classificação"
                      : "Nova Classificação"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados da classificação abaixo
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) =>
                        setFormData({ ...formData, tipo: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                        <SelectItem value="produto">Produto</SelectItem>
                        <SelectItem value="servico">Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingClassificacao ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="container mx-auto px-6 py-8">
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classificacoes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma classificação cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                classificacoes.map((classificacao) => (
                  <TableRow key={classificacao.id}>
                    <TableCell className="font-medium capitalize">
                      {classificacao.tipo}
                    </TableCell>
                    <TableCell>{classificacao.descricao}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(classificacao)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(classificacao.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default Classificacoes;
