// src/components/TodoItem.tsx
import * as React from 'react';
import { useTodoStore } from './store/todoStore';
import { Todo } from './types'; // Импортируем тип Todo

interface TodoItemProps {
    todo: Todo;
}

function TodoItem({ todo }: TodoItemProps) {
    const { focusedId, setFocusedId, deleteTodo, toggleTodo, renameTodo } = useTodoStore();
    const [isEditing, setIsEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(todo.text);

    const beginEdit = () => {
        if (todo.deleted || todo.archived) return;
        setDraft(todo.text);
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setDraft(todo.text);
    };

    const commitEdit = () => {
        const trimmed = draft.trim();
        if (trimmed && trimmed !== todo.text) {
            renameTodo(todo.id, trimmed);
        }
        setIsEditing(false);
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            commitEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    };

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
                style={{ marginRight: '10px' }}
            />

            {isEditing ? (
                <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    onBlur={commitEdit}
                    style={{ flexGrow: 1, textAlign: 'left', padding: '4px 6px' }}
                />
            ) : (
                <span onDoubleClick={beginEdit} style={{ flexGrow: 1, textAlign: 'left' }}>{todo.text}</span>
            )}

            {/* Actions */}
            <button
                onClick={() => deleteTodo(todo.id)}
                style={{ marginLeft: 'auto', padding: '5px 10px', cursor: 'pointer' }}
            >
                -
            </button>
            <button
                onClick={() => setFocusedId(todo.id)}
                style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}
            >
                *
            </button>


        </li>
    );
}

export default TodoItem;

