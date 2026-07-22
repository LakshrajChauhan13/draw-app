import { isRoomExistsApi } from '@/api/room.api'
import { ErrorMessage } from '@/components/signup-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const JoinCanvasCard = () => {
    const [joinRoomId, setJoinRoomId] = useState<string>('')
    const router = useRouter()
    
    const joinCanvasMutation = useMutation({
      mutationFn: (roomId: string) => isRoomExistsApi(roomId),                  // instead, we will protect the route directly `/canvas/${roomId}` before loading it using middleware over here.
      onMutate: () => {
        const id = toast.loading('verifying the room ID...')
        return  { id };
      },
      onSuccess: (data, variables, context) => {
        toast.dismiss(context.id);
        toast.success('Verified');
        router.push(`/canvas/${joinRoomId}`);
        console.log(data);
      },
      onError: (error: AxiosError<ErrorMessage>, variables, context) => {
        const message = error.response?.data.message;
        toast.dismiss(context!.id);
        toast.error(message);
        console.log("error --> ", message);
      }

    })
    
    const handleCreate = (roomId: string) => {
        joinCanvasMutation.mutate(roomId);
    }
    
  return (
    <>
     <Dialog 
     >
        <DialogTrigger>
          <div
            className={cn(
              "h-55 rounded-xl border-2 border-dashed border-muted-blue-foreground/50",
              "flex flex-col items-center justify-center gap-2",
              "text-muted-blue-foreground/70 cursor-pointer",
              "hover:border-muted-blue-foreground hover:bg-muted-blue/30 hover:text-muted-blue-foreground",
              "transition-all duration-150 w-full",
            )}
          >
            <div className="size-9 rounded-full border-2 border-dashed border-current flex items-center justify-center">
              <PlusIcon className="size-4" />
            </div>
            <span className="text-sm font-">Join Canvas</span>
          </div>
        </DialogTrigger>

        <DialogContent className={"sm:max-w-md"}>
          <DialogHeader>
            <DialogTitle>Join Canvas</DialogTitle>
            <DialogDescription>
              Join the canvas. Enter the room Id below to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="roomId"> Canvas Room Id </Label>
            <Input
              id="roomId"
              placeholder="my-canvas-roomID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate( joinRoomId )}
              autoFocus
            />
            <p className="text-xs text-muted-foreground italic">
              Note: Enter valid room ID.
            </p>
          </div>
          <DialogFooter>
            <Button className={""} variant={"outline"} 
            // onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button className={""} variant={"default"} 
            onClick={() => handleCreate( joinRoomId )}
            >
              Join
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>   
    </>
  )
}

export default JoinCanvasCard