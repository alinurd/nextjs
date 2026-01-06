'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  tag?: string;
  confidence?: number;
  isTyping?: boolean;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Saya asisten virtual Bengkel Motor Sejahtera. Ada yang bisa saya bantu?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'healthy' | 'unhealthy' | 'unknown'>('unknown');
  const [showChatModal, setShowChatModal] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to bottom dengan delay
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messagesEndRef.current && showChatModal) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    }, 100);
  }, [showChatModal]);

  // Effect untuk auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input ketika modal terbuka
  useEffect(() => {
    if (showChatModal && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [showChatModal]);

  // Check API health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://202.10.42.22:5000/health');
        const data = await response.json();
        setApiStatus(data.status === 'healthy' ? 'healthy' : 'unhealthy');
      } catch (error) {
        setApiStatus('unhealthy');
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  // Simulasi efek mengetik dengan karakter per karakter
  const simulateTyping = useCallback(async (text: string): Promise<string> => {
    return new Promise(resolve => {
      let displayedText = '';
      let i = 0;
      const speed = 20; // ms per karakter
      
      const typeWriter = () => {
        if (i < text.length) {
          displayedText += text.charAt(i);
          i++;
          setTimeout(typeWriter, speed);
        } else {
          resolve(displayedText);
        }
      };
      
      typeWriter();
    });
  }, []);

  // Fungsi untuk menampilkan indikator typing
  const showTypingIndicator = useCallback(() => {
    setIsTyping(true);
    
    // Tambah pesan typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, typingMessage]);
  }, []);

  // Fungsi untuk menghapus indikator typing
  const removeTypingIndicator = useCallback(() => {
    setIsTyping(false);
    setMessages(prev => prev.filter(m => !m.isTyping));
  }, []);

  // Fungsi utama untuk mengirim pesan
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    // Tambah pesan user
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Tampilkan typing indicator
      showTypingIndicator();

      // Kirim ke API
      const response = await fetch('http://202.10.42.22:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      // Hapus typing indicator
      removeTypingIndicator();

      if (data.success) {
        // Simulasi efek mengetik untuk bot
        const typedText = await simulateTyping(data.bot_response);
        
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          text: typedText,
          sender: 'bot',
          timestamp: new Date(),
          tag: data.tag,
          confidence: data.confidence,
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Tambah notifikasi jika modal tertutup
        if (!showChatModal) {
          setUnreadMessages(prev => prev + 1);
        }
      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          text: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      removeTypingIndicator();
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://202.10.42.22:5000',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    if (!showChatModal) {
      setShowChatModal(true);
      setUnreadMessages(0);
    }
    setTimeout(() => sendMessage(), 100);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Halo! Saya asisten virtual Bengkel Motor Sejahtera. Ada yang bisa saya bantu?',
        sender: 'bot',
        timestamp: new Date(),
      }
    ]);
  };

  const openChatModal = () => {
    setShowChatModal(true);
    setUnreadMessages(0);
  };

  const closeChatModal = () => {
    setShowChatModal(false);
  };

  // Data untuk halaman utama - DIUPDATE SESUAI DATASET BARU
  const services = [
    { 
      name: 'Ganti Oli & Filter', 
      price: 'Rp 60.000 - 150.000', 
      icon: '⚙️',
      tag: 'ganti_oli',
      patterns: ['ganti oli berapa', 'harga ganti oli', 'oli motor']
    },
    { 
      name: 'Service Ringan', 
      price: 'Rp 80.000 - 300.000', 
      icon: '🔧',
      tag: 'service_ringan',
      patterns: ['service ringan', 'perawatan rutin', 'service kecil']
    },
    { 
      name: 'Service Berat', 
      price: 'Rp 500.000 - 2jt', 
      icon: '🛠️',
      tag: 'service_berat',
      patterns: ['service berat', 'turun mesin', 'overhaul']
    },
    { 
      name: 'Ganti Ban', 
      price: 'Rp 200.000 - 500.000', 
      icon: '🌀',
      tag: 'harga_ban',
      patterns: ['ganti ban', 'harga ban', 'ban motor']
    },
    { 
      name: 'Servis Karburator', 
      price: 'Rp 100.000 - 200.000', 
      icon: '🔩',
      tag: 'servis_karburator',
      patterns: ['servis karburator', 'cuci karburator', 'tuning karburator']
    },
    { 
      name: 'Ganti Rantai & Sproket', 
      price: 'Rp 350.000 - 800.000', 
      icon: '⛓️',
      tag: 'ganti_rantai',
      patterns: ['ganti rantai', 'rantai sproket', 'set rantai']
    },
    { 
      name: 'Ganti Kampas Rem', 
      price: 'Rp 80.000 - 150.000', 
      icon: '🛑',
      tag: 'ganti_kampas_rem',
      patterns: ['ganti kampas rem', 'rem bunyi', 'kampas rem aus']
    },
    { 
      name: 'Service Lampu', 
      price: 'Rp 50.000 - 150.000', 
      icon: '💡',
      tag: 'service_lampu',
      patterns: ['lampu mati', 'ganti lampu', 'perbaikan lampu']
    },
    { 
      name: 'Ganti Ban Dalam', 
      price: 'Rp 40.000 - 75.000', 
      icon: '🛞',
      tag: 'ganti_ban_dalam',
      patterns: ['ganti ban dalam', 'ban dalam bocor', 'ban dalem']
    },
    { 
      name: 'Service Aki', 
      price: 'Rp 15.000 - 150.000', 
      icon: '🔋',
      tag: 'service_aki',
      patterns: ['aki tekor', 'isi aki', 'charge aki']
    },
    { 
      name: 'Ganti Busi', 
      price: 'Rp 15.000 - 120.000', 
      icon: '⚡',
      tag: 'ganti_busi',
      patterns: ['ganti busi', 'busi iridium', 'busi ngelitik']
    },
    { 
      name: 'Service Knalpot', 
      price: 'Rp 30.000 - 150.000', 
      icon: '📢',
      tag: 'service_knalpot',
      patterns: ['knalpot bocor', 'service knalpot', 'las knalpot']
    }
  ];

  const features = [
    {
      title: '31 Kategori Layanan',
      description: 'Dari ganti oli sampai service berat, semua bisa ditanyakan ke chatbot',
      icon: '📋',
      tags: ['service_ringan', 'service_berat', 'promo']
    },
    {
      title: 'Sparepart Original & Aftermarket',
      description: 'Tersedia suku cadang asli dan berkualitas dengan berbagai pilihan merk',
      icon: '✅',
      tags: ['sparepart_asli', 'spare_part']
    },
    {
      title: 'Layanan Darurat 24/7',
      description: 'Derek dan bantuan darurat tersedia kapan saja',
      icon: '🚨',
      tags: ['layanan_derek', 'motor_mati']
    },
    {
      title: 'Harga Transparan & Promo',
      description: 'Tidak ada biaya tersembunyi, plus berbagai promo menarik',
      icon: '💰',
      tags: ['promo', 'cara_bayar']
    },
    {
      title: 'Booking Online',
      description: 'Reservasi service bisa melalui WhatsApp dan chatbot',
      icon: '📅',
      tags: ['booking_service', 'estimasi_waktu']
    },
    {
      title: 'Garansi Service',
      description: 'Service bergaransi 30 hari, sparepart 3-6 bulan',
      icon: '🛡️',
      tags: ['garansi']
    },
    {
      title: 'Teknisi Professional',
      description: 'Dikerjakan oleh teknisi bersertifikasi dan berpengalaman',
      icon: '👨‍🔧',
      tags: ['service_ringan', 'service_berat']
    },
    {
      title: 'Multi-payment',
      description: 'Bayar tunai, QRIS, e-wallet, debit/kredit',
      icon: '💳',
      tags: ['cara_bayar']
    }
  ];

  // Fungsi untuk mendapatkan pertanyaan berdasarkan service
  const getServiceQuestion = (service: typeof services[0]) => {
    const randomPattern = service.patterns[Math.floor(Math.random() * service.patterns.length)];
    return randomPattern + '?';
  };

  // Data quick questions sesuai dataset
  const quickQuestions = [
    "Jam berapa buka bengkel?",
    "Bisa booking service hari ini?",
    "Ada layanan derek darurat?",
    "Berapa lama service ringan?",
    "Bisa bayar pakai QRIS?",
    "Ada promo bulan ini?",
    "Sparepart Honda asli ada?",
    "Rem blong perbaikan berapa?",
    "Lampu depan mati diperbaiki?",
    "Aki motor tekor bisa diisi?",
    "Velg bengkok bisa diperbaiki?",
    "Rantai bunyi harus diapain?",
    "Knalpot bocor bisa dilas?",
    "Service berkala berapa km?",
    "Ganti aki berapa harga?"
  ];

  // Data untuk info panel (sesuai model yang sudah di-training)
  const modelInfo = {
    intents: 31,
    patterns: 150,
    responses: 100,
    accuracy: 96.72,
    trainingSamples: 150,
    vocabulary: 180
  };

  return (
    <>
      {/* Floating Chat Button dengan animasi */}
      <button 
        className="floating-chat-button pulse-button"
        onClick={openChatModal}
        aria-label="Open chat"
      >
        💬
        {unreadMessages > 0 && (
          <span className="chat-badge">{unreadMessages}</span>
        )}
      </button>

      {/* Chat Modal dengan animasi */}
      {showChatModal && (
        <div className="modal-overlay fade-in" onClick={closeChatModal}>
          <div className="modal-content scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="bouncing-arrow">🤖</span>
                Bengkel Motor Assistant
              </div>
              <button className="close-button" onClick={closeChatModal}>
                ✕
              </button>
            </div>
            
            <div className="modal-body smooth-scroll" ref={chatContainerRef}>
              <div className="compact-chat">
                <div className="compact-messages">
                  {messages.map((msg, index) => (
                    <div 
                      key={msg.id} 
                      className={`compact-message ${msg.sender} message-stagger`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="compact-avatar">
                        {msg.sender === 'bot' ? '🤖' : '👤'}
                      </div>
                      <div className={`compact-bubble ${msg.isTyping ? '' : 'bubble-expand'}`}>
                        {msg.isTyping ? (
                          <div className="typing-indicator-fixed">
                            <div className="typing-dot-fixed"></div>
                            <div className="typing-dot-fixed"></div>
                            <div className="typing-dot-fixed"></div>
                          </div>
                        ) : (
                          <p>{msg.text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Loading overlay jika sedang loading */}
                {isLoading && (
                  <div className="loading-overlay">
                    <div className="wave-loader">
                      <div className="wave-dot"></div>
                      <div className="wave-dot"></div>
                      <div className="wave-dot"></div>
                      <div className="wave-dot"></div>
                      <div className="wave-dot"></div>
                    </div>
                  </div>
                )}

                <div className="chat-input-area">
                  <div className="input-wrapper">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Tanyakan tentang service, spare part, atau harga..."
                      className="message-input"
                      rows={2}
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className={`send-button ${isLoading ? 'loading' : ''}`}
                      aria-label="Send message"
                    >
                      {isLoading ? (
                        <div className="rotating-spinner"></div>
                      ) : (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      )}
                    </button>
                  </div>
                  {isLoading && (
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                  )}
                  <div className="input-footer">
                    <p className="input-hint">
                      Tekan Enter untuk mengirim
                    </p>
                    <div className="message-count">
                      {messages.filter(m => m.sender === 'user' && !m.isTyping).length} pesan
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content dengan animasi bertahap */}
      <main className="main-heading">
        <div className="chatbot-container">
          {/* Hero Section dengan animasi */}
          <div className="hero-section slide-down">
            <h1 className="hero-title gradient-text">Bengkel Motor Sejahtera</h1>
            <p className="hero-subtitle fade-in-up" style={{ animationDelay: '0.2s' }}>
              Chatbot Layanan Service & Spare Part Motor dengan 31 Kategori Layanan
            </p>
            <button 
              className="cta-button fade-in-up pulse-button"
              style={{ animationDelay: '0.4s' }}
              onClick={openChatModal}
            >
              <span>💬 Tanya Asisten Virtual</span>
            </button>
          </div>

          {/* Features Grid dengan animasi bertahap */}
          <section className="fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="quick-questions-title text-center mb-6">Keunggulan Layanan Kami</h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="feature-card fade-in-up" 
                  style={{ animationDelay: `${0.1 * index}s` }}
                  onClick={() => {
                    const randomTag = feature.tags[Math.floor(Math.random() * feature.tags.length)];
                    handleQuickQuestion(`Tentang ${randomTag.replace('_', ' ')}`);
                  }}
                >
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {feature.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {tag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Services Section */}
          <section className="fade-in-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="quick-questions-title">Daftar Layanan & Harga</h2>
            <p className="chatbot-subtitle mb-6">
              Klik layanan untuk langsung menanyakan detail harga dan informasi
            </p>
            
            <div className="service-cards">
              {services.map((service, index) => (
                <div 
                  key={index} 
                  className="service-card slide-in-bottom"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <div className="flex-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{service.icon}</div>
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-sm text-gray-500">Intent: <code>{service.tag}</code></p>
                      </div>
                    </div>
                    <span className="message-tag bg-green-100 text-green-800">{service.price}</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Contoh pertanyaan:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {service.patterns.slice(0, 2).map((pattern, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="quick-question-btn mt-2 w-full bg-blue-50 hover:bg-blue-100 border-blue-200"
                    onClick={() => handleQuickQuestion(getServiceQuestion(service))}
                  >
                    💬 Tanya tentang {service.name}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Questions Section */}
          <section className="fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h2 className="quick-questions-title">Pertanyaan Populer</h2>
            <p className="chatbot-subtitle mb-4">
              Klik pertanyaan untuk langsung chat dengan asisten AI
            </p>
            
            <div className="quick-questions-grid">
              {quickQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(question)}
                  className="quick-question-btn slide-in-bottom hover:scale-[1.02] transition-transform"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  {question}
                </button>
              ))}
            </div>
          </section>

          {/* Info Panel - Updated dengan info model yang tepat */}
          <div className="info-panel fade-in-up" style={{ animationDelay: '0.7s' }}>
            <h3 className="info-title">
              <span className="glow">🤖</span>
              Spesifikasi Chatbot AI
            </h3>
            <div className="info-grid">
              <div className="info-card">
                <h4 className="info-card-title gradient-text">📊 Dataset & Model</h4>
                <ul className="info-list">
                  <li><strong>Intents:</strong> {modelInfo.intents} kategori</li>
                  <li><strong>Patterns:</strong> {modelInfo.patterns} pola pertanyaan</li>
                  <li><strong>Responses:</strong> {modelInfo.responses} variasi jawaban</li>
                  <li><strong>Accuracy:</strong> {modelInfo.accuracy}% (training)</li>
                </ul>
              </div>
              <div className="info-card">
                <h4 className="info-card-title gradient-text">⚡ Performa</h4>
                <ul className="info-list">
                  <li><strong>Response Time:</strong> &lt; 1 detik</li>
                  <li><strong>Typing Animation:</strong> Real-time</li>
                  <li><strong>Auto-scroll:</strong> Smooth behavior</li>
                  <li><strong>Unread Counter:</strong> Live notification</li>
                </ul>
              </div>
              <div className="info-card">
                <h4 className="info-card-title gradient-text">🔧 Teknologi</h4>
                <ul className="info-list">
                  <li><strong>Backend:</strong> Python Flask + Scikit-learn</li>
                  <li><strong>Algorithm:</strong> Naive Bayes + TF-IDF</li>
                  <li><strong>Frontend:</strong> Next.js 14 + TypeScript</li>
                  <li><strong>API:</strong> RESTful + CORS enabled</li>
                </ul>
              </div>
            </div>
            
            {/* Stats bar */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg text-center border">
                <div className="text-2xl font-bold text-blue-600">{modelInfo.intents}</div>
                <div className="text-sm text-gray-600">Intents</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center border">
                <div className="text-2xl font-bold text-green-600">{modelInfo.patterns}+</div>
                <div className="text-sm text-gray-600">Patterns</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center border">
                <div className="text-2xl font-bold text-purple-600">{modelInfo.accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center border">
                <div className="text-2xl font-bold text-orange-600">{modelInfo.vocabulary}</div>
                <div className="text-sm text-gray-600">Vocabulary</div>
              </div>
            </div>
          </div>

          {/* Status & Action */}
          <div className="status-container mt-6 fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className={`status-badge ${apiStatus} ${apiStatus === 'unknown' ? 'glow' : ''}`}>
              <span className="status-dot"></span>
              API Status: {apiStatus === 'healthy' ? 'Connected ✅' : apiStatus === 'unhealthy' ? 'Disconnected ❌' : 'Checking... 🔄'}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={clearChat}
                className="clear-btn hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                🗑️ Clear Chat History
              </button>
              <button
                onClick={() => handleQuickQuestion("Ada promo apa bulan ini?")}
                className="clear-btn hover:bg-green-50 hover:text-green-700 hover:border-green-300"
              >
                🎁 Cek Promo Terbaru
              </button>
              <button
                onClick={() => handleQuickQuestion("Lokasi bengkel dimana?")}
                className="clear-btn hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              >
                📍 Lihat Lokasi
              </button>
              <button
                onClick={openChatModal}
                className="clear-btn pulse-button"
                style={{ background: 'var(--primary-color)', color: 'white' }}
              >
                💬 Buka Chat Assistant
              </button>
            </div>
          </div>
          
          {/* Footer Note */}
          <div className="text-center mt-8 text-sm text-gray-500 fade-in-up" style={{ animationDelay: '0.9s' }}>
            <p>Chatbot untuk UAS Data Mining - Program Pascasarjana Teknik Informatika S2</p>
            <p>Universitas Pamulang - Semester Ganjil 2025/2026</p>
            <p className="mt-2 text-xs">Menggunakan Naive Bayes Classifier dengan dataset {modelInfo.intents} intents</p>
          </div>
        </div>
      </main>
    </>
  );
}