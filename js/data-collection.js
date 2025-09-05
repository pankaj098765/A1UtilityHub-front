// Bot Data Collection Service
// This module handles data collection for all utility tools
import { 
  trackUserInteraction, 
  storeGeneratedContent, 
  trackAnalytics,
  withErrorHandling 
} from './firestore-service.js';

// Tool names enum
export const TOOLS = {
  AI_PROMPT_GENERATOR: 'ai_prompt_generator',
  INSTAGRAM_BIO_GENERATOR: 'instagram_bio_generator',
  TEXT_REWRITER: 'text_rewriter',
  LOVE_CALCULATOR: 'love_calculator',
  SALARY_TAX_CALCULATOR: 'salary_tax_calculator',
  CELEBRITY_LOOK_ALIKE: 'celebrity_look_alike_finder'
};

// Enhanced API call wrapper that includes data collection
export async function callGeminiApiWithDataCollection(prompt, toolName, inputData = {}, inlineData = null) {
  const startTime = Date.now();
  
  // Track the API call start
  await withErrorHandling(trackAnalytics)('api_call_start', {
    toolName,
    promptLength: prompt.length,
    hasInlineData: !!inlineData
  });

  try {
    // Original API call
    const response = await fetch("https://a1utilityhub.onrender.com/api/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, inlineData })
    });

    const data = await response.json();

    if (data.error) {
      // Track API error
      await withErrorHandling(trackAnalytics)('api_call_error', {
        toolName,
        error: data.error,
        duration: Date.now() - startTime
      });
      throw new Error(data.error);
    }

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const generatedContent = data.candidates[0].content.parts[0].text;
      const duration = Date.now() - startTime;

      // Store the interaction
      await withErrorHandling(trackUserInteraction)(
        toolName,
        { prompt, inputData },
        { content: generatedContent, responseTime: duration }
      );

      // Store the generated content
      await withErrorHandling(storeGeneratedContent)(
        toolName,
        generatedContent,
        { 
          promptLength: prompt.length,
          responseLength: generatedContent.length,
          responseTime: duration,
          inputData
        }
      );

      // Track successful API call
      await withErrorHandling(trackAnalytics)('api_call_success', {
        toolName,
        duration,
        responseLength: generatedContent.length
      });

      return generatedContent;
    } else {
      // Track API error - no response
      await withErrorHandling(trackAnalytics)('api_call_no_response', {
        toolName,
        duration: Date.now() - startTime
      });
      throw new Error("No response from Gemini");
    }
  } catch (error) {
    // Track any unexpected errors
    await withErrorHandling(trackAnalytics)('api_call_error', {
      toolName,
      error: error.message,
      duration: Date.now() - startTime
    });
    throw error;
  }
}

// Track tool usage (when user starts using a tool)
export async function trackToolUsage(toolName, additionalData = {}) {
  await withErrorHandling(trackAnalytics)('tool_usage', {
    toolName,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
}

// Track form submissions
export async function trackFormSubmission(toolName, formData) {
  await withErrorHandling(trackAnalytics)('form_submission', {
    toolName,
    formData,
    timestamp: new Date().toISOString()
  });
}

// Track page views
export async function trackPageView(pageName) {
  await withErrorHandling(trackAnalytics)('page_view', {
    pageName,
    url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  });
}

// Track user actions (clicks, copy, etc.)
export async function trackUserAction(action, toolName = null, data = {}) {
  await withErrorHandling(trackAnalytics)('user_action', {
    action,
    toolName,
    data,
    timestamp: new Date().toISOString()
  });
}

// Initialize data collection for a page
export function initializeDataCollection(toolName) {
  // Track page view
  trackPageView(toolName);
  
  // Track tool usage
  trackToolUsage(toolName);
  
  // Add copy button tracking
  addCopyButtonTracking(toolName);
  
  // Add form focus tracking
  addFormFocusTracking(toolName);
}

// Add tracking to copy buttons
function addCopyButtonTracking(toolName) {
  document.addEventListener('click', async (e) => {
    if (e.target.textContent?.includes('Copy') || e.target.classList.contains('copy-btn')) {
      await trackUserAction('copy_result', toolName);
    }
  });
}

// Add tracking to form inputs
function addFormFocusTracking(toolName) {
  const formInputs = document.querySelectorAll('input, textarea, select');
  formInputs.forEach(input => {
    input.addEventListener('focus', async () => {
      await trackUserAction('input_focus', toolName, {
        inputType: input.type,
        inputName: input.name || input.id
      });
    });
  });
}

// Enhanced form submission handler with data collection
export function handleFormSubmissionWithDataCollection(formId, loadingId, outputId, callback, toolName) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loadingElement = document.getElementById(loadingId);
    const resultElement = document.getElementById(outputId).parentElement;
    const outputElement = document.getElementById(outputId);

    // Get form data for tracking
    const formData = new FormData(form);
    const formDataObj = Object.fromEntries(formData.entries());
    
    // Track form submission
    await trackFormSubmission(toolName, formDataObj);

    loadingElement.classList.remove('hidden');
    resultElement.classList.add('hidden');
    outputElement.textContent = '';
    
    try {
      const result = await callback(e);
      outputElement.textContent = result;
      resultElement.classList.remove('hidden');
      
      // Track successful result generation
      await trackUserAction('result_generated', toolName, {
        resultLength: result.length
      });
    } catch (error) {
      console.error('Processing error:', error);
      outputElement.textContent = `An error occurred: ${error.message}`;
      resultElement.classList.remove('hidden');
      
      // Track error
      await trackUserAction('result_error', toolName, {
        error: error.message
      });
    } finally {
      loadingElement.classList.add('hidden');
    }
  });
}