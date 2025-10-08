// src/components/TodoList.tsx
import * as React from 'react';
import { useState, FormEvent } from 'react'; // Импортируем FormEvent для типизации событий формы
import { useTodoStore } from './store/todoStore';
import TodoItem from './TodoItem';

function TodoList() {
    const todos = useTodoStore((state) => state.todos);
    const addTodo = useTodoStore((state) => state.addTodo);
    const archiveTodo = useTodoStore((state) => state.archiveTodo);

    const [newTodoText, setNewTodoText] = useState<string>(''); // Явно указываем тип string для useState
    const [showArchive, setShowArchive] = useState<boolean>(true);

    const handleAddTodo = (e: FormEvent) => { // Типизируем событие формы
        e.preventDefault();
        if (newTodoText.trim()) {
            addTodo(newTodoText);
            setNewTodoText('');
        }
    };

    const activeTodos = todos.filter(t => !t.deleted && !t.archived);
    const deletedTodos = todos.filter(t => t.deleted && !t.archived);
    const archivedTodos = todos.filter(t => t.archived);

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>To do</h1>
            <form onSubmit={handleAddTodo} style={{ display: 'flex', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Add..."
                    style={{ flexGrow: 1, padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px 0 0 4px' }}
                />
                <button type="submit" style={{ padding: '10px 15px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>
                    Add
                </button>
            </form>

            {/* Active tasks */}
            <h2 style={{ marginTop: '10px' }}>Active</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {activeTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
            </ul>
            {activeTodos.length === 0 && (
                <p style={{ textAlign: 'left', color: '#666' }}>No active tasks</p>
            )}

            {/* Deleted tasks */}
            <h2 style={{ marginTop: '20px' }}>Deleted</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {deletedTodos.map((todo) => (
                    <li key={todo.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#999' }}>
                        <span style={{ flexGrow: 1, textAlign: 'left' }}>{todo.text}</span>
                        <button onClick={() => archiveTodo(todo.id)} style={{ padding: '5px 10px', cursor: 'pointer' }}>Archive</button>
                    </li>
                ))}
            </ul>
            {deletedTodos.length === 0 && (
                <p style={{ textAlign: 'left', color: '#666' }}>No deleted tasks</p>
            )}

            {/* Archive section with toggle */}
            <div style={{ marginTop: '20px' }}>
                <div onClick={() => setShowArchive(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ margin: 0 }}>Archive</h2>
                </div>
                {showArchive && (
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                        {archivedTodos.map((todo) => (
                            <li key={todo.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#777' }}>
                                <span style={{ flexGrow: 1, textAlign: 'left' }}>{todo.text}</span>
                            </li>
                        ))}
                    </ul>
                )}
                {showArchive && archivedTodos.length === 0 && (
                    <p style={{ textAlign: 'left', color: '#666' }}>No archived tasks</p>
                )}
            </div>
        </div>
    );
}

export default TodoList;
