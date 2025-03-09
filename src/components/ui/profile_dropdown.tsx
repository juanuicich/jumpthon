"use client"

import type React from "react"
import { X, UserPlus } from "lucide-react"
import { createClient } from "~/lib/supabase/client";
import { getInitial } from "~/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { oAuthOptions } from "~/lib/utils";
import { useAccountStore } from "~/components/stores/account_store";


export default function ProfileDropdown() {
  const { accounts, activeAccount, setActiveAccount } = useAccountStore();

  const handleSelectProfile = (profile: Account, e: React.MouseEvent) => {
    setActiveAccount(profile);
    e.stopPropagation()
  }

  const handleDeleteProfile = (profile: Account, e: React.MouseEvent) => {
    e.stopPropagation()
    unlinkIdentity(profile);
  }

  const handleConnectProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    linkIdentity();
  }

  async function linkIdentity() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: oAuthOptions(),
    });
  }

  async function unlinkIdentity(account: Account) {
    const supabase = createClient();
    // retrieve all identities linked to a user
    const response = await supabase.auth.getUserIdentities();

    if (response.error) {
      console.error(response.error);
      return;
    }
    const { identities } = response.data;
    if (!identities) {
      console.error("No identities found");
      return;
    }

    const selectedIdentity = identities.find((identity) => identity.identity_id === account.identity_id);
    if (selectedIdentity) {
      // unlink the  identity from the user
      const { data, error } = await supabase.auth.unlinkIdentity(selectedIdentity);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center justify-start p-2 mb-2 h-12 min-w-[120px] max-w-full cursor-pointer"
        >
          <Avatar className="h-6 w-6 mr-1">
            <AvatarImage src={activeAccount?.picture_url!} alt={activeAccount?.name!} />
            <AvatarFallback>{getInitial(activeAccount?.name!)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start overflow-hidden truncate">
            <div className="text-sm font-medium truncate">{activeAccount?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{activeAccount?.email}</div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[240px]" align="start">
        <DropdownMenuLabel>Switch account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {accounts.map((account) => (
            <DropdownMenuItem key={account.identity_id} className="py-2 cursor-pointer" onClick={(e) => handleSelectProfile(account, e)}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={account.picture_url!} alt={account.name!} />
                    <AvatarFallback>{getInitial(account.name || "")}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden max-w-36">
                    <p className="text-sm font-medium truncate">{account.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                  </div>
                </div>
                {account.identity_id !== 'all' && <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={(e) => handleDeleteProfile(account, e)}
                  title={`Remove ${account.name}'s account`}
                  aria-label={`Remove ${account.name}'s account`}
                >
                  <X className="h-4 w-4" />
                </Button>}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={(e) => handleConnectProfile(e)}>
          <UserPlus className="mr-2 h-4 w-4" />
          <span>Connect new account</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu >
  )
}

