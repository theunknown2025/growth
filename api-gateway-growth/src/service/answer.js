const OpenAI = require('openai');
const { openaiconfig } = require('../../conf');
const { generatePrompt } = require('../utils/prompt');

const openai = new OpenAI({
  apiKey: openaiconfig.apiKey,
  dangerouslyAllowBrowser: true,
});

const evaluateAnswers = async (answers) => {
  try {
      const prompt = generatePrompt(answers);
  
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert brand strategy consultant who specializes in evaluating business strategies. You provide detailed, constructive feedback and practical recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 2000,
      });
  
      const responseText = response.choices[0].message.content.trim();
      return JSON.parse(responseText);
  } catch (error) {
      console.log('API request failed:', error);
  }
};

const getAIResponse = async (message) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert brand strategy consultant who specializes in evaluating business strategies. You provide detailed, constructive feedback and practical recommendations. If the question is outside the context, please respond with "sorry , this question is outside the context of the conversation please rephrase it to be more specific".',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Evaluation error:", error);
  }
}

const generateConversationTitle = async (message) => {
  try {
      const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
          {
          role: 'system',
          content:
              'You are a helpful assistant dedicated to generating clear and concise conversation titles. Provide only the title text without any additional explanation, punctuation, or formatting.',
          },
          {
          role: 'user',
          content: `Generate a direct and unambiguous conversation title for the following message: "${message}"`,
          },
          ],
          temperature: 0.3,
          max_tokens: 20,
      });

      return response.choices[0].message.content.trim();
  } catch (error) {
      console.error("Error generating title:", error);
  }
}

  
module.exports = {
  evaluateAnswers,
  getAIResponse , 
  generateConversationTitle,
};