"use client";
import { useState, useEffect } from "react";
import { useAbstraxionAccount, useAbstraxionSigningClient, useAbstraxionClient } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import Toast from "@/components/Toast";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function TodosPage() {
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const { client: queryClient } = useAbstraxionClient();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", isVisible: false });

  // Fetch todos on mount and when account changes
  useEffect(() => {
    if (account?.bech32Address && queryClient) {
      fetchTodos();
    }
  }, [account?.bech32Address, queryClient]);

  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await queryClient?.queryContractSmart(contractAddress, {
        UserDocuments: {
          owner: account?.bech32Address,
          collection: "todos",
        }
      });
      
      if (response?.documents) {
        const parsedTodos = response.documents.map(([id, doc]: [string, any]) => ({
          id,
          ...JSON.parse(doc.data)
        }));
        setTodos(parsedTodos);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim() || !client || !account) return;

    setLoading(true);
    try {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: Date.now()
      };

      await client.execute(account.bech32Address, contractAddress, {
        Set: {
          collection: "todos",
          document: todo.id,
          data: JSON.stringify(todo)
        }
      }, "auto");

      setTodos([...todos, todo]);
      setNewTodo("");
      showToast("Todo added successfully!");
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    if (!client || !account) return;

    setLoading(true);
    try {
      const updatedTodo = { ...todo, completed: !todo.completed };
      await client.execute(account.bech32Address, contractAddress, {
        Update: {
          collection: "todos",
          document: todo.id,
          data: JSON.stringify(updatedTodo)
        }
      }, "auto");

      setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
      showToast(`Todo marked as ${updatedTodo.completed ? 'completed' : 'incomplete'}!`);
    } catch (error) {
      console.error("Error toggling todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (!client || !account) return;

    setLoading(true);
    try {
      await client.execute(account.bech32Address, contractAddress, {
        Delete: {
          collection: "todos",
          document: todoId
        }
      }, "auto");

      setTodos(todos.filter(t => t.id !== todoId));
      showToast("Todo deleted successfully!");
    } catch (error) {
      console.error("Error deleting todo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!account?.bech32Address) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-white">Please connect your wallet to view todos</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-8">My Todos</h1>
      
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          className="flex-1 p-2 rounded bg-white/10 text-white border border-white/20"
        />
        <Button
          onClick={addTodo}
          disabled={loading || !newTodo.trim()}
          structure="base"
        >
          Add Todo
        </Button>
      </div>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-4 p-4 rounded bg-white/5 border border-white/10"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
              className="w-5 h-5"
            />
            <span className={`flex-1 ${todo.completed ? 'line-through text-white/50' : 'text-white'}`}>
              {todo.text}
            </span>
            <Button
              onClick={() => deleteTodo(todo.id)}
              disabled={loading}
              structure="base"
              className="text-red-500"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
} 