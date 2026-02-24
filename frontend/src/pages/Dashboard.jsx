import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Play, ClipboardCheck, Timer, Trophy, ChevronRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await api.get(`/test/leaderboard/1`); // Simplified for status check
                const myResult = data.find(r => r.teamId._id === user._id);
                if (myResult) setResults(prev => [...prev, myResult]);
            } catch (error) {
                console.error('Error fetching status');
            }
        };
        fetchResults();
    }, [user._id]);

    const round1Result = results.find(r => r.round === 1);

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Team Dashboard
                    </h1>
                    <p className="text-slate-400">Welcome, <span className="text-white font-bold">{user.teamName}</span></p>
                    <p className="text-sm text-blue-400 font-mono mt-1">Participant ID: {user.username}</p>
                </div>
                <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Current Status</p>
                        <p className="text-xl font-semibold text-white">
                            {round1Result
                                ? (round1Result.qualified ? 'Qualified for R2' : 'Completed R1')
                                : 'Ready to Start'}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Round 1 Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card rounded-3xl p-8 relative overflow-hidden group"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                            <ClipboardCheck size={32} />
                        </div>
                        {round1Result && (
                            <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                                Score: {round1Result.totalScore}
                            </span>
                        )}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">Round 1: MCQ Challenge</h3>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Test your knowledge with 20 multiple-choice questions. You have 30 minutes.
                        Points: +4 for correct, -1 for incorrect.
                    </p>

                    {round1Result ? (
                        <div className="w-full py-4 text-center bg-slate-800/50 rounded-xl text-slate-300 font-medium">
                            Successfully Submitted
                        </div>
                    ) : (
                        <Link
                            to="/test/round1"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
                        >
                            <Play size={20} fill="currentColor" />
                            Start Round 1
                        </Link>
                    )}
                </motion.div>

                {/* Round 2 Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className={`glass-card rounded-3xl p-8 relative overflow-hidden group ${(!round1Result || !round1Result.qualified) ? 'opacity-50' : ''}`}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
                            <Timer size={32} />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">Round 2: Problem Solving</h3>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Advanced problems requiring logical thinking and precise answers.
                        Only for teams that qualified in Round 1.
                    </p>

                    {round1Result?.qualified ? (
                        <Link
                            to="/test/round2"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all"
                        >
                            <Play size={20} fill="currentColor" />
                            Enter Arena
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-700/50 text-slate-500 font-bold rounded-xl cursor-not-allowed"
                        >
                            <Lock size={20} />
                            Locked
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
