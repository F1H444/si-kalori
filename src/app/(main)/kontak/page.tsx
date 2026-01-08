'use client';

import React, { useState, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import emailjs from '@emailjs/browser';

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
                staggerChildren: 0.12,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12,
            },
        },
    };

    return (
        <div className="min-h-screen bg-white text-black font-mono overflow-hidden selection:bg-black selection:text-white flex flex-col justify-center pt-24 pb-8 md:pt-32">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                className="w-full max-w-4xl mx-auto px-4 md:px-8 relative z-10"
            >
                {/* Header Section */}
                <motion.header variants={itemVariants} className="mb-8 md:mb-12 text-center">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="inline-block border-4 border-black bg-white p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300"
                    >
                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                            Kontak{' '}
                            <span className="inline-block bg-yellow-400 px-2">
                                Kami
                            </span>
                        </h1>
                    </motion.div>
                    <motion.p
                        variants={itemVariants}
                        className="mt-6 text-lg font-bold text-gray-600 max-w-md mx-auto"
                    >
                        Punya pertanyaan atau saran? Kirim pesan dan kami akan membalas secepatnya.
                    </motion.p>
                </motion.header>

                {/* Contact Form */}
                <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
                    <motion.form
                        ref={form}
                        onSubmit={sendEmail}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="border-4 border-black bg-white p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative"
                    >
                        {/* Decorative corner squares */}
                        <div className="absolute top-0 left-0 w-3 h-3 bg-black" />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-black" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 bg-black" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-black" />

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="space-y-5"
                        >
                            <motion.div variants={itemVariants}>
                                <label className="block text-lg font-black uppercase mb-2">Nama</label>
                                <input
                                    type="text"
                                    name="user_name"
                                    required
                                    className="w-full bg-gray-50 border-4 border-black p-3 font-bold focus:outline-none focus:bg-yellow-100 focus:border-yellow-500 transition-all placeholder:text-gray-400"
                                    placeholder="Nama anda"
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label className="block text-lg font-black uppercase mb-2">Email</label>
                                <input
                                    type="email"
                                    name="user_email"
                                    required
                                    className="w-full bg-gray-50 border-4 border-black p-3 font-bold focus:outline-none focus:bg-yellow-100 focus:border-yellow-500 transition-all placeholder:text-gray-400"
                                    placeholder="email@anda.com"
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label className="block text-lg font-black uppercase mb-2">Pesan</label>
                                <textarea
                                    name="message"
                                    required
                                    rows={4}
                                    className="w-full bg-gray-50 border-4 border-black p-3 font-bold focus:outline-none focus:bg-yellow-100 focus:border-yellow-500 transition-all placeholder:text-gray-400 resize-none"
                                    placeholder="Tulis pesan anda..."
                                />
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={status === 'sending' || status === 'success'}
                                className="w-full bg-black text-white border-4 border-black p-4 text-lg font-black uppercase tracking-widest hover:bg-green-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'sending'
                                    ? 'MENGIRIM...'
                                    : status === 'success'
                                    ? '✓ TERKIRIM'
                                    : 'KIRIM PESAN →'}
                            </motion.button>

                            {status === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border-4 border-red-500 text-red-700 p-3 font-bold text-sm"
                                >
                                    ✕ {errorMessage}
                                </motion.div>
                            )}
                            {status === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-50 border-4 border-green-500 text-green-700 p-3 font-bold text-sm"
                                >
                                    ✓ Pesan berhasil dikirim! Kami akan segera membalas.
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.form>
                </motion.div>
            </motion.div>
        </div>
    );
}
