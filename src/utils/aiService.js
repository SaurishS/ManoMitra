// src/utils/aiService.js
import OpenAI from 'openai';

// This key is from Groq.com
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const groq = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true,
});

// "Ears" (Whisper on Groq)
export const transcribeAudio = async (audioBlob) => {
  try {
    const audioFile = new File([audioBlob], "user_audio.webm", { type: "audio/webm" });
    const response = await groq.audio.transcriptions.create({
      model: "whisper-large-v3",
      file: audioFile,
    });
    return response.text;
  } catch (error) {
    console.error("Groq Whisper Error:", error);
    return "Error: I couldn't understand that.";
  }
};

// "Brain" (Llama 3 on Groq)
export const getAIResponse = async (userText, currentMood, chatHistory) => {
  // --- FIX #1: The full, complete system prompt ---
  const saathiSystemPrompt = `
    You are "Saathi," an AI storyteller for a mental wellness app called "ManoMitra."
    Your user is 100% anonymous. Your goal is NOT therapy; it is positive distraction and engagement.
    You are voice-only. Your responses must be spoken, so keep them conversational and not too long (1-2 paragraphs).

    **Your Task:**
    You will be given the user's transcribed text, their current mood, and the chat history.
    Your job is to:
    1.  Analyze the user's transcribed text AND their current mood.
    2.  Continue the generative, collaborative story.
    3.  Dynamically adapt the story to the user's mood. If they are 'happy' or 'surprised', lean into positive or exciting themes. If they are 'anxious', 'sad', or 'fearful', steer the story to a calmer, safer, or more relaxing theme.
    
    **Crisis Detection (This is handled client-side, but be aware):**
    If the user says anything related to crisis, the app will intercept it. You just need to focus on the story.
    
    **Continue the story based on the user's last message.**
  `;
  
  const messages = [
    { role: 'system', content: saathiSystemPrompt },
    ...chatHistory.map(item => ({
      role: item.role === 'ai' ? 'assistant' : 'user',
      content: item.text,
    })),
    { role: 'user', content: userText }
  ];

  try {
    const completion = await groq.chat.completions.create({
      // --- FIX #2: The new, working model name ---
      model: "llama-3.1-8b-instant",
      messages: messages,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq Chat Error:", error);
    return "I'm sorry, I lost my train of thought. Could you say that again?";
  }
};