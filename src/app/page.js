import Image from "next/image";
import ImageSlider from "./components/ImageSlider/ImageSlider";
import PopularProduct from "./components/PopularProduct/PopularProduct";
import AllProducts from "./components/AllProducts/AllProducts";
// import AllCategoryPage from "./components/Category/AllCategoryPage";
// import CategoryPage from "./category/[slug]/page";
import CategoriesSection from "./components/Category/AllCategoryPage";

export default function Home() {
  return (
    <div className="px-3 md:px-24 pt-5">
      <ImageSlider />
      {/* <AllCategoryPage /> */}
      {/* <CategoriesSection /> */}
      {/* <CategoryPage /> */}
      <PopularProduct />
      <AllProducts />
    </div>
  );
}
