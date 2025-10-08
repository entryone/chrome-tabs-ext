// src/components/TodoItem.tsx
import * as React from 'react';
import { useTodoStore } from './store/todoStore';
import { Todo } from './types'; // Импортируем тип Todo

interface TodoItemProps {
    todo: Todo;
}

function TodoItem({ todo }: TodoItemProps) {
    const { focusedId, setFocusedId, deleteTodo, toggleTodo} = useTodoStore();

    return (
        <li
            style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#888' : '#333',
                fontWeight: todo.id === focusedId ? '800' : 'normal',
                backgroundColor: todo.id === focusedId ? 'orange' : 'transparent',
            }}
        >
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                style={{marginRight: '10px'}}
            />
            <span style={{flexGrow: 1, textAlign: 'left'}}>{todo.text}</span>
            <button
                onClick={() => deleteTodo(todo.id)}
                style={{marginLeft: 'auto', padding: '5px 10px', cursor: 'pointer'}}
            >
                Remove
            </button>
            <button
                onClick={() => setFocusedId(todo.id)}
                style={{marginLeft: 'auto', padding: '5px 10px', cursor: 'pointer'}}
            >
                Focus
            </button>
        </li>
    );
}

export default TodoItem;

