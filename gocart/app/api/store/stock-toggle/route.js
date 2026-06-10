
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import authSeller from "@/middlewares/authSeller"

export async function POST(request) {
    try{
        const { userId } = await auth()
        const {productId} = await request.json()

        if(!productId){
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId,storeId
            }
        })
        if(!product){
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }
        await prisma.product.update({
            where: {
                id: productId,},
            data: { 
                inStock: !product.inStock
            }
        })
        return NextResponse.json({ message: 'Stock status toggled successfully' }, { status: 200 })
    }catch(error){
        console.error('Error toggling stock status:', error)
        return NextResponse.json({ error: 'Failed to toggle stock status' }, { status: 500 })
    }
}