// Project Ingestion Agent - استخراج وتحليل المشاريع
import { aiAgentService } from "./aiAgent";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export interface ProjectElements {
  goals: string[];
  problem_statement: string;
  technology_stack: string[];
  domain: string;
  scope: string;
  target_audience?: string;
  expected_outcomes?: string[];
}

export interface IngestedProject {
  project_id: string;
  metadata: {
    name: string;
    bootcamp: string;
    supervisor: string;
    submission_date: string;
  };
  structured_elements: ProjectElements;
  embedding_ready: boolean; // For future embedding implementation
}

class ProjectIngestionAgent {
  private llm: ChatOpenAI | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey && apiKey.trim() !== "") {
      try {
        this.llm = new ChatOpenAI({
          modelName: "gpt-4o-mini",
          temperature: 0.2,
          apiKey: apiKey.trim(),
        });
      } catch (error) {
        console.error("Failed to initialize Project Ingestion Agent:", error);
      }
    }
  }

  /**
   * استخراج العناصر المنظمة من وصف المشروع
   */
  async extractProjectElements(
    projectName: string,
    projectDescription: string,
    technologies: string[]
  ): Promise<ProjectElements> {
    if (!this.llm) {
      // Fallback: استخراج بسيط بدون AI
      return this.fallbackExtraction(projectName, projectDescription, technologies);
    }

    try {
      const systemPrompt = `أنت وكيل استخراج عناصر المشاريع. مهمتك هي استخراج العناصر المنظمة من وصف المشروع.

ارجع JSON بالصيغة التالية:
{
  "goals": ["هدف 1", "هدف 2"],
  "problem_statement": "بيان المشكلة",
  "technology_stack": ["تقنية 1", "تقنية 2"],
  "domain": "المجال (مثل: AI/NLP, Web Development, Data Science)",
  "scope": "نطاق المشروع",
  "target_audience": "الجمهور المستهدف (اختياري)",
  "expected_outcomes": ["نتيجة متوقعة 1", "نتيجة متوقعة 2"]
}

مهم: ارجع فقط JSON صالح، بدون markdown، بدون code blocks.`;

      const userPrompt = `استخرج العناصر من هذا المشروع:

الاسم: ${projectName}
الوصف: ${projectDescription}
التقنيات: ${technologies.join(", ")}

ارجع JSON بالعناصر المستخرجة.`;

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ];

      const response = await this.llm.invoke(messages);
      const content = response.content as string;

      // Parse JSON
      let jsonString = content.trim();
      if (jsonString.startsWith("```")) {
        jsonString = jsonString.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ProjectElements;
      }

      throw new Error("Invalid JSON response");
    } catch (error) {
      console.error("AI extraction failed, using fallback:", error);
      return this.fallbackExtraction(projectName, projectDescription, technologies);
    }
  }

  /**
   * Fallback extraction بدون AI
   */
  private fallbackExtraction(
    projectName: string,
    projectDescription: string,
    technologies: string[]
  ): ProjectElements {
    // استخراج بسيط من النص
    const goals: string[] = [];
    const sentences = projectDescription.split(/[.!?]\s+/);
    
    sentences.forEach((sentence) => {
      if (sentence.match(/يهدف|الهدف|نهدف|نسعى|نطمح/i)) {
        goals.push(sentence.trim());
      }
    });

    // تحديد المجال من التقنيات
    let domain = "General";
    if (technologies.some(t => /ai|ml|tensorflow|pytorch|nlp/i.test(t))) {
      domain = "AI/ML";
    } else if (technologies.some(t => /react|vue|angular|frontend/i.test(t))) {
      domain = "Web Development";
    } else if (technologies.some(t => /data|analytics|pandas/i.test(t))) {
      domain = "Data Science";
    }

    return {
      goals: goals.length > 0 ? goals : ["تحسين العملية المحددة في المشروع"],
      problem_statement: sentences[0] || projectDescription.substring(0, 100),
      technology_stack: technologies,
      domain,
      scope: projectDescription.substring(0, 200),
      expected_outcomes: ["تحسين الأداء", "تحقيق الأهداف المحددة"],
    };
  }

  /**
   * استيعاب مشروع كامل
   */
  async ingestProject(
    projectId: string,
    projectName: string,
    projectDescription: string,
    bootcampName: string,
    supervisor: string,
    technologies: string[]
  ): Promise<IngestedProject> {
    const elements = await this.extractProjectElements(
      projectName,
      projectDescription,
      technologies
    );

    return {
      project_id: projectId,
      metadata: {
        name: projectName,
        bootcamp: bootcampName,
        supervisor,
        submission_date: new Date().toISOString(),
      },
      structured_elements: elements,
      embedding_ready: false, // سيتم إضافة embeddings لاحقاً
    };
  }
}

// Singleton instance
let ingestionAgentInstance: ProjectIngestionAgent | null = null;

export const getProjectIngestionAgent = (): ProjectIngestionAgent => {
  if (!ingestionAgentInstance) {
    ingestionAgentInstance = new ProjectIngestionAgent();
  }
  return ingestionAgentInstance;
};

export const projectIngestionAgent = {
  async ingestProject(
    projectId: string,
    projectName: string,
    projectDescription: string,
    bootcampName: string,
    supervisor: string,
    technologies: string[]
  ): Promise<IngestedProject> {
    return getProjectIngestionAgent().ingestProject(
      projectId,
      projectName,
      projectDescription,
      bootcampName,
      supervisor,
      technologies
    );
  },
};

