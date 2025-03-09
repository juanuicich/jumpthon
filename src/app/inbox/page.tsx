"use client"

import { useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import { DynamicIcon } from 'lucide-react/dynamic';
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Inbox, Dog } from "lucide-react"
import { EmailItem } from '~/components/ui/email_item';
import { Icon } from "~/components/ui/icon";
import { AddCategoryModal } from "~/components/ui/add_category_modal";
import { RemoveCategoryModal } from "~/components/ui/remove_category_modal";
import { DeleteEmail } from "~/components/ui/delete_email";
import ProfileDropdown from "~/components/ui/profile_dropdown";
import { initializeStores } from "~/components/stores/initialize";
import { useEmailStore } from "~/components/stores/email_store";
import { useCategoryStore } from "~/components/stores/category_store";
import { useAccountStore } from "~/components/stores/account_store";

export default function EmailInbox() {
  // Get state and actions from stores
  const { emails, selectedEmails, toggleEmailSelection, setFilters } = useEmailStore();
  const { categories, activeCategory, setActiveCategory } = useCategoryStore();
  // const { accounts, activeAccount, setActiveAccount } = useAccountStore();

  // Debounce filter updates
  const debouncedSetFilters = useCallback(
    debounce((filters) => {
      setFilters(filters);
    }, 300), // 300ms delay
    [setFilters]
  );

  // Initialize stores and subscriptions
  useEffect(() => {
    const cleanup = initializeStores();
    return cleanup;
  }, []);

  // // Update filters when category or account changes
  // useEffect(() => {
  //   console.log("Updating filters", { activeCategory, activeAccount });
  //   debouncedSetFilters({ category: activeCategory, account: activeAccount });
  // }, [activeCategory, activeAccount, debouncedSetFilters]);

  return (
    <div className="flex flex-col h-full max-h-screen bg-background">
      <div className="flex flex-1 overflow-hidden w-full max-w-7xl mx-auto">
        <aside className="w-56 p-3 hidden md:block h-screen flex-none">
          <div className="h-full w-full flex justify-between flex-col">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Dog className="h-5 w-5 stroke-amber-600" />
              <h1 className="text-lg font-bold">Chompymail</h1>
            </div>
            <ProfileDropdown />
            <div className="space-y-1 h-full">
              <Button
                variant={activeCategory === null ? "outline" : "ghost"}
                className="w-full justify-start cursor-pointer"
                onClick={() => setActiveCategory(null)}
              >
                <Inbox className="mr-2 h-4 w-4" />
                All Mail
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={activeCategory?.id === category.id ? "outline" : "ghost"}
                  className="w-full cursor-pointer flex justify-between"
                  onClick={() => setActiveCategory(category)}
                >
                  <DynamicIcon name={(category.icon || "email") as any} className={`mr-2 h-4 w-4 stroke-slate-800`} />
                  <div className="w-full flex"><span className='max-w-32 truncate'>{category.name}</span></div>
                </Button>
              ))}
              {false && <Button
                variant={false ? "secondary" : "ghost"}
                className="w-full justify-start cursor-pointer"
                onClick={() => setActiveCategory(null)}
              >
                <Inbox className="mr-2 h-4 w-4" />
                <span className='max-w-32 truncate'>Uncategorized</span>
              </Button>}
              <div className="mt-4 w-full px-2 text-left">
                <AddCategoryModal />
              </div>
            </div>
          </div>
        </aside>

        <main className="overflow-y-auto border-l border-r w-full">
          <div className="sticky top-0 z-10 p-3 border-b backdrop-blur-md bg-white/90 dark:bg-black/50 flex justify-between w-full">
            <div className="flex items-center gap-2 h-12">
              <Checkbox
                checked={selectedEmails.length === emails.length && selectedEmails.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    // setSelectedEmails(emails.map(email => email.id));
                  } else {
                    // setSelectedEmails([]);
                  }
                }}
                className="h-9 w-9 mr-2 rounded-full cursor-pointer"
              />

              {selectedEmails.length > 0 &&
                <>
                  <DeleteEmail emails={selectedEmails} />
                  <DeleteEmail emails={selectedEmails} unsub={true} />
                </>}
              {selectedEmails.length === 0 && activeCategory &&
                <div className="flex items-center gap-2">
                  <Icon name={activeCategory?.icon} className="h-6 w-6 mr-2" />
                  <div className="text-lg mr-4">{activeCategory?.name}</div>
                  <AddCategoryModal edit={true} category={activeCategory} />
                  <RemoveCategoryModal category={activeCategory} />
                </div>
              }

            </div>
            <div className="text-sm text-muted-foreground pr-4 my-auto">
              {selectedEmails.length > 0
                ? `${selectedEmails.length} selected`
                : `${emails.length} messages`}
            </div>
          </div>

          <div className="divide-y w-full">
            {emails.map((email) => (
              <EmailItem
                key={email.id}
                email={email}
                // accounts={accounts}
                isSelected={selectedEmails.includes(email.id)}
                onSelect={toggleEmailSelection}
              />
            ))}
          </div>
        </main>

        <aside className="w-32 h-screen hidden xl:block"></aside>
      </div >
    </div >
  )
}

