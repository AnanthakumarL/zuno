import React, { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, ShoppingBag, User, LogOut, Heart, ClipboardList, Crown } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const links = [
  { to: '/',          label: 'Home' },
  { to: '/menu',      label: 'Shop' },
  { to: '/subscribe', label: 'Premium', premium: true },
  { to: '/about',     label: 'About' },
  { to: '/contact',   label: 'Contact' },
]

export default function Navbar() {
  const { items } = useCart()
  const cartCount = items.length
  const { items: wishlistItems } = useWishlist()
  const { user, logout, isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    setShowUserMenu(false)
    navigate('/')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showUserMenu])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="bg-olive-700 p-1.5 rounded-xl group-hover:bg-olive-900 transition-colors">
              <ShoppingBag size={20} className="text-white" />
            </span>
            <span className="font-display text-base sm:text-lg font-bold text-stone-900 uppercase tracking-[0.18em]">
              Zuno
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <li key={l.to}>
                {l.premium ? (
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-full text-sm font-body font-semibold transition-colors duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`
                    }
                  >
                    <Crown size={13} />
                    {l.label}
                  </NavLink>
                ) : (
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-full text-sm font-body font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-stone-100 text-stone-800'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link to="/menu" className="hidden md:block btn-primary py-2 px-5">
              Shop Now
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-olive-700 text-white text-[10px] font-bold
                             rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center px-1"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="hidden md:flex items-center gap-2 p-2.5 rounded-full text-stone-600 hover:bg-stone-100 transition-colors"
                  aria-label="User menu"
                >
                  <User size={20} />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="text-sm font-medium text-stone-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-stone-500 truncate">{user?.email || user?.phone}</p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <ClipboardList size={16} className="text-olive-700" />
                      My Orders
                    </Link>
                    <Link
                      to="/cart#wishlist"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2">
                        <Heart size={16} className="text-rose-500" />
                        Wishlist
                      </span>
                      {wishlistItems.length > 0 && (
                        <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          {wishlistItems.length}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <User size={18} />
                Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-full text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-white border-t border-stone-100 overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {links.map(l => (
                  l.premium ? (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-xl text-sm font-body font-semibold transition-colors flex items-center gap-2 ${
                          isActive
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`
                      }
                    >
                      <Crown size={15} />
                      {l.label}
                    </NavLink>
                  ) : (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      end={l.to === '/'}
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-xl text-sm font-body font-medium transition-colors ${
                          isActive
                            ? 'bg-stone-100 text-stone-800'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`
                      }
                    >
                      {l.label}
                    </NavLink>
                  )
                ))}
                
                <div className="border-t border-stone-200 my-2"></div>
                
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 bg-stone-50 rounded-xl">
                      <p className="text-sm font-medium text-stone-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-stone-500 truncate">{user?.email || user?.phone}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="px-4 py-3 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <ClipboardList size={18} className="text-olive-700" />
                      My Orders
                    </Link>
                    <Link
                      to="/cart#wishlist"
                      className="px-4 py-3 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2">
                        <Heart size={18} className="text-rose-500" />
                        Wishlist
                      </span>
                      {wishlistItems.length > 0 && (
                        <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          {wishlistItems.length}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <User size={18} />
                    Login / Sign Up
                  </Link>
                )}
                
                <Link to="/menu" className="btn-primary text-center mt-2">
                  Shop Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
