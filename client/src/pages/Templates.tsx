import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { FileText, Loader2, Plus, Trash2, Edit, Copy } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Templates() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{ id: number; name: string; description: string } | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");

  // 取得範本列表
  const { data: templates, isLoading, refetch } = trpc.template.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 建立範本
  const createMutation = trpc.template.create.useMutation({
    onSuccess: () => {
      toast.success("範本建立成功");
      setIsCreateDialogOpen(false);
      setNewTemplateName("");
      setNewTemplateDescription("");
      refetch();
    },
    onError: (error) => {
      toast.error(`建立失敗: ${error.message}`);
    },
  });

  // 更新範本
  const updateMutation = trpc.template.update.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("範本更新成功");
        setIsEditDialogOpen(false);
        setEditingTemplate(null);
        refetch();
      } else {
        toast.error(result.error || "更新失敗");
      }
    },
    onError: (error) => {
      toast.error(`更新失敗: ${error.message}`);
    },
  });

  // 刪除範本
  const deleteMutation = trpc.template.delete.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("範本已刪除");
        refetch();
      } else {
        toast.error(result.error || "刪除失敗");
      }
    },
    onError: (error) => {
      toast.error(`刪除失敗: ${error.message}`);
    },
  });

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error("請輸入範本名稱");
      return;
    }
    createMutation.mutate({
      name: newTemplateName,
      description: newTemplateDescription,
    });
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !editingTemplate.name.trim()) {
      toast.error("請輸入範本名稱");
      return;
    }
    updateMutation.mutate({
      id: editingTemplate.id,
      data: {
        name: editingTemplate.name,
        description: editingTemplate.description,
      },
    });
  };

  const handleDeleteTemplate = (id: number, name: string) => {
    if (confirm(`確定要刪除範本「${name}」嗎？此操作無法復原。`)) {
      deleteMutation.mutate({ id });
    }
  };

  const openEditDialog = (template: { id: number; name: string; description: string | null }) => {
    setEditingTemplate({
      id: template.id,
      name: template.name,
      description: template.description || "",
    });
    setIsEditDialogOpen(true);
  };

  // 載入中狀態
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 未登入狀態
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>請先登入</CardTitle>
            <CardDescription>您需要登入才能管理範本</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <a href={getLoginUrl()}>登入</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary">史塔克</h1>
                <p className="text-xs text-muted-foreground tracking-widest">STARK WORKS</p>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline">返回首頁</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">評估範本管理</h2>
            <p className="text-muted-foreground mt-1">
              建立和管理您的評估範本，加快填寫速度
            </p>
          </div>
          
          {/* 建立範本對話框 */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                建立新範本
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>建立新範本</DialogTitle>
                <DialogDescription>
                  建立一個新的評估範本，您可以之後在編輯範本時加入預設的檢測項目
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">範本名稱 *</Label>
                  <Input
                    id="name"
                    placeholder="例如：肩頸評估範本"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    placeholder="範本的用途說明..."
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateTemplate} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  建立
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 範本列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{template.name}</span>
                  </CardTitle>
                  {template.description && (
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-4">
                    建立於 {new Date(template.createdAt).toLocaleDateString("zh-TW")}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/template/${template.id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      編輯內容
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTemplate(template.id, template.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">尚無範本</h3>
              <p className="text-muted-foreground mb-4">
                建立您的第一個評估範本，加快日後的填寫速度
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                建立新範本
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 編輯範本對話框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>編輯範本資訊</DialogTitle>
              <DialogDescription>
                修改範本的名稱和描述
              </DialogDescription>
            </DialogHeader>
            {editingTemplate && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">範本名稱 *</Label>
                  <Input
                    id="edit-name"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">描述</Label>
                  <Textarea
                    id="edit-description"
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleUpdateTemplate} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                儲存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
