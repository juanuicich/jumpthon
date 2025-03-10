import { DynamicIcon } from "lucide-react/dynamic";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"


interface RemoveCategoryModalProps {
  category: Category | null;
}

export function RemoveCategoryModal({ category }: RemoveCategoryModalProps) {

  async function deleteCategory() {
    if (!category) {
      return;
    }
    // Post the category data to the API /api/add-category
    try {
      await fetch(`/api/category?id=${category.id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={category == null} size="sm" className="cursor-pointer">
          <DynamicIcon name="trash-2" className="h-4 w-4" />
          Delete Category
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Category {category?.name}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove the {category?.name} category?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteCategory}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
