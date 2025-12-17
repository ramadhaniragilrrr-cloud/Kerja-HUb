import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: number;
    // assigneeId etc can be added later
}

interface TaskState {
    tasks: Task[];
    filter: 'all' | 'today' | 'completed';
    setFilter: (filter: 'all' | 'today' | 'completed') => void;
    addTask: (title: string) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: [
                { id: "t1", title: "Review implementation plan", completed: true, dueDate: Date.now() },
                { id: "t2", title: "Finish Tasks module", completed: false, dueDate: Date.now() },
            ],
            filter: 'all',
            setFilter: (filter) => set({ filter }),
            addTask: (title) => set((state) => ({
                tasks: [...state.tasks, { id: Math.random().toString(36).substr(2, 9), title, completed: false, dueDate: Date.now() }]
            })),
            toggleTask: (id) => set((state) => ({
                tasks: state.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
            })),
            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id)
            })),
        }),
        {
            name: 'tasks-storage',
        }
    )
);
