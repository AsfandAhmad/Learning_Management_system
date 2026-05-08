import { useState, useEffect } from 'react';
import { questionsAPI } from '../api/services';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';

export default function QuestionManager({ courseId, quizId, isOpen }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    marks: 1
  });

  // Fetch questions when modal opens
  useEffect(() => {
    if (isOpen && courseId && quizId) {
      fetchQuestions();
    }
  }, [isOpen, courseId, quizId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getQuizQuestions(courseId, quizId);
      const data = Array.isArray(response.data) ? response.data : (response.data.questions || response.data || []);
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      marks: 1
    });
    setEditingQuestion(null);
    setError('');
  };

  const validateForm = () => {
    if (!formData.questionText.trim()) {
      setError('Question text is required');
      return false;
    }
    if (!formData.optionA.trim() || !formData.optionB.trim() || !formData.optionC.trim() || !formData.optionD.trim()) {
      setError('All four options are required');
      return false;
    }
    if (!['A', 'B', 'C', 'D'].includes(formData.correctOption)) {
      setError('Valid correct option is required');
      return false;
    }
    if (formData.marks <= 0) {
      setError('Marks must be greater than 0');
      return false;
    }
    return true;
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        QuestionText: formData.questionText,
        OptionA: formData.optionA,
        OptionB: formData.optionB,
        OptionC: formData.optionC,
        OptionD: formData.optionD,
        CorrectOption: formData.correctOption,
        Marks: Number(formData.marks)
      };

      if (editingQuestion) {
        // Update existing question
        await questionsAPI.updateQuestion(courseId, editingQuestion.QuestionID, payload);
      } else {
        // Create new question
        await questionsAPI.createQuestion(courseId, quizId, payload);
      }

      // Refresh questions list
      await fetchQuestions();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.QuestionText || '',
      optionA: question.OptionA || '',
      optionB: question.OptionB || '',
      optionC: question.OptionC || '',
      optionD: question.OptionD || '',
      correctOption: question.CorrectOption || 'A',
      marks: question.Marks || 1
    });
    setShowForm(true);
    setError('');
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      setLoading(true);
      await questionsAPI.deleteQuestion(courseId, questionId);
      await fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-dark">Quiz Questions</h3>
        {!showForm && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            + Add Question
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Questions List */}
      {!showForm && questions.length > 0 && (
        <div className="space-y-3 mb-4">
          {questions.map((question, idx) => (
            <div key={question.QuestionID} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-grow pr-4">
                  <p className="font-medium text-sm text-text-dark mb-2">
                    Q{idx + 1}: {question.QuestionText}
                  </p>
                  <div className="space-y-1 text-xs text-text-muted">
                    <p>A) {question.OptionA}</p>
                    <p>B) {question.OptionB}</p>
                    <p>C) {question.OptionC}</p>
                    <p>D) {question.OptionD}</p>
                    <p className="mt-2">
                      <span className="font-medium">Correct: {question.CorrectOption}</span>
                      {' • '}
                      <span className="font-medium">Marks: {question.Marks}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditQuestion(question)}
                    disabled={loading}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.QuestionID)}
                    disabled={loading}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {questions.length > 0 && (
            <p className="text-sm text-text-muted bg-blue-50 border border-blue-200 p-2 rounded">
              Total Questions: {questions.length}
            </p>
          )}
        </div>
      )}

      {/* Add/Edit Question Form */}
      {showForm && (
        <form onSubmit={handleAddQuestion} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <Textarea
            label="Question Text"
            value={formData.questionText}
            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
            placeholder="Enter the question..."
            rows={2}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Option A"
              value={formData.optionA}
              onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
              placeholder="e.g., HTML"
              required
            />
            <Input
              label="Option B"
              value={formData.optionB}
              onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
              placeholder="e.g., CSS"
              required
            />
            <Input
              label="Option C"
              value={formData.optionC}
              onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
              placeholder="e.g., JavaScript"
              required
            />
            <Input
              label="Option D"
              value={formData.optionD}
              onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
              placeholder="e.g., React"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Correct Answer"
              value={formData.correctOption}
              onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
              options={[
                { value: 'A', label: 'Option A' },
                { value: 'B', label: 'Option B' },
                { value: 'C', label: 'Option C' },
                { value: 'D', label: 'Option D' }
              ]}
              required
            />

            <Input
              label="Marks"
              type="number"
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
              min="1"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {!showForm && questions.length === 0 && (
        <div className="text-center py-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-text-muted">No questions added yet</p>
        </div>
      )}
    </div>
  );
}
