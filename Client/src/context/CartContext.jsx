import React, { createContext, useContext, useReducer, useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const API_BASE_URL = (() => {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured) return configured
  const protocol = window.location.protocol || 'http:'
  const hostname = window.location.hostname || 'localhost'
  return `${protocol}//${hostname}:7999/api/v1`
})()

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
      }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }
    case 'UPDATE_QTY': {
      if (action.payload.qty <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.qty } : i
        ),
      }
    }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'SET_ITEMS':
      return { ...state, items: action.payload }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const saveTimerRef = useRef(null)
  const initialSyncDone = useRef(false)

  // ── Load cart from DB when user logs in ──────────────────────────────────
  useEffect(() => {
    if (!user?.id) {
      initialSyncDone.current = false
      return
    }
    const localItems = state.items
    fetch(`${API_BASE_URL}/cart?account_id=${user.id}`)
      .then(r => r.ok ? r.json() : { items: [] })
      .then(({ items: dbItems }) => {
        if (dbItems && dbItems.length > 0) {
          // DB cart exists: merge with local (add local items not in DB)
          const merged = [...dbItems]
          localItems.forEach(localItem => {
            if (!merged.find(i => i.id === localItem.id)) {
              merged.push(localItem)
            }
          })
          dispatch({ type: 'SET_ITEMS', payload: merged })
        } else if (localItems.length > 0) {
          // DB empty, push local cart up
          saveCartToDB(user.id, localItems)
        }
        initialSyncDone.current = true
      })
      .catch(() => { initialSyncDone.current = true })
  }, [user?.id])

  // ── Debounced save to DB on every cart change ────────────────────────────
  useEffect(() => {
    if (!user?.id || !initialSyncDone.current) return
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveCartToDB(user.id, state.items)
    }, 800)
    return () => clearTimeout(saveTimerRef.current)
  }, [state.items, user?.id])

  const saveCartToDB = (accountId, items) => {
    fetch(`${API_BASE_URL}/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_id: accountId, items }),
    }).catch(() => {})
  }

  // ── Cart actions ─────────────────────────────────────────────────────────
  const addItem = (product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } })
    toast.success(`${product.name} added to cart`, {
      style: {
        background: '#435729', color: '#fff',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '14px', borderRadius: '12px',
      },
      iconTheme: { primary: '#a8bf8e', secondary: '#fff' },
    })
  }

  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id })
  const updateQty  = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } })

  const clearCart = () => {
    dispatch({ type: 'CLEAR' })
    if (user?.id) {
      fetch(`${API_BASE_URL}/cart/${user.id}`, { method: 'DELETE' }).catch(() => {})
    }
  }

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0)
  const subtotal   = state.items.reduce((s, i) => s + i.price * i.quantity, 0)

  const FREE_THRESHOLD = 999
  const DELIVERY_CHARGE = 400

  const isFreeDelivery = subtotal >= FREE_THRESHOLD
  const delivery = isFreeDelivery ? 0 : DELIVERY_CHARGE
  const amountForFreeDelivery = isFreeDelivery ? 0 : FREE_THRESHOLD - subtotal
  const total = subtotal + delivery

  return (
    <CartContext.Provider
      value={{
        items: state.items, addItem, removeItem, updateQty, clearCart,
        totalItems, subtotal, delivery, total,
        isFreeDelivery, amountForFreeDelivery,
        sidebarOpen, setSidebarOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
