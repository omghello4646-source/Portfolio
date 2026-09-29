export default async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing message" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured in Netlify.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const knowledgeBase = `
Name: C. Divya Ajay

Education:
- Master of Computer Applications (MCA), Hindustan Institute of Science and Technology, 2024-2026.
- Bachelor of Computer Applications (BCA), Hindustan Institute of Science and Technology, 2020-2023.

Career objective:
Motivated postgraduate student seeking an entry-level opportunity to apply programming and problem-solving skills.

Internship:
Fantasy Technology, Trichy — hands-on experience in basic software development and assisted in application development tasks.

Skills:
Python, HTML, CSS, basic Machine Learning, Natural Language Processing.

Project 1:
Face Detection and Identification for Attendance System.
Developed a system to automate attendance using face detection and identification techniques, reducing manual effort.

Project 2:
NLP for Interventions using Machine Learning.
Designed an NLP-based solution to analyze text data for intelligent interventions using machine learning models for text classification and analysis.

Contact:
Email: omghello4646@gmail.com
GitHub: github.com/Ajay5794
`;

    const systemInstruction = `
You are the portfolio chatbot for C. Divya Ajay.

You may ONLY answer questions about:
- Divya's education
- Divya's skills
- Divya's internship
- Divya's projects
- Divya's career background
- Divya's contact information
- Information contained in the portfolio

Do NOT answer unrelated questions.

If the user asks something unrelated to Divya, respond:
"I can only answer questions about Divya's background, skills, education, projects, and portfolio."

Do not invent information about Divya.
Keep answers short, friendly, and professional.

INFORMATION ABOUT DIVYA:
${knowledgeBase}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: systemInstruction,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return new Response(
        JSON.stringify({
          error: "Gemini API error",
          details: data,
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error("Unexpected Gemini response:", data);

      return new Response(
        JSON.stringify({
          error: "Gemini returned no response.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ reply }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Function error:", error);

    return new Response(
      JSON.stringify({
        error: "Something went wrong.",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
};
