'use client';
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
  const [listWidth, setListWidth] = useState(800);
  const [listHeight, setListHeight] = useState(600);

  useEffect(() => {
    const handleResize = () => {
      if (listRef.current) {
        setListWidth(listRef.current.clientWidth);
        setListHeight((typeof window !== 'undefined' ? window.innerHeight : 600) - listRef.current.getBoundingClientRect().top);
      }
    };

    // Initial size calculation after component mounts
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
    <div className="w-full h-[calc(100vh-200px)]" ref={listRef}>
      <List
        height={listHeight || 500}
        width={listWidth || '100%'}
        itemCount={emails.length}
        itemSize={ITEM_HEIGHT}
      >
        {Row}
      </List>
    </div>
  );
}
