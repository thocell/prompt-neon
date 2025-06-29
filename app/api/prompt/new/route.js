import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../../lib/prisma'

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

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

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

    // Check if user has enough points for premium prompt
    if (isPremium && user.points < 10) {
      return NextResponse.json(
        { error: 'Insufficient points to create premium prompt (requires 10 points)' },
        { status: 400 }
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

    // Award points to user for creating prompt and deduct cost if premium
    const pointsEarned = isPremium ? 15 : 5
    const pointsCost = isPremium ? 10 : 0
    const netPoints = pointsEarned - pointsCost

    await prisma.user.update({
      where: { id: user.id },
      data: {
        points: { increment: netPoints },
        totalEarned: { increment: pointsEarned },
        totalSpent: { increment: pointsCost }
      }
    })

    // Record transactions
    if (pointsEarned > 0) {
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

    if (pointsCost > 0) {
      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          amount: -pointsCost,
          type: 'SPENT',
          description: `Premium prompt creation fee`,
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
