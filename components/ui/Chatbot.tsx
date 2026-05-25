"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/state/LanguageContext";

type Message = {
    id: string;
    type: 'bot' | 'user';
    text: string;
    isTyping?: boolean;
};

export function Chatbot() {
    const { t, language } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    type: 'bot',
                    text: "Bonjour ! 👋 Je suis l'Assistant Virtuel Intelligent de Cepsa Golden Parc. Posez-moi vos questions sur la station, le restaurant, l'hôtel, ou la piscine !"
                }
            ]);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsg = inputValue;
        setInputValue("");
        
        const newMessages: Message[] = [
            ...messages,
            { id: Date.now().toString(), type: 'user', text: userMsg }
        ];
        
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages, language })
            });

            const data = await response.json();

            if (data.reply) {
                setMessages(prev => [...prev, { 
                    id: (Date.now() + 1).toString(), 
                    type: 'bot', 
                    text: data.reply 
                }]);
            } else {
                setMessages(prev => [...prev, { 
                    id: (Date.now() + 1).toString(), 
                    type: 'bot', 
                    text: "Désolé, je rencontre des difficultés techniques. Veuillez contacter l'assistance au 06 61 69 01 79." 
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { 
                id: (Date.now() + 1).toString(), 
                type: 'bot', 
                text: "Désolé, il y a un problème de connexion. Veuillez réessayer." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_10px_30px_rgba(220,38,38,0.5)] bg-gradient-to-br from-red-600 to-orange-500 text-white border border-white/20 flex items-center justify-center ${isOpen ? 'hidden' : 'block'}`}
            >
                <MessageSquare className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-[#070A13] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#111827] border-b border-white/5 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center border border-white/20">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Assistant IA Cepsa</h3>
                                    <p className="text-green-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> En Ligne
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative">
                            {messages.map((msg) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id} 
                                    className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                        msg.type === 'user' 
                                            ? 'bg-red-600 text-white rounded-br-none' 
                                            : 'bg-[#1E293B] text-gray-200 border border-white/5 rounded-bl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-start"
                                >
                                    <div className="bg-[#1E293B] text-gray-200 border border-white/5 rounded-2xl rounded-bl-none p-3 px-4 flex gap-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-[#111827] border-t border-white/5 flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                                placeholder={isLoading ? "L'IA réfléchit..." : "Posez votre question..."}
                                className="flex-1 bg-[#1E293B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500 transition-all disabled:opacity-50"
                            />
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim() || isLoading}
                                className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-[#1E293B] transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
