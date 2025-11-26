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
import { Pessoa } from "@/types/typ";
import {
  createPessoa,
  deletePessoa,
  getPessoas,
  updatePessoa,
} from "@/services/financeiroService";

const Pessoas = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null);
  const [formData, setFormData] = useState<Pessoa>({
    tipo: "",
    razaosocial: "",
    fantasia: "",
    documento: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPessoas();
  }, []);

  const loadPessoas = async () => {
    try {
      const data = await getPessoas();
      setPessoas(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar pessoas",
        description: "Não foi possível carregar a lista de pessoas",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPessoa) {
        await updatePessoa(editingPessoa.id!, formData);
        toast({
          title: "Pessoa atualizada",
          description: "Os dados foram atualizados com sucesso",
        });
      } else {
        await createPessoa(formData);
        toast({
          title: "Pessoa criada",
          description: "Nova pessoa adicionada com sucesso",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadPessoas();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (pessoa: Pessoa) => {
    setEditingPessoa(pessoa);
    setFormData(pessoa);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta pessoa?")) {
      try {
        await deletePessoa(id);
        toast({
          title: "Pessoa excluída",
          description: "A pessoa foi removida com sucesso",
        });
        loadPessoas();
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a pessoa",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: "",
      razaosocial: "",
      fantasia: "",
      documento: "",
    });
    setEditingPessoa(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <Layout>
      <Header
        title="Pessoas"
        description="Gerencie fornecedores, clientes e outras pessoas do sistema"
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Pessoa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingPessoa ? "Editar Pessoa" : "Nova Pessoa"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados da pessoa abaixo
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
                        <SelectItem value="PF">Pessoa Física</SelectItem>
                        <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="razaosocial">Razão Social</Label>
                    <Input
                      id="razaosocial"
                      value={formData.razaosocial}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          razaosocial: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fantasia">Nome Fantasia</Label>
                    <Input
                      id="fantasia"
                      value={formData.fantasia}
                      onChange={(e) =>
                        setFormData({ ...formData, fantasia: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="documento">Documento (CPF/CNPJ)</Label>
                    <Input
                      id="documento"
                      value={formData.documento}
                      onChange={(e) =>
                        setFormData({ ...formData, documento: e.target.value })
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
                    {editingPessoa ? "Atualizar" : "Criar"}
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
                <TableHead>Razão Social</TableHead>
                <TableHead>Nome Fantasia</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pessoas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma pessoa cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                pessoas.map((pessoa) => (
                  <TableRow key={pessoa.id}>
                    <TableCell className="font-medium capitalize">
                      {pessoa.tipo}
                    </TableCell>
                    <TableCell>{pessoa.razaosocial}</TableCell>
                    <TableCell>{pessoa.fantasia}</TableCell>
                    <TableCell>{pessoa.documento}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(pessoa)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(pessoa.id!)}
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

export default Pessoas;
