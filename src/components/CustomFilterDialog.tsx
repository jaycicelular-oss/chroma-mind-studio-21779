import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface CustomFilterDialogProps {
  onAdd: (filterName: string, filterValue: string) => void;
  category: string;
}

export const CustomFilterDialog = ({ onAdd, category }: CustomFilterDialogProps) => {
  const [open, setOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const handleAdd = () => {
    if (filterName.trim() && filterValue.trim()) {
      onAdd(filterName.trim(), filterValue.trim());
      setFilterName("");
      setFilterValue("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2 backdrop-blur-glass border-gradient"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Filtro Personalizado
        </Button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-glass border-gradient bg-card">
        <DialogHeader>
          <DialogTitle>Adicionar Filtro - {category}</DialogTitle>
          <DialogDescription className="sr-only">Preencha nome e valor para adicionar um filtro personalizado nesta categoria.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Nome do Filtro</Label>
            <Input
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Ex: Iluminação, Textura, etc."
              className="backdrop-blur-glass border-gradient"
            />
          </div>
          <div className="space-y-2">
            <Label>Valor do Filtro</Label>
            <Input
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Ex: Natural, Suave, etc."
              className="backdrop-blur-glass border-gradient"
            />
          </div>
          <Button 
            onClick={handleAdd} 
            className="w-full"
            disabled={!filterName.trim() || !filterValue.trim()}
          >
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};