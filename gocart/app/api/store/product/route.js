import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import imagekit from "@/configs/imagekit";
import authSeller from "@/middlewares/authSeller";

export async function POST(request) {
    try {
        const { userId } = await auth()
        
        console.log('POST /api/store/product - userId:')
        console.log("userid:", userId) 
        
        if (!userId) {
            return NextResponse.json({ 
                error: 'Unauthorized - No user logged in',
                details: 'Please sign in first'
            }, { status: 401 })
        }

        const storeId = await authSeller(userId)
        
        console.log('POST /api/store/product - storeId:', storeId)
        
        if (!storeId) {
            return NextResponse.json({ 
                error: 'Unauthorized - No approved store',
                details: 'You need to create and get your store approved first'
            }, { status: 401 })
        }

        const formData = await request.formData();
        const name = formData.get('name');
        const description = formData.get('description');
        const mrp = parseFloat(formData.get('mrp'));
        const price = parseFloat(formData.get('price'));
        const category = formData.get('category');
        const images = formData.getAll('images');

        if (!name || !description || !mrp || !price || !category || images.length === 0) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        const imageUrls = await Promise.all(images.map(async (image) => {
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

        const product = await prisma.product.create({
            data: {
                name,
                description,
                mrp,
                price,
                category,
                images: imageUrls,
                storeId
            }
        })

        return NextResponse.json({ message: 'Product created successfully', product }, { status: 201 })
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 })
    }
}


export async function GET(request) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const storeId = await authSeller(userId)
        if (!storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const products = await prisma.product.findMany({
            where: {
                storeId
            }
        })
        return NextResponse.json({ products }, { status: 200 })
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}