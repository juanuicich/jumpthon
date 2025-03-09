import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";


interface RemoveCategoryDialogProps {
  category: Category | null;
  onConfirm: (category: Category, shouldRecategorize: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemoveCategoryDialog({
  category,
  onConfirm,
  open,
  onOpenChange,
}: RemoveCategoryDialogProps) {
  const [shouldRecategorize, setShouldRecategorize] = useState(false);

  const handleConfirmRemove = () => {
    if (category) {
      onConfirm(category, shouldRecategorize);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove Category {category?.name}</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove the {category?.name} category?
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="recategorize"
            checked={shouldRecategorize}
            onCheckedChange={(checked) => setShouldRecategorize(!!checked)}
          />
          <Label htmlFor="recategorize">
            Recategorize all emails from this category
          </Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmRemove}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}