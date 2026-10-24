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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";
import { RoomSlugSchemaType } from "@repo/common/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NewCanvasCard = () => {
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const createRoomMutation = useMutation({
    mutationFn: (data: RoomSlugSchemaType) =>
      createRoomApi(data.slug, data.description),
    onMutate: () => {
      const id = toast.loading("Creating...");
      return { id };
    },
    onSuccess: (data, variables, context) => {
      toast.dismiss(context.id);
      const message = data.message || "Room created successfully";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["getAllRooms&Data"] });
      setDialogOpen(false);
      setSlug("");
      setDescription(""); // Reset description on success
    },
    onError: (error: AxiosError<ErrorMessage>, variables, context) => {
      toast.dismiss(context!.id);
      const message = error.response?.data.message || "Error occurred !";
      toast.error(message);
      console.log(error.response);
    },
  });

  function handleCreate(data: RoomSlugSchemaType) {
    createRoomMutation.mutate(data);
  }

  // Derived validation states for UI feedback
  const isSlugValid = slug.trim().length >= 8 && slug.trim().length <= 15;
  const isDescValid = description.trim().length >= 10 && description.trim().length <= 100;

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger>
          <div
            className={cn(
              "h-55 rounded-xl border-2 border-dashed border-border",
              "flex flex-col items-center justify-center gap-2",
              "text-muted-foreground cursor-pointer",
              "hover:border-primary/50 hover:bg-accent hover:text-foreground",
              "transition-all duration-150 w-full"
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
              Give your canvas a unique name with a description. You can share it
              with others once created.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-2">
            {/* Slug Input Section */}
            <div className="space-y-2">
              <Input
                id="slug"
                placeholder="my-canvas-name"
                className={cn("placeholder:italic")}
                value={slug}
                maxLength={15}
                onChange={(e) => setSlug(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCreate({ slug, description })
                }
                autoFocus
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  8-15 characters only.
                </p>
                <span
                  className={cn(
                    "text-xs transition-colors",
                    isSlugValid ? "text-emerald-500 font-medium" : "text-muted-foreground"
                  )}
                >
                  {slug.length}/15
                </span>
              </div>
            </div>

            {/* Description Textarea Section */}
            <div className="space-y-2">
              <Textarea
                id="description"
                placeholder="Write a short description..."
                value={description}
                maxLength={100}
                className={cn("placeholder:italic resize-none break-all")}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCreate({ slug, description })
                }
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  10-100 characters only.
                </p>
                <span
                  className={cn(
                    "text-xs transition-colors",
                    isDescValid ? "text-emerald-500 font-medium" : "text-muted-foreground"
                  )}
                >
                  {description.length}/100
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant={"outline"} onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={"default"}
              disabled={!isSlugValid || !isDescValid}
              onClick={() => handleCreate({ slug, description })}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewCanvasCard;