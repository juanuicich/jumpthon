"use client"

import type React from "react"
import { X, UserPlus } from "lucide-react"
import { createClient } from "~/lib/supabase/client";
import { cn, getInitial } from "~/lib/utils";

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
import { unlink } from "fs";
import { use, useEffect } from "react";

interface ProfileDropdownProps {
  currentProfile: Account | null
  profiles?: Account[],
  setActiveAccount: (account: Account | null) => void
  className?: string,
}

export default function ProfileDropdown({ currentProfile, profiles = [], setActiveAccount, className }: ProfileDropdownProps) {
  const allAccountsProfile: Account = {
    identity_id: "all",
    name: "All accounts",
    email: null,
    picture_url: null,
  }

  // Use provided props or defaults
  const profilesData = profiles.length > 1 ? [allAccountsProfile, ...profiles] : profiles
  const currentProfileData = currentProfile || profilesData[0]

  useEffect(() => {
    // If accounts change and the current account is not in the list, set the first account as active
    if (!profilesData.find((profile) => profile.identity_id === currentProfileData?.identity_id)) {
      setActiveAccount(profilesData[0])
    }
  }, [profilesData])

  // Handle profile deletion (just a placeholder)
  const handleSelectProfile = (profile: Account, e: React.MouseEvent) => {
    setActiveAccount(profile);
    e.stopPropagation()
  }

  // Handle profile deletion (just a placeholder)
  const handleDeleteProfile = (profile: Account, e: React.MouseEvent) => {
    e.stopPropagation()
    unlinkIdentity(profile);
  }

  // Handle profile deletion (just a placeholder)
  const handleConnectProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    linkIdentity();
  }

  async function linkIdentity() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.linkIdentity({ provider: 'google' })
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
    console.log({ identities, account });
    const selectedIdentity = identities.find((identity) => identity.identity_id === account.identity_id);
    if (selectedIdentity) {
      // unlink the  identity from the user
      const { data, error } = await supabase.auth.unlinkIdentity(selectedIdentity);
      console.log({ data, error });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("flex items-center justify-start p-2 h-auto min-w-[120px] max-w-full cursor-pointer", className)}
        >
          <Avatar className="h-6 w-6 mr-1">
            <AvatarImage src={currentProfileData?.picture_url!} alt={currentProfileData?.name!} />
            <AvatarFallback>{getInitial(currentProfileData?.name!)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start overflow-hidden truncate">
            <div className="text-sm font-medium truncate">{currentProfileData?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{currentProfileData?.email}</div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[240px]" align="start">
        <DropdownMenuLabel>Switch account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {profilesData.map((profile) => (
            <DropdownMenuItem key={profile.identity_id} className="py-2 cursor-pointer" onClick={(e) => handleSelectProfile(profile, e)}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={profile.picture_url!} alt={profile.name!} />
                    <AvatarFallback>{getInitial(profile.name || "")}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden max-w-36">
                    <p className="text-sm font-medium truncate">{profile.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                  </div>
                </div>
                {profile.identity_id !== 'all' && <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={(e) => handleDeleteProfile(profile, e)}
                  title={`Remove ${profile.name}'s account`}
                  aria-label={`Remove ${profile.name}'s account`}
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
    </DropdownMenu>
  )
}

