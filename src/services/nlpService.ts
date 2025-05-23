
import { Message } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';

// Mock NLP service - in production, this would integrate with Hugging Face or OpenAI API
export const nlpService = {
  // Generate appropriate response based on conversation context
  generateResponse: async (
    conversationHistory: Message[],
    modelBio: Record<string, any>,
    noGoTopics: string[]
  ): Promise<string> => {
    // In a real implementation, this would call an NLP API
    console.log('Generating response based on:', { conversationHistory, modelBio, noGoTopics });
    
    // Filter out messages containing no-go topics
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      const containsNoGoTopic = noGoTopics.some(topic => 
        lastMessage.content.toLowerCase().includes(topic.toLowerCase())
      );
      
      if (containsNoGoTopic) {
        return "I'd prefer not to talk about that. Tell me about your day instead?";
      }
    }
    
    // Mock flirty responses - in production, use an actual AI model
    const flirtyResponses = [
      "I've been thinking about you... what are you wearing right now?",
      "I just got out of the shower and I'm feeling a bit lonely...",
      "I have a special video for you that I think you'll really enjoy 😘",
      "You always know exactly what to say to make me smile",
      "I've got something special to show you if you're interested..."
    ];
    
    return flirtyResponses[Math.floor(Math.random() * flirtyResponses.length)];
  },
  
  // Match content based on conversation context
  matchContentToConversation: async (
    conversationHistory: Message[],
    modelId: string,
    keywords: string[] = []
  ): Promise<string | null> => {
    console.log('Matching content for keywords:', keywords);
    
    // Extract potential keywords from the last few messages
    const recentMessages = conversationHistory.slice(-3);
    const extractedKeywords = recentMessages.flatMap(msg => {
      const words = msg.content.toLowerCase().split(/\s+/);
      return words.filter(word => word.length > 3); // Simple keyword extraction
    });
    
    // Combine extracted keywords with provided keywords
    const allKeywords = [...new Set([...extractedKeywords, ...keywords])];
    
    // Query content based on keywords
    if (allKeywords.length > 0) {
      const { data: matchedContent } = await supabase
        .from('content')
        .select('id')
        .eq('model_id', modelId)
        .contains('keywords', allKeywords)
        .limit(1);
      
      return matchedContent && matchedContent.length > 0 ? matchedContent[0].id : null;
    }
    
    return null;
  }
};
