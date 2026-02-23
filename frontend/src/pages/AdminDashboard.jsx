import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Users, PlusCircle, Trophy, Settings, List, Plus, Search, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('teams');
    const [teams, setTeams] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [round, setRound] = useState(1);

    // Forms
    const [newTeam, setNewTeam] = useState({ teamName: '', username: '', password: '' });
    const [newQuestion, setNewQuestion] = useState({
        round: 1, type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: '', marks: 4, negativeMarks: -1
    });

    const fetchData = async () => {
        try {
            const tRes = await api.get('/auth/teams');
            setTeams(tRes.data);
            const lRes = await api.get(`/test/leaderboard/${round}`);
            setLeaderboard(lRes.data);
        } catch (error) {
            toast.error('Failed to fetch data');
        }
    };

    useEffect(() => {
        fetchData();
    }, [round]);

    const handleAddTeam = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/teams', newTeam);
            toast.success('Team created');
            setNewTeam({ teamName: '', username: '', password: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create team');
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        try {
            await api.post('/test/questions', newQuestion);
            toast.success('Question added');
            setNewQuestion({ ...newQuestion, question: '', options: ['', '', '', ''], correctAnswer: '' });
        } catch (error) {
            toast.error('Failed to add question');
        }
    };

    const handleQualify = async (teamId) => {
        try {
            await api.post('/test/qualify', { teamIds: [teamId] });
            toast.success('Team qualified');
            fetchData();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="md:w-64 space-y-2">
                    {[
                        { id: 'teams', icon: Users, label: 'Manage Teams' },
                        { id: 'questions', icon: PlusCircle, label: 'Add Questions' },
                        { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50'
                                }`}
                        >
                            <tab.icon size={20} />
                            <span className="font-semibold">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 glass-card rounded-3xl p-8">
                    {activeTab === 'teams' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                            <section className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Plus size={20} className="text-blue-500" /> Register New Team
                                </h3>
                                <form onSubmit={handleAddTeam} className="grid md:grid-cols-3 gap-4">
                                    <input
                                        type="text" placeholder="Team Name" required
                                        className="bg-slate-800 border-white/10 rounded-xl px-4 py-2 focus:ring-1 ring-blue-500 outline-none"
                                        value={newTeam.teamName} onChange={e => setNewTeam({ ...newTeam, teamName: e.target.value })}
                                    />
                                    <input
                                        type="text" placeholder="Username" required
                                        className="bg-slate-800 border-white/10 rounded-xl px-4 py-2 focus:ring-1 ring-blue-500 outline-none"
                                        value={newTeam.username} onChange={e => setNewTeam({ ...newTeam, username: e.target.value })}
                                    />
                                    <input
                                        type="password" placeholder="Password" required
                                        className="bg-slate-800 border-white/10 rounded-xl px-4 py-2 focus:ring-1 ring-blue-500 outline-none"
                                        value={newTeam.password} onChange={e => setNewTeam({ ...newTeam, password: e.target.value })}
                                    />
                                    <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all">
                                        Create Team Account
                                    </button>
                                </form>
                            </section>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-white/5">
                                            <th className="pb-4 px-4 font-medium">Team Name</th>
                                            <th className="pb-4 px-4 font-medium">Username</th>
                                            <th className="pb-4 px-4 font-medium">Created At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {teams.map(team => (
                                            <tr key={team._id} className="group hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-medium">{team.teamName}</td>
                                                <td className="py-4 px-4 text-slate-400 font-mono text-sm">{team.username}</td>
                                                <td className="py-4 px-4 text-slate-500">{new Date(team.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'questions' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h3 className="text-2xl font-bold mb-8">Add Question</h3>
                            <form onSubmit={handleAddQuestion} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Round</label>
                                        <select
                                            className="w-full bg-slate-800 border-white/10 rounded-xl px-4 py-2"
                                            value={newQuestion.round} onChange={e => setNewQuestion({ ...newQuestion, round: parseInt(e.target.value) })}
                                        >
                                            <option value={1}>Round 1 (MCQ)</option>
                                            <option value={2}>Round 2 (Problem)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Type</label>
                                        <select
                                            className="w-full bg-slate-800 border-white/10 rounded-xl px-4 py-2"
                                            value={newQuestion.type} onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value })}
                                        >
                                            <option value="mcq">MCQ</option>
                                            <option value="problem">Problem Round</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Question Content</label>
                                    <textarea
                                        required rows={3}
                                        className="w-full bg-slate-800 border-white/10 rounded-xl px-4 py-4"
                                        value={newQuestion.question} onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                    />
                                </div>

                                {newQuestion.type === 'mcq' && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {newQuestion.options.map((opt, idx) => (
                                            <input
                                                key={idx} type="text" placeholder={`Option ${idx + 1}`} required
                                                className="bg-slate-800 border-white/10 rounded-xl px-4 py-2"
                                                value={opt} onChange={e => {
                                                    const newOpts = [...newQuestion.options];
                                                    newOpts[idx] = e.target.value;
                                                    setNewQuestion({ ...newQuestion, options: newOpts });
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Correct Answer</label>
                                    <input
                                        type="text" placeholder={newQuestion.type === 'mcq' ? "Exact option text" : "Provide correct answer / key"} required
                                        className="w-full bg-slate-800 border-white/10 rounded-xl px-4 py-2"
                                        value={newQuestion.correctAnswer} onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-bold transition-all text-xl">
                                    Add to Repository
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'leaderboard' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold text-white tracking-tight">Real-time Standings</h3>
                                <div className="flex gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/5">
                                    <button
                                        onClick={() => setRound(1)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${round === 1 ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >Round 1</button>
                                    <button
                                        onClick={() => setRound(2)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${round === 2 ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >Round 2</button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {leaderboard.map((res, idx) => (
                                    <div key={res._id} className="flex items-center gap-4 glass-card p-5 rounded-2xl border-l-4 border-l-blue-500 hover:bg-white/5 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-white/5">
                                            #{idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-white">{res.teamId.teamName}</h4>
                                            <p className="text-xs text-slate-500 font-mono tracking-wider uppercase">Team: {res.teamId.username}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-8">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Time</p>
                                                <p className="text-slate-300 font-mono">{Math.floor(res.totalTime / 60)}m {res.totalTime % 60}s</p>
                                            </div>
                                            <div className="min-w-[80px]">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Score</p>
                                                <p className="text-2xl font-black text-blue-400">{res.totalScore}</p>
                                            </div>
                                            {round === 1 && (
                                                <button
                                                    onClick={() => handleQualify(res.teamId._id)}
                                                    disabled={res.qualified}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${res.qualified
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-white/10 text-white hover:bg-emerald-600 border border-white/10'
                                                        }`}
                                                >
                                                    {res.qualified ? <CheckCircle size={18} /> : null}
                                                    {res.qualified ? 'Qualified' : 'Qualify'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
