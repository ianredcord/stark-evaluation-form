import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvaluationFormProvider } from "@/contexts/EvaluationFormContext";
import { Page1BasicInfo } from "@/components/pages/Page1BasicInfo";
import { Page2MotiPhysio } from "@/components/pages/Page2MotiPhysio";
import { Page3FunctionalUpper } from "@/components/pages/Page3FunctionalUpper";
import { Page4FunctionalLower } from "@/components/pages/Page4FunctionalLower";
import { Page5Redcord } from "@/components/pages/Page5Redcord";
import { Page6Ronfic } from "@/components/pages/Page6Ronfic";
import { Page7TrainingPlan } from "@/components/pages/Page7TrainingPlan";

export const DRAWER_TABS = [
  { key: "basic", label: "基本資料" },
  { key: "posture", label: "姿勢" },
  { key: "functional", label: "功能動作" },
  { key: "redcord", label: "紅繩" },
  { key: "body-comp", label: "體組成" },
  { key: "training", label: "訓練計畫" },
] as const;

export type DrawerTabKey = (typeof DRAWER_TABS)[number]["key"];

export type EvaluationDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: DrawerTabKey;
};

export function EvaluationDrawer({
  open,
  onOpenChange,
  initialTab = "basic",
}: EvaluationDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-full sm:!max-w-2xl lg:!max-w-3xl p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-3 border-b shrink-0">
          <SheetTitle className="font-display">編輯評估資料</SheetTitle>
          <SheetDescription>
            Week 4 過渡版本:現有 Page 1-7 表單暫時放這裡。Week 4 後半接 tRPC
            存檔。
          </SheetDescription>
        </SheetHeader>
        <EvaluationFormProvider>
          <Tabs
            defaultValue={initialTab}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList className="mx-6 mt-3 shrink-0 h-auto flex-wrap justify-start gap-1">
              {DRAWER_TABS.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
              <TabsContent value="basic" className="mt-0">
                <Page1BasicInfo />
              </TabsContent>
              <TabsContent value="posture" className="mt-0">
                <Page2MotiPhysio />
              </TabsContent>
              <TabsContent value="functional" className="mt-0 space-y-6">
                <Page3FunctionalUpper />
                <Page4FunctionalLower />
              </TabsContent>
              <TabsContent value="redcord" className="mt-0">
                <Page5Redcord />
              </TabsContent>
              <TabsContent value="body-comp" className="mt-0">
                <Page6Ronfic />
              </TabsContent>
              <TabsContent value="training" className="mt-0">
                <Page7TrainingPlan />
              </TabsContent>
            </div>
          </Tabs>
        </EvaluationFormProvider>
      </SheetContent>
    </Sheet>
  );
}
