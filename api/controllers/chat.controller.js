import OpenAI from 'openai';
import createError from '../utils/createError.js';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';

// Initialize OpenAI client with proper error handling
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in environment variables');
    throw new Error('OpenAI API key is not configured');
  }
  
  openai = new OpenAI({
    apiKey: apiKey,
  });
  
  console.log('✅ OpenAI client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize OpenAI client:', error.message);
  openai = null;
}

// System prompt for SkillAble assistant
const SYSTEM_PROMPT = `You are SkillAble Assistant, an AI-powered helper for the SkillAble platform - a freelance marketplace similar to Fiverr.

Your role is to help users with:
1. Understanding how SkillAble works
2. Finding the right gigs for their needs
3. Tips for buyers and sellers
4. Platform navigation and features
5. General questions about freelancing

Key information about SkillAble:
- It's a platform where freelancers (sellers) offer services called "gigs"
- Buyers can browse and purchase these gigs
- Categories include: Graphics & Design, Programming & Tech, Digital Marketing, Writing & Translation, Video & Animation, Music & Audio, AI Services, Business, Lifestyle, Photography, Data, Voice Over, Video Explainer, Social Media, SEO, Illustration, Logo Design, WordPress, Web & Mobile Design, Packaging Design, Book Design
- Users can save gigs, follow sellers, leave reviews, and message each other
- The platform has a recommendation system for gigs

Guidelines:
- Be helpful, friendly, and professional
- Keep responses concise but informative
- If you don't know something specific about the platform, suggest contacting support
- Encourage users to explore the platform and its features
- Don't make up information about pricing or specific features you're unsure about
- If asked about technical issues, suggest checking the help section or contacting support

Always respond in a conversational, helpful tone.`;

export const sendMessage = async (req, res, next) => {
  try {
    // Check if OpenAI is properly initialized
    if (!openai) {
      return next(createError(503, "AI service is not configured. Please contact support."));
    }

    const { message, conversationId, userId } = req.body;

    if (!message || !message.trim()) {
      return next(createError(400, "Message is required"));
    }

    let conversation;
    let user = null;

    // Get user information if userId is provided
    if (userId && userId !== 'anonymous') {
      try {
        user = await User.findById(userId).select('username email isSeller');
      } catch (err) {
        console.log('User not found, continuing as anonymous');
      }
    }

    // Create or get existing conversation
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return next(createError(404, "Conversation not found"));
      }
    } else {
      conversation = new Conversation({
        userId: userId !== 'anonymous' ? userId : null,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        createdAt: new Date()
      });
      await conversation.save();
    }

    // Save user message
    const userMessage = new Message({
      conversationId: conversation._id,
      sender: 'user',
      content: message,
      timestamp: new Date()
    });
    await userMessage.save();

    // Get conversation history for context
    const conversationHistory = await Message.find({
      conversationId: conversation._id
    }).sort({ timestamp: 1 }).limit(10); // Last 10 messages for context

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add user context if available
    if (user) {
      const userContext = `Current user: ${user.username} (${user.isSeller ? 'Seller' : 'Buyer'})`;
      messages.push({ role: 'system', content: userContext });
    }

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const aiResponse = completion.choices[0].message.content;

    // Save AI response
    const botMessage = new Message({
      conversationId: conversation._id,
      sender: 'bot',
      content: aiResponse,
      timestamp: new Date()
    });
    await botMessage.save();

    // Update conversation with latest message
    conversation.lastMessage = aiResponse;
    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(200).json({
      response: aiResponse,
      conversationId: conversation._id,
      messageId: botMessage._id
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    if (error.code === 'insufficient_quota') {
      return next(createError(503, "AI service temporarily unavailable. Please try again later."));
    }
    
    if (error.code === 'invalid_api_key') {
      return next(createError(500, "AI service configuration error. Please contact support."));
    }

    return next(createError(500, "Failed to process message. Please try again."));
  }
};

export const getConversationHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    if (!conversationId) {
      return next(createError(400, "Conversation ID is required"));
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(createError(404, "Conversation not found"));
    }

    // Check if user has access to this conversation
    if (conversation.userId && conversation.userId.toString() !== userId) {
      return next(createError(403, "Access denied"));
    }

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .limit(50); // Limit to last 50 messages

    res.status(200).json({
      conversation,
      messages
    });

  } catch (error) {
    console.error('Get conversation history error:', error);
    next(createError(500, "Failed to retrieve conversation history"));
  }
};

export const getUserConversations = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === 'anonymous') {
      return res.status(200).json({ conversations: [] });
    }

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(20);

    res.status(200).json({ conversations });

  } catch (error) {
    console.error('Get user conversations error:', error);
    next(createError(500, "Failed to retrieve conversations"));
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(createError(404, "Conversation not found"));
    }

    // Check if user owns this conversation
    if (conversation.userId && conversation.userId.toString() !== userId) {
      return next(createError(403, "Access denied"));
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId });
    
    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ message: "Conversation deleted successfully" });

  } catch (error) {
    console.error('Delete conversation error:', error);
    next(createError(500, "Failed to delete conversation"));
  }
}; 