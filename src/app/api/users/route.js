import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
// import { auth } from "@/auth"; // Import NextAuth instance
import { getServerSession } from "next-auth";
import NextAuth from "next-auth";

// GET - Fetch User (Specific) OR Fetch All Users
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const collection = await dbConnect("users");

    if (!userId) {
      const allUsers = await collection.find({}).toArray();
      const usersWithoutPasswords = allUsers.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return NextResponse.json(
        { success: true, data: usersWithoutPasswords },
        { status: 200 },
      );
    }

    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(
      { success: true, data: userWithoutPassword },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST - Create User
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role = "user",
      phone,
      address,
      profileImage,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const collection = await dbConnect("users");
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || "",
      address: address || "",
      profileImage: profileImage || "https://via.placeholder.com/150",
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: userWithoutPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// PUT - Update User
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      email,
      password,
      role,
      phone,
      address,
      profileImage,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );
    }

    const collection = await dbConnect("users");

    const updateData = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (role) updateData.role = role;
    if (profileImage) updateData.profileImage = profileImage;

    if (password && password.length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // --- NEXTAUTH SERVER SIDE UPDATE ---
    // This refreshes the session token for the user being updated across all devices
    try {
      if (name || email || role) {
        await NextAuth.updateUser({
          userId: userId, // The unique ID identifying the user
          data: { name, email, role, phone, address, profileImage }, // Updated data
        });
      }
    } catch (authError) {
      console.error("Failed to update NextAuth session:", authError);
      // Don't fail the request if Auth config is missing
    }

    return NextResponse.json(
      { success: true, message: "Profile updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE - Remove user
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId)
      return NextResponse.json(
        { success: false, message: "userId required" },
        { status: 400 },
      );

    const collection = await dbConnect("users");
    const result = await collection.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User deleted" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
