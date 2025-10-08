// src/store/todoStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { Todo, TodoStore } from '../types'; // Импортируем наши типы

export const useTodoStore = create<TodoStore>()(
    persist(
        (set) => ({
            todos: [],
            addTodo: (text: string) =>
                set(
                    produce((state: TodoStore) => {
                        state.todos.push({ id: Date.now(), text, completed: false });
                    })
                ),
            deleteTodo: (id: number) =>
                set(
                    produce((state: TodoStore) => {
                        state.todos = state.todos.filter((todo: Todo) => todo.id !== id);
                    })
                ),
            toggleTodo: (id: number) =>
                set(
                    produce((state: TodoStore) => {
                        const todo = state.todos.find((todo: Todo) => todo.id === id);
                        if (todo) {
                            todo.completed = !todo.completed;
                        }
                    })
                ),
            setFocusedId: id => {
                set({
                    focusedId: id
                })
            }
        }),
        {
            name: 'todo-storage', // уникальное имя для хранилища в localStorage
        }
    )
);
