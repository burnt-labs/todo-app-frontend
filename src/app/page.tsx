"use client";
import { useState, useEffect } from "react";
import { useAbstraxionAccount, useAbstraxionClient, useModal } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import Link from "next/link";
import { Abstraxion } from "@burnt-labs/abstraxion";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface Profile {
  displayName: string;
  bio: string;
  avatar: string;
}

export default function HomePage() {
  const { data: account } = useAbstraxionAccount();
  const { client: queryClient } = useAbstraxionClient();
  const [, setShowModal] = useModal();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account?.bech32Address && queryClient) {
      fetchData();
    }
  }, [account?.bech32Address, queryClient]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch todos
      const todosResponse = await queryClient?.queryContractSmart(contractAddress, {
        UserDocuments: {
          owner: account?.bech32Address,
          collection: "todos",
        }
      });
      
      if (todosResponse?.documents) {
        const parsedTodos = todosResponse.documents.map(([id, doc]: [string, any]) => ({
          id,
          ...JSON.parse(doc.data)
        }));
        setTodos(parsedTodos);
      }

      // Fetch profile
      const profileResponse = await queryClient?.queryContractSmart(contractAddress, {
        Get: {
          collection: "profiles",
          document: account?.bech32Address
        }
      });
      
      if (profileResponse?.document) {
        setProfile(JSON.parse(profileResponse.document.data));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!account?.bech32Address) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Please connect your wallet to view dashboard</p>
        </div>
        <Abstraxion onClose={() => setShowModal(false)} />
      </div>
    );
  }

  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = todos.length - completedTodos;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Summary */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            {profile?.avatar && (
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full"
              />
            )}
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-white">
                {profile?.displayName || "Anonymous"}
              </h3>
              <p className="text-white/60 break-all">{account.bech32Address}</p>
            </div>
          </div>
          <Link href="/profile">
            <Button structure="base" fullWidth>
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Todo Summary */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Todo Summary</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 rounded p-4">
              <p className="text-white/60">Total Todos</p>
              <p className="text-2xl font-bold text-white">{todos.length}</p>
            </div>
            <div className="bg-white/10 rounded p-4">
              <p className="text-white/60">Completed</p>
              <p className="text-2xl font-bold text-white">{completedTodos}</p>
            </div>
          </div>
          <Link href="/todos">
            <Button structure="base" fullWidth>
              View All Todos
            </Button>
          </Link>
        </div>

        {/* Recent Todos */}
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Todos</h2>
          {todos.length === 0 ? (
            <p className="text-white/60">No todos yet. Create your first todo!</p>
          ) : (
            <div className="space-y-2">
              {todos.slice(0, 5).map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-4 p-4 rounded bg-white/5 border border-white/10"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    readOnly
                    className="w-5 h-5"
                  />
                  <span className={`flex-1 ${todo.completed ? 'line-through text-white/50' : 'text-white'}`}>
                    {todo.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}