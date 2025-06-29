import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// GET user's prompts
export async function GET(request, { params }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's prompts
    const prompts = await prisma.prompt.findMany({
      where: { authorId: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        _count: {
          select: {
            likes: true,
            downloads: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.prompt.count({
      where: { authorId: id }
    })

    return NextResponse.json({ 
      prompts, 
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      success: true 
    })
  } catch (error) {
    console.error('Error fetching user prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user prompts' },
      { status: 500 }
    )
  }
}
