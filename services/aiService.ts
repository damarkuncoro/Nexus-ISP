
import { GoogleGenAI, Type } from "@google/genai";
import { Ticket, TicketComment, NetworkDevice } from "../types";

// Initialize Gemini Client
// Note: In a real production app, you should proxy this through your backend
// to avoid exposing the API key in the frontend bundle.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export interface TicketAnalysis {
  sentiment: 'Frustrated' | 'Angry' | 'Neutral' | 'Happy' | 'Urgent';
  summary: string;
  rootCause: string;
  suggestedActions: string[];
  draftResponse: string;
}

export interface OutageNotification {
  subject: string;
  emailBody: string;
  smsBody: string;
  estimatedDuration: string;
}

export interface DeviceDiagnostic {
  healthScore: number;
  status: 'Healthy' | 'Degraded' | 'Critical';
  analysis: string;
  recommendations: string[];
  potentialSecurityRisks: string[];
}

export const analyzeTicketWithGemini = async (
  ticket: Ticket, 
  comments: TicketComment[] = []
): Promise<TicketAnalysis> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure process.env.API_KEY.");
  }

  const commentText = comments.map(c => `${c.author_name}: ${c.content}`).join('\n');
  
  const prompt = `
    You are a Level 3 Support Engineer for an Internet Service Provider (ISP). 
    Analyze the following support ticket and provide structured assistance.

    TICKET DETAILS:
    Title: ${ticket.title}
    Description: ${ticket.description}
    Category: ${ticket.category}
    Priority: ${ticket.priority}
    Created At: ${ticket.created_at}
    
    COMMENT HISTORY:
    ${commentText}

    Your task is to return a JSON object containing:
    1. sentiment: One of [Frustrated, Angry, Neutral, Happy, Urgent] based on the customer's tone.
    2. summary: A concise 1-sentence technical summary of the issue.
    3. rootCause: A probable technical root cause (e.g., "Optical signal loss", "DHCP failure", "Billing suspension").
    4. suggestedActions: An array of 3 specific technical steps the support agent should take next.
    5. draftResponse: A polite, professional, and empathetic draft response to the customer.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING },
            summary: { type: Type.STRING },
            rootCause: { type: Type.STRING },
            suggestedActions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            draftResponse: { type: Type.STRING },
          },
          required: ["sentiment", "summary", "rootCause", "suggestedActions", "draftResponse"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as TicketAnalysis;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw error;
  }
};

export const generateOutageMessage = async (
  device: NetworkDevice, 
  affectedCount: number
): Promise<OutageNotification> => {
  if (!apiKey) throw new Error("Gemini API Key is missing.");

  const prompt = `
    You are the Communications Manager for an ISP. 
    A critical network device has failed, causing an outage.
    
    DEVICE INFO:
    Name: ${device.name}
    Type: ${device.type}
    Location: ${device.location}
    Issue: Device is currently ${device.status.toUpperCase()}
    Affected Customers: ~${affectedCount}

    Generate a structured notification plan in JSON format containing:
    1. subject: A clear, non-alarming email subject line.
    2. emailBody: A professional email notification explaining the situation, apologizing, and assuring a fix is underway. Keep it under 150 words.
    3. smsBody: A short, direct SMS message (max 160 chars).
    4. estimatedDuration: An estimated time to fix (e.g., "2 hours").
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          emailBody: { type: Type.STRING },
          smsBody: { type: Type.STRING },
          estimatedDuration: { type: Type.STRING },
        },
      },
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as OutageNotification;
  }
  throw new Error("Failed to generate outage message");
};

export const diagnoseDeviceWithAI = async (device: NetworkDevice): Promise<DeviceDiagnostic> => {
  if (!apiKey) throw new Error("Gemini API Key is missing.");

  const prompt = `
    You are a Senior Network Engineer AI. Analyze the state of this network device.
    
    DEVICE TELEMETRY:
    Name: ${device.name}
    Type: ${device.type}
    IP: ${device.ip_address}
    Status: ${device.status}
    Model: ${device.model || 'Generic'}
    Firmware: ${device.firmware_version || 'Unknown'}
    Last Check: ${device.last_check}
    
    The device is reporting status: ${device.status}. 
    
    Provide a diagnostic report in JSON:
    1. healthScore: 0-100 integer.
    2. status: 'Healthy', 'Degraded' | 'Critical'.
    3. analysis: A 2-sentence technical analysis of what might be wrong (or right).
    4. recommendations: Array of 3 specific commands or actions to fix/optimize.
    5. potentialSecurityRisks: Array of potential vulnerabilities based on info (e.g. old firmware).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          healthScore: { type: Type.INTEGER },
          status: { type: Type.STRING },
          analysis: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          potentialSecurityRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as DeviceDiagnostic;
  }
  throw new Error("Failed to diagnose device");
};
