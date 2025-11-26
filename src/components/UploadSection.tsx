import { useState } from "react";
import { Upload, File, Link2, FolderOpen, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface UploadSectionProps {
  language: "en" | "ar";
  onDataUpload: (data: any[]) => void;
}

const UploadSection = ({ language, onDataUpload }: UploadSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const translations = {
    ar: {
      title: "رفع أو ربط البيانات",
      subtitle: "قم برفع ملفات JSON أو CSV أو ربط قاعدة بيانات تحتوي على مشاريع أكاديمية طويق",
      uploadButton: "رفع ملفات",
      uploadMultipleButton: "رفع ملفات متعددة",
      connectButton: "ربط قاعدة بيانات",
      loadFromFolder: "تحميل من مجلد البيانات",
      urlPlaceholder: "أدخل رابط JSON",
      processing: "جاري المعالجة...",
      success: "تم رفع البيانات بنجاح!",
      error: "خطأ في معالجة البيانات",
      filesInfo: "يمكنك رفع ملفات JSON أو CSV أو TXT",
      folderInfo: "تحميل جميع الملفات من مجلد public/data",
      noFiles: "لم يتم رفع أي ملفات بعد",
      filesUploaded: "ملفات مرفوعة",
    },
    en: {
      title: "Upload or Connect Data",
      subtitle: "Upload JSON or CSV files or connect a database containing Tuwaiq Academy projects",
      uploadButton: "Upload Files",
      uploadMultipleButton: "Upload Multiple Files",
      connectButton: "Connect Database",
      loadFromFolder: "Load from Data Folder",
      urlPlaceholder: "Enter JSON URL",
      processing: "Processing...",
      success: "Data uploaded successfully!",
      error: "Error processing data",
      filesInfo: "You can upload JSON, CSV, or TXT files",
      folderInfo: "Load all files from public/data folder",
      noFiles: "No files uploaded yet",
      filesUploaded: "Files uploaded",
    },
  };

  const t = translations[language];

  const parseFile = async (file: File): Promise<any[]> => {
    const fileName = file.name.toLowerCase();
    const text = await file.text();

    if (fileName.endsWith('.json') || fileName.endsWith('.txt')) {
      try {
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : [data];
      } catch (error) {
        throw new Error(`Invalid JSON format in ${file.name}`);
      }
    } else if (fileName.endsWith('.csv')) {
      // Basic CSV parsing
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) return [];
      
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
      return data;
    } else {
      throw new Error(`Unsupported file type: ${file.name}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const allData: any[] = [];
    const fileNames: string[] = [];
    const errors: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const data = await parseFile(file);
          allData.push(...data);
          fileNames.push(file.name);
        } catch (error) {
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (allData.length > 0) {
        onDataUpload(allData);
        setUploadedFiles(fileNames);
        toast({
          title: t.success,
          description: `${allData.length} projects loaded from ${fileNames.length} file(s)`,
        });
      }

      if (errors.length > 0) {
        toast({
          title: t.error,
          description: errors.join(', '),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : "Failed to process files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleLoadFromFolder = async () => {
    setIsLoading(true);
    try {
      // Try to load from public/data folder
      // In a real app, you'd need a backend API to list files
      // For now, we'll show a message and suggest manual upload
      toast({
        title: language === "ar" ? "معلومات" : "Information",
        description: language === "ar" 
          ? "يرجى وضع ملفاتك في مجلد public/data ثم رفعها يدوياً. أو استخدم زر رفع الملفات."
          : "Please place your files in the public/data folder and upload them manually. Or use the upload button.",
      });
    } catch (error) {
      toast({
        title: t.error,
        description: "Failed to load from folder",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlLoad = async () => {
    const urlInput = document.querySelector('input[type="url"]') as HTMLInputElement;
    const url = urlInput?.value;
    if (!url) {
      toast({
        title: t.error,
        description: language === "ar" ? "يرجى إدخال رابط صحيح" : "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      onDataUpload(Array.isArray(data) ? data : [data]);
      toast({
        title: t.success,
        description: `${Array.isArray(data) ? data.length : 1} projects loaded`,
      });
    } catch (error) {
      toast({
        title: t.error,
        description: "Failed to load data from URL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass p-8 neon-border">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 gradient-text">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* File Upload */}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors bg-background/50">
          <Upload className="h-12 w-12 text-primary mb-3 animate-float" />
          <label className="cursor-pointer w-full">
            <Button disabled={isLoading} className="neon-glow w-full" variant="default">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.processing}
                </>
              ) : (
                <>
                  <File className="mr-2 h-4 w-4" />
                  {t.uploadButton}
                </>
              )}
            </Button>
            <input
              type="file"
              accept=".json,.csv,.txt"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </label>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {t.filesInfo}
          </p>
        </div>

        {/* Load from Folder */}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-secondary transition-colors bg-background/50">
          <FolderOpen className="h-12 w-12 text-secondary mb-3 animate-float" style={{ animationDelay: "0.3s" }} />
          <Button 
            variant="secondary" 
            className="w-full" 
            disabled={isLoading}
            onClick={handleLoadFromFolder}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            {t.loadFromFolder}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {t.folderInfo}
          </p>
        </div>

        {/* URL Connection */}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-accent transition-colors bg-background/50">
          <Link2 className="h-12 w-12 text-accent mb-3 animate-float" style={{ animationDelay: "0.6s" }} />
          <div className="w-full space-y-2">
            <Input
              type="url"
              placeholder={t.urlPlaceholder}
              className="glass border-accent/50 text-sm"
            />
            <Button 
              variant="outline" 
              className="w-full" 
              disabled={isLoading}
              onClick={handleUrlLoad}
            >
              <Link2 className="mr-2 h-4 w-4" />
              {t.connectButton}
            </Button>
          </div>
        </div>
      </div>

      {/* Uploaded Files Info */}
      {uploadedFiles.length > 0 && (
        <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-semibold mb-2">{t.filesUploaded}:</p>
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((fileName, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs"
              >
                {fileName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-muted/20 rounded-lg">
        <p className="text-sm font-semibold mb-2">
          {language === "ar" ? "📁 أين تضع ملفاتك:" : "📁 Where to place your files:"}
        </p>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            {language === "ar" 
              ? "1. ضع ملفاتك في المجلد: ai-tuwaiq-sync/public/data/"
              : "1. Place your files in: ai-tuwaiq-sync/public/data/"}
          </p>
          <p>
            {language === "ar"
              ? "2. استخدم زر 'رفع ملفات' لرفع ملفات JSON أو CSV أو TXT"
              : "2. Use the 'Upload Files' button to upload JSON, CSV, or TXT files"}
          </p>
          <p>
            {language === "ar"
              ? "3. يمكنك رفع عدة ملفات في نفس الوقت"
              : "3. You can upload multiple files at once"}
          </p>
        </div>
      </div>

      {/* Sample Data Indicator */}
      <div className="mt-4 p-4 bg-blue-500/10 rounded-lg text-center border border-blue-500/20">
        <p className="text-sm text-muted-foreground">
          {language === "ar"
            ? "💡 مثال: رفع ملف tuwaiq_projects.json يحتوي على مشاريع من مختلف البرامج"
            : "💡 Example: Upload tuwaiq_projects.json containing projects from different bootcamps"}
        </p>
      </div>
    </Card>
  );
};

export default UploadSection;
