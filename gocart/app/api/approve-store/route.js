import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function POST(request){
    try{
        const {userId} = getAuth(request)
        const isAdmin = await authAdmin(userId)


        if(!isAdmin){
            return NextResponse.json({error:'not authorized'},{status:401})
        }

        const {storeId , status} = await request.json()
        if(status == 'approved'){
            await prisma.store.update({
                where:{id:storeId},
                data: {status:"approved",isActive:true}
            })
        }else if(status == 'rejected'){
            await prisma.store.update({
                where:{id:storeId},
                data: {status:"rejected",isActive:true}
            })
        }

        return NextResponse.json({message: status + ' successfully'})

    }catch (err){
        console.error(err)
        return NextResponse.json({error:err.code || err.message},{status:400})
    }
}

export async function GET(request){
    try{
        const {userId} = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if(!isAdmin){
            return NextResponse.json({error:'not authorized'},{status:401})
        }
        const stores = await prisma.store.findMany({
            where:{status: {in:['pending','rejected']}}
        })
        return NextResponse.json({stores})
    }catch (err){
        console.error(err)
        return NextResponse.json({error:err.code || err.message},{status:400})
    }
}