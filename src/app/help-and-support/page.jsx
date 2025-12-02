'use client';

import { useState } from 'react';
import Link from 'next/link';

const HelpAndSupportPage = () => {
    const [openFAQ, setOpenFAQ] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'general',
        message: ''
    });

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Thank you for your message. We will get back to you within 24 hours.');
        // Reset form
        setFormData({ name: '', email: '', subject: 'general', message: '' });
    };

    const faqData = [
        {
            category: "Orders & Shipping",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            questions: [
                { q: "How can I track my order?", a: "Once your order ships, you will receive an email with a tracking number. You can also track your order by logging into your account and viewing your order history." },
                { q: "What are the shipping options?", a: "We offer Standard Shipping (5-7 business days), Express Shipping (2-3 business days), and Next Day Delivery. Shipping costs are calculated at checkout." },
                { q: "Do you ship internationally?", a: "Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by location." },
                { q: "Can I change my shipping address?", a: "If your order hasn't shipped yet, please contact our support team immediately at support@beauty.com. We will do our best to update the address for you." }
            ]
        },
        {
            category: "Returns & Refunds",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
            ),
            questions: [
                { q: "What is your return policy?", a: "We offer a 30-day return policy for items in their original condition. Please see our full Return Policy page for more details." },
                { q: "How do I initiate a return?", a: "You can initiate a return through your account dashboard or by contacting our customer support team. A prepaid shipping label will be provided." },
                { q: "When will I receive my refund?", a: "Once we receive your returned item, it will be processed within 3-5 business days. Refunds are typically credited to your original payment method." },
                { q: "Are sale items refundable?", a: "Items purchased on sale are eligible for store credit or exchange only, unless they are faulty." }
            ]
        },
        {
            category: "Payments & Accounts",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            questions: [
                { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay." },
                { q: "Is my payment information secure?", a: "Absolutely. We use industry-standard SSL encryption to protect your personal and payment information. Your security is our top priority." },
                { q: "How do I reset my password?", a: "Click on 'Forgot Password' on the login page. Enter your email address, and we will send you a link to reset your password." },
                { q: "Can I save my payment information?", a: "Yes, you can securely save your payment methods in your account for faster checkout in the future." }
            ]
        },
        {
            category: "Products & Ingredients",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            questions: [
                { q: "Are your products cruelty-free?", a: "Yes, all our products are 100% cruelty-free. We are certified by Leaping Bunny and never test on animals." },
                { q: "Where can I find ingredient lists?", a: "Full ingredient lists are available on each product page under the 'Ingredients' tab." },
                { q: "Do you use parabens or sulfates?", a: "We are committed to clean beauty. The majority of our products are formulated without parabens, sulfates, and phthalates. This is clearly marked on the product page." },
                { q: "How do I know which product is right for me?", a: "We recommend taking our skincare quiz or reading our blog for personalized recommendations. You can also contact our team for expert advice." }
            ]
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-50 to-purple-50 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">How Can We Help?</h1>
                    <p className="text-lg text-gray-600 mb-8">Find answers to common questions or get in touch with our support team.</p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search for help (e.g., 'track order', 'return policy')..."
                            className="w-full py-4 pl-12 pr-4 text-gray-900 bg-white border border-gray-300 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <Link href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">Track Order</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">Return Policy</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">Contact Us</Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold font-serif text-gray-900 text-center mb-12">Frequently Asked Questions</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {faqData.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center mb-4">
                                    <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 mr-4">
                                        {category.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">{category.category}</h3>
                                </div>
                                <div className="space-y-3">
                                    {category.questions.map((item, itemIndex) => {
                                        const index = `${categoryIndex}-${itemIndex}`;
                                        return (
                                            <div key={index} className="border-b border-gray-200 last:border-b-0 pb-3 last:pb-0">
                                                <button
                                                    onClick={() => toggleFAQ(index)}
                                                    className="w-full text-left flex justify-between items-center py-2 focus:outline-none"
                                                >
                                                    <span className="font-medium text-gray-800">{item.q}</span>
                                                    <svg
                                                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${openFAQ === index ? 'rotate-180' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                {openFAQ === index && (
                                                    <p className="mt-2 text-gray-600 text-sm leading-relaxed">{item.a}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-serif text-gray-900">Still Need Help? Get in Touch</h2>
                        <p className="mt-4 text-lg text-gray-600">Our friendly customer support team is here to assist you.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                                    <input type="text" id="name" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                                    <select id="subject" name="subject" value={formData.subject} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="general">General Question</option>
                                        <option value="order">Order Issue</option>
                                        <option value="return">Return/Refund</option>
                                        <option value="product">Product Question</option>
                                        <option value="technical">Technical Issue</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                                    <textarea id="message" name="message" rows="5" required value={formData.message} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300">
                                    Send Message
                                </button>
                            </form>
                        </div>

                        {/* Other Contact Methods */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center">
                                    <div className="bg-green-100 p-3 rounded-full text-green-600 mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
                                        <p className="text-gray-600">Chat with our support team in real-time.</p>
                                        <p className="text-sm text-gray-500 mt-1">Available Mon-Fri, 9am - 5pm EST</p>
                                        <button className="mt-2 text-green-600 font-medium hover:text-green-800">Start Chat →</button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Email Us</h3>
                                        <p className="text-gray-600">Send us an email anytime.</p>
                                        <p className="text-sm text-gray-500 mt-1">We respond within 24 hours.</p>
                                        <a href="mailto:support@beauty.com" className="mt-2 text-blue-600 font-medium hover:text-blue-800 block">support@beauty.com →</a>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center">
                                    <div className="bg-purple-100 p-3 rounded-full text-purple-600 mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Call Us</h3>
                                        <p className="text-gray-600">Prefer to talk? Give us a call.</p>
                                        <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am - 5pm EST</p>
                                        <a href="tel:+1234567890" className="mt-2 text-purple-600 font-medium hover:text-purple-800 block">+1 (234) 567-890 →</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HelpAndSupportPage;