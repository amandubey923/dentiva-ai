import { Gender } from "@prisma/client";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { formatPhoneNumber } from "@/lib/utils";

export interface DoctorFormData {
  name: string;
  email: string;
  phone: string;
  speciality: string;
  gender: Gender;
  isActive: boolean;
}

interface DoctorFormFieldsProps {
  formData: DoctorFormData;
  onChange: (updated: DoctorFormData) => void;
}

export function DoctorFormFields({ formData, onChange }: DoctorFormFieldsProps) {
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    onChange({ ...formData, phone: formatted });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doctor-name">Name *</Label>
          <Input
            id="doctor-name"
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            placeholder="Dr. John Smith"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doctor-speciality">Speciality *</Label>
          <Input
            id="doctor-speciality"
            value={formData.speciality}
            onChange={(e) => onChange({ ...formData, speciality: e.target.value })}
            placeholder="General Dentistry"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="doctor-email">Email *</Label>
        <Input
          id="doctor-email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange({ ...formData, email: e.target.value })}
          placeholder="doctor@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="doctor-phone">Phone</Label>
        <Input
          id="doctor-phone"
          value={formData.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doctor-gender">Gender</Label>
          <Select
            value={formData.gender || "MALE"}
            onValueChange={(value) => onChange({ ...formData, gender: value as Gender })}
          >
            <SelectTrigger id="doctor-gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctor-status">Status</Label>
          <Select
            value={formData.isActive ? "active" : "inactive"}
            onValueChange={(value) => onChange({ ...formData, isActive: value === "active" })}
          >
            <SelectTrigger id="doctor-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

