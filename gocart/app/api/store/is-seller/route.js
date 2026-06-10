import authSeller from "@/middlewares/authSeller"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"


export async function GET(request) {
    try {
        const { userId } = await auth()
        const isSeller = await authSeller(userId)
        if (!isSeller) {
            return NextResponse.json({ error: 'Not Authorized' }, { status: 401 })
        }
        const storeInfo = await prisma.store.findFirst({where:userId});
        return NextResponse.json({ isSeller,storeInfo }, { status: 200 })
    } catch (error) {
        console.error('Error toggling stock:', error)
        return NextResponse.json({ error: 'Failed to toggle stock' }, { status: 500 })
    }
}