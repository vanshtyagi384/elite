import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Send, Terminal, Loader2, User, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ProblemRound = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState(null);
    const [solvedQuestions, setSolvedQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [skippedQuestions, setSkippedQuestions] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestionsAndProgress = async () => {
            try {
                const [qRes, pRes] = await Promise.all([
                    api.get('/test/questions/2'),
                    api.get('/test/progress/round2')
                ]);
                setQuestions(qRes.data);
                setSolvedQuestions(pRes.data.solved || []);
            } catch (error) {
                console.error("Round 2 Load Error:", error.response?.data || error.message);
                toast.error(error.response?.data?.message || 'Not authorized or Round 2 not open');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestionsAndProgress();
    }, [navigate]);

    // Update the starting question to the first unsolved one whenever data loads
    useEffect(() => {
        if (questions.length > 0) {
            const firstUnsolvedIdx = questions.findIndex(q => !solvedQuestions.includes(q._id) && !skippedQuestions.includes(q._id));
            if (firstUnsolvedIdx !== -1) {
                setCurrentQuestionIndex(firstUnsolvedIdx);
            } else {
                setCurrentQuestionIndex(questions.length); // all solved/skipped
            }
        }
    }, [questions, solvedQuestions]);

    // Timer Logic
    useEffect(() => {
        if (loading || currentQuestionIndex >= questions.length) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestionIndex, loading, questions.length]);

    // Reset timer when question changes
    useEffect(() => {
        setTimeLeft(600);
    }, [currentQuestionIndex]);

    const handleTimeout = () => {
        if (currentQuestionIndex >= questions.length || !questions[currentQuestionIndex]) return;

        const qId = questions[currentQuestionIndex]._id;
        toast.warning("Time's up! Question skipped.");
        setSkippedQuestions(prev => [...prev, qId]);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const handleSingleSubmit = async (e, questionId) => {
        e.preventDefault();
        const answer = answers[questionId];
        if (!answer || !answer.trim()) return toast.warning('Please enter an answer');

        setSubmittingId(questionId);
        try {
            const res = await api.post('/test/submit/round2/question', { questionId, answer });
            if (res.data.isCorrect) {
                toast.success(`Correct Answer!`);
                setSolvedQuestions(prev => [...prev, questionId]);
            } else {
                toast.error('Incorrect answer. Keep trying!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmittingId(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-purple-500" size={48} />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10">
            <header className="mb-12 border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Round 2: The Arena
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        Provide precise answers for the following logic-based problems. Your answers will be graded based on exact match or algorithmic logic.
                    </p>
                </div>
                <div className="flex gap-4">
                    {/* Timer */}
                    {currentQuestionIndex < questions.length && (
                        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-colors ${timeLeft <= 60 ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-800/50 border-white/5'}`}>
                            <div className={`p-2 rounded-lg ${timeLeft <= 60 ? 'bg-red-500/20' : 'bg-orange-500/10'}`}>
                                <Clock size={20} className={timeLeft <= 60 ? 'text-red-400 animate-pulse' : 'text-orange-400'} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Time Left</p>
                                <p className={`font-mono text-lg font-bold ${timeLeft <= 60 ? 'text-red-400' : 'text-white'}`}>
                                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                </p>
                            </div>
                        </div>
                    )}
                    {/* Participant Info */}
                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-800/50 rounded-2xl border border-white/5 h-fit">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <User size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Participant</p>
                            <p className="font-mono text-sm text-white">{user?.username}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="space-y-12">
                <div className="space-y-12">
                    {questions.map((q, idx) => {
                        if (idx !== currentQuestionIndex) return null;

                        const isSolved = solvedQuestions.includes(q._id);
                        const isSubmitting = submittingId === q._id;

                        return (
                            <div id={`problem-${q._id}`} key={q._id} className={`glass-card p-8 rounded-3xl border-2 transition-all ${isSolved ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-transparent'}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-4 text-purple-400 font-bold">
                                        <Terminal size={24} />
                                        <span>PROBLEM_0{idx + 1}</span>
                                    </div>
                                    {isSolved && (
                                        <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold flex items-center gap-2">
                                            Solved
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-xl font-medium text-white mb-8 leading-relaxed">
                                    {q.question}
                                </h2>

                                <form onSubmit={(e) => handleSingleSubmit(e, q._id)} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 tracking-wider uppercase">Submission Input</label>
                                        <textarea
                                            required
                                            rows={4}
                                            disabled={isSolved || isSubmitting}
                                            className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-slate-100 font-mono focus:ring-1 ring-purple-500 outline-none placeholder:text-slate-700 disabled:opacity-50"
                                            placeholder={isSolved ? "You have already solved this problem." : "Type your answer here..."}
                                            value={answers[q._id] || ''}
                                            onChange={e => setAnswers({ ...answers, [q._id]: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        {isSolved ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCurrentQuestionIndex(prev => prev + 1);
                                                }}
                                                className="flex items-center gap-3 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all text-lg border border-white/10 shadow-lg"
                                            >
                                                Next Problem <ArrowRight size={20} />
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex items-center gap-3 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-purple-500/20 text-lg"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                                Submit Code
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        );
                    })}

                    {questions.length > 0 && currentQuestionIndex >= questions.length && (
                        <div className="glass-card p-12 rounded-3xl text-center">
                            <h2 className="text-3xl font-bold text-emerald-400 mb-4 tracking-tight">Arena Completed!</h2>
                            <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
                                You have finished all problems in Round 2. Stay tuned for the final results on the main dashboard.
                            </p>
                        </div>
                    )}

                    {questions.length > 0 && currentQuestionIndex >= questions.length && (
                        <div className="flex justify-end pt-8">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-white/10"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemRound;
