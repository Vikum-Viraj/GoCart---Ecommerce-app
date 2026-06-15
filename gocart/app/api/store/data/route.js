import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function GET(request){
    try{
        const { searchParams } = new URL(request.url)
        const username = searchParams.get('username').toLowerCase()
        if(!username){
            return new NextResponse(JSON.stringify({error:"Username is required"}),{status:400})
        }
        const store = await prisma.store.findUnique({
            where:{
                username,isActive:true
            },
            include:{   Product:{include:{rating:true}}}
        })
        if(!store){
            return new NextResponse(JSON.stringify({error:"Store not found"}),{status:404})
        }
        return new NextResponse(JSON.stringify(store),{status:200})

    }catch(error){
        return new NextResponse(JSON.stringify({error:"Internal server error"}),{status:500})
    }
}