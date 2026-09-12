import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Quiz, Subject, QuizQuestion } from '../types';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  RotateCcw, 
  History, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AiQuizPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [quizzesHistory, setQuizzesHistory] = useState<Quiz[]>([]);
  
  // Generator form
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic, setTopic] = useState('Database Normalization (1NF, 2NF, 3NF & BCNF)');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const fetchInitial = async () => {
    try {
      const [subRes, quizRes] = await Promise.all([
        api.subjects.getAll(),
        api.ai.getQuizzes()
      ]);
      setSubjects(subRes.data);
      if (subRes.data.length > 0) {
        setSelectedSubject(subRes.data[0].name);
      }
      setQuizzesHistory(quizRes.data);
      if (quizRes.data.length > 0 && !activeQuiz) {
        // Load latest completed quiz into review if available
        const latest = quizRes.data[0];
        setActiveQuiz(latest);
        setIsSubmitted(latest.completed);
        if (latest.completed) {
          setSubmissionResult({
            score: latest.score,
            total: latest.total_questions,
            percentage: Math.round((latest.score / latest.total_questions) * 100)
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setGenerating(true);
    setFormError(null);

    try {
      const res = await api.ai.generateQuiz({
        subjectName: selectedSubject || 'Computer Science',
        topic,
        difficulty,
        questionCount
      });

      const newQuiz: Quiz = res.data;
      setActiveQuiz(newQuiz);
      setUserAnswers({});
      setCurrentQIndex(0);
      setIsSubmitted(false);
      setSubmissionResult(null);
      setQuizzesHistory(prev => [newQuiz, ...prev]);
    } catch (err: any) {
      setFormError(err.message || 'Failed to generate quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    try {
      const res = await api.ai.submitQuiz(activeQuiz.id, userAnswers);
      setSubmissionResult(res.data);
      setActiveQuiz(res.data.quiz);
      setIsSubmitted(true);
      
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 }
      });
      
      // Update in history list
      setQuizzesHistory(prev => prev.map(q => q.id === activeQuiz.id ? res.data.quiz : q));
    } catch (err: any) {
      alert('Failed to submit quiz: ' + err.message);
    }
  };

  const currentQ: QuizQuestion | undefined = activeQuiz?.questions[currentQIndex];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>AI Interactive Quiz Generator</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Sparkles size={12} className="text-purple-500" /> Auto-Graded
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test your knowledge with AI-generated university exam questions, timed sessions, and instantaneous solution explanations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1 col): Quiz Configuration Form */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <HelpCircle size={18} className="text-brand-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Generate New Quiz
            </h3>
          </div>

          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject Module
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Topic / Concept *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. BCNF, Relational Algebra, ACID Properties"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Easy">Easy (Fundamentals)</option>
                  <option value="Medium">Medium (Exam Level)</option>
                  <option value="Hard">Hard (Challenging)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating || !topic.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Gemini is generating MCQs...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </form>

          {/* Past Quiz History */}
          {quizzesHistory.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <History size={13} /> Past Quiz Attempts
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {quizzesHistory.map(q => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveQuiz(q);
                      setIsSubmitted(q.completed);
                      setCurrentQIndex(0);
                      if (q.completed) {
                        setSubmissionResult({
                          score: q.score,
                          total: q.total_questions,
                          percentage: Math.round((q.score / q.total_questions) * 100)
                        });
                      }
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                      activeQuiz?.id === q.id
                        ? 'bg-brand-50 dark:bg-brand-950 font-bold text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate max-w-[140px]">
                      <div>{q.topic}</div>
                      <div className="text-[10px] text-slate-400">{q.subject_name}</div>
                    </div>
                    {q.completed ? (
                      <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        {q.score}/{q.total_questions}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-500 font-semibold">Pending</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (2 cols): Interactive Quiz Session */}
        <div className="lg:col-span-2 space-y-6">
          {activeQuiz && currentQ ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[560px]">
              
              <div>
                {/* Quiz Status Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                      {activeQuiz.subject_name}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {activeQuiz.topic}
                    </h3>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Question {currentQIndex + 1} of {activeQuiz.total_questions}
                    </span>
                    <div className="w-24 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-brand-500 transition-all duration-300"
                        style={{ width: `${((currentQIndex + 1) / activeQuiz.total_questions) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Score Banner (if submitted) */}
                {isSubmitted && submissionResult && (
                  <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                      <Award size={28} />
                      <div>
                        <h4 className="text-base font-extrabold">
                          Quiz Completed! Score: {submissionResult.score} / {submissionResult.total} ({submissionResult.percentage}%)
                        </h4>
                        <p className="text-xs text-emerald-100">
                          {submissionResult.percentage >= 80 
                            ? 'Excellent mastery of concepts! 🌟' 
                            : 'Review the explanations below to strengthen weak areas.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setUserAnswers({});
                        setCurrentQIndex(0);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <RotateCcw size={14} /> Retake
                    </button>
                  </div>
                )}

                {/* Question Prompt */}
                <div className="my-6">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                    {currentQ.question}
                  </h4>
                </div>

                {/* MCQ Options A, B, C, D */}
                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const optText = currentQ.options[optKey];
                    const isSelected = (userAnswers[currentQ.id] === optKey) || (currentQ.selected_option === optKey);
                    const isCorrect = currentQ.correct_option === optKey;

                    let optionStyle = 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-brand-400';

                    if (isSubmitted) {
                      if (isCorrect) {
                        optionStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-900 dark:text-rose-200 line-through';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-brand-50 dark:bg-brand-950/50 border-brand-500 text-brand-900 dark:text-brand-200 font-bold ring-2 ring-brand-500/20';
                    }

                    return (
                      <div
                        key={optKey}
                        onClick={() => handleSelectOption(currentQ.id, optKey)}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${optionStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {optKey}
                        </span>
                        <span className="text-xs leading-relaxed mt-0.5 flex-1">{optText}</span>

                        {isSubmitted && isCorrect && (
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        )}
                        {isSubmitted && isSelected && !isCorrect && (
                          <XCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Solution Explanation (Shown after submit) */}
                {isSubmitted && currentQ.explanation && (
                  <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-brand-500" /> Explanation:
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Previous
                </button>

                {currentQIndex < activeQuiz.total_questions - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex(prev => Math.min(activeQuiz.total_questions - 1, prev + 1))}
                    className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-900 flex items-center gap-1.5"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                ) : (
                  !isSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={15} /> Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQIndex(0)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50"
                    >
                      Review All Questions
                    </button>
                  )
                )}
              </div>

            </div>
          ) : (
            <div className="py-28 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <HelpCircle size={44} className="mx-auto text-brand-400 mb-3 opacity-40 animate-pulse" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Start an Interactive Quiz
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Choose a subject and topic on the left and click "Generate Quiz" to begin.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
