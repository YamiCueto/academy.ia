// Archivo de configuración de ejemplo para el chatbot IA
// Copia este archivo como 'config.js' y configura tu token de Hugging Face

export const config = {
    HUGGING_FACE_TOKEN: 'hf_TU_TOKEN_AQUI',
    API_ENDPOINT: 'https://api-inference.huggingface.co/models/',
    
    // Para uso en producción, considera usar:
    // 1. Variables de entorno
    // 2. Cloudflare Workers como proxy
    // 3. Netlify Edge Functions
    // 4. Vercel Edge Functions
};

// Nota: El chatbot funciona sin token usando respuestas educativas integradas