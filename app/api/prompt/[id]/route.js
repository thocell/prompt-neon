import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../../lib/prisma'

// GET specific prompt by ID
export async function GET(request, { params }) {
  try {
    const { id } = params

    const prompt = await prisma.prompt.findUnique({
      where: { id },
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
      }
    })

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.prompt.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json({ prompt, success: true })
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    )
  }
}

// PUT update prompt
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const { title, content, category, tags, isPremium, pricePoints } = await request.json()

    // Find the prompt and check ownership
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
      include: { author: true }
    })

    if (!existingPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    if (existingPrompt.author.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Not authorized to edit this prompt' },
        { status: 403 }
      )
    }

    // Update the prompt
    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        title,
        content,
        category,
        tags: tags || [],
        isPremium: isPremium || false,
        pricePoints: pricePoints || 0
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

    return NextResponse.json({ prompt: updatedPrompt, success: true })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}

// DELETE prompt
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    // Find the prompt and check ownership
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
      include: { author: true }
    })

    if (!existingPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    if (existingPrompt.author.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Not authorized to delete this prompt' },
        { status: 403 }
      )
    }

    // Delete the prompt
    await prisma.prompt.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Prompt deleted successfully' })
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    )
  }
}
