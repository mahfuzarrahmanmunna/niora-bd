import Image from "next/image";
import ImageSlider from "./components/ImageSlider/ImageSlider";
import PopularProduct from "./components/PopularProduct/PopularProduct";
import AllProducts from "./components/AllProducts/AllProducts";

export default function Home() {
  return (
    <>
      <ImageSlider />
      <PopularProduct />
      <AllProducts />
    </>
  );
}
