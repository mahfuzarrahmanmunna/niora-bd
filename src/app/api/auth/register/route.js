import { dbConnect } from "@/lib/dbConnect"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request) {
    try {
        const { name, email, password } = await request.json()

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Connect to database
        const collection = await dbConnect("users")

        // Check if user already exists
        const existingUser = await collection.findOne({ email })

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user with the default "user" role
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: 'user', // <-- SET DEFAULT ROLE HERE
            provider: "email",
            verified: false,
            createdAt: new Date(),
        }

        const result = await collection.insertOne(newUser)

        return NextResponse.json(
            { message: "User registered successfully", userId: result.insertedId },
            { status: 201 }
        )
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}