import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

// GET all users or single user by ID
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    const collection = await dbConnect("users");

    if (userId) {
      const user = await collection.findOne({ _id: userId });
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
    }

    if (email) {
      const user = await collection.findOne({ email });
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
    }

    // Get all users (exclude passwords)
    const users = await collection.find({}).toArray();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return NextResponse.json(
      {
        success: true,
        data: usersWithoutPasswords,
        count: usersWithoutPasswords.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Create new user
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role = "user", phone, address } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    const collection = await dbConnect("users");

    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || "",
      address: address || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: { ...userWithoutPassword, _id: result.insertedId },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT - Update user
export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, name, email, password, role, phone, address } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );
    }

    const collection = await dbConnect("users");

    const updateData = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const result = await collection.updateOne(
      { _id: userId },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE - Remove user
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );
    }

    const collection = await dbConnect("users");
    const result = await collection.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
