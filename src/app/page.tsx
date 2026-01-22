'use client';

import { useState, useEffect } from 'react';

export default function TodoCRUD() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // Fetch todos dari API
  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      alert('Gagal memuat data todos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // CREATE
  const handleCreate = async () => {
    if (!formData.title.trim()) {
      alert('Judul tidak boleh kosong');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos([newTodo, ...todos]);
        resetForm();
        alert('Todo berhasil ditambahkan!');
      } else {
        alert('Gagal menambahkan todo');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      alert('Terjadi kesalahan saat menambahkan todo');
    } finally {
      setSubmitting(false);
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      alert('Judul tidak boleh kosong');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/todos/${editingTodo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          completed: editingTodo.completed
        }),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(todo => 
          todo.id === editingTodo.id ? updatedTodo : todo
        ));
        resetForm();
        alert('Todo berhasil diupdate!');
      } else {
        alert('Gagal mengupdate todo');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Terjadi kesalahan saat mengupdate todo');
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus todo ini?')) return;
    
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
        alert('Todo berhasil dihapus!');
      } else {
        alert('Gagal menghapus todo');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Terjadi kesalahan saat menghapus todo');
    }
  };

  // Toggle Complete
  const toggleComplete = async (todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: todo.title,
          description: todo.description,
          completed: !todo.completed
        }),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
      }
    } catch (error) {
      console.error('Error toggling complete:', error);
      alert('Gagal mengubah status todo');
    }
  };

  const openCreateModal = () => {
    setEditingTodo(null);
    setFormData({ title: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (todo) => {
    setEditingTodo(todo);
    setFormData({ 
      title: todo.title, 
      description: todo.description || '' 
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '' });
    setEditingTodo(null);
    setIsModalOpen(false);
  };

  const handleSubmit = () => {
    if (editingTodo) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Todo List CRUD</h1>
              <p className="text-gray-600 mt-1">Next.js + MySQL Database</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchTodos}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                disabled={loading}
              >
                <span className={loading ? 'inline-block animate-spin' : ''}>🔄</span>
                Refresh
              </button>
              <button
                onClick={openCreateModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <span>➕</span>
                Tambah Todo
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            <p className="text-gray-600 mt-4">Memuat data...</p>
          </div>
        ) : (
          /* Todo List */
          <div className="space-y-3">
            {todos.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 text-lg">Belum ada todo. Tambahkan todo pertama Anda!</p>
              </div>
            ) : (
              todos.map(todo => (
                <div
                  key={todo.id}
                  className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleComplete(todo)}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition text-sm ${
                        todo.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {todo.completed && '✓'}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${
                        todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className={`mt-1 ${
                          todo.completed ? 'line-through text-gray-400' : 'text-gray-600'
                        }`}>
                          {todo.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        ID: {todo.id} • Dibuat: {new Date(todo.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(todo)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingTodo ? 'Edit Todo' : 'Tambah Todo Baru'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  disabled={submitting}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan judul todo"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan deskripsi todo"
                    rows="3"
                    disabled={submitting}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg font-medium transition"
                  >
                    {submitting ? 'Menyimpan...' : (editingTodo ? 'Update' : 'Tambah')}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={submitting}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 py-2 rounded-lg font-medium transition"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}