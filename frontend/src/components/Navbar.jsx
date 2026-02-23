import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Trophy, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="glass-card sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white/10">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                EliteTest
            </Link>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-300">
                    <User size={18} />
                    <span className="font-medium">{user.teamName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">
                        {user.role}
                    </span>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
