import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export type variantType = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link' | 'outlineSecondary';

export function AlertDialogNew({ onClick, Trigger, Title, Description, TriggerButtonStyle, TriggerButtonVariant, ActionButtonVariant }: {
  onClick: () => void;
  Trigger: string | React.ReactNode;
  TriggerButtonStyle?: string;
  TriggerButtonVariant: variantType;
  ActionButtonVariant: variantType;
  Title: string;
  Description: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant={TriggerButtonVariant} className={TriggerButtonStyle}> 
            {Trigger}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{Title}</AlertDialogTitle>
          <AlertDialogDescription>
            {Description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClick} variant={ActionButtonVariant}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
