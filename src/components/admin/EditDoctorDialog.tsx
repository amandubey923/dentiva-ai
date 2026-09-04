import { useUpdateDoctor } from "@/hooks/use-doctors";
import { Doctor } from "@prisma/client";
import { useState, useEffect } from "react";
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

interface EditDoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

function EditDoctorDialog({ doctor, isOpen, onClose }: EditDoctorDialogProps) {
  const [formData, setFormData] = useState<DoctorFormData>({
    name: "",
    email: "",
    phone: "",
    speciality: "",
    gender: "MALE",
    isActive: true,
  });

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        speciality: doctor.speciality,
        gender: doctor.gender,
        isActive: doctor.isActive,
      });
    }
  }, [doctor]);

  const updateDoctorMutation = useUpdateDoctor();

  const handleSave = () => {
    if (doctor) {
      updateDoctorMutation.mutate(
        { id: doctor.id, ...formData },
        { onSuccess: handleClose }
      );
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Edit Doctor</DialogTitle>
          <DialogDescription>Update doctor information and status.</DialogDescription>
        </DialogHeader>

        {doctor && <DoctorFormFields formData={formData} onChange={setFormData} />}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
            disabled={
              !formData.name ||
              !formData.email ||
              !formData.speciality ||
              updateDoctorMutation.isPending
            }
          >
            {updateDoctorMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditDoctorDialog;