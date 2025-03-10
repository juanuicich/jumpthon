import { vi } from 'vitest'
import * as React from 'react'

// Mock the components that use cn
vi.mock('~/components/ui/button', () => ({
  Button: (props: { 
    children: React.ReactNode, 
    onClick?: () => void, 
    disabled?: boolean, 
    variant?: string, 
    className?: string,
    size?: string 
  }) => React.createElement(
    'button',
    { 
      onClick: props.onClick, 
      disabled: props.disabled,
      'data-variant': props.variant,
      'data-size': props.size,
      className: props.className || '',
      'data-testid': 'button' 
    },
    props.children
  ),
  // Mock the buttonVariants function
  buttonVariants: () => 'button-variant-class'
}))

// Mock cn utility function
vi.mock('~/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
  oAuthOptions: () => ({ redirectTo: 'http://localhost:3000/auth/callback' })
}))

export function setupUIMocks() {
  // Mock lucide icons
  vi.mock('lucide-react/dynamic', () => ({
    DynamicIcon: (props: { name: string }) => 
      React.createElement('div', { 
        'data-testid': `icon-${props.name}` 
      }, props.name)
  }))

  vi.mock('lucide-react', () => ({
    Inbox: () => React.createElement('div', { 'data-testid': 'inbox-icon' }, 'Inbox'),
    Dog: () => React.createElement('div', { 'data-testid': 'dog-icon' }, 'Dog'),
    Checkbox: (props: any) => React.createElement('div', { 
      'data-testid': 'checkbox',
      ...props 
    })
  }))

  // Mock react-window for better testing
  vi.mock('react-window', () => ({
    FixedSizeList: (props: { children: Function, itemCount: number }) => {
      const items = []
      for (let i = 0; i < props.itemCount; i++) {
        items.push(props.children({ index: i, style: {} }))
      }
      return React.createElement('div', { 'data-testid': 'virtualized-list' }, items)
    }
  }))

  // Mock next/navigation
  vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    })
  }))

  // Mock common UI components

  vi.mock('~/components/ui/dialog', () => ({
    Dialog: (props: { children: React.ReactNode }) => 
      React.createElement('div', { 'data-testid': 'dialog' }, props.children),
    DialogTrigger: (props: { children: React.ReactNode }) => 
      React.createElement('div', { 
        'data-testid': 'dialog-trigger', 
        onClick: () => {} 
      }, props.children),
    DialogContent: (props: { children: React.ReactNode }) => 
      React.createElement('div', { 'data-testid': 'dialog-content' }, props.children),
    DialogHeader: (props: { children: React.ReactNode }) => 
      React.createElement('div', { 'data-testid': 'dialog-header' }, props.children),
    DialogFooter: (props: { children: React.ReactNode }) => 
      React.createElement('div', { 'data-testid': 'dialog-footer' }, props.children),
    DialogTitle: (props: { children: React.ReactNode }) => 
      React.createElement('div', { 'data-testid': 'dialog-title' }, props.children),
    DialogDescription: (props: { children: React.ReactNode }) => 
      React.createElement('div', { 'data-testid': 'dialog-description' }, props.children),
  }))

  // Mock EmailItem
  vi.mock('~/components/ui/email_item', () => ({
    EmailItem: (props: { 
      email: any, 
      isSelected?: boolean, 
      onSelect?: (id: string) => void 
    }) => React.createElement(
      'div',
      { 
        'data-testid': `email-item-${props.email.id}`, 
        'data-selected': props.isSelected,
        onClick: () => props.onSelect && props.onSelect(props.email.id)
      },
      `${props.email.sender} - ${props.email.subject}`
    )
  }))

  // Mock profile dropdown
  vi.mock('~/components/ui/profile_dropdown', () => ({
    default: () => React.createElement(
      'div', 
      { 'data-testid': 'profile-dropdown' }, 
      'Profile Dropdown'
    )
  }))

  // Mock add/remove category modals
  vi.mock('~/components/ui/add_category_modal', () => ({
    AddCategoryModal: (props: { edit?: boolean, category?: any }) => React.createElement(
      'div',
      { 'data-testid': 'add-category-modal' },
      props.edit ? 'Edit Category' : 'Add Category'
    )
  }))

  vi.mock('~/components/ui/remove_category_modal', () => ({
    RemoveCategoryModal: (props: { category?: any }) => React.createElement(
      'div',
      { 'data-testid': 'remove-category-modal' },
      'Remove Category'
    )
  }))

  // Mock delete email modal
  vi.mock('~/components/ui/delete_email', () => ({
    DeleteEmail: (props: { emails: string[], unsub?: boolean }) => React.createElement(
      'div',
      { 'data-testid': props.unsub ? 'unsub-button' : 'delete-button' },
      `${props.unsub ? 'Unsubscribe' : 'Delete'} (${props.emails.length})`
    )
  }))

  // Mock icon component
  vi.mock('~/components/ui/icon', () => ({
    Icon: (props: { name: string }) => React.createElement(
      'div', 
      { 'data-testid': `icon-${props.name}` }, 
      props.name
    )
  }))

  // Mock email list
  vi.mock('~/components/ui/email_list', () => ({
    EmailList: () => React.createElement(
      'div', 
      { 'data-testid': 'email-list' }, 
      'Email List'
    )
  }))
}