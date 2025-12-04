import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComingSoonModal({ open, onOpenChange }: ComingSoonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md backdrop-blur-xl bg-background/95 border-2"
        aria-describedby="coming-soon-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Matrix Dashboard is coming soon
          </DialogTitle>
          <DialogDescription id="coming-soon-description" className="text-center text-base pt-2">
            This feature will launch very soon. QuantNumeric is currently in beta.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-[#d21212] text-white hover:bg-[#b01010] px-8"
          >
            Back to site
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
