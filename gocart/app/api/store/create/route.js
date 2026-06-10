import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export async function POST(request) {
    try {

        const { userId } = await auth()
        const formData = await request.formData()
        const name = formData.get('name')
        const username = formData.get('username')
        const description = formData.get('description')
        const email = formData.get('email')
        const contact = formData.get('contact')
        const address = formData.get('address')
        const image = formData.get('image')

        if(!userId || !name || !username || !description || !email || !contact || !address || !image) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const store = await prisma.store.findFirst({
            where: {userId:userId}
        })

        if(store) {
            return NextResponse.json({ error: 'Store already exists for this user' }, { status: 400 })
        }

        const checkUserName = await prisma.store.findFirst({
            where: {username:username}
        })

        if(checkUserName) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
        }

        // image upload to imagekit
        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos"
        })

        const optimizedImage = imagekit.url({
            path: response.filePath,
            transformation: [
                {
                    quality: 'auto',
                },
                {
                    format: 'webp'
                },
                {
                    width: '512'
                }
            ]
        })

        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                username,
                description,
                email,
                contact,
                address,
                logo: optimizedImage
            }
        })

        // link store to user
        await prisma.user.update({
            where: { id: userId },
            data: {store: {connect: {id: newStore.id}}}
        })

        return NextResponse.json({message: "applied, waiting for approval"})

        
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}

export async function GET(request) {
    try {
        const { userId } = await auth()

        // check is user have already registered a store
        const store = await prisma.store.findFirst({
            where: { userId: userId }
        })

        // if store is already registered then send status of store
        if(store) {
            return NextResponse.json({status: store.status})
        }

        return NextResponse.json({})
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, { status: 400 })
    }
}