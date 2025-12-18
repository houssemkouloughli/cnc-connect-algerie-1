'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { getQuoteMessages, sendMessage, markMessagesAsRead } from '@/lib/queries/messages';
import type { MessageWithSender } from '@/lib/queries/messages';
import { useToast } from '@/components/ui/Toast';
import { getUserFriendlyError } from '@/lib/errors/handleError';

interface MessagingPanelProps {
    quoteId: string;
    receiverId: string;
    receiverName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function MessagingPanel({
    quoteId,
    receiverId,
    receiverName,
    isOpen,
    onClose
}: MessagingPanelProps) {
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            loadMessages();
            markMessagesAsRead(quoteId);
        }
    }, [isOpen, quoteId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            const data = await getQuoteMessages(quoteId);
            setMessages(data);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await sendMessage({
                quote_id: quoteId,
                receiver_id: receiverId,
                content: newMessage.trim()
            });

            setNewMessage('');
            await loadMessages();
        } catch (error) {
            const friendlyError = getUserFriendlyError(error);
            showToast(friendlyError, 'error');
        } finally {
            setIsSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-blue-600" />
                        <div>
                            <h3 className="font-semibold text-slate-900">Messagerie</h3>
                            <p className="text-sm text-slate-600">{receiverName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Security Notice */}
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
                    <p className="text-xs text-amber-900">
                        🔒 <strong>Sécurité :</strong> Les numéros de téléphone et emails sont automatiquement masqués.
                        Utilisez uniquement cette messagerie pour échanger.
                    </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            Aucun message pour le moment
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_id === receiverId ? 'justify-start' : 'justify-end'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.sender_id === receiverId
                                            ? 'bg-slate-100 text-slate-900'
                                            : 'bg-blue-600 text-white'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    <p
                                        className={`text-xs mt-1 ${msg.sender_id === receiverId ? 'text-slate-500' : 'text-blue-100'
                                            }`}
                                    >
                                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-slate-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Écrivez votre message..."
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Envoyer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
