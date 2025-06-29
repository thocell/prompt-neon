import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../lib/prisma'

// GET all prompts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let where = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }
    
    if (category && category !== 'all') {
      where.category = category
    }

    const prompts = await prisma.prompt.findMany({
      where,
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

    return NextResponse.json({ prompts, success: true })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

// POST create new prompt
export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { title, content, category, tags, isPremium, pricePoints } = await request.json()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create prompt
    const prompt = await prisma.prompt.create({
      data: {
        title,
        content,
        category,
        tags: tags || [],
        isPremium: isPremium || false,
        pricePoints: pricePoints || 0,
        authorId: user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    // Award points to user for creating prompt
    if (prompt) {
      const pointsEarned = isPremium ? 15 : 5
      await prisma.user.update({
        where: { id: user.id },
        data: {
          points: { increment: pointsEarned },
          totalEarned: { increment: pointsEarned }
        }
      })

      // Record transaction
      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          amount: pointsEarned,
          type: 'EARNED',
          description: `Created ${isPremium ? 'premium' : 'free'} prompt: ${title}`,
          reference: prompt.id
        }
      })
    }

    return NextResponse.json({ prompt, success: true })
  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    )
  }
}
