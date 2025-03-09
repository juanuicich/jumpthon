import { useAccountStore } from "~/components/stores/account_store";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { getInitial } from "~/lib/utils";

export function EmailItem({ email, isSelected, onSelect }: { email: Email; isSelected: boolean; onSelect: (id: string) => void }) {
  const { accounts } = useAccountStore();

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    onSelect(email.id)
  }

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    const account = accounts.find(a => a.identity_id === email.identity_id);
    const url = `https://mail.google.com/mail?authuser=${account.email}#all/${email.gmail_id}`;
    if (typeof window !== "undefined") {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    console.log("Opening email:", email.id)
  }

  return (
    <Card
      className={`p-3 rounded-none hover:bg-accent/50 transition-colors cursor-pointer h-24 ${isSelected ? 'bg-primary/10' : ''}`
      }
    >
      <div className="flex items-start gap-3" onClick={(e) => handleOpenClick(e)}>
        <div
          className="relative cursor-pointer group w-9 h-9"
          onClick={handleSelectClick}
        >
          <Checkbox
            checked={isSelected}
            className={`h-9 w-9 rounded-full cursor-pointer absolute bg-white ${isSelected ? 'block' : 'group-hover:block'}`}
          />
          <Avatar className={`h-9 w-9 shrink-0 ${isSelected ? 'hidden' : ' group-hover:hidden'}`}>
            <AvatarFallback>{email.sender ? getInitial(email.sender) : ""}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="font-semibold text-base truncate max-w-[180px] sm:max-w-xs flex items-center mr-2">
              {email.sender}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {email.created_at}
            </div>
          </div>

          <div className="text-sm">
            <span className="font-semibold">{email.subject}</span>
            {" "}
            <span className="text-muted-foreground">{email.preview}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

