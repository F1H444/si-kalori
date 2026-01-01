'use client';

import React, { useState, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
    const form = useRef<HTMLFormElement>(null);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const sendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_shbkp0i';
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_gwsw0ur';
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'yeG2OF_KQEskfbfdR';

        if (!form.current) return;

        emailjs
            .sendForm(serviceId, templateId, form.current, {
                publicKey: publicKey,
            })
            .then(
                () => {
                    setStatus('success');
                    if (form.current) form.current.reset();
                    setTimeout(() => setStatus('idle'), 5000);
                },
                (error) => {
                    setStatus('error');
                    setErrorMessage(error.text || 'Gagal mengirim pesan');
                    setTimeout(() => setStatus('idle'), 5000);
                },
            );
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10,
            },
        },
    };

    return (
        <div className="min-h-screen bg-[#f0f0f0] text-black font-mono overflow-hidden selection:bg-black selection:text-white flex flex-col justify-center pt-24 pb-8 md:pt-32">
            {/* Background Grid Decoration */}
            <div className="fixed inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] opacity-10 pointer-events-none z-0">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="border-l border-black h-full" />
                ))}
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-4xl mx-auto px-4 md:px-8 relative z-10"
            >
                {/* Header Section */}
                <motion.header variants={itemVariants} className="mb-8 md:mb-12 text-center">
                    <div className="inline-block border-4 border-black bg-white p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                            Kontak <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Kami</span>
                        </h1>
                    </div>
                </motion.header>

                {/* Contact Form */}
                <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
                    <form
                        ref={form}
                        onSubmit={sendEmail}
                        className="border-4 border-black bg-white p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative"
                    >
                        {/* Decorative corner squares */}
                        <div className="absolute top-0 left-0 w-3 h-3 bg-black" />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-black" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 bg-black" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-black" />

                        <div className="space-y-4">
                            <div>
                                <label className="block text-lg font-black uppercase mb-1">Nama</label>
                                <input
                                    type="text"
                                    name="user_name"
                                    required
                                    className="w-full bg-gray-100 border-4 border-black p-3 font-bold focus:outline-none focus:bg-[#ffde00] transition-colors placeholder:text-gray-500"
                                    placeholder="NAMA ANDA"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-black uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    name="user_email"
                                    required
                                    className="w-full bg-gray-100 border-4 border-black p-3 font-bold focus:outline-none focus:bg-[#ffde00] transition-colors placeholder:text-gray-500"
                                    placeholder="EMAIL@ANDA.COM"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-black uppercase mb-1">Pesan</label>
                                <textarea
                                    name="message"
                                    required
                                    rows={4}
                                    className="w-full bg-gray-100 border-4 border-black p-3 font-bold focus:outline-none focus:bg-[#ffde00] transition-colors placeholder:text-gray-500 resize-none"
                                    placeholder="TULIS PESAN ANDA..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending' || status === 'success'}
                                className="w-full bg-black text-white border-4 border-black p-3 text-lg font-black uppercase tracking-widest hover:bg-[#ffde00] hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                            >
                                {status === 'sending' ? (
                                    'MENGIRIM...'
                                ) : status === 'success' ? (
                                    <>
                                        TERKIRIM <CheckCircle2 className="w-5 h-5" />
                                    </>
                                ) : (
                                    <>
                                        KIRIM PESAN <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            {status === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-100 border-2 border-red-500 text-red-700 p-3 font-bold flex items-center gap-2 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {errorMessage}
                                </motion.div>
                            )}
                            {status === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-100 border-2 border-green-500 text-green-700 p-3 font-bold flex items-center gap-2 text-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Pesan berhasil dikirim! Kami akan segera membalas.
                                </motion.div>
                            )}
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
}
