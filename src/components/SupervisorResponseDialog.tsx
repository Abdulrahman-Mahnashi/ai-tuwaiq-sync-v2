import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSupervisorResponse, ProjectSubmission } from "@/services/projectService";
import { createNotification } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SupervisorResponseDialogProps {
  project: ProjectSubmission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: "ar" | "en";
}

const SupervisorResponseDialog = ({
  project,
  open,
  onOpenChange,
  language,
}: SupervisorResponseDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [responseType, setResponseType] = useState<"similarity_warning" | "approval" | "rejection" | "revision_request">("similarity_warning");
  const [message, setMessage] = useState("");

  const translations = {
    ar: {
      title: "إرسال رد للطلاب",
      description: "أرسل رداً للطلاب حول مشروعهم",
      responseType: "نوع الرد",
      message: "الرسالة",
      send: "إرسال",
      cancel: "إلغاء",
      similarityWarning: "تنبيه تشابه",
      approval: "موافقة",
      rejection: "رفض",
      revisionRequest: "طلب مراجعة",
      success: "تم إرسال الرد بنجاح",
      error: "حدث خطأ أثناء إرسال الرد",
      defaultSimilarityMessage: "نود إعلامكم أن فكرتكم المشروع مشابهة لمشروع آخر موجود. يرجى مراجعة الفكرة وتعديلها لتكون فريدة.",
    },
    en: {
      title: "Send Response to Students",
      description: "Send a response to students about their project",
      responseType: "Response Type",
      message: "Message",
      send: "Send",
      cancel: "Cancel",
      similarityWarning: "Similarity Warning",
      approval: "Approval",
      rejection: "Rejection",
      revisionRequest: "Revision Request",
      success: "Response sent successfully",
      error: "Error sending response",
      defaultSimilarityMessage: "We would like to inform you that your project idea is similar to another existing project. Please review and modify your idea to make it unique.",
    },
  };

  const t = translations[language];

  const handleSend = () => {
    if (!message.trim() || !user) return;

    const finalMessage = message.trim() || t.defaultSimilarityMessage;

    const success = addSupervisorResponse(project.id, {
      supervisor_id: user.id,
      supervisor_name: user.name || user.email,
      message: finalMessage,
      response_type: responseType,
    });

    if (success) {
      // Create notification for each team member
      project.team.forEach((member) => {
        createNotification({
          type: "similarity_alert",
          recipient_id: project.submitted_by, // For now, use project submitter ID
          project_id: project.id,
          title: language === "ar" 
            ? `رد من المشرف: ${project.bootcamp_supervisor}`
            : `Response from Supervisor: ${project.bootcamp_supervisor}`,
          message: finalMessage,
          severity: responseType === "similarity_warning" ? "high" : responseType === "rejection" ? "high" : "medium",
          status: "unread",
          metadata: {
            matched_project_name: project.project_name,
          },
        });
      });

      toast({
        title: t.success,
        description: language === "ar" 
          ? "تم إرسال الرد للطلاب بنجاح"
          : "Response sent to students successfully",
      });

      setMessage("");
      setResponseType("similarity_warning");
      onOpenChange(false);
    } else {
      toast({
        title: t.error,
        description: language === "ar" 
          ? "حدث خطأ أثناء إرسال الرد"
          : "An error occurred while sending the response",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass neon-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="responseType">{t.responseType}</Label>
            <Select value={responseType} onValueChange={(value: any) => setResponseType(value)}>
              <SelectTrigger className="glass border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass neon-border">
                <SelectItem value="similarity_warning">{t.similarityWarning}</SelectItem>
                <SelectItem value="approval">{t.approval}</SelectItem>
                <SelectItem value="rejection">{t.rejection}</SelectItem>
                <SelectItem value="revision_request">{t.revisionRequest}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">{t.message}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.defaultSimilarityMessage}
              className="min-h-[120px] glass border-primary/30 resize-y"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button onClick={handleSend} disabled={!message.trim()}>
            {t.send}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupervisorResponseDialog;

