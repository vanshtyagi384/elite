import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Timer, Send, ChevronLeft, ChevronRight, AlertTriangle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MCQTest = () => {
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([qid, ans]) => ({
                questionId: qid,
                selectedAnswer: ans
            }));
            await api.post('/test/submit/round1', {
                answers: formattedAnswers,
                timeTaken: 1800 - timeLeft
            });
            toast.success('Test submitted successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    }, [answers, navigate, submitting, timeLeft]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const { data } = await api.get('/test/questions/1');
                setQuestions(data);
            } catch (error) {
                toast.error('Failed to load questions');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [navigate]);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, handleSubmit]);

    useEffect(() => {
        // Basic Anti-cheating: Warn on back navigation
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Timer className="animate-spin text-blue-500" size={48} />
        </div>
    );

    const formatTime = (sec) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = questions[currentIdx];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="sticky top-20 z-40 flex justify-between items-center glass-card p-4 rounded-2xl mb-8 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-medium">Question {currentIdx + 1} of {questions.length}</span>
                    <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden hidden md:block">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5">
                        <User size={16} className="text-slate-400" />
                        <span className="text-sm font-mono text-blue-400">{user?.username}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                        <Timer size={20} />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card p-8 rounded-3xl min-h-[400px] flex flex-col"
                >
                    <h2 className="text-2xl font-medium text-white mb-8 leading-relaxed">
                        {currentQuestion?.question}
                    </h2>

                    <div className="grid gap-4 mt-auto">
                        {currentQuestion?.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion._id]: option }))}
                                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${answers[currentQuestion._id] === option
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                                    : 'bg-slate-800/30 border-white/10 text-slate-400 hover:border-white/30'
                                    }`}
                            >
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border ${answers[currentQuestion._id] === option ? 'bg-blue-500 border-blue-400 text-white' : 'bg-slate-700/50 border-white/10'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                {option}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-between items-center">
                <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={20} />
                    Previous
                </button>

                {currentIdx === questions.length - 1 ? (
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to final submit?')) handleSubmit();
                        }}
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Send size={20} />
                        {submitting ? 'Submitting...' : 'Final Submit'}
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentIdx(prev => prev + 1)}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
                    >
                        Next
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>

            <div className="mt-12 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-4 text-yellow-500/80 text-sm">
                <AlertTriangle className="shrink-0" size={20} />
                <p>Warning: Refresing the page or navigating back may result in test termination or data loss. Please stay on this page until submission.</p>
            </div>
        </div>
    );
};

export default MCQTest;
