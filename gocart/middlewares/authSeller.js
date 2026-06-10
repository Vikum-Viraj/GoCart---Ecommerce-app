import prisma from '@/lib/prisma';

const authSeller = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { store: true },
        })

        if(!user) {
            console.error('User not found:', userId)
            return false
        }

        if(user.store){
            // Allow both pending and approved for testing
            if(user.store.status === 'approved' || user.store.status === 'pending'){
                return user.store.id
            } else {
                console.error('Store status not allowed:', user.store.status)
                return false
            }
        } else {
            console.error('User has no store')
            return false
        }
    } catch (error) {
        console.error('authSeller error:', error)
        return false
    }
}

export default authSeller;