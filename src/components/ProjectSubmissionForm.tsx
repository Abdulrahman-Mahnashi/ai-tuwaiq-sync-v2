import { useState } from "react";
import { GraduationCap, Plus, X, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { submitProject, TeamMember, type ProjectSubmission } from "@/services/projectService";
import { useLocalProjects } from "@/services/localProjects";
import { workflowOrchestrator } from "@/services/workflowOrchestrator";
import { getAllSupervisors, getAllBootcamps } from "@/services/userService";

interface ProjectSubmissionFormProps {
  language: "en" | "ar";
  onSuccess?: () => void;
}

const ProjectSubmissionForm = ({ language, onSuccess }: ProjectSubmissionFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { projects: existingProjects } = useLocalProjects();
  
  // Section A: Team Information
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { full_name: "", academic_id: "", phone_number: "", email: "" }
  ]);
  
  // Section B: Project Information
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [bootcampSupervisor, setBootcampSupervisor] = useState("");
  const [bootcampName, setBootcampName] = useState("");
  const [toolsTechnologies, setToolsTechnologies] = useState<string[]>([]);
  const [newTool, setNewTool] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isRTL = language === "ar";

  const translations = {
    ar: {
      sectionA: "القسم أ: معلومات الفريق",
      sectionB: "القسم ب: معلومات المشروع",
      addMember: "إضافة عضو",
      removeMember: "إزالة",
      fullName: "الاسم الكامل",
      academicId: "الرقم الأكاديمي",
      phoneNumber: "رقم الجوال",
      email: "البريد الإلكتروني",
      atLeastOneIdentifier: "يجب إدخال على الأقل: الرقم الأكاديمي أو رقم الجوال أو البريد الإلكتروني",
      projectName: "اسم المشروع",
      projectDescription: "وصف المشروع",
      descriptionMinLength: "يجب أن يكون الوصف 250 حرف على الأقل",
      bootcampSupervisor: "مشرف المعسكر",
      bootcampName: "اسم المعسكر",
      toolsTechnologies: "الأدوات والتقنيات",
      addTool: "إضافة أداة",
      submitButton: "تقديم المشروع",
      submitting: "جاري التقديم...",
      analyzing: "جاري تحليل التشابه...",
      success: "تم تقديم المشروع بنجاح!",
      error: "حدث خطأ أثناء التقديم",
      validationError: "يرجى ملء جميع الحقول المطلوبة",
    },
    en: {
      sectionA: "Section A: Team Information",
      sectionB: "Section B: Project Information",
      addMember: "Add Member",
      removeMember: "Remove",
      fullName: "Full Name",
      academicId: "Academic ID",
      phoneNumber: "Phone Number",
      email: "Email",
      atLeastOneIdentifier: "At least one identifier required: Academic ID, Phone, or Email",
      projectName: "Project Name",
      projectDescription: "Project Description",
      descriptionMinLength: "Description must be at least 250 characters",
      bootcampSupervisor: "Bootcamp Supervisor",
      bootcampName: "Bootcamp Name",
      toolsTechnologies: "Tools / Technologies",
      addTool: "Add Tool",
      submitButton: "Submit Project",
      submitting: "Submitting...",
      analyzing: "Analyzing similarity...",
      success: "Project submitted successfully!",
      error: "Error submitting project",
      validationError: "Please fill all required fields",
    },
  };

  const t = translations[language];

  // Get supervisors and bootcamps from userService
  const supervisorsData = getAllSupervisors();
  const supervisors = supervisorsData.map((s) => s.name);
  const bootcamps = getAllBootcamps();

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { full_name: "", academic_id: "", phone_number: "", email: "" }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const addTechnology = () => {
    if (newTool.trim() && !toolsTechnologies.includes(newTool.trim())) {
      setToolsTechnologies([...toolsTechnologies, newTool.trim()]);
      setNewTool("");
    }
  };

  const removeTechnology = (tool: string) => {
    setToolsTechnologies(toolsTechnologies.filter((t) => t !== tool));
  };

  const validateForm = (): boolean => {
    // Validate team members
    for (const member of teamMembers) {
      if (!member.full_name.trim()) {
        toast({
          title: t.error,
          description: language === "ar" ? "يرجى إدخال اسم كل عضو في الفريق" : "Please enter name for all team members",
          variant: "destructive",
        });
        return false;
      }
      
      const hasIdentifier = member.academic_id || member.phone_number || member.email;
      if (!hasIdentifier) {
        toast({
          title: t.error,
          description: t.atLeastOneIdentifier,
          variant: "destructive",
        });
        return false;
      }
    }

    // Validate project
    if (!projectName.trim()) {
      toast({
        title: t.error,
        description: language === "ar" ? "يرجى إدخال اسم المشروع" : "Please enter project name",
        variant: "destructive",
      });
      return false;
    }

    if (projectDescription.length < 250) {
      toast({
        title: t.error,
        description: t.descriptionMinLength,
        variant: "destructive",
      });
      return false;
    }

    if (!bootcampSupervisor || !bootcampName) {
      toast({
        title: t.error,
        description: language === "ar" ? "يرجى اختيار المشرف والمعسكر" : "Please select supervisor and bootcamp",
        variant: "destructive",
      });
      return false;
    }

    if (toolsTechnologies.length === 0) {
      toast({
        title: t.error,
        description: language === "ar" ? "يرجى إضافة على الأقل أداة أو تقنية واحدة" : "Please add at least one tool or technology",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    setIsAnalyzing(true);

    try {
      // Execute complete workflow with all agents
      if (existingProjects && existingProjects.length > 0) {
        try {
          const workflowResult = await workflowOrchestrator.executeWorkflow(
            {
              project_name: projectName,
              project_description: projectDescription,
              bootcamp_supervisor: bootcampSupervisor,
              bootcamp_name: bootcampName,
              tools_technologies: toolsTechnologies,
              team: teamMembers,
              submitted_by: user.id,
            },
            existingProjects.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              bootcamp: p.bootcamp || "",
              technologies: p.technologies || [],
            }))
          );

          // Log workflow results
          console.log("✅ Workflow completed:", {
            project: workflowResult.project.id,
            ingested: workflowResult.ingested.metadata.name,
            teamSize: workflowResult.teamProfile.size,
            roleAssignments: workflowResult.roleRecommendations.role_assignments.length,
            similarityMatches: workflowResult.similarityResults.length,
            mergeOpportunities: workflowResult.mergeOpportunities.length,
          });

          // Show success message with details
          const hasSimilarity = workflowResult.similarityResults.some((r) => r.similarity_score >= 0.7);
          const hasMergeOpportunity = workflowResult.mergeOpportunities.length > 0;
          
          let description = language === "ar" 
            ? "تم تقديم المشروع بنجاح وتم تحليله بواسطة جميع الـ Agents"
            : "Project submitted successfully and analyzed by all agents";
          
          if (hasSimilarity) {
            description += `\n${language === "ar" ? "تم اكتشاف مشاريع مشابهة" : "Similar projects detected"}`;
          }
          if (hasMergeOpportunity) {
            description += `\n${language === "ar" ? "تم اكتشاف فرص دمج" : "Merge opportunities detected"}`;
          }
        } catch (error) {
          console.error("Workflow error:", error);
          // Fallback: submit project without full workflow
          submitProject({
            project_name: projectName,
            project_description: projectDescription,
            bootcamp_supervisor: bootcampSupervisor,
            bootcamp_name: bootcampName,
            tools_technologies: toolsTechnologies,
            team: teamMembers,
            submitted_by: user.id,
          });
        }
      } else {
        // No existing projects, just submit
        submitProject({
          project_name: projectName,
          project_description: projectDescription,
          bootcamp_supervisor: bootcampSupervisor,
          bootcamp_name: bootcampName,
          tools_technologies: toolsTechnologies,
          team: teamMembers,
          submitted_by: user.id,
        });
      }

      setIsAnalyzing(false);
      
      toast({
        title: t.success,
        description: language === "ar" 
          ? "تم تقديم المشروع بنجاح وسيتم مراجعته من قبل المشرف"
          : "Project submitted successfully and will be reviewed by supervisor",
      });

      // Reset form
      setTeamMembers([{ full_name: "", academic_id: "", phone_number: "", email: "" }]);
      setProjectName("");
      setProjectDescription("");
      setBootcampSupervisor("");
      setBootcampName("");
      setToolsTechnologies([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section A: Team Information */}
      <Card className="glass p-6 neon-border">
        <h2 className="text-2xl font-bold mb-6 gradient-text">{t.sectionA}</h2>
        
        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <Card key={index} className="p-4 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {language === "ar" ? `عضو الفريق ${index + 1}` : `Team Member ${index + 1}`}
                </h3>
                {teamMembers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeamMember(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.fullName} *</Label>
                  <Input
                    value={member.full_name}
                    onChange={(e) => updateTeamMember(index, "full_name", e.target.value)}
                    required
                    placeholder={t.fullName}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t.academicId}</Label>
                  <Input
                    value={member.academic_id || ""}
                    onChange={(e) => updateTeamMember(index, "academic_id", e.target.value)}
                    placeholder={t.academicId}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t.phoneNumber}</Label>
                  <Input
                    value={member.phone_number || ""}
                    onChange={(e) => updateTeamMember(index, "phone_number", e.target.value)}
                    placeholder={t.phoneNumber}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t.email}</Label>
                  <Input
                    type="email"
                    value={member.email || ""}
                    onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                    placeholder={t.email}
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                {t.atLeastOneIdentifier}
              </p>
            </Card>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addTeamMember}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.addMember}
          </Button>
        </div>
      </Card>

      {/* Section B: Project Information */}
      <Card className="glass p-6 neon-border">
        <h2 className="text-2xl font-bold mb-6 gradient-text">{t.sectionB}</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t.projectName} *</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              placeholder={t.projectName}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t.projectDescription} *</Label>
            <Textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              required
              minLength={250}
              rows={8}
              placeholder={t.projectDescription}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {projectDescription.length} / 250 {language === "ar" ? "حرف" : "characters"}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.bootcampSupervisor} *</Label>
              <Select value={bootcampSupervisor} onValueChange={setBootcampSupervisor} required>
                <SelectTrigger className="glass border-primary/30">
                  <SelectValue placeholder={language === "ar" ? "اختر المشرف" : "Select Supervisor"} />
                </SelectTrigger>
                <SelectContent className="glass neon-border">
                  {supervisors.length === 0 ? (
                    <SelectItem value="" disabled>
                      {language === "ar" ? "لا يوجد مشرفين مسجلين" : "No supervisors registered"}
                    </SelectItem>
                  ) : (
                    supervisors.map((supervisor) => (
                      <SelectItem key={supervisor} value={supervisor}>
                        {supervisor}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t.bootcampName} *</Label>
              <Select value={bootcampName} onValueChange={setBootcampName} required>
                <SelectTrigger className="glass border-primary/30">
                  <SelectValue placeholder={language === "ar" ? "اختر المعسكر" : "Select Bootcamp"} />
                </SelectTrigger>
                <SelectContent className="glass neon-border">
                  {bootcamps.length === 0 ? (
                    <SelectItem value="" disabled>
                      {language === "ar" ? "لا يوجد معسكرات مسجلة" : "No bootcamps registered"}
                    </SelectItem>
                  ) : (
                    bootcamps.map((bootcamp) => (
                      <SelectItem key={bootcamp} value={bootcamp}>
                        {bootcamp}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t.toolsTechnologies} *</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology())}
                placeholder={t.addTool}
              />
              <Button type="button" onClick={addTechnology} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {toolsTechnologies.map((tool) => (
                <span
                  key={tool}
                  className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-sm flex items-center gap-2"
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() => removeTechnology(tool)}
                    className="hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || isAnalyzing}
        className="w-full neon-glow"
        size="lg"
      >
        {isSubmitting || isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {isAnalyzing ? t.analyzing : t.submitting}
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {t.submitButton}
          </>
        )}
      </Button>
    </form>
  );
};

export default ProjectSubmissionForm;

