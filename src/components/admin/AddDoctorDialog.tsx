import { useCreateDoctor } from "@/hooks/use-doctors";
import { Gender } from "@prisma/client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { DoctorFormFields, type DoctorFormData } from "./DoctorFormFields";

interface AddDoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_STATE: DoctorFormData = {
  name: "",
  email: "",
  phone: "",
  speciality: "",
  gender: "MALE" as Gender,
  isActive: true,
};

function AddDoctorDialog({ isOpen, onClose }: AddDoctorDialogProps) {
  const [newDoctor, setNewDoctor] = useState<DoctorFormData>(INITIAL_STATE);

  const createDoctorMutation = useCreateDoctor();

  const handleSave = () => {
    createDoctorMutation.mutate({ ...newDoctor }, { onSuccess: handleClose });
  };

  const handleClose = () => {
    onClose();
    setNewDoctor(INITIAL_STATE);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Add New Doctor</DialogTitle>
          <DialogDescription>Add a new doctor to your practice.</DialogDescription>
        </DialogHeader>

        <DoctorFormFields formData={newDoctor} onChange={setNewDoctor} />

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
            disabled={
              !newDoctor.name ||
              !newDoctor.email ||
              !newDoctor.speciality ||
              createDoctorMutation.isPending
            }
          >
            {createDoctorMutation.isPending ? "Adding..." : "Add Doctor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddDoctorDialog;