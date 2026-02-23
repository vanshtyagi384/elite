import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Send, Terminal, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ProblemRound = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const { data } = await api.get('/test/questions/2');
                setQuestions(data);
            } catch (error) {
                toast.error('Not authorized or Round 2 not open');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([qid, ans]) => ({
                questionId: qid,
                selectedAnswer: ans
            }));
            await api.post('/test/submit/round2', { answers: formattedAnswers });
            toast.success('Round 2 submitted! Final results will be announced soon.');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-purple-500" size={48} />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10">
            <header className="mb-12 border-b border-white/5 pb-8">
                <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Round 2: The Arena
                </h1>
                <p className="text-slate-400 max-w-2xl">
                    Provide precise answers for the following logic-based problems. Your answers will be graded based on exact match or algorithmic logic.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
                {questions.map((q, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={q._id}
                        className="glass-card p-8 rounded-3xl"
                    >
                        <div className="flex items-center gap-4 mb-6 text-purple-400 font-bold">
                            <Terminal size={24} />
                            <span>PROBLEM_0{idx + 1}</span>
                        </div>

                        <h2 className="text-xl font-medium text-white mb-8 leading-relaxed">
                            {q.question}
                        </h2>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 tracking-wider uppercase">Submission Input</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-slate-100 font-mono focus:ring-1 ring-purple-500 outline-none placeholder:text-slate-700"
                                placeholder="Type your answer here..."
                                value={answers[q._id] || ''}
                                onChange={e => setAnswers({ ...answers, [q._id]: e.target.value })}
                            />
                        </div>
                    </motion.div>
                ))}

                <div className="flex justify-end pt-8">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-3 px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-purple-500/20 text-xl"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                        Submit Challenge
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProblemRound;
