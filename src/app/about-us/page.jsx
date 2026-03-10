import Image from "next/image";
import Link from "next/link";
import SearchParamsWrapper from "../components/SearchParamsWrapper/SearchParamsWrapper";
import founder from "../assets/founder.jpeg";

const AboutUsPage = () => {
  return (
    <SearchParamsWrapper>
      <div className="bg-white">
        {/* Hero Section with Parallax Effect */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://picsum.photos/seed/about-hero/1920/1080.jpg"
              alt="Elegant cosmetics background"
              fill
              style={{ objectFit: "cover" }}
              quality={100}
              className="scale-110 animate-pulse"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-indigo-900/70 to-pink-900/80"></div>
          <div className="relative z-10 text-center text-white max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-serif tracking-tight mb-6 animate-fade-in">
              Beauty,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-indigo-300">
                Redefined
              </span>
              .
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed">
              We are not just selling makeup; we are celebrating the art of
              self-expression with products that are kind to your skin and the
              planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/all-products"
                className="inline-block bg-white text-gray-900 font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Explore Our Collection
              </Link>
              <Link
                href="#our-story"
                className="inline-block border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
              >
                Discover Our Story
              </Link>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="max-w-6xl mx-auto ">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "10M+", label: "Happy Customers" },
                { number: "500+", label: "Premium Products" },
                { number: "50+", label: "Countries Served" },
                { number: "15+", label: "Years of Excellence" },
              ].map((stat, index) => (
                <div key={index} className="group">
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Statement Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <svg
              className="w-64 h-64 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mb-6 relative">
            Our Mission
          </h2>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-xl">
            <p className="text-xl text-gray-700 leading-relaxed font-serif italic">
              `To empower individuals to feel confident and beautiful in their
              own skin by providing high-performance, ethically-sourced, and
              sustainable beauty products that inspire creativity and
              self-care.`
            </p>
          </div>
        </section>

        {/* Our Story Timeline Section */}
        <section id="our-story" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mb-4">
                Our Journey
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From a small studio to a global beauty movement, our story is
                one of passion, innovation, and commitment.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-indigo-200 to-purple-200"></div>

              {[
                {
                  year: "2008",
                  title: "The Beginning",
                  description:
                    "Our founder started in a small studio with a vision for clean, effective beauty products.",
                },
                {
                  year: "2012",
                  title: "First Product Launch",
                  description:
                    "After years of research, we launched our first line of cruelty-free cosmetics.",
                },
                {
                  year: "2016",
                  title: "Going Global",
                  description:
                    "Expanded to 20 countries and introduced our sustainable packaging initiative.",
                },
                {
                  year: "2020",
                  title: "Innovation Award",
                  description:
                    "Recognized for our breakthrough formulations and commitment to sustainability.",
                },
                {
                  year: "2023",
                  title: "The Future",
                  description:
                    "Continuing to innovate and expand our reach while staying true to our core values.",
                },
              ].map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center mb-10 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`w-5/12 ${index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}
                  >
                    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="text-indigo-600 font-bold text-lg mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-4 border-indigo-600 rounded-full z-10"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values Section with Enhanced Design */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">
                The Values We Live By
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                These principles guide everything we do, from formulation to
                delivery.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg
                      className="w-8 h-8 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Cruelty-Free",
                  description:
                    "We never test on animals, and we never will. We partner with Leaping Bunny to certify our commitment.",
                  color: "indigo",
                },
                {
                  icon: (
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Sustainably Sourced",
                  description:
                    "We prioritize ethically sourced, natural, and organic ingredients that are good for you and the Earth.",
                  color: "green",
                },
                {
                  icon: (
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Always Fresh",
                  description:
                    "We produce in small batches to ensure you receive products at their peak potency and freshness.",
                  color: "purple",
                },
              ].map((value, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-${value.color}-50 to-${value.color}-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  ></div>
                  <div className="relative p-8 text-center">
                    <div
                      className={`bg-${value.color}-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {value.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet the Team Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">
                Meet The Team
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                The passionate people behind your favorite products.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Rubiyat Khandakar",
                  role: "Founder & CEO",
                  img: founder, // Using the imported local image
                  isLocal: true, // Flag to use local image
                  bio: "I am Md. Rubel Khandakar Sojol. My mission is to deliver premium quality and modern products right to your doorstep.",
                },
                {
                  name: "John Smith",
                  role: "Head Chemist",
                  img: "team2",
                  isLocal: false,
                  bio: "Expert in clean formulation and sustainable ingredients",
                },
                {
                  name: "Emily Jones",
                  role: "Creative Director",
                  img: "team3",
                  isLocal: false,
                  bio: "Award-winning designer with a passion for aesthetics",
                },
                {
                  name: "Michael Brown",
                  role: "Lead Marketer",
                  img: "team4",
                  isLocal: false,
                  bio: "Brand strategist with global marketing experience",
                },
              ].map((member) => (
                <div key={member.name} className="group text-center">
                  <div className="relative mb-6 overflow-hidden rounded-full mx-auto w-48 h-48 border-4 border-white shadow-lg">
                    {/* Conditional rendering for local vs remote image */}
                    {member.isLocal ? (
                      <Image
                        src={member.img}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Image
                        src={`https://picsum.photos/seed/${member.img}/300/300.jpg`}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-indigo-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 px-4">
                    {member.bio}
                  </p>
                  <div className="flex justify-center space-x-3">
                    {["twitter", "linkedin", "instagram"].map((social) => (
                      <a
                        key={social}
                        href="#"
                        className="text-gray-400 hover:text-indigo-600 transition-colors duration-300"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About the Creator / Developer Section */}
        <section
          id="about-creator"
          className="py-24 bg-gray-900 text-white relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Text Content */}
              <div className="lg:w-3/5">
                <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  About the Creator
                </h2>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Hi, I am the developer behind this digital experience.
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  With a passion for full-stack development and modern UI/UX
                  design, I built this platform to bridge the gap between
                  premium beauty products and a seamless online shopping
                  experience.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  My goal was to create a fast, accessible, and visually
                  stunning website using the latest technologies like Next.js,
                  React, and Tailwind CSS. I believe that code is art, and this
                  website is a canvas for innovation.
                </p>

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {[
                    "React",
                    "Next.js",
                    "Tailwind CSS",
                    "JavaScript",
                    "UI/UX Design",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-indigo-300 text-sm font-semibold hover:bg-indigo-900/50 transition-colors cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <a
                    target="_blank"
                    href="https://github.com/mahfuzarrahmanmunna"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="sr-only">GitHub</span>
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    target="_blank"
                    href="https://www.linkedin.com/in/mdmahfuzarrahman-munna/"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Image Content */}
              <div className="lg:w-2/5 flex justify-center relative">
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-30 animate-pulse"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-2xl">
                    <Image
                      src="https://i.ibb.co.com/2fd2dKf/Naruto-Anime-Wallpaper-for-Wall-710x488.jpg" // Using founder image for creator as well
                      alt="Website Creator"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">
                What Our Customers Say
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Real stories from our amazing community.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Beauty Enthusiast",
                  content:
                    "I've tried countless beauty brands, but nothing compares to the quality and ethics of this company. My skin has never looked better!",
                  img: "testimonial1",
                },
                {
                  name: "Emily Chen",
                  role: "Professional Makeup Artist",
                  content:
                    "As a makeup artist, I need products that perform. This brand delivers every time with stunning colors and long-lasting formulas.",
                  img: "testimonial2",
                },
                {
                  name: "Maria Rodriguez",
                  role: "Skincare Advocate",
                  content:
                    "Finally, a brand that aligns with my values! Clean ingredients, sustainable packaging, and amazing results. I'm a customer for life.",
                  img: "testimonial3",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">
                    `{testimonial.content}`
                  </p>
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                      <Image
                        src={`https://picsum.photos/seed/${testimonial.img}/100/100.jpg`}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700"></div>
          <div className="absolute inset-0">
            <svg
              className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2"
              width="404"
              height="404"
              fill="none"
              viewBox="0 0 404 404"
              role="img"
              aria-labelledby="svg-squares"
            >
              <title id="svg-squares">squares</title>
              <defs>
                <pattern
                  id="ad119f34-7694-4c31-947f-5c9d249b21f3"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x="0"
                    y="0"
                    width="4"
                    height="4"
                    className="text-indigo-500"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width="404"
                height="404"
                fill="url(#ad119f34-7694-4c31-947f-5c9d249b21f3)"
              />
            </svg>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl text-indigo-200 mb-8 max-w-2xl mx-auto">
              Join our community and discover beauty that feels good inside and
              out. Sign up for exclusive offers and beauty tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/all-products"
                className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Shop Now
              </Link>
              <Link
                href="/newsletter"
                className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105"
              >
                Join Our Newsletter
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SearchParamsWrapper>
  );
};

export default AboutUsPage;
