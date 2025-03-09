import { useState } from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import { Button } from "~/components/ui/button"

interface DeleteEmailProps {
  emails: EmailSummary[];
  unsub?: boolean;
}

export function DeleteEmail({ emails, unsub = false }: DeleteEmailProps) {
  const [disabled, setDisabled] = useState(false);

  async function deleteEmails() {
    if (emails.length == 0) {
      return;
    }
    // Post the category data to the API /api/add-category
    try {
      setDisabled(true);
      console.log("Deleting emails:", emails);
      const response = await fetch(`/api/email`, {
        method: 'DELETE',
        body: JSON.stringify({ emailIds: emails, unsub }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("Response:", response);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete emails');
      }
    } catch (error) {
      console.error('Error deleting emails', error);
    } finally {
      setDisabled(false);
    }
  }

  if (unsub) {
    return (
      <Button variant="outline" disabled={emails.length == 0} size="sm"
        onClick={deleteEmails} className="cursor-pointer"
        title="Use AI agent to unsubscribe">
        <DynamicIcon name="bot" className="h-4 w-4 mr-2" />
        Delete & unsub
      </Button>
    )
  } else {
    return (
      <Button variant="outline" disabled={emails.length == 0} size="sm"
        onClick={deleteEmails} className="cursor-pointer">
        <DynamicIcon name="trash-2" className="h-4 w-4 mr-2" />
        Delete
      </Button>
    )
  }
}