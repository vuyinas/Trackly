
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Email, MenuItem, UserRole, SocialLink, Sector, TeamMember, Event, ShiftType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const synthesizeShiftSchedule = async (sector: Sector, team: TeamMember[], events: Event[]) => {
  try {
    const prompt = `
      You are an AI Workforce Orchestrator. 
      Sector: ${sector}
      Team: ${JSON.stringify(team.map(t => ({ id: t.id, name: t.name, role: t.role })))}
      Events: ${JSON.stringify(events.map(e => ({ name: e.name, type: e.type, date: e.date })))}

      Rules:
      - Hotel: Breakfast starts 06:00-10:30. Dinner 18:00-22:30. Closing 23:30.
      - Hospitality: Lunch 12:00-15:00. Dinner 18:00-22:30. Closing 23:30.
      - Ensure team members have at least 8 hours between shifts.
      - Assign relevant roles to relevant tasks.
      - Return an array of shift suggestions for the next 2 days.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              memberId: { type: Type.STRING },
              location: { type: Type.STRING },
              types: { type: Type.ARRAY, items: { type: Type.STRING } },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              requiresTransport: { type: Type.BOOLEAN }
            },
            required: ["memberId", "location", "types", "startTime", "endTime"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Shift Synthesis Error:", error);
    return [];
  }
};

export const getSmartTaskSuggestions = async (tasks: Task[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Given these tasks, suggest which one is most urgent and provide 3 sub-tasks for it: ${JSON.stringify(tasks.map(t => ({ title: t.title, due: t.dueDate })))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            urgentTaskId: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const synthesizeMeetingNotes = async (meetingTitle: string, context: string, duration: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are an AI meeting scribe for an elite hospitality group.
        Meeting Title: "${meetingTitle}"
        Duration: ${duration} minutes.
        Context: "${context}"

        Generate a list of 5 concise, actionable shorthand meeting notes that would typically emerge from a session of this type.
        Focus on logistics, personnel, and growth.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Scribe Error:", error);
    return ["Review staffing gaps for weekend", "Audit bar stock for VIP arrival"];
  }
};

export const synthesizeSocialIntelligence = async (links: SocialLink[], context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a Digital Brand Strategist and Data Analyst. 
        Analyze these connected social platforms for the venue context "${context}":
        ${JSON.stringify(links)}
        
        Generate a comprehensive analysis including:
        1. Global sentiment score (0-100).
        2. Platform specific trends and brand participation ideas.
        3. Creative briefs for new content approaches.
        4. Mock customer feedback items based on likely current sentiment.
        5. Suggested autonomous marketing tasks for the team.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentimentScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            platformTrends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  trendName: { type: Type.STRING },
                  brandParticipationIdea: { type: Type.STRING }
                }
              }
            },
            creativeBriefs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  basedOnPost: { type: Type.STRING },
                  newContentIdea: { type: Type.STRING },
                  strategyRationale: { type: Type.STRING }
                }
              }
            },
            comments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  handle: { type: Type.STRING },
                  comment: { type: Type.STRING },
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  isPhysicalFeedback: { type: Type.BOOLEAN }
                }
              }
            },
            suggestedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  assignedRole: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Social Intel Error:", error);
    return null;
  }
};

export const synthesizeEventIntelligence = async (eventData: any, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a world-class Event Director for an elite venue. 
        Analyze this event: "${eventData.name}".
        Type: "${eventData.type}". Date: "${eventData.date}".
        Expected Attendance: ${eventData.expectedAttendance}.
        Venue Context: "${context}".
        
        Generate:
        1. Comprehensive briefs for: Kitchen, Bar, Office/Admin, and Management.
        2. A tactical checklist of 12 items.
        3. 3-5 Proactive Suggestions.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            briefs: {
              type: Type.OBJECT,
              properties: {
                kitchen: { type: Type.STRING },
                bar: { type: Type.STRING },
                office: { type: Type.STRING },
                management: { type: Type.STRING }
              }
            },
            checklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  assignedRole: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  targetTime: { type: Type.STRING },
                  department: { type: Type.STRING }
                }
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Event Intelligence Error:", error);
    return null;
  }
};

export const generateMeetingAgenda = async (title: string, description: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are an elite event producer and operational strategist.
        Analyze this briefing: "${title}". Description: "${description}".
        Venue Context: "${context}".
        Generate a structured agenda with specific time blocks and Hidden Considerations.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            engagementType: { type: Type.STRING },
            agenda: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeBlock: { type: Type.STRING },
                  objective: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  responsible: { type: Type.STRING }
                }
              }
            },
            considerations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  item: { type: Type.STRING },
                  note: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Agenda Synthesis Error:", error);
    return null;
  }
};

export const analyzeEmails = async (emails: Email[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Identify the most critical email: ${JSON.stringify(emails.filter(e => !e.isResponded))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            criticalEmailId: { type: Type.STRING },
            reason: { type: Type.STRING },
            suggestedReplyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return null;
  }
};

export const getEventStrategySuggestions = async (holidays: any[], topSellingItems: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 impact events based on: ${JSON.stringify(holidays)} and ${JSON.stringify(topSellingItems)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  recommendedZone: { type: Type.STRING },
                  featuredSpecial: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return null;
  }
};
