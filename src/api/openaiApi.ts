import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true, // For client-side usage (consider moving to server in production)
});

interface SubscriptionAnalysisResult {
  isSubscription: boolean;
  serviceName?: string;
  amount?: number;
  billingFrequency?: string; // monthly, yearly, etc.
  nextBillingDate?: string;
  confidence: number; // 0-100
  messageId?: string; // To match results back to original messages
}

interface EmailBatchItem {
  messageId: string;
  content: string;
}

const openaiApi = {
  /**
   * Analyze a single email content to detect subscription information
   */
  analyzeEmailForSubscription: async (emailContent: string): Promise<SubscriptionAnalysisResult> => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes email content to identify subscription information.
            Extract the following details if present:
            - Whether this is a subscription-related email (receipt, invoice, renewal notice, etc.)
            - Service name/company
            - Subscription amount
            - Billing frequency (monthly, yearly, etc.)
            - Next billing date if mentioned
            - Provide a confidence score (0-100) for your analysis
            
            Return ONLY a JSON object with these fields. If you're not confident or the email doesn't appear to be subscription-related, return a low confidence score.`
          },
          {
            role: 'user',
            content: emailContent
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        isSubscription: result.isSubscription || false,
        serviceName: result.serviceName,
        amount: result.amount ? parseFloat(result.amount) : undefined,
        billingFrequency: result.billingFrequency,
        nextBillingDate: result.nextBillingDate,
        confidence: result.confidence || 0
      };
    } catch (error) {
      console.error('Error analyzing email with OpenAI:', error);
      return {
        isSubscription: false,
        confidence: 0
      };
    }
  },
  
  /**
   * Batch analyze multiple emails for subscription information
   */
  batchAnalyzeEmails: async (emails: EmailBatchItem[]): Promise<SubscriptionAnalysisResult[]> => {
    try {
      console.log(`Batch analyzing ${emails.length} emails with OpenAI`);
      
      // Prepare the batch request
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes email content to identify subscription information.
            I will provide you with multiple emails in JSON format. For each email, extract the following details if present:
            - Whether this is a subscription-related email (receipt, invoice, renewal notice, etc.)
            - Service name/company
            - Subscription amount
            - Billing frequency (monthly, yearly, etc.)
            - Next billing date if mentioned
            - Provide a confidence score (0-100) for your analysis
            
            Return ONLY a JSON array where each object contains:
            - messageId: the ID of the email
            - isSubscription: boolean indicating if this is a subscription email
            - serviceName: the name of the service/company
            - amount: the subscription amount as a number
            - billingFrequency: how often billing occurs (monthly, yearly, etc.)
            - nextBillingDate: when the next billing will occur
            - confidence: a score from 0-100 indicating your confidence
            
            If you're not confident or the email doesn't appear to be subscription-related, return a low confidence score.`
          },
          {
            role: 'user',
            content: JSON.stringify(emails)
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '[]');
      
      if (Array.isArray(result)) {
        return result.map(item => ({
          messageId: item.messageId,
          isSubscription: item.isSubscription || false,
          serviceName: item.serviceName,
          amount: item.amount ? parseFloat(String(item.amount)) : undefined,
          billingFrequency: item.billingFrequency,
          nextBillingDate: item.nextBillingDate,
          confidence: item.confidence || 0
        }));
      } else if (result.results && Array.isArray(result.results)) {
        // Handle case where OpenAI wraps results in an object
        return result.results.map(item => ({
          messageId: item.messageId,
          isSubscription: item.isSubscription || false,
          serviceName: item.serviceName,
          amount: item.amount ? parseFloat(String(item.amount)) : undefined,
          billingFrequency: item.billingFrequency,
          nextBillingDate: item.nextBillingDate,
          confidence: item.confidence || 0
        }));
      }
      
      console.error('Unexpected response format from OpenAI:', result);
      return [];
    } catch (error) {
      console.error('Error batch analyzing emails with OpenAI:', error);
      return [];
    }
  }
};

export default openaiApi;
