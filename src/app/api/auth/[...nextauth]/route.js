import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { dbConnect } from "@/lib/dbConnect"
import bcrypt from "bcryptjs"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    const collection = await dbConnect("users")

                    const user = await collection.findOne({ email: credentials.email })

                    if (!user || !user.password) {
                        return null
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )

                    if (!isPasswordValid) {
                        return null
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: user.role, // <-- ADD ROLE TO THE RETURNED USER OBJECT
                    }
                } catch (error) {
                    console.error("Auth error:", error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === "google" || account.provider === "facebook") {
                try {
                    const collection = await dbConnect("users")

                    // Check if user already exists
                    const existingUser = await collection.findOne({ email: user.email })

                    if (!existingUser) {
                        // Create new user if they don't exist with the default "user" role
                        const newUser = {
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            role: 'user', // <-- SET DEFAULT ROLE FOR SOCIAL SIGN-UPS
                            provider: account.provider,
                            providerId: account.providerAccountId,
                            verified: true,
                            createdAt: new Date(),
                        }

                        await collection.insertOne(newUser)
                    }

                    return true
                } catch (error) {
                    console.error("Error during social sign-in:", error)
                    return false
                }
            }
            return true
        },
        async jwt({ token, user }) {
            // Persist the user ID and role to the token right after signin
            if (user) {
                token.sub = user.id
                token.role = user.role // <-- ADD ROLE TO JWT TOKEN
            }
            return token
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token and user id from the token
            if (token.sub) {
                session.user.id = token.sub
            }
            if (token.role) {
                session.user.role = token.role // <-- ADD ROLE TO SESSION OBJECT
            }
            return session
        },
    },
    pages: {
        signIn: '/sign-in',
        signUp: '/register',
    },
    session: {
        strategy: "jwt",
    },
})

export { handler as GET, handler as POST }