// src/lib/updateProductRating.js
import { dbConnect } from '@/lib/dbConnect';

/**
 * @param {string} productId - The ID of the product to update.
 * @returns {Promise<number>} The newly calculated average rating.
 */
export async function updateProductRating(productId) {
    try {
        // Get all reviews for the product
        const reviewsCollection = await dbConnect('reviews');
        const reviews = await reviewsCollection.find({ productId }).toArray();
        
        // Calculate average rating
        let averageRating = 0; // Changed from const to let
        
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / reviews.length;
        }
        
        // Update the product with the new average rating
        const productsCollection = await dbConnect('products');
        await productsCollection.updateOne(
            { id: productId }, // Use custom 'id' field
            { 
                $set: { 
                    rating: parseFloat(averageRating.toFixed(1)),
                    updatedAt: new Date()
                }
            }
        );
        
        console.log(`Updated rating for product ${productId} to ${averageRating.toFixed(1)}`);
        return averageRating;
    } catch (error) {
        console.error('Error updating product rating:', error);
        throw error;
    }
}