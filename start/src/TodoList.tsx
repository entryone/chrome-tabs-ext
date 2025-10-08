// src/components/TodoList.tsx
import * as React from 'react';
import { useState, FormEvent } from 'react'; // Импортируем FormEvent для типизации событий формы
import { useTodoStore } from './store/todoStore';
import TodoItem from './TodoItem';

function TodoList() {
    const todos = useTodoStore((state) => state.todos);
    const addTodo = useTodoStore((state) => state.addTodo);
    const [newTodoText, setNewTodoText] = useState<string>(''); // Явно указываем тип string для useState

    const handleAddTodo = (e: FormEvent) => { // Типизируем событие формы
        e.preventDefault();
        if (newTodoText.trim()) {
            addTodo(newTodoText);
            setNewTodoText('');
        }
    };

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
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {todos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
            </ul>
            {todos.length === 0 && (
                <p style={{ textAlign: 'center', color: '#666' }}>
                    No task yet
                </p>
            )}
        </div>
    );
}

export default TodoList;
