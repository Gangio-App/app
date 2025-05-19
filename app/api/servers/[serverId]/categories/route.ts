import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET: Fetch all categories for a server
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    
    if (!serverId) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
    }
    
    const db = await connectToDatabase();

    // Find the server
    const server = await db.collection('servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Fetch categories for this server
    const categories = await db.collection('categories')
      .find({ serverId })
      .sort({ position: 1 })
      .toArray();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new category
export async function POST(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { name, userId } = await req.json();
    
    if (!serverId || !name || !userId) {
      return NextResponse.json({ 
        error: "Server ID, category name, and user ID are required" 
      }, { status: 400 });
    }
    
    const db = await connectToDatabase();

    // Find the server
    const server = await db.collection('servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Check if user is authorized (server owner or admin)
    if (server.ownerId !== userId) {
      // Check if user has admin role
      const member = await db.collection('serverMembers').findOne({
        serverId,
        userId
      });

      if (!member || !member.roles.includes('admin')) {
        return NextResponse.json({ error: "Unauthorized to create categories" }, { status: 403 });
      }
    }

    // Get the highest position
    const highestPositionCategory = await db.collection('categories')
      .find({ serverId })
      .sort({ position: -1 })
      .limit(1)
      .toArray();
    
    const position = highestPositionCategory.length > 0 
      ? highestPositionCategory[0].position + 1 
      : 0;

    // Create the new category
    const newCategory = {
      id: uuidv4(),
      name: name.toUpperCase(),
      serverId,
      position,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('categories').insertOne(newCategory);

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error("[CATEGORY_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: Update a category
export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { categoryId, name, position, userId } = await req.json();
    
    if (!serverId || !categoryId || !userId) {
      return NextResponse.json({ 
        error: "Server ID, category ID, and user ID are required" 
      }, { status: 400 });
    }
    
    const db = await connectToDatabase();

    // Find the server
    const server = await db.collection('servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Check if user is authorized (server owner or admin)
    if (server.ownerId !== userId) {
      // Check if user has admin role
      const member = await db.collection('serverMembers').findOne({
        serverId,
        userId
      });

      if (!member || !member.roles.includes('admin')) {
        return NextResponse.json({ error: "Unauthorized to update categories" }, { status: 403 });
      }
    }

    // Find the category
    const category = await db.collection('categories').findOne({ 
      id: categoryId,
      serverId
    });
    
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Update fields
    const updateData: any = { updatedAt: new Date() };
    
    if (name !== undefined) {
      updateData.name = name.toUpperCase();
    }
    
    if (position !== undefined) {
      updateData.position = position;
    }

    // Update the category
    await db.collection('categories').updateOne(
      { id: categoryId, serverId },
      { $set: updateData }
    );

    // Get updated category
    const updatedCategory = await db.collection('categories').findOne({ 
      id: categoryId,
      serverId
    });

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a category
export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const userId = searchParams.get('userId');
    
    if (!serverId || !categoryId || !userId) {
      return NextResponse.json({ 
        error: "Server ID, category ID, and user ID are required" 
      }, { status: 400 });
    }
    
    const db = await connectToDatabase();

    // Find the server
    const server = await db.collection('servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Check if user is authorized (server owner or admin)
    if (server.ownerId !== userId) {
      // Check if user has admin role
      const member = await db.collection('serverMembers').findOne({
        serverId,
        userId
      });

      if (!member || !member.roles.includes('admin')) {
        return NextResponse.json({ error: "Unauthorized to delete categories" }, { status: 403 });
      }
    }

    // Find the category
    const category = await db.collection('categories').findOne({ 
      id: categoryId,
      serverId
    });
    
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if this is the last category
    const categoriesCount = await db.collection('categories').countDocuments({ serverId });
    
    if (categoriesCount <= 1) {
      return NextResponse.json({ 
        error: "Cannot delete the last category in a server" 
      }, { status: 400 });
    }

    // Find default category to move channels to
    const defaultCategory = await db.collection('categories').findOne({
      serverId,
      id: { $ne: categoryId }
    });

    if (!defaultCategory) {
      return NextResponse.json({ 
        error: "Could not find alternative category to move channels to" 
      }, { status: 500 });
    }

    // Move channels from this category to the default category
    await db.collection('channels').updateMany(
      { serverId, categoryId },
      { $set: { categoryId: defaultCategory.id } }
    );

    // Delete the category
    await db.collection('categories').deleteOne({ id: categoryId, serverId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
 