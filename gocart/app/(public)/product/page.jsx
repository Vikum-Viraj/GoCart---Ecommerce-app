"use client"
import React from 'react'
import { useSelector } from 'react-redux'
import ProductCard from '@/components/ProductCard'

export default function ProductListPage() {
  const products = useSelector((state) => state.product.list || [])

  return (
    <div className="mx-6">
      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <div>No products available</div>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </div>
  )
}