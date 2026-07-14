import { createRoomApi } from "@/api/room.api";
import { ErrorMessage } from "@/components/signup-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";
import { RoomSlugSchemaType } from "@repo/common/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NewCanvasCard = () => {
    const [slug, setSlug] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const queryClient = useQueryClient();
    
    const createRoomMutation = useMutation({
        mutationFn: (data: RoomSlugSchemaType) => createRoomApi(data.slug),
        onMutate: () => {
            const id = toast.loading("Creating...")
            return { id }
        },
        onSuccess: (data, variables, context) => {
            toast.dismiss(context.id)
            const message = data.message || 'Room created successfully'
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: ['getAllRooms&Data']})
            setDialogOpen(false)
            setSlug('');
        },
        onError: (error: AxiosError<ErrorMessage>, variables, context) => {
            toast.dismiss(context!.id)
            const message = error.response?.data.message || 'Error occurred !'
            toast.error(message)
        }
    })

    function handleCreate(data: RoomSlugSchemaType){
        createRoomMutation.mutate(data);
    }
    
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger>
          <div
            className={cn(
              "h-50 rounded-xl border-2 border-dashed border-border",
              "flex flex-col items-center justify-center gap-2",
              "text-muted-foreground cursor-pointer",
              "hover:border-primary/50 hover:bg-accent hover:text-foreground",
              "transition-all duration-150 w-full",
            )}
          >
            <div className="size-9 rounded-full border-2 border-dashed border-current flex items-center justify-center">
              <PlusIcon className="size-4" />
            </div>
            <span className="text-sm font-">New Canvas</span>
          </div>
        </DialogTrigger>

        <DialogContent className={"sm:max-w-md"}>
          <DialogHeader>
            <DialogTitle>Create Canvas</DialogTitle>
            <DialogDescription>
              Give your canvas a unique name. You can share it with others after
              creating it
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="slug"> Canvas Name </Label>
            <Input
              id="slug"
              placeholder="my-canvas-name"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate({ slug })}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              8-30 characters only.
            </p>
          </div>
          <DialogFooter>
            <Button className={""} variant={"outline"} onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className={""} variant={"default"} disabled={slug.trim().length < 8 || slug.trim().length > 30} onClick={() => handleCreate({ slug })}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewCanvasCard;
