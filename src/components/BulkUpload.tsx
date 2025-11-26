import { useState, useRef } from "react";
import { Upload, Loader2, FileCheck, AlertCircle, FolderOpen, Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface BulkUploadProps {
  language: "en" | "ar";
  onUploadComplete?: () => void;
}

interface UploadStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

const BulkUpload = ({ language, onUploadComplete }: BulkUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const translations = {
    ar: {
      title: "رفع ملفات JSON متعددة",
      subtitle: "قم برفع ملفات JSON المتعددة لإضافتها إلى قاعدة البيانات",
      selectFiles: "اختر ملفات JSON",
      uploadButton: "رفع الملفات",
      uploading: "جاري الرفع...",
      success: "تم الرفع بنجاح!",
      error: "حدث خطأ أثناء الرفع",
      noFiles: "لم يتم اختيار أي ملفات",
      processing: "جاري المعالجة",
      totalFiles: "إجمالي الملفات",
      successful: "نجح",
      failed: "فشل",
      processed: "تم المعالجة",
      dropFiles: "اسحب الملفات هنا أو اضغط للاختيار",
      supportedFormats: "صيغ مدعومة: JSON",
    },
    en: {
      title: "Bulk Upload JSON Files",
      subtitle: "Upload multiple JSON files to add them to the database",
      selectFiles: "Select JSON Files",
      uploadButton: "Upload Files",
      uploading: "Uploading...",
      success: "Upload successful!",
      error: "An error occurred during upload",
      noFiles: "No files selected",
      processing: "Processing",
      totalFiles: "Total Files",
      successful: "Successful",
      failed: "Failed",
      processed: "Processed",
      dropFiles: "Drag files here or click to select",
      supportedFormats: "Supported formats: JSON",
    },
  };

  const t = translations[language];

  // Parse JSON file
  const parseJSONFile = async (file: File): Promise<any[]> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (Array.isArray(data)) {
        return data;
      } else if (data.projects && Array.isArray(data.projects)) {
        return data.projects;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else if (typeof data === 'object') {
        return [data];
      }
      
      return [];
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Normalize project data
  const normalizeProject = (project: any, fileName: string) => {
    let bootcamp = project.bootcamp || project.bootcamp_name || project.program;
    
    if (!bootcamp && fileName) {
      const nameWithoutExt = fileName.replace(/\.json$/i, '');
      bootcamp = nameWithoutExt
        .split(/[-_]/)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return {
      title: project.title || project.name || project.project_title || 'Untitled Project',
      description: project.description || project.desc || project.project_description || '',
      bootcamp: bootcamp || null,
      technologies: Array.isArray(project.technologies) 
        ? project.technologies 
        : Array.isArray(project.tech) 
          ? project.tech 
          : Array.isArray(project.tech_stack)
            ? project.tech_stack
            : project.technologies 
              ? [project.technologies] 
              : [],
      team_members: Array.isArray(project.team_members) 
        ? project.team_members 
        : Array.isArray(project.team) 
          ? project.team 
          : Array.isArray(project.members)
            ? project.members
            : project.team_members 
              ? [project.team_members] 
              : [],
      status: project.status || 'completed',
    };
  };

  // Handle file upload
  const handleUpload = async () => {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      toast({
        title: t.error,
        description: t.noFiles,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStats({
      total: files.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    });

    const jsonFiles = Array.from(files).filter(file => 
      file.name.toLowerCase().endsWith('.json')
    );

    let totalProjects = 0;
    let successfulProjects = 0;
    let failedProjects = 0;
    const errors: string[] = [];

    try {
      for (let i = 0; i < jsonFiles.length; i++) {
        const file = jsonFiles[i];
        
        setUploadStats(prev => prev ? {
          ...prev,
          processed: i + 1,
        } : null);

        try {
          const projects = await parseJSONFile(file);
          
          for (const project of projects) {
            try {
              const normalizedProject = normalizeProject(project, file.name);
              
              // Save to localStorage instead of database
              const existingProjects = JSON.parse(localStorage.getItem("tuwaiq_local_projects") || "[]");
              
              // Check for duplicates
              const isDuplicate = existingProjects.some(
                (p: any) => p.title === normalizedProject.title || p.id === normalizedProject.id
              );
              
              if (isDuplicate) {
                continue; // Skip duplicates
              }
              
              // Add project to localStorage
              const projectToSave = {
                ...normalizedProject,
                id: normalizedProject.id || `PROJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              };
              
              existingProjects.push(projectToSave);
              localStorage.setItem("tuwaiq_local_projects", JSON.stringify(existingProjects));
              
              successfulProjects++;
              totalProjects++;
            } catch (error) {
              failedProjects++;
              errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        } catch (error) {
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setUploadStats({
        total: jsonFiles.length,
        processed: jsonFiles.length,
        successful: successfulProjects,
        failed: failedProjects,
        errors,
      });

      toast({
        title: t.success,
        description: language === "ar"
          ? `تم رفع ${successfulProjects} مشروع بنجاح من ${jsonFiles.length} ملف`
          : `Successfully uploaded ${successfulProjects} projects from ${jsonFiles.length} files`,
      });

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const progress = uploadStats 
    ? (uploadStats.processed / uploadStats.total) * 100 
    : 0;

  return (
    <Card className="glass p-8 neon-border">
      <div className="text-center mb-8">
        <Database className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
        <h2 className="text-3xl font-bold mb-2 gradient-text">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* File Input */}
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
          <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">{t.dropFiles}</p>
          <p className="text-xs text-muted-foreground mb-4">{t.supportedFormats}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            multiple
            className="hidden"
            disabled={isUploading}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            variant="outline"
            className="neon-border"
          >
            <Upload className="mr-2 h-4 w-4" />
            {t.selectFiles}
          </Button>
          {fileInputRef.current?.files && fileInputRef.current.files.length > 0 && (
            <p className="mt-4 text-sm text-primary">
              {fileInputRef.current.files.length} {language === "ar" ? "ملف محدد" : "files selected"}
            </p>
          )}
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={isUploading || !fileInputRef.current?.files || fileInputRef.current.files.length === 0}
          className="w-full neon-glow"
          size="lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t.uploading}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              {t.uploadButton}
            </>
          )}
        </Button>

        {/* Progress */}
        {isUploading && uploadStats && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t.processing}</span>
              <span>{uploadStats.processed} / {uploadStats.total}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Stats */}
        {uploadStats && !isUploading && (
          <Card className="p-4 bg-primary/10 border-primary/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{uploadStats.total}</p>
                <p className="text-sm text-muted-foreground">{t.totalFiles}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{uploadStats.successful}</p>
                <p className="text-sm text-muted-foreground">{t.successful}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{uploadStats.failed}</p>
                <p className="text-sm text-muted-foreground">{t.failed}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{uploadStats.processed}</p>
                <p className="text-sm text-muted-foreground">{t.processed}</p>
              </div>
            </div>
            {uploadStats.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-500/10 rounded border border-red-500/20">
                <p className="text-sm font-semibold mb-2 text-red-500">Errors:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {uploadStats.errors.slice(0, 5).map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                  {uploadStats.errors.length > 5 && (
                    <li>... and {uploadStats.errors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </Card>
        )}
      </div>
    </Card>
  );
};

export default BulkUpload;

