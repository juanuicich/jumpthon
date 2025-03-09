import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmailList } from '~/components/ui/email_list'

// Mock react-window to make it easier to test
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount }) => {
    const items = []
    for (let i = 0; i < itemCount; i++) {
      items.push(children({ index: i, style: {} }))
    }
    return <div data-testid="virtualized-list">{items}</div>
  }
}))

// Mock the email store
vi.mock('~/components/stores/email_store', () => ({
  useEmailStore: () => ({
    emails: mockEmails,
    selectedEmails: ['email1'],
    toggleEmailSelection: mockToggleEmailSelection
  })
}))

// Mock EmailItem component
vi.mock('~/components/ui/email_item', () => ({
  EmailItem: ({ email, isSelected, onSelect }) => (
    <div
      data-testid={`email-item-${email.id}`}
      data-selected={isSelected}
      onClick={() => onSelect(email.id)}
    >
      {email.sender} - {email.subject}
    </div>
  )
}))

// Mock data and functions
const mockEmails = [
  {
    id: 'email1',
    sender: 'sender1@example.com',
    subject: 'Test Email 1',
    preview: 'This is test email 1',
    created_at: '2023-01-01T00:00:00Z',
    identity_id: 'identity1',
    gmail_id: 'gmail1'
  },
  {
    id: 'email2',
    sender: 'sender2@example.com',
    subject: 'Test Email 2',
    preview: 'This is test email 2',
    created_at: '2023-01-02T00:00:00Z',
    identity_id: 'identity2',
    gmail_id: 'gmail2'
  }
]

const mockToggleEmailSelection = vi.fn()

// Mock window properties for the component
global.innerWidth = 1024
global.innerHeight = 768

describe('EmailList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a list of emails', () => {
    render(<EmailList />)

    // Check if the virtualized list is rendered
    const virtualizedList = screen.getByTestId('virtualized-list')
    expect(virtualizedList).toBeInTheDocument()

    // Check if email items are rendered
    const emailItem1 = screen.getByTestId('email-item-email1')
    const emailItem2 = screen.getByTestId('email-item-email2')

    expect(emailItem1).toBeInTheDocument()
    expect(emailItem2).toBeInTheDocument()

    // Check if content is displayed correctly
    expect(screen.getByText('sender1@example.com - Test Email 1')).toBeInTheDocument()
    expect(screen.getByText('sender2@example.com - Test Email 2')).toBeInTheDocument()
  })

  it('passes the correct selection state to email items', () => {
    render(<EmailList />)

    // Check if the first email is selected and the second is not
    const emailItem1 = screen.getByTestId('email-item-email1')
    const emailItem2 = screen.getByTestId('email-item-email2')

    expect(emailItem1.getAttribute('data-selected')).toBe('true')
    expect(emailItem2.getAttribute('data-selected')).toBe('false')
  })
})