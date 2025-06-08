# DocuStore - Decentralized Document Storage

DocuStore is a decentralized application that allows users to store and manage their documents on the blockchain. It uses the Abstraxion library for wallet integration and smart contract interaction.

## Features

### User Authentication
- Wallet connection using Abstraxion
- Secure authentication flow
- User session management
- Logout functionality

### Document Management
- Create, read, update, and delete documents
- Document metadata storage
- Document versioning
- Access control

### User Interface
- Modern, responsive design
- Dark mode support
- Toast notifications for user feedback
- Navigation bar with user address display

## Smart Contract Integration

The application interacts with a smart contract that implements the following collections:

### Documents Collection
```rust
struct Document {
    owner: String,
    title: String,
    content: String,
    created_at: u64,
    updated_at: u64,
    metadata: Option<Metadata>,
}
```

### Profiles Collection
```rust
struct Profile {
    display_name: String,
    bio: String,
    avatar: String,
    social_links: Vec<SocialLink>,
}
```

### Settings Collection
```rust
struct Settings {
    dark_mode: bool,
    notifications: bool,
    language: String,
    timezone: String,
}
```

## Frontend Architecture

### Pages
1. **Dashboard** (`/`)
   - Overview of user's documents
   - Quick access to recent documents
   - Profile summary

2. **Documents** (`/documents`)
   - List of all documents
   - Create new document
   - Search and filter documents

3. **Profile** (`/profile`)
   - User profile management
   - Update display name, bio, and avatar
   - Social links management

4. **Settings** (`/settings`)
   - App preferences
   - Dark mode toggle
   - Notification settings
   - Language and timezone selection

### Components

1. **Navigation**
   - Responsive navigation bar
   - Wallet connection button
   - User address display
   - Logout functionality

2. **Toast**
   - Success/error notifications
   - Auto-dismissing alerts
   - Customizable messages

3. **Document Card**
   - Document preview
   - Quick actions
   - Metadata display

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- XION wallet

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd docu-store-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

- `NEXT_PUBLIC_CONTRACT_ADDRESS`: The address of your deployed smart contract

## Smart Contract Interaction

### Document Operations

1. **Create Document**
```typescript
await client.execute(account.bech32Address, contractAddress, {
  Set: {
    collection: "documents",
    document: documentId,
    data: JSON.stringify(documentData)
  }
}, "auto");
```

2. **Get Document**
```typescript
const response = await queryClient?.queryContractSmart(contractAddress, {
  Get: {
    collection: "documents",
    document: documentId
  }
});
```

3. **Update Document**
```typescript
await client.execute(account.bech32Address, contractAddress, {
  Set: {
    collection: "documents",
    document: documentId,
    data: JSON.stringify(updatedData)
  }
}, "auto");
```

4. **Delete Document**
```typescript
await client.execute(account.bech32Address, contractAddress, {
  Delete: {
    collection: "documents",
    document: documentId
  }
}, "auto");
```

### Profile Operations

1. **Update Profile**
```typescript
await client.execute(account.bech32Address, contractAddress, {
  Set: {
    collection: "profiles",
    document: account.bech32Address,
    data: JSON.stringify(profileData)
  }
}, "auto");
```

2. **Get Profile**
```typescript
const response = await queryClient?.queryContractSmart(contractAddress, {
  Get: {
    collection: "profiles",
    document: account.bech32Address
  }
});
```

## Error Handling

The application implements comprehensive error handling:

1. **Smart Contract Errors**
   - Transaction failures
   - Invalid operations
   - Permission denied

2. **Network Errors**
   - Connection issues
   - Timeout handling
   - Retry mechanisms

3. **User Feedback**
   - Toast notifications
   - Error messages
   - Loading states

## Security Considerations

1. **Authentication**
   - Secure wallet connection
   - Session management
   - Access control

2. **Data Validation**
   - Input sanitization
   - Type checking
   - Size limits

3. **Transaction Security**
   - Gas estimation
   - Transaction confirmation
   - Error recovery

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
