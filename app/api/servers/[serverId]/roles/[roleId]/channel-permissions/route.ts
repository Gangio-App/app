import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string; roleId: string } }
) {
  try {
    const db = await connectToDatabase();
    const { serverId, roleId } = params;

    // Validate role exists
    const role = await db.collection("roles").findOne({
      _id: new ObjectId(roleId),
      serverId: serverId,
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      channelPermissions: role.channelPermissions || {} 
    });
  } catch (error) {
    console.error("Error fetching role channel permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch role channel permissions" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string; roleId: string } }
) {
  try {
    const db = await connectToDatabase();
    const { serverId, roleId } = params;
    const { channelPermissions } = await req.json();

    // Validate role exists
    const role = await db.collection("roles").findOne({
      _id: new ObjectId(roleId),
      serverId: serverId,
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    // Update role with new channel permissions
    await db.collection("roles").updateOne(
      { _id: new ObjectId(roleId) },
      { $set: { channelPermissions, updatedAt: new Date() } }
    );

    return NextResponse.json({ 
      success: true,
      message: "Channel permissions updated successfully" 
    });
  } catch (error) {
    console.error("Error updating role channel permissions:", error);
    return NextResponse.json(
      { error: "Failed to update role channel permissions" },
      { status: 500 }
    );
  }
} 
 