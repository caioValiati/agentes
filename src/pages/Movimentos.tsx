import { useState, useEffect } from "react";
import { Layout } from "@/components/ui/layout";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Movimento, Pessoa } from "@/types/typ";
import {
  createMovimentos,
  deleteMovimento,
  getMovimentos,
  getPessoas,
  updateMovimento,
} from "@/services/financeiroService";

const Movimentos = () => {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMovimento, setEditingMovimento] = useState<Movimento | null>(
    null
  );
  const [formData, setFormData] = useState<Movimento>({
    tipo: "",
    numero_notafiscal: "",
    data_emissao: "",
    descricao: "",
    valor_total: 0,
    id_fornecedorcliente: 0,
    id_faturado: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadMovimentos();
    loadPessoas();
  }, []);

  const loadMovimentos = async () => {
    try {
      const data = await getMovimentos();
      setMovimentos(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar movimentos",
        description: "Não foi possível carregar a lista de movimentos",
        variant: "destructive",
      });
    }
  };

  const loadPessoas = async () => {
    try {
      const data = await getPessoas();
      setPessoas(data);
    } catch (error) {
      console.error("Erro ao carregar pessoas:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMovimento) {
        await updateMovimento(editingMovimento.id!, formData);
        toast({
          title: "Movimento atualizado",
          description: "Os dados foram atualizados com sucesso",
        });
      } else {
        await createMovimentos(formData);
        toast({
          title: "Movimento criado",
          description: "Novo movimento adicionado com sucesso",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadMovimentos();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (movimento: Movimento) => {
    setEditingMovimento(movimento);
    setFormData(movimento);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este movimento?")) {
      try {
        await deleteMovimento(id);
        toast({
          title: "Movimento excluído",
          description: "O movimento foi removido com sucesso",
        });
        loadMovimentos();
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o movimento",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: "",
      numero_notafiscal: "",
      data_emissao: "",
      descricao: "",
      valor_total: 0,
      id_fornecedorcliente: 0,
      id_faturado: 0,
    });
    setEditingMovimento(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <Layout>
      <Header
        title="Movimentos"
        description="Gerencie notas fiscais, compras e vendas"
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Movimento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingMovimento ? "Editar Movimento" : "Novo Movimento"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do movimento abaixo
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="entrada">Entrada</SelectItem>
                          <SelectItem value="saida">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="numero_notafiscal">Número NF</Label>
                      <Input
                        id="numero_notafiscal"
                        value={formData.numero_notafiscal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            numero_notafiscal: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="data_emissao">Data de Emissão</Label>
                      <Input
                        id="data_emissao"
                        type="date"
                        value={formData.data_emissao.split("T")[0]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            data_emissao: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="valor_total">Valor Total</Label>
                      <Input
                        id="valor_total"
                        type="number"
                        step="0.01"
                        value={formData.valor_total}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            valor_total: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="id_fornecedorcliente">
                        Fornecedor/Cliente
                      </Label>
                      <Select
                        value={formData.id_fornecedorcliente.toString()}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            id_fornecedorcliente: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {pessoas.map((pessoa) => (
                            <SelectItem
                              key={pessoa.id}
                              value={pessoa.id!.toString()}
                            >
                              {pessoa.razaosocial}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="id_faturado">Faturado Para</Label>
                      <Select
                        value={formData.id_faturado.toString()}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            id_faturado: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {pessoas.map((pessoa) => (
                            <SelectItem
                              key={pessoa.id}
                              value={pessoa.id!.toString()}
                            >
                              {pessoa.razaosocial}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                    {editingMovimento ? "Atualizar" : "Criar"}
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
                <TableHead>NF</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Fornecedor/Cliente</TableHead>
                <TableHead>Faturado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum movimento cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                movimentos.map((movimento) => (
                  <TableRow key={movimento.id}>
                    <TableCell className="font-medium capitalize">
                      {movimento.tipo}
                    </TableCell>
                    <TableCell>{movimento.numero_notafiscal}</TableCell>
                    <TableCell>{formatDate(movimento.data_emissao)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {movimento.descricao}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatCurrency(movimento.valor_total)}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {pessoas.find(
                        (p) => p.id === movimento.id_fornecedorcliente
                      )?.razaosocial || "N/A"}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {pessoas.find((p) => p.id === movimento.id_faturado)
                        ?.razaosocial || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(movimento)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(movimento.id!)}
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

export default Movimentos;
