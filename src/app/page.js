import Image from "next/image";
import ImageSlider from "./components/ImageSlider/ImageSlider";
import PopularProduct from "./components/PopularProduct/PopularProduct";
import AllProducts from "./components/AllProducts/AllProducts";
import AllCategoryPage from "./components/Category/AllCategoryPage";
import CategoryPage from "./category/[slug]/page";

export default function Home() {
  return (
    <>
      <ImageSlider />
      <AllCategoryPage />
      {/* <CategoryPage /> */}
      <PopularProduct />
      <AllProducts />
    </>
  );
}
