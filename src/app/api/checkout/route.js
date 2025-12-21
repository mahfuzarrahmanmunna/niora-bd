// src/app/api/checkout/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

// POST to process checkout
export async function POST(request) {
    try {
        const { userId, items, shippingAddress, paymentMethod } = await request.json();
        
        if (!userId || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, message: 'User ID and items are required' },
                { status: 400 }
            );
        }

        // Get product details and check stock
        const productsCollection = await dbConnect('products');
        const products = await Promise.all(
            items.map(async (item) => {
                const product = await productsCollection.findOne({ id: item.productId });
                return {
                    ...item,
                    product
                };
            })
        );

        // Check if all products are available and have enough stock
        for (const item of products) {
            if (!item.product) {
                return NextResponse.json(
                    { success: false, message: `Product with ID ${item.productId} not found` },
                    { status: 404 }
                );
            }
            
            if (item.product.stock < item.quantity) {
                return NextResponse.json(
                    { success: false, message: `Not enough stock for ${item.product.name}` },
                    { status: 400 }
                );
            }
        }

        // Calculate total price
        let totalPrice = 0;
        for (const item of products) {
            const price = item.product.discount > 0 
                ? item.product.finalPrice 
                : item.product.price;
            totalPrice += price * item.quantity;
        }

        // Create order
        const order = {
            userId,
            items: products.map(item => ({
                productId: item.productId,
                name: item.product.name,
                price: item.product.discount > 0 
                    ? item.product.finalPrice 
                    : item.product.price,
                quantity: item.quantity,
                imageUrl: item.product.imageUrl
            })),
            shippingAddress,
            paymentMethod,
            totalPrice,
            status: 'processing',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const ordersCollection = await dbConnect('orders');
        const result = await ordersCollection.insertOne(order);

        // Update product stock
        for (const item of products) {
            await productsCollection.updateOne(
                { id: item.productId },
                { $inc: { stock: -item.quantity } }
            );
        }

        // Clear cart items for the ordered products
        const cartCollection = await dbConnect('cart');
        const productIds = items.map(item => item.productId);
        await cartCollection.deleteMany({ 
            userId, 
            productId: { $in: productIds } 
        });

        return NextResponse.json(
            { 
                success: true, 
                message: 'Order placed successfully',
                orderId: result.insertedId.toString()
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error processing checkout:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to process checkout', error: error.message },
            { status: 500 }
        );
    }
}

// GET to retrieve order history
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

        const collection = await dbConnect('orders');
        const orders = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();

        return NextResponse.json(
            { success: true, data: orders },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch orders', error: error.message },
            { status: 500 }
        );
    }
}