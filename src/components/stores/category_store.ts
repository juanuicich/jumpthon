import { create } from 'zustand';
import { createClient } from "~/lib/supabase/client";

interface CategoryState {
  categories: Category[];
  activeCategory: Category | null;

  // Actions
  fetchCategories: () => Promise<void>;
  setActiveCategory: (category: Category | null) => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  activeCategory: null,

  fetchCategories: async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("category")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
      } else {

        const activeCategory = get().activeCategory;
        set({ categories: data });
        if (activeCategory && !data.includes(activeCategory)) {
          get().setActiveCategory(null);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  },

  setActiveCategory: (category) => set({ activeCategory: category }),
}));
