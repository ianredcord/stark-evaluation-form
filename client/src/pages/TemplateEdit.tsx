import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Loader2, Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// 簡化的範本項目類型
interface TemplateMovementItem {
  action: string;
}

interface TemplateRedcordItem {
  item: string;
}

interface TemplateTrainingPlan {
  session: string;
  content: string;
}

// 預設的功能性動作檢測項目
const defaultFunctionalMovement = {
  upperBody: [
    { action: "頸部旋轉" },
    { action: "頸部側彎" },
    { action: "肩關節屈曲" },
    { action: "肩關節外展" },
    { action: "肩關節內旋" },
    { action: "肩關節外旋" },
  ],
  lowerBody: [
    { action: "髖關節屈曲" },
    { action: "髖關節伸展" },
    { action: "髖關節外展" },
    { action: "髖關節內收" },
    { action: "膝關節屈曲" },
    { action: "踝關節背屈" },
  ],
};

// 預設的紅繩檢測項目
const defaultRedcordAssessment = {
  lowerExtremity: [
    { item: "Supine Hip Flexion" },
    { item: "Supine Hip Extension" },
    { item: "Prone Hip Extension" },
    { item: "Sidelying Hip Abduction" },
  ],
  core: [
    { item: "Supine Pelvic Lift" },
    { item: "Prone Plank" },
    { item: "Side Plank" },
  ],
  upperExtremity: [
    { item: "Push Up" },
    { item: "Pull" },
  ],
  cervical: [
    { item: "Cervical Stabilization" },
  ],
};

// 預設的訓練計畫
const defaultTrainingPlans: TemplateTrainingPlan[] = [
  { session: "1-4", content: "" },
  { session: "5-8", content: "" },
  { session: "9-12", content: "" },
];

// 簡單的項目列表編輯元件
function ItemListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: { action?: string; item?: string }[];
  onChange: (items: { action?: string; item?: string }[]) => void;
  placeholder: string;
}) {
  const fieldKey = items[0]?.action !== undefined ? "action" : "item";

  const addItem = () => {
    onChange([...items, { [fieldKey]: "" }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = { [fieldKey]: value };
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground w-8">{index + 1}.</span>
          <Input
            value={(item.action ?? item.item) || ""}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => removeItem(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
        <Plus className="w-4 h-4 mr-1" />
        新增項目
      </Button>
    </div>
  );
}

export default function TemplateEdit() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const templateId = params.id ? parseInt(params.id) : null;

  const [functionalMovement, setFunctionalMovement] = useState(defaultFunctionalMovement);
  const [redcordAssessment, setRedcordAssessment] = useState(defaultRedcordAssessment);
  const [trainingPlans, setTrainingPlans] = useState<TemplateTrainingPlan[]>(defaultTrainingPlans);
  const [isSaving, setIsSaving] = useState(false);

  // 取得範本資料
  const { data: template, isLoading } = trpc.template.get.useQuery(
    { id: templateId! },
    { enabled: !!templateId && isAuthenticated }
  );

  // 更新範本
  const updateMutation = trpc.template.update.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("範本已儲存");
      } else {
        toast.error(result.error || "儲存失敗");
      }
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(`儲存失敗: ${error.message}`);
      setIsSaving(false);
    },
  });

  // 載入範本資料
  useEffect(() => {
    if (template) {
      if (template.functionalMovement) {
        setFunctionalMovement(template.functionalMovement as typeof defaultFunctionalMovement);
      }
      if (template.redcordAssessment) {
        setRedcordAssessment(template.redcordAssessment as typeof defaultRedcordAssessment);
      }
      if (template.trainingPlans) {
        setTrainingPlans(template.trainingPlans as TemplateTrainingPlan[]);
      }
    }
  }, [template]);

  const handleSave = () => {
    if (!templateId) return;
    setIsSaving(true);
    updateMutation.mutate({
      id: templateId,
      data: {
        functionalMovement,
        redcordAssessment,
        trainingPlans,
      },
    });
  };

  // 載入中狀態
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 範本不存在
  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>範本不存在</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/templates">返回範本列表</Link>
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
          <div className="flex items-center gap-4">
            <Link href="/templates">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{template.name}</h1>
                <p className="text-xs text-muted-foreground">編輯範本內容</p>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            儲存範本
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="functional" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="functional">功能性動作檢測</TabsTrigger>
            <TabsTrigger value="redcord">紅繩動力鍊檢測</TabsTrigger>
            <TabsTrigger value="training">訓練計畫</TabsTrigger>
          </TabsList>

          <TabsContent value="functional">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">上半身檢測項目</CardTitle>
                </CardHeader>
                <CardContent>
                  <ItemListEditor
                    items={functionalMovement.upperBody}
                    onChange={(items) => setFunctionalMovement({ ...functionalMovement, upperBody: items as TemplateMovementItem[] })}
                    placeholder="輸入動作名稱"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">下半身 / 核心檢測項目</CardTitle>
                </CardHeader>
                <CardContent>
                  <ItemListEditor
                    items={functionalMovement.lowerBody}
                    onChange={(items) => setFunctionalMovement({ ...functionalMovement, lowerBody: items as TemplateMovementItem[] })}
                    placeholder="輸入動作名稱"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="redcord">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">下肢檢測項目</CardTitle>
                </CardHeader>
                <CardContent>
                  <ItemListEditor
                    items={redcordAssessment.lowerExtremity}
                    onChange={(items) => setRedcordAssessment({ ...redcordAssessment, lowerExtremity: items as TemplateRedcordItem[] })}
                    placeholder="輸入檢測項目"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">核心檢測項目</CardTitle>
                </CardHeader>
                <CardContent>
                  <ItemListEditor
                    items={redcordAssessment.core}
                    onChange={(items) => setRedcordAssessment({ ...redcordAssessment, core: items as TemplateRedcordItem[] })}
                    placeholder="輸入檢測項目"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">上肢檢測項目</CardTitle>
                </CardHeader>
                <CardContent>
                  <ItemListEditor
                    items={redcordAssessment.upperExtremity}
                    onChange={(items) => setRedcordAssessment({ ...redcordAssessment, upperExtremity: items as TemplateRedcordItem[] })}
                    placeholder="輸入檢測項目"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">頸部檢測項目</CardTitle>
                </CardHeader>
                <CardContent>
                  <ItemListEditor
                    items={redcordAssessment.cervical}
                    onChange={(items) => setRedcordAssessment({ ...redcordAssessment, cervical: items as TemplateRedcordItem[] })}
                    placeholder="輸入檢測項目"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>訓練計畫預設項目</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingPlans.map((plan, index) => (
                    <div key={index} className="grid grid-cols-[120px_1fr_auto] gap-4 items-start">
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <Input
                          value={plan.session}
                          onChange={(e) => {
                            const newPlans = [...trainingPlans];
                            newPlans[index] = { ...plan, session: e.target.value };
                            setTrainingPlans(newPlans);
                          }}
                          placeholder="堂數"
                          className="text-center text-sm"
                        />
                      </div>
                      <textarea
                        className="w-full min-h-[100px] p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="請輸入訓練內容..."
                        value={plan.content}
                        onChange={(e) => {
                          const newPlans = [...trainingPlans];
                          newPlans[index] = { ...plan, content: e.target.value };
                          setTrainingPlans(newPlans);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          const newPlans = trainingPlans.filter((_, i) => i !== index);
                          setTrainingPlans(newPlans);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setTrainingPlans([...trainingPlans, { session: "", content: "" }])}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    新增訓練階段
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
