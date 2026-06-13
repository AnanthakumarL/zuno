import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Users,
    UserCircle,
    Briefcase,
    Factory,
    Truck,
    Crown,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_USER_KEY = 'admin_user';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',     path: '/dashboard' },
    { icon: ShoppingBag,     label: 'Products',      path: '/products' },
    { icon: ShoppingCart,    label: 'Orders',        path: '/orders' },
    { icon: Factory,         label: 'Production',    path: '/production-management' },
    { icon: Truck,           label: 'Delivery',      path: '/delivery-management' },
    { icon: Users,           label: 'Accounts',      path: '/accounts' },
    { icon: UserCircle,      label: 'Users',         path: '/users' },
    { icon: Crown,           label: 'Subscriptions', path: '/subscriptions' },
    { icon: Briefcase,       label: 'Careers',       path: '/careers' },
    { icon: Settings,        label: 'Site Config',   path: '/site-config' },
];

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem(ADMIN_USER_KEY);
        navigate('/login');
    };

    const handleNavClick = () => {
        if (isMobile) setIsOpen(false);
    };

    // Mobile: slide in/out with translateX, always 280px wide
    // Desktop: animate width between 80px and 280px
    const sidebarAnimation = isMobile
        ? { x: isOpen ? 0 : -300, width: 280 }
        : { x: 0, width: isOpen ? 280 : 80 };

    return (
        <motion.aside
            initial={false}
            animate={sidebarAnimation}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed left-0 top-0 h-screen bg-white border-r border-dark-200 z-50 flex flex-col shadow-xl shadow-dark-900/5"
        >
            {/* Header */}
            <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-6 border-b border-dark-100 shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">Z</span>
                    </div>
                    <AnimatePresence>
                        {(isOpen) && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="font-heading font-bold text-xl text-dark-900 whitespace-nowrap overflow-hidden"
                            >
                                Zuno Admin
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile: close X | Desktop: collapse toggle */}
                {isMobile ? (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-dark-50 text-dark-400 hover:text-dark-900 transition-colors"
                    >
                        <X size={20} />
                    </button>
                ) : (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1.5 rounded-lg hover:bg-dark-50 text-dark-400 hover:text-dark-900 transition-colors"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className={clsx(
                                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative',
                                isActive
                                    ? 'bg-violet-50 text-violet-700'
                                    : 'text-dark-500 hover:bg-dark-50 hover:text-dark-900'
                            )}
                        >
                            <item.icon
                                size={22}
                                className={clsx(
                                    'transition-colors flex-shrink-0',
                                    isActive ? 'text-violet-600' : 'text-dark-400 group-hover:text-dark-600'
                                )}
                            />
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="font-medium whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {/* Tooltip for collapsed desktop state */}
                            {!isOpen && !isMobile && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-dark-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-dark-100 shrink-0">
                <button
                    onClick={handleLogout}
                    className={clsx(
                        'flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors',
                        !isOpen && !isMobile && 'justify-center'
                    )}
                >
                    <LogOut size={22} className="flex-shrink-0" />
                    <AnimatePresence>
                        {isOpen && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                                className="font-medium whitespace-nowrap overflow-hidden"
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
