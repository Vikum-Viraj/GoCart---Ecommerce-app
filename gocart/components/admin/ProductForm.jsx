'use client'
import { useState, useEffect } from 'react'
import { X, Plus, Image as ImageIcon } from 'lucide-react'

export default function ProductForm({ onProductSaved, initialProduct = null }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        mrp: '',
        images: []
    })
    const [imagePreviewUrls, setImagePreviewUrls] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        setError('')
        setSuccess('')
        if (initialProduct) {
            setFormData({
                name: initialProduct.name,
                description: initialProduct.description,
                category: initialProduct.category,
                price: initialProduct.price.toString(),
                mrp: initialProduct.mrp.toString(),
                images: []
            })
            setImagePreviewUrls(initialProduct.images || [])
        }
    }, [initialProduct])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || [])
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }))

        files.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreviewUrls(prev => [...prev, reader.result])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeImagePreview = (index) => {
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
        if (index < formData.images.length) {
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.mrp) {
            setError('All fields are required')
            return
        }

        if (imagePreviewUrls.length === 0) {
            setError('At least one image is required')
            return
        }

        if (parseFloat(formData.price) > parseFloat(formData.mrp)) {
            setError('Price cannot be greater than MRP')
            return
        }

        try {
            setLoading(true)
            const formDataToSend = new FormData()
            formDataToSend.append('name', formData.name)
            formDataToSend.append('description', formData.description)
            formDataToSend.append('category', formData.category)
            formDataToSend.append('price', formData.price)
            formDataToSend.append('mrp', formData.mrp)

            // Append only new files, not existing image URLs
            formData.images.forEach(image => {
                if (image instanceof File) {
                    formDataToSend.append('images', image)
                }
            })

            const url = initialProduct 
                ? `/api/store/product/${initialProduct.id}`
                : '/api/store/product'
            
            const method = initialProduct ? 'PATCH' : 'POST'

            console.log('Sending product form...', { url, method })

            const response = await fetch(url, {
                method,
                body: formDataToSend,
                credentials: 'include'
            })

            const data = await response.json()
            
            console.log('Response:', { status: response.status, data })

            if (!response.ok) {
                setError(data.error || 'Failed to save product')
                console.error('Error response:', data)
                return
            }

            console.log('Product saved successfully:', data.product)
            setSuccess(initialProduct ? 'Product updated successfully!' : 'Product created successfully!')
            onProductSaved(data.product)
            setFormData({
                name: '',
                description: '',
                category: '',
                price: '',
                mrp: '',
                images: []
            })
            setImagePreviewUrls([])
            setTimeout(() => setSuccess(''), 3000)
        } catch (error) {
            console.error('Error:', error)
            setError('An error occurred while saving the product')
        } finally {
            setLoading(false)
        }
    }

    const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Food', 'Other']

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {initialProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Price (₹)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter price"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">MRP (₹)</label>
                    <input
                        type="number"
                        name="mrp"
                        value={formData.mrp}
                        onChange={handleInputChange}
                        placeholder="Enter MRP"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows="4"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Product Images</label>
                <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                        <ImageIcon size={20} className="text-blue-600" />
                        <span className="text-blue-600 font-medium">Add Images</span>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                    <span className="text-sm text-slate-500">
                        {imagePreviewUrls.length} image(s) selected
                    </span>
                </div>

                {imagePreviewUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                        {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={url}
                                    alt={`Preview ${index}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImagePreview(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                    {loading ? 'Saving...' : (initialProduct ? 'Update Product' : 'Add Product')}
                </button>
            </div>
        </form>
    )
}
