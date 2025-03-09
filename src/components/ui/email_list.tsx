import { useEmailStore } from '~/components/stores/email_store';
import { EmailItem } from '~/components/ui/email_item';
import { FixedSizeList as List } from 'react-window';
import { useRef, useEffect, useState } from 'react';

export function EmailList() {
  const { emails, selectedEmails, toggleEmailSelection } = useEmailStore();
  const listRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 96; // h-24 in Tailwind equals 6rem which is 96px

  const onToggleSelection = (id: string) => {
    toggleEmailSelection(id);
  };

  // Get container width and height for responsive list dimensions
  const [listWidth, setListWidth] = useState(() =>
    listRef.current?.clientWidth || 0
  );

  const [listHeight, setListHeight] = useState(() => {
    if (typeof window !== "undefined") {
      return Math.min(emails.length * ITEM_HEIGHT, window.innerHeight);
    }
    return 0;
  });


  useEffect(() => {
    const handleResize = () => {
      if (listRef.current) {
        setListWidth(listRef.current.clientWidth);
      }
    };

    handleResize();
    if (typeof window !== "undefined") {
      window?.addEventListener('resize', handleResize);
    }
    return () => {
      if (typeof window !== "undefined") {
        window?.removeEventListener('resize', handleResize)
      }
    };
  }, []);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const email = emails[index];
    return (
      <div style={style} className="divide-y">
        <EmailItem
          key={email.id}
          email={email}
          isSelected={selectedEmails.includes(email.id)}
          onSelect={onToggleSelection}
        />
      </div>
    );
  };

  return (
    <div className="w-full" ref={listRef}>
      <List
        height={listHeight}
        width={listWidth || '100%'}
        itemCount={emails.length}
        itemSize={ITEM_HEIGHT}
      >
        {Row}
      </List>
    </div>
  );
}
