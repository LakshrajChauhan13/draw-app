import { Button } from "@/components/ui/button"
import { LockIcon } from "lucide-react"
import Link from "next/link"

export const PrivateCanvasPage = ({errorMessage}: {errorMessage: string}) => {
    return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground font-mono gap-4 selection:bg-muted">
                <LockIcon className="size-14 text-destructive" />
                <h1 className="text-3xl font-bold tracking-tighter">Private Canvas</h1>
                <p className="text-muted-foreground text-sm max-w-sm text-center tracking-tight">
                    {errorMessage}
                </p>
                <Button variant={'default'} size={'sm'} >
                    <Link href="/dashboard">
                        Return to Dashboard
                    </Link>
                </Button>
            </div>
    )
} 