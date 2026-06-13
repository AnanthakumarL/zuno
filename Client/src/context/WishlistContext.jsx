import React, { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('amudhu_wishlist') || '[]') }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('amudhu_wishlist', JSON.stringify(items))
  }, [items])

  const isWishlisted = (id) => items.some(i => i.id === id)

  const toggleWishlist = (product) => {
    setItems(prev => {
      if (prev.some(i => i.id === product.id)) {
        toast('Removed from wishlist', { icon: '💔', style: { borderRadius: '12px', fontSize: '14px' } })
        return prev.filter(i => i.id !== product.id)
      }
      toast('Added to wishlist', { icon: '❤️', style: { borderRadius: '12px', fontSize: '14px' } })
      return [...prev, product]
    })
  }

  const removeFromWishlist = (id) => setItems(prev => prev.filter(i => i.id !== id))

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}
