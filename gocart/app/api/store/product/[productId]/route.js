import { auth, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import imagekit from "@/configs/imagekit";
import authSeller from "@/middlewares/authSeller";

export async function PATCH(request, { params }) {
    try {
        const { userId } = getAuth(request)
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const storeId = await authSeller(userId)
        
        if (!storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { productId } = params

        // Verify product exists and belongs to this store
        const existingProduct = await prisma.product.findFirst({
            where: {
                id: productId,
                storeId
            }
        })

        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        const formData = await request.formData();
        const name = formData.get('name');
        const description = formData.get('description');
        const mrp = formData.get('mrp') ? parseFloat(formData.get('mrp')) : existingProduct.mrp;
        const price = formData.get('price') ? parseFloat(formData.get('price')) : existingProduct.price;
        const category = formData.get('category');
        const images = formData.getAll('images');

        let imageUrls = existingProduct.images || []

        // Upload new images if provided
        if (images.length > 0) {
            imageUrls = await Promise.all(images.map(async (image) => {
                const buffer = Buffer.from(await image.arrayBuffer());
                const response = await imagekit.upload({
                    file: buffer,
                    fileName: image.name,
                    folder: 'products'
                })
                return imagekit.url({
                    path: response.filePath,
                    transformation: [
                        { quality: "auto" },
                        { fetchFormat: "webp" },
                        { width: '1024' },
                    ]
                })
            }))
        }

        const product = await prisma.product.update({
            where: {
                id: productId
            },
            data: {
                name: name || existingProduct.name,
                description: description || existingProduct.description,
                mrp,
                price,
                category: category || existingProduct.category,
                images: imageUrls
            }
        })

        return NextResponse.json({ message: 'Product updated successfully', product }, { status: 200 })
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json({ error: 'Failed to update product', details: error.message }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const storeId = await authSeller(userId)
        
        if (!storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { productId } = params

        // Verify product exists and belongs to this store
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                storeId
            }
        })

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Delete product images from imagekit
        if (product.images && product.images.length > 0) {
            try {
                for (const imageUrl of product.images) {
                    const filePath = new URL(imageUrl).pathname.split('/').pop()
                    if (filePath) {
                        await imagekit.deleteFile(filePath)
                    }
                }
            } catch (error) {
                console.error('Error deleting images from imagekit:', error)
            }
        }

        await prisma.product.delete({
            where: {
                id: productId
            }
        })

        return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json({ error: 'Failed to delete product', details: error.message }, { status: 500 })
    }
}
