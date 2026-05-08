import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizzesAPI, questionsAPI } from '../api/services';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function StudentQuizAttempt() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Fetch quiz and questions
  useEffect(() => {
    fetchQuizData();
  }, [courseId, quizId]);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || !timeRemaining || timeRemaining <= 0 || quizSubmitted) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizStarted, timeRemaining, quizSubmitted]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const [quizRes, questionsRes] = await Promise.all([
        quizzesAPI.getQuizById(quizId),
        questionsAPI.getQuizQuestions(courseId, quizId)
      ]);

      const quizData = quizRes.data;
      const questionsData = Array.isArray(questionsRes.data) 
        ? questionsRes.data 
        : (questionsRes.data.questions || []);

      setQuiz(quizData);
      setQuestions(questionsData);
      
      // Initialize time remaining (convert from minutes if needed, default 60 minutes)
      const timeLimit = quizData.TimeLimit || 60;
      setTimeRemaining(timeLimit * 60);
      
      // Initialize answers object
      const initialAnswers = {};
      questionsData.forEach((_, idx) => {
        initialAnswers[idx] = null;
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error('Error fetching quiz data:', err);
      setError(err.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = (questionIndex, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setLoading(true);
      
      // Calculate score
      let totalScore = 0;
      let correctAnswers = 0;
      const answerDetails = [];

      questions.forEach((question, idx) => {
        const studentAnswer = answers[idx];
        const isCorrect = studentAnswer === question.CorrectOption;
        
        if (isCorrect) {
          correctAnswers++;
          totalScore += question.Marks || 1;
        }

        answerDetails.push({
          questionId: question.QuestionID,
          studentAnswer,
          isCorrect,
          correctAnswer: question.CorrectOption,
          marks: isCorrect ? (question.Marks || 1) : 0
        });
      });

      // Submit quiz attempt
      const payload = {
        answers: answerDetails,
        score: totalScore,
        totalQuestions: questions.length,
        correctAnswers,
        timeSpent: quiz.TimeLimit ? (quiz.TimeLimit * 60 - timeRemaining) : 0
      };

      const response = await quizzesAPI.submitQuiz(quizId, payload);
      
      setScore(totalScore);
      setFeedback(
        totalScore >= (quiz.PassingMarks || 70) 
          ? '🎉 Congratulations! You passed the quiz.' 
          : '⚠️ You did not pass this quiz. Review the materials and try again.'
      );
      setQuizSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-dark mb-2">Error Loading Quiz</h3>
              <p className="text-text-muted mb-4">{error}</p>
              <Button variant="primary" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizStarted && !quizSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="bg-[#6b00b3] text-white p-6 rounded-t-lg">
              <h1 className="text-3xl font-bold mb-2">{quiz?.Title}</h1>
              <p className="text-white/80">Ready to take this quiz?</p>
            </div>

            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Total Questions:</strong> {questions.length}
                  </p>
                </div>

                {quiz?.TimeLimit && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-900">
                      <strong>Time Limit:</strong> {quiz.TimeLimit} minutes
                    </p>
                  </div>
                )}

                {quiz?.PassingMarks && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900">
                      <strong>Passing Score:</strong> {quiz.PassingMarks}%
                    </p>
                  </div>
                )}

                {quiz?.Description && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-text-dark mb-2">Description:</p>
                    <p className="text-sm text-text-muted">{quiz.Description}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button variant="primary" fullWidth onClick={handleStartQuiz}>
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (quizSubmitted) {
    const totalMarks = questions.reduce((sum, q) => sum + (q.Marks || 1), 0);
    const percentage = Math.round((score / totalMarks) * 100);
    const passed = percentage >= (quiz?.PassingMarks || 70);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className={`${passed ? 'bg-green-500' : 'bg-red-500'} text-white p-6 rounded-t-lg text-center`}>
              <div className="text-5xl font-bold mb-2">{percentage}%</div>
              <h2 className="text-2xl font-bold">{passed ? 'Quiz Passed! ✓' : 'Quiz Not Passed'}</h2>
            </div>

            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-text-dark font-medium">Score</span>
                  <span className="text-2xl font-bold text-[#6b00b3]">{score}/{totalMarks}</span>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">{feedback}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-text-muted mb-1">Total Questions</p>
                    <p className="text-2xl font-bold text-text-dark">{questions.length}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-text-muted mb-1">Time Spent</p>
                    <p className="text-2xl font-bold text-text-dark">
                      {quiz?.TimeLimit ? formatTime(quiz.TimeLimit * 60 - timeRemaining) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => navigate(-1)}>
                  Back to Course
                </Button>
                {!passed && (
                  <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={() => {
                      setQuizStarted(false);
                      setQuizSubmitted(false);
                      fetchQuizData();
                    }}
                  >
                    Retry Quiz
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const unansweredCount = Object.values(answers).filter(a => a === null).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-dark">{quiz?.Title}</h1>
          <Badge variant="primary" className="text-lg px-4 py-2">
            Time: {formatTime(timeRemaining)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Questions List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-full py-2 px-3 rounded-lg font-medium transition-colors ${
                        currentQuestionIndex === idx
                          ? 'bg-[#6b00b3] text-white'
                          : answers[idx]
                          ? 'bg-green-100 text-green-900'
                          : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                      }`}
                    >
                      Q{idx + 1}
                      {answers[idx] && <span className="ml-1">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-900">
                  <p className="font-medium mb-1">Unanswered: {unansweredCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <p className="text-lg font-semibold text-text-dark mb-4">
                    {currentQuestion?.QuestionText}
                  </p>

                  {currentQuestion?.Marks && (
                    <Badge variant="secondary" className="mb-4">
                      {currentQuestion.Marks} mark{currentQuestion.Marks > 1 ? 's' : ''}
                    </Badge>
                  )}

                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map(option => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          answers[currentQuestionIndex] === option
                            ? 'border-[#6b00b3] bg-[#6b00b3]/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={option}
                          checked={answers[currentQuestionIndex] === option}
                          onChange={() => handleAnswerChange(currentQuestionIndex, option)}
                          className="w-4 h-4 text-[#6b00b3] cursor-pointer"
                        />
                        <span className="ml-3 flex-grow">
                          <span className="font-medium text-text-dark">Option {option}:</span>
                          <span className="ml-2 text-text-muted">
                            {currentQuestion?.[`Option${option}`]}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    ← Previous
                  </Button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={handleSubmitQuiz}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleNextQuestion}
                      fullWidth
                    >
                      Next →
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
