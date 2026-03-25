// ==========================================
// VERCEL SERVERLESS CONFIGURATION
// Calls the backend /api/chat.js securely
// ==========================================

// You can safely hardcode the Google Apps Script URL here because it is a public POST webhook.
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLSKMuZGjI-d_9vl4fPamtiFF3kcVnIAl3j8eNCprDR_O1cGhlQNUIwhmcIPHA_pl2/exec";

// This array will store the chat history so the bot remembers the context of the conversation
let conversationHistory = [];

const SYSTEM_PROMPT = `
You are Vibebot, the AI assistant for vibecode.studio — a digital product studio that builds websites, mobile apps, AI systems, and growth infrastructure for startups and founders.

Your objectives:
1. Help visitors understand vibecode.studio services.
2. Identify serious project inquiries.
3. Qualify potential clients.
4. Collect lead information.
5. Save the lead to the Google Sheet.
6. Encourage visitors to start a project.

Communication rules:
• Maximum 2–3 sentences per response.
• Professional, friendly, and business-focused.
• Clear and concise answers.
• Avoid long explanations.
• No markdown formatting.

Services offered:
• Web Development
• Mobile App Development
• UI/UX Design
• SEO & Growth Marketing
• Automation Systems
• AI Chatbot Development

General behavior:
• If a visitor asks about services, pricing, or timelines, answer briefly.
• If a visitor shows interest in building something, begin collecting lead details.
• Ask only ONE missing question at a time.
• Keep the conversation focused on starting a project.

Lead fields to collect:
Name
Email
Phone
Company
Service
Budget
Timeline
ProjectDescription

Important lead collection rules:
• Users may provide information in ANY order.
• Users may provide MULTIPLE details in one message.
• Extract any lead fields automatically whenever they appear.
• Do NOT ask for fields that are already provided.
• If the user message contains several fields, store all of them immediately.
• If information is unclear, politely ask for clarification.
• Always continue by asking the NEXT missing field.

Example:
User: "Hi I'm Rahul from StartupX. Need a website. Budget around 60k."
Extract:
Name: Rahul
Company: StartupX
Service: Website Development
Budget: ₹60k

Then ask only the next missing field.

Never assume information that the user did not provide.

Lead completion rule:
When all fields are collected, show a summary and ask for confirmation.

Example confirmation:
"Thanks. Here's what I captured:

Name: John
Email: john@email.com
Phone: +91XXXXXXXXXX
Company: StartupX
Service: Website Development
Budget: ₹50k–₹1L
Timeline: 2 months
Project: Startup landing page

Please confirm if this is correct."

If the user confirms, store the lead in this sheet:
https://docs.google.com/spreadsheets/d/1b3bGr4zifF2mXyzbYOzhYeCVL6Bw_yPbTd1dDcwhtiw

Lead data structure:
Name
Email
Phone
Company
Service
Budget
Timeline
ProjectDescription
Timestamp

Missing field safety rule:
If some fields are still missing when the user wants to proceed, store available information and leave missing fields blank instead of blocking the submission.

After saving the lead, reply:
"Thanks for sharing the details. Our team will review your project and contact you within 24 hours."

Direct contact options:
Email: vibecodestudio.info@gmail.com
WhatsApp: +91 82176 79297

Pricing guidance (when asked):
• Websites: typically ₹30k – ₹2L+
• Mobile apps: ₹1L – ₹8L+
• UI/UX design: ₹20k – ₹1L+
• Automation systems: ₹25k – ₹2L+
• AI chatbot solutions: ₹30k – ₹3L+

Timeline guidance:
• Simple website: 2–3 weeks
• Advanced website: 4–6 weeks
• Mobile apps: 6–12 weeks
• AI systems or automation: depends on scope

If users ask unrelated questions, politely redirect the conversation toward digital product development.

Conversation closing:
If the user says thanks, okay, or ends the conversation, respond with:
"Happy to help. If you'd like to start a project, just let me know."
`;

document.addEventListener('DOMContentLoaded', () => {
  const chatbotWrapper = document.getElementById('chatbotWrapper');
  const chatbotIcon = document.getElementById('chatbotIcon');
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotClose = document.getElementById('chatbotClose');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotSend = document.getElementById('chatbotSend');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');

  // Toggle chatbot window on clicking the entire 3D icon container
  chatbotIcon.addEventListener('click', (e) => {
    if (!chatbotWindow.classList.contains('active')) {
      chatbotWindow.classList.add('active');
      chatbotInput.focus();
    } else {
      chatbotWindow.classList.remove('active');
    }
  });

  chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.remove('active');
  });

  // Handle Quick Replies
  quickReplyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent;
      processUserMessage(text);
      // Optional: hide quick replies after click to save space
      document.getElementById('chatbotQuickReplies').style.display = 'none';
    });
  });

  // Handle sending messages manually
  chatbotSend.addEventListener('click', () => {
    const text = chatbotInput.value.trim();
    if (text) processUserMessage(text);
  });

  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const text = chatbotInput.value.trim();
      if (text) processUserMessage(text);
    }
  });

  async function processUserMessage(text) {
    // Add user message to UI
    appendMessage(text, 'user-message');
    chatbotInput.value = '';

    // Add user message to history
    conversationHistory.push({
      role: "user",
      content: text
    });

    // Show typing indicator
    showTypingIndicator();

    try {
      const response = await fetchGroqResponse();
      removeTypingIndicator();
      if (response) {
        appendMessage(response, 'bot-message');

        // Add bot response to history manually here if it was text
        if (!conversationHistory[conversationHistory.length - 1].tool_calls) {
          conversationHistory.push({
            role: "assistant",
            content: response
          });
        }
      }
    } catch (error) {
      console.error("Chatbot Error:", error);
      removeTypingIndicator();
      appendMessage("I'm sorry, I'm having trouble connecting right now. Please try again later or contact us directly via the contact form!", 'bot-message');
    }
  }

  function appendMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;

    // Simple parsing for basic newlines
    const formattedText = text.replace(/\n/g, '<br>');
    msgDiv.innerHTML = formattedText;

    chatbotMessages.appendChild(msgDiv);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    chatbotMessages.appendChild(typingDiv);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const typingDiv = document.getElementById('typingIndicator');
    if (typingDiv) {
      typingDiv.remove();
    }
  }

  function scrollToBottom() {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Fetch response securely from our Vercel Serverless Function
  async function fetchGroqResponse() {
    const payload = {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "storeLeadInSheet",
            description: "Stores the collected lead details into the Google Sheet automatically. Call this ONLY after summarizing and confirming all details with the user.",
            parameters: {
              type: "object",
              properties: {
                Name: { type: "string" },
                Email: { type: "string" },
                Phone: { type: "string" },
                Company: { type: "string" },
                Service: { type: "string" },
                Budget: { type: "string" },
                Timeline: { type: "string" },
                ProjectDescription: { type: "string" }
              },
              required: ["Name", "Email", "Phone", "Company", "Service", "Budget", "Timeline", "ProjectDescription"]
            }
          }
        }
      ]
    };

    // The API URL will be relative when deployed to Vercel
    // For local testing (like with ngrok or Live Server), this requires running `vercel dev`
    const API_URL = "/api/chat";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vercel Serverless Error:", errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const messageResponse = data.choices[0].message;

    // If the model decides to call the function to save the lead
    if (messageResponse.tool_calls && messageResponse.tool_calls.length > 0) {
      const toolCall = messageResponse.tool_calls[0];
      if (toolCall.function.name === "storeLeadInSheet") {
        const leadData = JSON.parse(toolCall.function.arguments);

        // Execute the webhook in the background
        submitLeadToGoogleSheets(leadData);

        // Add the function call to history
        conversationHistory.push(messageResponse);

        // Add the mock function response to history so the model knows it succeeded
        conversationHistory.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ status: "success", message: "Lead stored successfully." })
        });

        // Fetch the final response from Groq (the "Thank you..." message)
        return await fetchGroqResponse();
      }
    }

    return messageResponse.content;
  }

  // Function to send the lead data to the Google Apps Script Web App
  function submitLeadToGoogleSheets(data) {
    if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL") {
      console.warn("Google Apps Script URL is missing. Cannot send lead to sheet:", data);
      return;
    }

    // Use mode: 'no-cors' to avoid CORS issues with simple web apps
    fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        Source: "Chatbot",
        Timestamp: new Date().toLocaleString()
      })
    }).then(() => {
      console.log("Lead submitted successfully.");
    }).catch(err => {
      console.error("Error submitting lead:", err);
    });
  }
});
