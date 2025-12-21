// src/app/api/cart/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

// GET cart items for a user
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'User ID is required' },
                { status: 400 }
            );
        }

        const collection = await dbConnect('cart');
        const cartItems = await collection.find({ userId }).toArray();
        
        // Get product details for each cart item
        const productsCollection = await dbConnect('products');
        const cartItemsWithProducts = await Promise.all(
            cartItems.map(async (item) => {
                const product = await productsCollection.findOne({ id: item.productId });
                return {
                    ...item,
                    product
                };
            })
        );

        return NextResponse.json(
            { success: true, data: cartItemsWithProducts },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch cart', error: error.message },
            { status: 500 }
        );
    }
}

// POST to add item to cart
export async function POST(request) {
    try {
        const { userId, productId, quantity } = await request.json();
        
        if (!userId || !productId || !quantity) {
            return NextResponse.json(
                { success: false, message: 'User ID, product ID, and quantity are required' },
                { status: 400 }
            );
        }

        // Check if product exists and has enough stock
        const productsCollection = await dbConnect('products');
        const product = await productsCollection.findOne({ id: productId });
        
        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        if (product.stock < quantity) {
            return NextResponse.json(
                { success: false, message: 'Not enough stock available' },
                { status: 400 }
            );
        }

        // Check if item already in cart
        const cartCollection = await dbConnect('cart');
        const existingItem = await cartCollection.findOne({ userId, productId });
        
        if (existingItem) {
            // Update quantity if already in cart
            const newQuantity = existingItem.quantity + quantity;
            
            if (product.stock < newQuantity) {
                return NextResponse.json(
                    { success: false, message: 'Not enough stock available' },
                    { status: 400 }
                );
            }
            
            await cartCollection.updateOne(
                { _id: existingItem._id },
                { $set: { quantity: newQuantity, updatedAt: new Date() } }
            );
        } else {
            // Add new item to cart
            const cartItem = {
                userId,
                productId,
                quantity,
                addedAt: new Date(),
                updatedAt: new Date()
            };
            
            await cartCollection.insertOne(cartItem);
        }

        return NextResponse.json(
            { success: true, message: 'Item added to cart successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error adding to cart:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to add item to cart', error: error.message },
            { status: 500 }
        );
    }
}

// PUT to update cart item quantity
export async function PUT(request) {
    try {
        const { userId, productId, quantity } = await request.json();
        
        if (!userId || !productId || !quantity) {
            return NextResponse.json(
                { success: false, message: 'User ID, product ID, and quantity are required' },
                { status: 400 }
            );
        }

        // Check if product exists and has enough stock
        const productsCollection = await dbConnect('products');
        const product = await productsCollection.findOne({ id: productId });
        
        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        if (product.stock < quantity) {
            return NextResponse.json(
                { success: false, message: 'Not enough stock available' },
                { status: 400 }
            );
        }

        // Update cart item
        const cartCollection = await dbConnect('cart');
        const result = await cartCollection.updateOne(
            { userId, productId },
            { $set: { quantity, updatedAt: new Date() } }
        );
        
        if (result.matchedCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Cart item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Cart item updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating cart:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update cart', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE to remove item from cart
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const productId = searchParams.get('productId');
        
        if (!userId || !productId) {
            return NextResponse.json(
                { success: false, message: 'User ID and product ID are required' },
                { status: 400 }
            );
        }

        const collection = await dbConnect('cart');
        const result = await collection.deleteOne({ userId, productId });
        
        if (result.deletedCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Cart item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Item removed from cart successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error removing from cart:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to remove item from cart', error: error.message },
            { status: 500 }
        );
    }
}