# AI Chatbot Setup Instructions

## 🚀 Quick Start

This guide will help you set up the AI-powered chatbot for your SkillAble platform.

## 📋 Prerequisites

1. **OpenAI API Key**: Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **MongoDB Database**: Already configured in your project
3. **Node.js & npm**: Already installed

## 🔧 Environment Variables Setup

### 1. Backend (.env file in `/api` directory)

Add these variables to your existing `.env` file:

```env
# Existing variables...
MONGO=your_mongodb_connection_string
JWT_KEY=your_jwt_secret

# New AI Chatbot variables
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### 2. Frontend Environment (Optional)

If you want to configure any frontend-specific settings, add to your client's `.env`:

```env
VITE_CHATBOT_ENABLED=true
VITE_CHATBOT_WELCOME_MESSAGE="Hello! I'm SkillAble Assistant..."
```

## 🔑 Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Add it to your `.env` file

**⚠️ Security Note**: Never commit your API key to version control!

## 🚀 Deployment on Render

### Backend Deployment

1. **Environment Variables**: Add to your Render backend service:
   ```
   OPENAI_API_KEY=sk-your_openai_api_key_here
   ```

2. **Build Command**: Your existing build command should work
3. **Start Command**: Your existing start command should work

### Frontend Deployment

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: Add any frontend-specific variables

## 🧪 Testing the Chatbot

1. **Start your backend server**:
   ```bash
   cd api
   npm start
   ```

2. **Start your frontend**:
   ```bash
   cd client
   npm run dev
   ```

3. **Test the chatbot**:
   - Open your website
   - Look for the floating chat button (bottom-right corner)
   - Click it to open the chat
   - Try asking questions like:
     - "How does SkillAble work?"
     - "What categories of gigs do you have?"
     - "How can I become a seller?"

## 🔧 Configuration Options

### Customizing the AI Assistant

Edit `api/controllers/chat.controller.js` to modify:

- **System Prompt**: Change the `SYSTEM_PROMPT` variable
- **AI Model**: Change `gpt-3.5-turbo` to other models
- **Response Settings**: Adjust `temperature`, `max_tokens`, etc.

### Styling the Chatbot

Edit `client/src/components/chatbot/ChatBot.scss` to customize:

- Colors and themes
- Size and positioning
- Animations and transitions
- Mobile responsiveness

## 🛠️ Advanced Features

### 1. Conversation History

The chatbot automatically:
- Saves all conversations to MongoDB
- Maintains context across messages
- Associates conversations with logged-in users

### 2. User Context

When users are logged in, the AI receives:
- Username
- User type (buyer/seller)
- Previous conversation history

### 3. Error Handling

The system handles:
- API rate limits
- Network errors
- Invalid API keys
- Database connection issues

## 🔒 Security Considerations

1. **API Key Protection**: Never expose your OpenAI API key in frontend code
2. **Rate Limiting**: Consider implementing rate limiting for chat endpoints
3. **Input Validation**: All user inputs are validated and sanitized
4. **User Authentication**: Optional authentication for conversation history

## 📊 Monitoring & Analytics

### Logs to Monitor

1. **API Usage**: Monitor OpenAI API usage in your OpenAI dashboard
2. **Error Logs**: Check your server logs for chat-related errors
3. **Performance**: Monitor response times and success rates

### Cost Management

- **OpenAI Pricing**: GPT-3.5-turbo costs ~$0.002 per 1K tokens
- **Token Usage**: Each message typically uses 50-200 tokens
- **Monthly Estimate**: ~$10-50 for moderate usage

## 🚀 Future Enhancements

### 1. Speech-to-Text Integration

```javascript
// Add to ChatBot.jsx
const [isListening, setIsListening] = useState(false);

const startListening = () => {
  // Web Speech API implementation
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInputMessage(transcript);
  };
  
  recognition.start();
  setIsListening(true);
};
```

### 2. Voice Response

```javascript
// Add to ChatBot.jsx
const speakResponse = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
};
```

### 3. File Upload Support

```javascript
// Add file upload capability
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('message', 'Analyze this file');
  
  // Send to backend for processing
};
```

### 4. Multi-language Support

```javascript
// Add language detection and translation
const detectLanguage = (text) => {
  // Use a language detection library
  return detectedLanguage;
};

const translateResponse = async (text, targetLanguage) => {
  // Use translation API
  return translatedText;
};
```

## 🐛 Troubleshooting

### Common Issues

1. **"AI service temporarily unavailable"**
   - Check your OpenAI API key
   - Verify your account has credits
   - Check API rate limits

2. **Chatbot not appearing**
   - Check browser console for errors
   - Verify ChatBot component is imported in App.jsx
   - Check if CSS is loading properly

3. **Messages not sending**
   - Check network tab for API errors
   - Verify backend server is running
   - Check CORS configuration

4. **Conversation history not loading**
   - Check MongoDB connection
   - Verify user authentication
   - Check database permissions

### Debug Mode

Add this to your frontend for debugging:

```javascript
// In ChatBot.jsx
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('ChatBot Debug:', {
    isOpen,
    messages,
    conversationId,
    currentUser
  });
}
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all environment variables are set correctly
4. Test with a simple message first

## 🎉 Success!

Once everything is working, you'll have a fully functional AI chatbot that:

- ✅ Responds to user questions about SkillAble
- ✅ Maintains conversation history
- ✅ Works on mobile and desktop
- ✅ Integrates seamlessly with your existing platform
- ✅ Scales with your user base

Happy coding! 🚀 