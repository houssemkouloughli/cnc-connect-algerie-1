'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { sendMessage, getQuoteMessages, markMessagesAsRead, type MessageWithSender } from '@/lib/queries/messages';
import { useToast } from '@/components/ui/Toast';

interface MessagingPanelProps {
    quoteId: string;
    receiverId: string;
    receiverName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function MessagingPanel({ quoteId, receiverId, receiverName, isOpen, onClose }: MessagingPanelProps) {
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen && quoteId) {
            loadMessages();
            const interval = setInterval(loadMessages, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [isOpen, quoteId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            const data = await getQuoteMessages(quoteId);
            setMessages(data);
            await markMessagesAsRead(quoteId);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await sendMessage({
                quote_id: quoteId,
                receiver_id: receiverId,
                content: newMessage.trim()
            });
            setNewMessage('');
            await loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            showToast('Erreur lors de l\'envoi du message', 'error');
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[500px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">{receiverName}</h3>
                            <p className="text-xs text-slate-500">Discussion sécurisée</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                            <p className="text-sm">Aucun message pour l'instant</p>
                            <p className="text-xs">Commencez la conversation !</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isOwn = message.sender_id !== receiverId;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${isOwn
                                                ? 'bg-blue-600 text-white rounded-br-md'
                                                : 'bg-slate-100 text-slate-900 rounded-bl-md'
                                            }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-slate-500'}`}>
                                            {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Écrivez votre message..."
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!newMessage.trim() || sending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        📍 Les numéros de téléphone et emails sont automatiquement masqués
                    </p>
                </div>
            </div>
        </div>
    );
}
