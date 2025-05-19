import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { Db, Document, WithId } from "mongodb";

// Type definition for role
interface Role {
  id: string;
  name: string;
  serverId: string;
  permissions?: string[];
}

// Generate a new invite code for a server
export async function POST(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  // Correctly access serverId from params
  const serverId = params.serverId;

  if (!serverId) {
    return NextResponse.json(
      { error: "Server ID is required" },
      { status: 400 }
    );
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required for authorization" }, // Clarified error
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    
    // Check if user has permission to generate invite code (must be admin or owner)
    const serverMember = await db.collection("serverMembers").findOne({
      serverId: serverId, // Use the variable
      userId,
    });

    if (!serverMember) {
      return NextResponse.json(
        { error: "User is not a member of this server or lacks permissions" }, // Combined check
        { status: 403 } // Forbidden
      );
    }

    const server = await db.collection("servers").findOne({
      id: serverId, // Use the variable
    });

    if (!server) {
      return NextResponse.json(
        { error: "Server not found" },
        { status: 404 }
      );
    }

    // Check if user is owner or has admin role
    const isOwner = server.ownerId === userId;
    let hasAdminPermission = false;
    
    if (!isOwner) {
      // Check if user has admin permissions
      const userRoleIds = serverMember.roleIds || [];
      if (userRoleIds.length > 0) { // Only query if user has roles
        const rolesData = await db.collection("roles").find({
          id: { $in: userRoleIds },
          serverId: serverId, // Use the variable
        }).toArray();
        
        // Convert document array to Role array
        const roles = rolesData.map(roleDoc => ({
          id: roleDoc.id,
          name: roleDoc.name,
          serverId: roleDoc.serverId,
          permissions: roleDoc.permissions
        }));
        
        hasAdminPermission = roles.some((role) => 
          role.permissions?.includes("ADMINISTRATOR") || 
          role.permissions?.includes("MANAGE_SERVER")
        );
      }
      
      if (!hasAdminPermission) {
        return NextResponse.json(
          { error: "You don't have permission to generate invite codes" },
          { status: 403 } // Forbidden
        );
      }
    }
    // User is either owner or has admin permission
    
    // Generate new invite code
    const inviteCode = uuidv4().substring(0, 8);
    
    // Update server with new invite code
    await db.collection("servers").updateOne(
      { id: serverId }, // Use the variable
      { $set: { inviteCode } }
    );
    
    return NextResponse.json({ inviteCode });
  } catch (error) {
    console.error("[SERVER_INVITE_POST]", error);
    return NextResponse.json(
      { error: "Internal server error while generating invite" }, // More specific
      { status: 500 }
    );
  }
}

// Get current invite code for a server
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  // Correctly access serverId from params
  const serverId = params.serverId;

  if (!serverId) {
    return NextResponse.json(
      { error: "Server ID is required" },
      { status: 400 }
    );
  }

  try {
    const db = await connectToDatabase();
    const server = await db.collection("servers").findOne({
      id: serverId, // Use the variable
    });

    if (!server) {
      return NextResponse.json(
        { error: "Server not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ inviteCode: server.inviteCode || "" });
  } catch (error) {
    console.error("[SERVER_INVITE_GET]", error);
    return NextResponse.json(
      { error: "Internal server error while fetching invite" }, // More specific
      { status: 500 }
    );
  }
}

// Delete/invalidate current invite code
export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    // Correctly access serverId from params
    const serverId = params.serverId;
    const { userId } = await req.json();

    if (!serverId) {
      return NextResponse.json(
        { error: "Server ID is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required for authorization" }, // Clarified error
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Check if server exists
    const server = await db.collection("servers").findOne({ id: serverId });

    if (!server) {
      return NextResponse.json(
        { error: "Server not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the server with appropriate permissions
    const member = await db.collection("serverMembers").findOne({
      serverId: serverId, // Use the variable
      userId,
    });

    if (!member) {
      return NextResponse.json(
        { error: "User is not a member of this server" },
        { status: 403 } // Forbidden
      );
    }

    // Check if user has permission (is owner or has a role with invite permission)
    let hasPermission = false;
    if (server.ownerId === userId) {
      hasPermission = true;
    } else {
      // Get user's roles
      const userRoleIds = member.roleIds || [];
      if (userRoleIds.length > 0) {
        const rolesData = await db.collection("roles").find({
          id: { $in: userRoleIds },
          serverId: serverId // Use the variable
        }).toArray();

        const roles = rolesData.map(roleDoc => ({ 
          permissions: roleDoc.permissions 
        }));

        // Check for relevant permissions (e.g., MANAGE_SERVER or ADMINISTRATOR)
        hasPermission = roles.some(role => 
          role.permissions?.includes("ADMINISTRATOR") || 
          role.permissions?.includes("MANAGE_SERVER")
        );
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don\'t have permission to manage invite codes" },
        { status: 403 } // Forbidden
      );
    }
    
    // Invalidate invite code (set to null or empty string)
    await db.collection("servers").updateOne(
      { id: serverId }, // Use the variable
      { $set: { inviteCode: null } } // Or set to '' depending on preference
    );

    return NextResponse.json({ message: "Invite code invalidated successfully" });
  } catch (error) {
    console.error("[SERVER_INVITE_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error while invalidating invite" }, // More specific
      { status: 500 }
    );
  }
} 
 