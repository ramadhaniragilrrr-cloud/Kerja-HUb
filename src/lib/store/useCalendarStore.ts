import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start: number; // timestamp
    end: number;
    type: 'meeting' | 'task' | 'reminder';
}

interface CalendarState {
    events: CalendarEvent[];
    view: 'month' | 'week' | 'day';
    selectedDate: number; // timestamp
    addEvent: (event: CalendarEvent) => void;
    deleteEvent: (id: string) => void;
    updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
    setView: (view: 'month' | 'week' | 'day') => void;
    setSelectedDate: (date: number) => void;
}

export const useCalendarStore = create<CalendarState>()(
    persist(
        (set) => ({
            events: [
                {
                    id: "ev1",
                    title: "Project Kickoff",
                    description: "Initial meeting for the Lark Clone project.",
                    start: new Date().setHours(10, 0, 0, 0),
                    end: new Date().setHours(11, 0, 0, 0),
                    type: 'meeting'
                }
            ],
            view: 'month',
            selectedDate: Date.now(),
            addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
            deleteEvent: (id) => set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
            updateEvent: (id, updates) => set((state) => ({
                events: state.events.map((e) => e.id === id ? { ...e, ...updates } : e)
            })),
            setView: (view) => set({ view }),
            setSelectedDate: (date) => set({ selectedDate: date }),
        }),
        {
            name: 'calendar-storage',
        }
    )
);
