import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmailItem } from '~/components/ui/email_item'

// Mock the account store
vi.mock('~/components/stores/account_store', () => ({
  useAccountStore: () => ({
    accounts: [
      {
        id: 'account1',
        identity_id: 'identity1',
        email: 'test@example.com',
        name: 'Test User',
        picture_url: 'https://example.com/avatar.jpg'
      }
    ]
  })
}))

// Mock window.open
const mockOpen = vi.fn()
vi.stubGlobal('open', mockOpen)

describe('EmailItem Component', () => {
  const mockEmail = {
    id: 'email1',
    sender: 'John Doe',
    subject: 'Test Subject',
    preview: 'This is a test email',
    created_at: '2023-01-01T10:00:00Z',
    identity_id: 'identity1',
    gmail_id: 'gmailId123'
  }

  const mockOnSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email information correctly', () => {
    render(<EmailItem email={mockEmail} isSelected={false} onSelect={mockOnSelect} />)
    
    // Check if sender is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    
    // Check if subject is displayed
    expect(screen.getByText('Test Subject')).toBeInTheDocument()
    
    // Check if preview is displayed
    expect(screen.getByText('This is a test email')).toBeInTheDocument()
    
    // Check if created_at is displayed
    expect(screen.getByText('2023-01-01T10:00:00Z')).toBeInTheDocument()
  })

  it('applies selected class when isSelected is true', () => {
    const { container } = render(
      <EmailItem email={mockEmail} isSelected={true} onSelect={mockOnSelect} />
    )
    
    // Get the card element
    const card = container.querySelector('.bg-primary\\/10')
    expect(card).toBeInTheDocument()
  })

  it('calls onSelect when checkbox is clicked', () => {
    render(<EmailItem email={mockEmail} isSelected={false} onSelect={mockOnSelect} />)
    
    // Find the avatar container and click on it
    const avatarContainer = screen.getByText('J')
    fireEvent.click(avatarContainer)
    
    // Check if onSelect was called with the correct id
    expect(mockOnSelect).toHaveBeenCalledWith('email1')
  })

  it('opens email in a new tab when clicked', () => {
    render(<EmailItem email={mockEmail} isSelected={false} onSelect={mockOnSelect} />)
    
    // Find the email container and click on it
    const emailContent = screen.getByText('Test Subject')
    fireEvent.click(emailContent.parentElement.parentElement)
    
    // Check if window.open was called with the correct URL
    expect(mockOpen).toHaveBeenCalledWith(
      'https://mail.google.com/mail?authuser=test@example.com#all/gmailId123',
      '_blank',
      'noopener,noreferrer'
    )
  })
})