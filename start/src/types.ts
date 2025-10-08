// src/types.ts
export interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

export interface TodoStore {
    todos: Todo[];
    addTodo: (text: string) => void;
    deleteTodo: (id: number) => void;
    toggleTodo: (id: number) => void
    focusedId?: number
    setFocusedId: (id: number) => void
}

