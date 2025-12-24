import { dbConnect } from "@/lib/dbConnect";

export async function GET(request) {
    try{
        const collection = await dbConnect('products');
        const {searchParams} = new URL(request.url)
        console.log(searchParams)
    }
    catch(error){
        return new Response(JSON.stringify({ success: false, message: 'Server Error', error: error.message }), { status: 500 });
    }
}