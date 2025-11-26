import { ChatOpenAI } from "@langchain/openai";2
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { NormalizedProject } from "./localProjects";

// Use NormalizedProject from localProjects for type consistency
type Project = NormalizedProject;

export interface SimilarityResult {
  project: Project;
  similarity_score: number;
  reasoning?: string;
}

class AIAgentService {
  private llm: ChatOpenAI | null = null;
  private useAI: boolean = false;

  constructor() {
    // تحقق من وجود API key
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log("🔑 Checking OpenAI API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT FOUND");
    console.log("🔍 Full env object keys:", Object.keys(import.meta.env));
    console.log("🔍 import.meta.env.MODE:", import.meta.env.MODE);
    console.log("🔍 import.meta.env.DEV:", import.meta.env.DEV);
    
    if (apiKey && apiKey.trim() !== "") {
      try {
        // Try different ways to initialize
        const trimmedKey = apiKey.trim();
        console.log("🔑 Using API Key length:", trimmedKey.length);
        
        this.llm = new ChatOpenAI({
          modelName: "gpt-4o-mini", // استخدام GPT-4o-mini (أسرع وأرخص)
          temperature: 0.3,
          apiKey: trimmedKey,
        });
        
        this.useAI = true;
        console.log("✅ AI Agent (OpenAI GPT-4o-mini) initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize AI Agent:", error);
        console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
        this.useAI = false;
        // Don't throw error, just disable AI functionality
      }
    } else {
      console.warn("⚠️ OpenAI API key not found! AI features will be disabled.");
      console.warn("📝 Make sure VITE_OPENAI_API_KEY is set in .env file");
      console.warn("📝 .env file should be in the project root directory");
      this.useAI = false;
    }
  }

  /**
   * حساب التشابه باستخدام AI Agent (OpenAI)
   */
  async calculateSimilarity(
    idea: string,
    projects: Project[]
  ): Promise<SimilarityResult[]> {
    if (!this.useAI || !this.llm) {
      throw new Error("AI service not available. Please check your OpenAI API key.");
    }

    try {
      // إنشاء prompt للمقارنة
      const systemPrompt = `أنت محلل مشاريع خبير. مهمتك هي مقارنة فكرة مشروع جديدة مع المشاريع الموجودة وحساب درجات التشابه (0-1).

ضع في الاعتبار:
- أهداف المشروع والغايات
- التقنيات المستخدمة
- المجال/القطاع المستهدف
- المشكلة التي يحلها المشروع
- تكوين الفريق

ارجع مصفوفة JSON بدرجات التشابه لكل مشروع. الصيغة:
[{"project_id": "id", "similarity_score": 0.85, "reasoning": "شرح مختصر"}]

مهم: ارجع فقط مصفوفة JSON صالحة، بدون markdown، بدون code blocks، بدون نص إضافي.

إذا كانت الفكرة مطابقة تماماً للمشروع، أعطِ similarity_score = 1.0 (100%).`;

      const projectsText = projects
        .slice(0, 20) // Limit to 20 projects to avoid token limits
        .map(
          (p, idx) =>
            `المشروع ${idx + 1} (ID: ${p.id}):
العنوان: ${p.title}
الوصف: ${p.description}
التقنيات: ${p.technologies.join(", ") || "غير محدد"}
البرنامج: ${p.bootcamp || "غير محدد"}`
        )
        .join("\n\n");

      const userPrompt = `قارن هذه الفكرة الجديدة مع المشاريع الموجودة:

الفكرة الجديدة: ${idea}

المشاريع الموجودة:
${projectsText}

ارجع فقط مصفوفة JSON بدرجات التشابه لكل مشروع.`;

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ];

      const response = await this.llm.invoke(messages);
      const content = response.content as string;

      // Parse JSON response - handle markdown code blocks if present
      let jsonString = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonString.startsWith("```")) {
        jsonString = jsonString.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      
      // Extract JSON array
      const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response from AI. Response: " + jsonString.substring(0, 200));
      }

      const aiResults = JSON.parse(jsonMatch[0]) as Array<{
        project_id: string;
        similarity_score: number;
        reasoning?: string;
      }>;

      // Map results back to projects
      const results: SimilarityResult[] = projects
        .map((project) => {
          const aiResult = aiResults.find((r) => r.project_id === project.id);
          return {
            project,
            similarity_score: aiResult?.similarity_score || 0,
            reasoning: aiResult?.reasoning,
          };
        })
        .filter((r) => r.similarity_score > 0.1)
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, 5);

      return results;
    } catch (error) {
      console.error("AI Agent error:", error);
      throw new Error(
        `AI Agent failed: ${error instanceof Error ? error.message : "Unknown error"}. Please check your API key and try again.`
      );
    }
  }

  isAIAvailable(): boolean {
    return this.useAI;
  }
}

// Export singleton instance - will be initialized lazily
let aiAgentInstance: AIAgentService | null = null;

export const getAIAgentService = (): AIAgentService => {
  // Always check API key fresh from env
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  // Debug: Log all VITE_ env vars
  const viteEnvVars = Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'));
  console.log("🔍 Available VITE_ env vars:", viteEnvVars);
  console.log("🔍 VITE_OPENAI_API_KEY value:", apiKey ? `${apiKey.substring(0, 15)}...` : "UNDEFINED");
  
  // If instance doesn't exist, or if API key exists but AI is not available, create/recreate instance
  const shouldRecreate = !aiAgentInstance || 
                         (apiKey && apiKey.trim() !== "" && !aiAgentInstance.isAIAvailable());
  
  if (shouldRecreate) {
    try {
      console.log("🚀 Creating/Recreating AI Agent Service instance...");
      aiAgentInstance = new AIAgentService();
      
      if (aiAgentInstance.isAIAvailable()) {
        console.log("✅ AI Agent Service ready and initialized!");
      } else {
        console.warn("⚠️ AI Agent Service created but AI is not available");
        if (apiKey && apiKey.trim() !== "") {
          console.error("❌ API Key exists but AI initialization failed. Check API key validity.");
        }
      }
    } catch (error) {
      console.error("❌ Failed to create AI Agent Service:", error);
      aiAgentInstance = new AIAgentService();
    }
  }
  return aiAgentInstance;
};

// Export service object - creates instance lazily when methods are called
// This ensures env vars are loaded by Vite before we try to use them
export const aiAgentService = {
  async calculateSimilarity(idea: string, projects: Project[]): Promise<SimilarityResult[]> {
    const service = getAIAgentService();
    if (!service.isAIAvailable()) {
      // Try one more time to recreate if API key is available
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (apiKey && apiKey.trim() !== "") {
        console.log("🔄 Retrying AI Agent initialization...");
        // Force recreation
        aiAgentInstance = null;
        const retryService = getAIAgentService();
        if (!retryService.isAIAvailable()) {
          throw new Error("AI service not available. Please check your OpenAI API key and restart the dev server.");
        }
        return retryService.calculateSimilarity(idea, projects);
      }
      throw new Error("AI service not available. Please check your OpenAI API key.");
    }
    return service.calculateSimilarity(idea, projects);
  },
  isAIAvailable(): boolean {
    return getAIAgentService().isAIAvailable();
  }
};

