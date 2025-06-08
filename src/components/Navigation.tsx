"use client";
import Link from 'next/link';
import { useAbstraxionAccount, useModal, useAbstraxionSigningClient } from '@burnt-labs/abstraxion';
import { Button } from '@burnt-labs/ui';
import { Abstraxion } from '@burnt-labs/abstraxion';

export default function Navigation() {
  const { data: account } = useAbstraxionAccount();
  const [, setShowModal] = useModal();
  const { client, signArb, logout } = useAbstraxionSigningClient();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-white/10 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-white font-semibold">
              DocuStore - Todo App
            </Link>
            {account?.bech32Address && (
              <div className="flex items-center gap-4">
                <Link href="/todos" className="text-white/60 hover:text-white">
                  Todos
                </Link>
                <Link href="/profile" className="text-white/60 hover:text-white">
                  Profile
                </Link>
                <Link href="/settings" className="text-white/60 hover:text-white">
                  Settings
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {account?.bech32Address ? (
              <>
                <span className="text-white/60">
                  {account.bech32Address.slice(0, 6)}...{account.bech32Address.slice(-4)}
                </span>
                <Button
                  onClick={logout}
                  structure="base"
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowModal(true)}
                structure="base"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
      <Abstraxion onClose={() => setShowModal(false)} />
    </nav>
  );
} 