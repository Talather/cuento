import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StoryLoadingState() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto p-8">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </Card>
    </div>
  );
}