// src/types.ts
export interface Todo {
    id: number;
    text: string;
    completed: boolean;
    deleted?: boolean;
    archived?: boolean;
}

export interface TodoStore {
    todos: Todo[];
    addTodo: (text: string) => void;
    deleteTodo: (id: number) => void; // now marks as deleted
    archiveTodo: (id: number) => void;
    toggleTodo: (id: number) => void
    focusedId?: number
    setFocusedId: (id: number) => void
    renameTodo: (id: number, text: string) => void
}

