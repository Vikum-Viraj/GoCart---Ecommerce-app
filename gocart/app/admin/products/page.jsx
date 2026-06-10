'use client'
import { useState, useEffect } from 'react'
import ProductForm from '@/components/admin/ProductForm'
import { Trash2, Edit2 } from 'lucide-react'

export default function AdminProductsPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingProduct, setEditingProduct] = useState(null)
    const [showForm, setShowForm] = useState(false)

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/store/product', {
                credentials: 'include'
            })
            const data = await response.json()
            if (response.ok) {
                setProducts(data.products)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleProductSaved = (newProduct) => {
        if (editingProduct) {
            setProducts(products.map(p => p.id === newProduct.id ? newProduct : p))
            setEditingProduct(null)
        } else {
            setProducts([newProduct, ...products])
        }
        setShowForm(false)
        // Refresh products to ensure data is up to date
        setTimeout(() => fetchProducts(), 1000)
    }

    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return
        
        try {
            const response = await fetch(`/api/store/product/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (response.ok) {
                setProducts(products.filter(p => p.id !== productId))
            }
        } catch (error) {
            console.error('Error deleting product:', error)
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">
                    Manage <span className="text-blue-600">Products</span>
                </h1>
                <button
                    onClick={() => {
                        setEditingProduct(null)
                        setShowForm(!showForm)
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    {showForm ? 'Cancel' : '+ Add Product'}
                </button>
            </div>

            {showForm && (
                <ProductForm 
                    onProductSaved={handleProductSaved}
                    initialProduct={editingProduct}
                />
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-500 text-lg">No products yet. Create your first product!</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b">
                                <th className="p-4 text-left text-slate-700 font-semibold">Product Name</th>
                                <th className="p-4 text-left text-slate-700 font-semibold">Category</th>
                                <th className="p-4 text-left text-slate-700 font-semibold">Price</th>
                                <th className="p-4 text-left text-slate-700 font-semibold">MRP</th>
                                <th className="p-4 text-left text-slate-700 font-semibold">Stock</th>
                                <th className="p-4 text-center text-slate-700 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-b hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {product.images[0] && (
                                                <img 
                                                    src={product.images[0]} 
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            )}
                                            <span className="font-medium text-slate-800">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600">{product.category}</td>
                                    <td className="p-4 font-semibold text-slate-800">${product.price}</td>
                                    <td className="p-4 text-slate-600">${product.mrp}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            product.inStock 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setEditingProduct(product)
                                                    setShowForm(true)
                                                }}
                                                className="text-blue-600 hover:text-blue-800 transition"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-800 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
