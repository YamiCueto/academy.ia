/**
 * 🤖 SmartChat Academy - Chatbot Educativo Inteligente
 * Sistema de chat 100% offline con IA simulada para Academia de Idiomas
 * Perfecto para GitHub Pages - Sin APIs externas necesarias
 */

class SmartChatAcademy {
    constructor() {
        this.chatHistory = [];
        this.isThinking = false;
        this.isVisible = false;
        this.userName = '';
        this.userLevel = 'beginner'; // beginner, intermediate, advanced
        this.conversationContext = [];
        this.currentTopic = null;
        this.sessionStartTime = Date.now();
        
        // Personalidades del chatbot
        this.personalities = {
            teacher: { emoji: '👩‍🏫', name: 'Profesora Ana' },
            friend: { emoji: '😊', name: 'Amigo Virtual' },
            formal: { emoji: '🎓', name: 'Tutor Académico' },
            fun: { emoji: '🎉', name: 'ChatBot Divertido' }
        };
        this.currentPersonality = 'teacher';
        
        // Base de conocimiento súper completa
        this.knowledgeBase = this.initializeKnowledgeBase();
        
        // Patrones de conversación para simular IA real
        this.conversationPatterns = this.initializeConversationPatterns();
        
        // Cargar preferencias del usuario
        this.loadUserData();
        
        // Inicializar componente
        this.init();
    }

    init() {
        this.createChatInterface();
        this.bindEvents();
        this.setupFloatingButton();
        this.startTypingSimulation();
        
        // El chat empieza oculto
        this.chatContainer.style.display = 'none';
    }

    initializeKnowledgeBase() {
        return {
            grammar: {
                'present simple': {
                    explanation: 'Se usa para rutinas, hechos y verdades generales.',
                    structure: 'Sujeto + verbo (s/es para 3era persona)',
                    examples: ['I work every day', 'She speaks English', 'The sun rises in the east'],
                    exercises: ['Complete: She _____ (study) medicine', 'Transform to negative: They play soccer']
                },
                'present continuous': {
                    explanation: 'Se usa para acciones en progreso ahora o planes futuros.',
                    structure: 'Sujeto + am/is/are + verbo-ing',
                    examples: ['I am studying now', 'They are coming tomorrow', 'She is working'],
                    exercises: ['What are you _____ (do) right now?', 'Make question: He is reading']
                },
                'past simple': {
                    explanation: 'Se usa para acciones completadas en el pasado.',
                    structure: 'Sujeto + verbo en pasado / did + verbo base (negativo/pregunta)',
                    examples: ['I visited Paris last year', 'Did you see the movie?', 'She didn\'t call me'],
                    exercises: ['Complete: Yesterday I _____ (go) to school', 'Make negative: He played tennis']
                },
                'present perfect': {
                    explanation: 'Se usa para acciones pasadas con relevancia presente.',
                    structure: 'Sujeto + have/has + participio pasado',
                    examples: ['I have lived here for 5 years', 'She has finished her work', 'Have you ever been to Japan?'],
                    exercises: ['Complete: I _____ never _____ (see) that movie', 'Choose: I have lived/lived here since 2020']
                },
                'future': {
                    explanation: 'Will (decisiones espontáneas), Going to (planes), Present continuous (citas)',
                    structure: 'Will + verbo base / am/is/are going to + verbo / am/is/are + verbo-ing',
                    examples: ['I will help you', 'I am going to study', 'I am meeting him at 3pm'],
                    exercises: ['Choose will/going to: Look at those clouds! It _____ rain', 'Complete: Tomorrow I _____ (visit) my grandmother']
                }
            },
            vocabulary: {
                'false friends': {
                    'actually': 'En realidad (no "actualmente" = currently)',
                    'library': 'Biblioteca (no "librería" = bookstore)',
                    'realize': 'Darse cuenta (no "realizar" = carry out)',
                    'embarrassed': 'Avergonzado (no "embarazada" = pregnant)',
                    'exit': 'Salida (no "éxito" = success)'
                },
                'confusing words': {
                    'affect vs effect': 'Affect = verbo (afectar), Effect = sustantivo (efecto)',
                    'there vs their vs they\'re': 'There = lugar, Their = posesión, They\'re = they are',
                    'your vs you\'re': 'Your = posesión, You\'re = you are',
                    'lose vs loose': 'Lose = perder, Loose = suelto/flojo',
                    'then vs than': 'Then = entonces/después, Than = que (comparación)'
                },
                'business english': {
                    'meetings': ['schedule a meeting', 'agenda', 'minutes', 'action items', 'follow up'],
                    'emails': ['Dear Sir/Madam', 'I am writing to...', 'Please find attached', 'Looking forward to hearing from you'],
                    'presentations': ['Let me start by...', 'Moving on to...', 'To summarize...', 'Any questions?']
                }
            },
            pronunciation: {
                'difficult sounds': {
                    'th sounds': {
                        'voiced': ['the', 'this', 'that', 'mother', 'brother'],
                        'unvoiced': ['think', 'thank', 'three', 'month', 'birth']
                    },
                    'r vs l': ['red vs led', 'right vs light', 'pray vs play', 'rice vs lice'],
                    'silent letters': ['knife', 'lamb', 'castle', 'listen', 'island']
                },
                'stress patterns': {
                    'word stress': 'PHOtograph vs phoTOgraphy vs photoGRAPHic',
                    'sentence stress': 'Content words are stressed, function words are unstressed'
                }
            },
            conversation: {
                'greetings': ['Hello!', 'How are you?', 'Nice to meet you', 'Good morning/afternoon/evening'],
                'small talk': ['How\'s the weather?', 'What do you do for work?', 'Do you have any hobbies?'],
                'expressing opinions': ['I think...', 'In my opinion...', 'I believe...', 'From my point of view...'],
                'agreeing/disagreeing': ['I agree', 'I disagree', 'That\'s true', 'I\'m not sure about that']
            },
            culture: {
                'uk vs us': {
                    'vocabulary': 'lift/elevator, biscuit/cookie, petrol/gas, autumn/fall',
                    'spelling': 'colour/color, realise/realize, centre/center',
                    'pronunciation': 'Different accents and intonation patterns'
                }
            }
        };
    }

    initializeConversationPatterns() {
        return {
            greetings: [
                '¡Hola! 👋 ¿Cómo estás hoy?',
                '¡Hey! ¿En qué puedo ayudarte con tu inglés?',
                '¡Bienvenido de nuevo! ¿Continuamos aprendiendo?'
            ],
            encouragement: [
                '¡Excelente pregunta! 🌟',
                '¡Muy bien! Estás progresando genial 💪',
                '¡Perfecto! Esa es exactamente la actitud correcta 🎯',
                '¡Fantástico! Me encanta tu curiosidad 🚀'
            ],
            thinking: [
                'Déjame pensar en la mejor manera de explicarte esto...',
                'Hmm, esa es una pregunta interesante...',
                'Perfecto, voy a prepararte una explicación súper clara...',
                'Excelente, tengo algunos ejemplos perfectos para ti...'
            ],
            transitions: [
                'Por otro lado...',
                'Además de esto...',
                'También es importante mencionar que...',
                'Una cosa más que deberías saber...'
            ],
            clarification: [
                '¿Te gustaría que profundice en algún punto específico?',
                '¿Hay algo que no quedó claro?',
                '¿Necesitas más ejemplos sobre este tema?',
                '¿Te gustaría practicar esto con algunos ejercicios?'
            ]
        };
    }

    createChatInterface() {
        const chatContainer = document.createElement('div');
        chatContainer.className = 'smart-chat-container';
        chatContainer.innerHTML = `
            <div class="smart-chat-header">
                <div class="chat-title">
                    <div class="bot-avatar">
                        <span class="bot-emoji">${this.personalities[this.currentPersonality].emoji}</span>
                        <div class="status-indicator"></div>
                    </div>
                    <div class="title-text">
                        <span class="bot-name">${this.personalities[this.currentPersonality].name}</span>
                        <span class="bot-status">En línea</span>
                    </div>
                </div>
                <div class="chat-controls">
                    <select id="personality-selector" class="personality-selector" title="Cambiar personalidad">
                        <option value="teacher">👩‍🏫 Profesora</option>
                        <option value="friend">😊 Amigable</option>
                        <option value="formal">🎓 Formal</option>
                        <option value="fun">🎉 Divertido</option>
                    </select>
                    <button id="clear-chat" class="btn-control" title="Limpiar chat">
                        <i class="fas fa-broom"></i>
                    </button>
                    <button id="toggle-chat" class="btn-control" title="Minimizar">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button id="close-chat" class="btn-control" title="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="smart-chat-messages" id="chat-messages">
                <!-- Los mensajes aparecen aquí -->
            </div>
            
            <div class="quick-topics" id="quick-topics">
                <div class="topic-chip" data-topic="grammar">📝 Gramática</div>
                <div class="topic-chip" data-topic="vocabulary">📚 Vocabulario</div>
                <div class="topic-chip" data-topic="pronunciation">🗣️ Pronunciación</div>
                <div class="topic-chip" data-topic="conversation">💬 Conversación</div>
            </div>
            
            <div class="smart-chat-input">
                <div class="input-container">
                    <input type="text" 
                           id="chat-input" 
                           placeholder="Escribe tu pregunta sobre idiomas..."
                           maxlength="500"
                           autocomplete="off">
                    <button id="send-message" class="btn-send">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="smart-suggestions" id="suggestions-container">
                    <!-- Sugerencias dinámicas aparecen aquí -->
                </div>
            </div>
            
            <div class="typing-indicator" id="typing-indicator" style="display: none;">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="typing-text">Escribiendo...</span>
            </div>
        `;

        document.body.appendChild(chatContainer);
        
        // Referencias a elementos
        this.chatContainer = chatContainer;
        this.messagesContainer = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-message');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.personalitySelector = document.getElementById('personality-selector');
        this.quickTopics = document.getElementById('quick-topics');
        this.suggestionsContainer = document.getElementById('suggestions-container');
    }

    setupFloatingButton() {
        // Crear botón flotante si no existe
        let fabButton = document.getElementById('smart-chat-fab');
        if (!fabButton) {
            fabButton = document.createElement('button');
            fabButton.id = 'smart-chat-fab';
            fabButton.className = 'smart-chat-fab';
            fabButton.innerHTML = `
                <i class="fas fa-robot"></i>
                <div class="notification-badge">1</div>
            `;
            fabButton.title = 'Abrir Smart Chat Academy';
            document.body.appendChild(fabButton);
        }
        
        this.fabButton = fabButton;
        this.fabButton.addEventListener('click', () => {
            this.toggleChatVisibility();
        });
    }

    bindEvents() {
        // Enviar mensaje
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Temas rápidos
        this.quickTopics.addEventListener('click', (e) => {
            if (e.target.classList.contains('topic-chip')) {
                const topic = e.target.dataset.topic;
                this.handleQuickTopic(topic);
            }
        });

        // Cambio de personalidad
        this.personalitySelector.addEventListener('change', (e) => {
            this.changePersonality(e.target.value);
        });

        // Controles del chat
        document.getElementById('clear-chat').addEventListener('click', () => this.clearChat());
        document.getElementById('toggle-chat').addEventListener('click', () => this.toggleChat());
        document.getElementById('close-chat').addEventListener('click', () => this.toggleChatVisibility());

        // Auto-sugerencias mientras escribe
        this.chatInput.addEventListener('input', () => {
            this.updateSuggestions();
        });

        // Focus automático
        this.chatInput.addEventListener('focus', () => {
            this.updateSuggestions();
        });
    }

    toggleChatVisibility() {
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            this.chatContainer.style.display = 'flex';
            this.fabButton.classList.add('hidden');
            
            // Mostrar mensaje de bienvenida si es primera vez
            if (this.chatHistory.length === 0) {
                setTimeout(() => this.showWelcomeMessage(), 500);
            }
            
            // Focus en input
            setTimeout(() => this.chatInput.focus(), 300);
            
            // Quitar badge de notificación
            const badge = this.fabButton.querySelector('.notification-badge');
            if (badge) badge.style.display = 'none';
            
        } else {
            this.chatContainer.style.display = 'none';
            this.fabButton.classList.remove('hidden');
        }
    }

    async showWelcomeMessage() {
        await this.simulateTyping();
        
        const welcomeMessage = {
            type: 'bot',
            content: `¡Hola! 👋 Soy ${this.personalities[this.currentPersonality].name}, tu asistente personal de inglés.

🎯 **Estoy aquí para ayudarte con:**
• 📝 Gramática y estructuras
• 📚 Vocabulario y expresiones
• 🗣️ Pronunciación y fonética
• 💬 Conversación práctica
• 🌍 Cultura angloparlante

💡 **Soy súper inteligente porque:**
• Adapto mi respuesta a tu nivel
• Recuerdo nuestras conversaciones anteriores
• Te doy ejemplos prácticos
• Sugiero ejercicios personalizados

¿Cuál es tu nombre? ¿Y en qué nivel de inglés te consideras? 😊`,
            timestamp: new Date().toISOString(),
            personality: this.currentPersonality
        };

        this.addMessage(welcomeMessage);
        this.updateSuggestions();
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isThinking) return;

        // Agregar mensaje del usuario
        const userMessage = {
            type: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        this.addMessage(userMessage);
        this.chatInput.value = '';
        this.suggestionsContainer.innerHTML = '';

        // Agregar contexto a la conversación
        this.conversationContext.push({
            role: 'user',
            content: message,
            timestamp: Date.now()
        });

        // Obtener respuesta inteligente
        await this.generateSmartResponse(message);
    }

    async generateSmartResponse(userMessage) {
        await this.simulateTyping();

        try {
            // Analizar el mensaje del usuario
            const analysis = this.analyzeUserMessage(userMessage);
            
            // Generar respuesta contextual
            const response = this.generateContextualResponse(analysis);
            
            const botMessage = {
                type: 'bot',
                content: response.content,
                timestamp: new Date().toISOString(),
                personality: this.currentPersonality,
                topic: analysis.topic,
                confidence: response.confidence
            };

            this.addMessage(botMessage);
            
            // Agregar al contexto
            this.conversationContext.push({
                role: 'bot',
                content: response.content,
                timestamp: Date.now()
            });

            // Actualizar sugerencias basadas en la respuesta
            setTimeout(() => this.updateSuggestions(), 1000);

        } catch (error) {
            console.error('Error generando respuesta:', error);
            
            const errorMessage = {
                type: 'bot',
                content: '¡Ups! 😅 Parece que tuve un pequeño problema procesando eso. ¿Podrías reformular tu pregunta? Estoy aquí para ayudarte con cualquier tema de inglés.',
                timestamp: new Date().toISOString(),
                personality: this.currentPersonality
            };
            
            this.addMessage(errorMessage);
        } finally {
            this.setThinking(false);
        }
    }

    analyzeUserMessage(message) {
        const lowerMessage = message.toLowerCase();
        const analysis = {
            topic: 'general',
            intent: 'question',
            level: 'unknown',
            keywords: [],
            entities: [],
            sentiment: 'neutral'
        };

        // Detectar temas
        if (this.matchesKeywords(lowerMessage, ['grammar', 'gramática', 'tense', 'tiempo', 'verb', 'verbo'])) {
            analysis.topic = 'grammar';
        } else if (this.matchesKeywords(lowerMessage, ['vocabulary', 'vocabulario', 'word', 'palabra', 'meaning', 'significado'])) {
            analysis.topic = 'vocabulary';
        } else if (this.matchesKeywords(lowerMessage, ['pronunciation', 'pronunciación', 'sound', 'sonido', 'accent', 'acento'])) {
            analysis.topic = 'pronunciation';
        } else if (this.matchesKeywords(lowerMessage, ['conversation', 'conversación', 'speak', 'hablar', 'talk', 'dialogue'])) {
            analysis.topic = 'conversation';
        }

        // Detectar intención
        if (lowerMessage.includes('?') || this.matchesKeywords(lowerMessage, ['how', 'what', 'when', 'where', 'why', 'cómo', 'qué', 'cuándo', 'dónde', 'por qué'])) {
            analysis.intent = 'question';
        } else if (this.matchesKeywords(lowerMessage, ['help', 'ayuda', 'explain', 'explica', 'teach', 'enseña'])) {
            analysis.intent = 'help_request';
        } else if (this.matchesKeywords(lowerMessage, ['practice', 'práctica', 'exercise', 'ejercicio', 'test', 'prueba'])) {
            analysis.intent = 'practice_request';
        }

        // Detectar nivel estimado
        if (this.matchesKeywords(lowerMessage, ['beginner', 'principiante', 'basic', 'básico'])) {
            analysis.level = 'beginner';
        } else if (this.matchesKeywords(lowerMessage, ['intermediate', 'intermedio'])) {
            analysis.level = 'intermediate';
        } else if (this.matchesKeywords(lowerMessage, ['advanced', 'avanzado'])) {
            analysis.level = 'advanced';
        }

        // Detectar sentimiento
        if (this.matchesKeywords(lowerMessage, ['thanks', 'gracias', 'great', 'genial', 'perfect', 'perfecto'])) {
            analysis.sentiment = 'positive';
        } else if (this.matchesKeywords(lowerMessage, ['difficult', 'difícil', 'confused', 'confundido', 'hard', 'duro'])) {
            analysis.sentiment = 'frustrated';
        }

        return analysis;
    }

    generateContextualResponse(analysis) {
        const personality = this.personalities[this.currentPersonality];
        let response = '';
        let confidence = 0.8;

        // Generar respuesta basada en el tema
        switch (analysis.topic) {
            case 'grammar':
                response = this.generateGrammarResponse(analysis);
                confidence = 0.9;
                break;
            case 'vocabulary':
                response = this.generateVocabularyResponse(analysis);
                confidence = 0.9;
                break;
            case 'pronunciation':
                response = this.generatePronunciationResponse(analysis);
                confidence = 0.85;
                break;
            case 'conversation':
                response = this.generateConversationResponse(analysis);
                confidence = 0.85;
                break;
            default:
                response = this.generateGeneralResponse(analysis);
                confidence = 0.7;
        }

        // Ajustar tono según personalidad
        response = this.adjustToneForPersonality(response, this.currentPersonality);

        return { content: response, confidence };
    }

    generateGrammarResponse(analysis) {
        const userMessage = this.conversationContext[this.conversationContext.length - 1]?.content || '';
        const lowerMessage = userMessage.toLowerCase();

        // Detectar temas específicos de gramática
        for (const [grammarTopic, data] of Object.entries(this.knowledgeBase.grammar)) {
            if (lowerMessage.includes(grammarTopic.replace(' ', '')) || 
                lowerMessage.includes(grammarTopic) ||
                this.matchesKeywords(lowerMessage, grammarTopic.split(' '))) {
                
                return `¡Excelente pregunta sobre **${grammarTopic}**! 🎯

📋 **Explicación:**
${data.explanation}

🔧 **Estructura:**
${data.structure}

💡 **Ejemplos:**
${data.examples.map(ex => `• ${ex}`).join('\n')}

🏃‍♀️ **Práctica rápida:**
${data.exercises[0]}

¿Te gustaría más ejercicios o tienes alguna duda específica sobre este tema?`;
            }
        }

        // Respuesta general de gramática
        return `¡Perfecto! La gramática es fundamental 📝

Puedo ayudarte con:
• **Tiempos verbales** (presente, pasado, futuro)
• **Estructuras de oraciones** (afirmativa, negativa, interrogativa)
• **Condicionales** (if clauses)
• **Voz pasiva** (passive voice)
• **Reported speech** (estilo indirecto)

¿Hay algún tema específico que te gustaría repasar? 🤔`;
    }

    generateVocabularyResponse(analysis) {
        const userMessage = this.conversationContext[this.conversationContext.length - 1]?.content || '';
        const lowerMessage = userMessage.toLowerCase();

        // Palabras confusas
        if (this.matchesKeywords(lowerMessage, ['confusing', 'confusa', 'difference', 'diferencia'])) {
            const confusingPairs = Object.entries(this.knowledgeBase.vocabulary['confusing words']);
            const randomPair = confusingPairs[Math.floor(Math.random() * confusingPairs.length)];
            
            return `¡Qué buena pregunta! Las palabras confusas son súper comunes 🤯

📚 **Ejemplo:** ${randomPair[0]}
💡 **Explicación:** ${randomPair[1]}

🎯 **Más pares confusos:**
${confusingPairs.slice(0, 3).map(([pair, explanation]) => `• **${pair}**: ${explanation}`).join('\n')}

¿Hay algún par específico que te confunde? ¡Pregúntame!`;
        }

        // False friends
        if (this.matchesKeywords(lowerMessage, ['false friend', 'falso cognado', 'false cognate'])) {
            const falseFriends = Object.entries(this.knowledgeBase.vocabulary['false friends']);
            const examples = falseFriends.slice(0, 3);
            
            return `¡Los falsos cognados son tramposos! 😈 Pero no te preocupes, te ayudo:

🚫 **Falsos amigos comunes:**
${examples.map(([word, meaning]) => `• **${word}**: ${meaning}`).join('\n')}

💡 **Truco:** Siempre verifica el significado real, no asumas por el parecido al español.

¿Conoces algún otro falso cognado que te confunde?`;
        }

        return `¡El vocabulario es tu superpoder! 💪

🎯 **Puedo ayudarte con:**
• **Falsos cognados** (false friends)
• **Palabras confusas** (confusing words)
• **Inglés de negocios** (business English)
• **Expresiones idiomáticas** (idioms)
• **Sinónimos y antónimos**

¿Qué área te interesa más? 🤔`;
    }

    generatePronunciationResponse(analysis) {
        return `¡La pronunciación es clave para comunicarte bien! 🗣️

🎵 **Puedo ayudarte con:**
• **Sonidos difíciles** (th, r/l, silent letters)
• **Acentuación** (word stress, sentence stress)
• **Diferencias** UK vs US pronunciation
• **Fonética básica** (símbolos IPA)

💡 **Tip del día:** Practica con trabalenguas (tongue twisters)
"She sells seashells by the seashore" 🐚

¿Hay algún sonido específico que te cuesta trabajo? ¡Te doy trucos súper útiles!`;
    }

    generateConversationResponse(analysis) {
        return `¡Hablemos! La conversación es donde brilla tu inglés ✨

💬 **Puedo enseñarte:**
• **Saludos y presentaciones**
• **Small talk** (conversación casual)
• **Expresar opiniones**
• **Dar y pedir direcciones**
• **En restaurantes y tiendas**

🎭 **¿Te parece si practicamos un diálogo?**
Elige una situación:
• En el aeropuerto ✈️
• En una entrevista de trabajo 💼
• Conociendo gente nueva 👥
• Pidiendo ayuda 🙋‍♀️

¿Cuál te interesa más? ¡Vamos a practicar!`;
    }

    generateGeneralResponse(analysis) {
        const responses = [
            `¡Qué interesante! 🤔 Cuéntame más detalles para poder ayudarte mejor.`,
            `¡Excelente! Me encanta cuando mis estudiantes tienen curiosidad 🌟`,
            `¡Perfecto! Esa es exactamente la actitud para aprender idiomas 🚀`,
            `¡Genial! Vamos paso a paso para que lo entiendas súper bien 💡`
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return `${randomResponse}

🎯 **Recuerda que puedo ayudarte con:**
• Gramática y estructuras
• Vocabulario y expresiones
• Pronunciación y fonética
• Conversación práctica

¿En qué área específica te gustaría que te ayude hoy?`;
    }

    adjustToneForPersonality(response, personality) {
        switch (personality) {
            case 'friend':
                return response.replace(/¡/g, '¡Hey! ').replace(/\./g, '! 😊');
            case 'formal':
                return response.replace(/¡/g, '').replace(/😊|😎|🎉/g, '').replace(/súper/g, 'muy');
            case 'fun':
                return response + '\n\n🎉 ¡Aprender inglés es súper divertido! ¿Verdad? 🤩';
            default:
                return response;
        }
    }

    matchesKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    async simulateTyping() {
        this.setThinking(true);
        
        // Simular tiempo de pensamiento realista
        const thinkingTime = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, thinkingTime));
    }

    setThinking(isThinking) {
        this.isThinking = isThinking;
        this.sendButton.disabled = isThinking;
        this.chatInput.disabled = isThinking;
        
        if (isThinking) {
            this.typingIndicator.style.display = 'flex';
            this.scrollToBottom();
        } else {
            this.typingIndicator.style.display = 'none';
        }
    }

    addMessage(message) {
        this.chatHistory.push(message);
        this.saveChatHistory();

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.type}`;
        
        const timestamp = new Date(message.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const avatar = message.type === 'bot' 
            ? `<div class="message-avatar">${this.personalities[message.personality || this.currentPersonality].emoji}</div>`
            : `<div class="message-avatar">👤</div>`;

        messageDiv.innerHTML = `
            <div class="message-header">
                ${avatar}
                <span class="message-time">${timestamp}</span>
                ${message.confidence ? `<span class="confidence-badge">${Math.round(message.confidence * 100)}%</span>` : ''}
            </div>
            <div class="message-content">${this.formatMessage(message.content)}</div>
        `;

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Animación de entrada
        setTimeout(() => messageDiv.classList.add('animate-in'), 100);
    }

    formatMessage(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/•/g, '<span class="bullet">•</span>');
    }

    updateSuggestions() {
        const input = this.chatInput.value.toLowerCase();
        const suggestions = this.generateSmartSuggestions(input);
        
        this.suggestionsContainer.innerHTML = suggestions
            .map(suggestion => `<div class="suggestion-chip" data-text="${suggestion}">${suggestion}</div>`)
            .join('');

        // Bind click events
        this.suggestionsContainer.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.chatInput.value = e.target.dataset.text;
                this.sendMessage();
            });
        });
    }

    generateSmartSuggestions(input) {
        const allSuggestions = [
            '¿Cómo uso el presente perfecto?',
            '¿Cuál es la diferencia entre there, their y they\'re?',
            '¿Puedes ayudarme con la pronunciación?',
            '¿Cómo mejoro mi vocabulario?',
            'Quiero practicar conversación',
            '¿Qué son los falsos cognados?',
            '¿Cómo hago preguntas en inglés?',
            'Explícame los tiempos verbales',
            '¿Cuándo uso will vs going to?',
            'Ayúdame con el past simple'
        ];

        if (!input) {
            return allSuggestions.slice(0, 3);
        }

        // Sugerencias contextualesa
        const contextual = allSuggestions.filter(s => 
            s.toLowerCase().includes(input) || 
            input.split(' ').some(word => s.toLowerCase().includes(word))
        );

        return contextual.length > 0 ? contextual.slice(0, 3) : allSuggestions.slice(0, 3);
    }

    handleQuickTopic(topic) {
        const topicQuestions = {
            grammar: '¿Puedes explicarme los tiempos verbales básicos?',
            vocabulary: '¿Cómo puedo ampliar mi vocabulario en inglés?',
            pronunciation: '¿Qué sonidos son más difíciles para hispanohablantes?',
            conversation: '¿Podemos practicar una conversación casual?'
        };

        this.chatInput.value = topicQuestions[topic];
        this.sendMessage();
    }

    changePersonality(newPersonality) {
        this.currentPersonality = newPersonality;
        
        const botAvatar = document.querySelector('.bot-emoji');
        const botName = document.querySelector('.bot-name');
        
        if (botAvatar) botAvatar.textContent = this.personalities[newPersonality].emoji;
        if (botName) botName.textContent = this.personalities[newPersonality].name;

        // Mensaje de cambio
        const changeMessage = {
            type: 'bot',
            content: `¡Hola! Ahora soy ${this.personalities[newPersonality].name} ${this.personalities[newPersonality].emoji}. ¡Sigamos aprendiendo juntos!`,
            timestamp: new Date().toISOString(),
            personality: newPersonality
        };

        this.addMessage(changeMessage);
    }

    clearChat() {
        if (confirm('¿Estás seguro de que quieres limpiar el historial? 🗑️')) {
            this.chatHistory = [];
            this.conversationContext = [];
            this.messagesContainer.innerHTML = '';
            this.saveChatHistory();
            setTimeout(() => this.showWelcomeMessage(), 500);
        }
    }

    toggleChat() {
        this.chatContainer.classList.toggle('minimized');
        const toggleBtn = document.getElementById('toggle-chat');
        const icon = toggleBtn?.querySelector('i');
        
        if (this.chatContainer.classList.contains('minimized')) {
            if (icon) icon.className = 'fas fa-expand';
            if (toggleBtn) toggleBtn.title = 'Expandir';
        } else {
            if (icon) icon.className = 'fas fa-minus';
            if (toggleBtn) toggleBtn.title = 'Minimizar';
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    startTypingSimulation() {
        // Simular actividad periódica del bot
        setInterval(() => {
            if (!this.isVisible && Math.random() < 0.1) {
                const badge = this.fabButton?.querySelector('.notification-badge');
                if (badge) {
                    badge.style.display = 'block';
                    badge.textContent = '!';
                }
            }
        }, 30000);
    }

    loadUserData() {
        try {
            const saved = localStorage.getItem('smartChatUserData');
            if (saved) {
                const userData = JSON.parse(saved);
                this.userName = userData.userName || '';
                this.userLevel = userData.userLevel || 'beginner';
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    saveUserData() {
        try {
            const userData = {
                userName: this.userName,
                userLevel: this.userLevel,
                sessionCount: (this.getUserData().sessionCount || 0) + 1
            };
            localStorage.setItem('smartChatUserData', JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    getUserData() {
        try {
            const saved = localStorage.getItem('smartChatUserData');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('smartChatHistory');
            if (saved) {
                this.chatHistory = JSON.parse(saved);
                
                if (this.chatHistory.length > 100) {
                    this.chatHistory = this.chatHistory.slice(-100);
                    this.saveChatHistory();
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            this.chatHistory = [];
        }
    }

    saveChatHistory() {
        try {
            localStorage.setItem('smartChatHistory', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    restoreMessages() {
        if (this.chatHistory.length > 0) {
            this.messagesContainer.innerHTML = '';
            this.chatHistory.forEach(message => {
                // Solo restaurar mensajes, no ejecutar lógica adicional
                this.addMessage(message);
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.smartChat = new SmartChatAcademy();
    
    // Restaurar mensajes con delay
    setTimeout(() => {
        if (window.smartChat.chatHistory.length > 1) {
            window.smartChat.restoreMessages();
        }
    }, 500);
});

export default SmartChatAcademy;