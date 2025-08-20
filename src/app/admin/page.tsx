'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  FileText,
  LogOut,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  answer_text: string | null;
  source_url: string | null;
  is_public: boolean;
  status: 'pending' | 'answered' | 'researching';
  created_at: string;
  payments?: Array<{
    user_email: string;
    stripe_payment_id: string;
    amount_cents: number;
    created_at: string;
  }>;
}

interface Stats {
  totalQuestions: number;
  answeredQuestions: number;
  pendingQuestions: number;
  totalRevenue: number;
  activeSubscriptions: number;
  oneTimePayments: number;
  totalBadDecisions: number;
  badDecisionsToday: number;
  averageRiskScore: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const [statsRes, questionsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/questions?status=${filter}`)
      ]);

      if (!statsRes.ok || !questionsRes.ok) {
        router.push('/admin/login');
        return;
      }

      const statsData = await statsRes.json();
      const questionsData = await questionsRes.json();

      setStats(statsData.stats);
      setRecentQuestions(statsData.recentQuestions || []);
      setQuestions(questionsData.questions || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const handleUpdateQuestion = async (question: Question) => {
    try {
      const response = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question),
      });

      if (response.ok) {
        setEditingQuestion(null);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update question:', error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/admin/questions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const handleAddQuestion = async (question: Partial<Question>) => {
    try {
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question),
      });

      if (response.ok) {
        setShowAddForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">LawLens Admin</h1>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-gray-600 hover:text-black">
              <ExternalLink className="h-5 w-5" />
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-black"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center gap-4">
              <FileText className="h-10 w-10 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Total Questions</h3>
                <p className="text-2xl font-bold">{stats?.totalQuestions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">Answered</h3>
                <p className="text-2xl font-bold">{stats?.answeredQuestions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center gap-4">
              <Clock className="h-10 w-10 text-yellow-600" />
              <div>
                <h3 className="text-lg font-semibold">Pending</h3>
                <p className="text-2xl font-bold">{stats?.pendingQuestions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center gap-4">
              <DollarSign className="h-10 w-10 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">Revenue</h3>
                <p className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-lg">🎯</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Bad Decisions</h3>
                <p className="text-2xl font-bold">{stats?.totalBadDecisions || 0}</p>
                <p className="text-xs text-gray-500">{stats?.badDecisionsToday || 0} today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">⚡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Avg Risk Score</h3>
                <p className="text-2xl font-bold">{stats?.averageRiskScore || 0}</p>
                <p className="text-xs text-gray-500">out of 100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'answered')}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option value="all">All Questions</option>
                  <option value="pending">Pending</option>
                  <option value="answered">Answered</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="divide-y divide-gray-200">
            {questions.map((question) => (
              <div key={question.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        question.status === 'answered' ? 'bg-green-100 text-green-800' :
                        question.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {question.status}
                      </span>
                      {question.payments?.length > 0 && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Paid
                        </span>
                      )}
                      {!question.is_public && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Private
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-medium text-black mb-2">
                      {question.question_text}
                    </h3>
                    
                    {question.answer_text && (
                      <p className="text-gray-600 mb-2">
                        {question.answer_text.substring(0, 200)}...
                      </p>
                    )}
                    
                    {question.payments?.length > 0 && (
                      <p className="text-sm text-gray-500">
                        Customer: {question.payments[0].user_email}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingQuestion(question)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <QuestionModal
          question={editingQuestion}
          onSave={handleUpdateQuestion}
          onCancel={() => setEditingQuestion(null)}
        />
      )}

      {/* Add Question Modal */}
      {showAddForm && (
        <QuestionModal
          question={{} as Question}
          onSave={handleAddQuestion}
          onCancel={() => setShowAddForm(false)}
          isNew={true}
        />
      )}
    </div>
  );
}

interface QuestionModalProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
  isNew?: boolean;
}

function QuestionModal({ question, onSave, onCancel, isNew = false }: QuestionModalProps) {
  const [formData, setFormData] = useState({
    question_text: question.question_text || '',
    answer_text: question.answer_text || '',
    source_url: question.source_url || '',
    is_public: question.is_public ?? true,
    status: question.status || 'pending'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...question, ...formData });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {isNew ? 'Add New Question' : 'Edit Question'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <textarea
                value={formData.question_text}
                onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                className="w-full p-3 border rounded-lg"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Answer</label>
              <textarea
                value={formData.answer_text}
                onChange={(e) => setFormData({...formData, answer_text: e.target.value})}
                className="w-full p-3 border rounded-lg"
                rows={6}
                placeholder="Provide a detailed answer..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Source URL</label>
              <input
                type="url"
                value={formData.source_url}
                onChange={(e) => setFormData({...formData, source_url: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="https://example.com/law-source"
              />
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                />
                Make Public
              </label>
              
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="border rounded px-2 py-1"
              >
                <option value="pending">Pending</option>
                <option value="researching">Researching</option>
                <option value="answered">Answered</option>
              </select>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}