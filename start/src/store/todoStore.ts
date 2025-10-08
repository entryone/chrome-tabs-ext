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
                        state.todos.push({ id: Date.now(), text, completed: false, deleted: false, archived: false });
                    })
                ),
            deleteTodo: (id: number) =>
                set(
                    produce((state: TodoStore) => {
                        const todo = state.todos.find((t: Todo) => t.id === id);
                        if (todo) {
                            todo.deleted = true; // mark as deleted instead of removing
                        }
                    })
                ),
            archiveTodo: (id: number) =>
                set(
                    produce((state: TodoStore) => {
                        const todo = state.todos.find((t: Todo) => t.id === id);
                        if (todo) {
                            todo.archived = true;
                            todo.deleted = true; // keep it marked as deleted as it moves to archive
                        }
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
