import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Save,
  User,
  Activity,
  CalendarIcon,
  Plus,
  X,
} from "lucide-react";
import { Participant } from "@/lib/supabase";
import { SubmitHandler } from "react-hook-form";

const participantSchema = z.object({
  nik: z
    .string()
    .min(16, "NIK harus berisi 16 digit")
    .max(16, "NIK harus berisi 16 digit"),
  name: z.string().min(1, "Nama lengkap diperlukan"),
  date_of_birth: z.string().min(1, "Tanggal lahir diperlukan"),
  address: z.string().min(1, "Alamat lengkap diperlukan"),
  bb: z.number().min(0, "Berat harus lebih dari 0"),
  tb: z.number().min(0, "Tinggi harus lebih dari 0"),
  lila: z.number().min(0, "LILA harus bernilai positif"),
  gds: z.number().min(0, "GDS harus bernilai positif"),
  au: z.string(),
  immunization: z.string(),
  lp: z.number().min(0, "LP harus bernilai positif"),
  td: z.string(),
  hb: z.number().min(0, "HB harus bernilai positif"),
  chol: z.number().min(0, "Cholesterol harus bernilai positif"),
  custom_fields: z.record(z.string(), z.string()).optional(),
});

// Interface untuk custom field
interface CustomField {
  id: string;
  label: string;
  value: string;
  type: "text" | "number" | "textarea";
}

export type ParticipantFormData = z.infer<typeof participantSchema>;

interface ParticipantFormProps {
  onSubmit: (data: ParticipantFormData) => Promise<void>;
  initialData?: Participant;
  loading?: boolean;
  showToast?: boolean; // Optional prop to control toast display
}

export function ParticipantForm({
  onSubmit,
  initialData,
  loading,
  showToast = true,
}: ParticipantFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date_of_birth ? new Date(initialData.date_of_birth) : undefined
  );
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const { toast } = useToast();

  // Sync date state with initialData
  useEffect(() => {
    if (initialData?.date_of_birth) {
      setDate(new Date(initialData.date_of_birth));
    }
  }, [initialData?.date_of_birth]);

  // Functions untuk mengelola custom fields
  const addCustomField = () => {
    const newField: CustomField = {
      id: `custom_${Date.now()}`,
      label: "",
      value: "",
      type: "text",
    };
    setCustomFields([...customFields, newField]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter((field) => field.id !== id));
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(
      customFields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: initialData
      ? {
          nik: initialData.nik,
          name: initialData.name,
          date_of_birth: initialData.date_of_birth,
          address: initialData.address,
          bb: initialData.bb,
          tb: initialData.tb,
          lila: initialData.lila,
          gds: initialData.gds,
          au: initialData.au,
          immunization: initialData.immunization,
          lp: initialData.lp,
          td: initialData.td,
          hb: initialData.hb,
          chol: initialData.chol,
          custom_fields: {},
        }
      : {
          nik: "",
          name: "",
          date_of_birth: "",
          address: "",
          bb: 0,
          tb: 0,
          lila: 0,
          gds: 0,
          au: "",
          immunization: "",
          lp: 0,
          td: "",
          hb: 0,
          chol: 0,
          custom_fields: {},
        },
  });

  const handleFormSubmit: SubmitHandler<ParticipantFormData> = async (data) => {
    try {
      // Buat object custom fields dari state
      const customFieldsObject: Record<string, string> = {};
      customFields.forEach((field) => {
        if (field.label && field.value) {
          customFieldsObject[field.label] = field.value;
        }
      });

      // Tambahkan custom fields ke data
      const submitData = {
        ...data,
        custom_fields: customFieldsObject,
      };

      await onSubmit(submitData);

      // Tampilkan toast sukses hanya jika showToast adalah true
      if (showToast) {
        toast({
          title: "Berhasil",
          description: initialData
            ? "Data peserta berhasil diperbarui"
            : "Data peserta berhasil ditambahkan",
        });
      }

      if (!initialData) {
        reset();
        setDate(undefined);
        setCustomFields([]);
      }
    } catch (error) {
      // Toast error akan ditampilkan hanya jika showToast adalah true
      if (showToast) {
        toast({
          title: "Kesalahan",
          description: "Gagal menyimpan data peserta",
          variant: "destructive",
        });
      }
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <User className="h-5 w-5 text-white" />
          </div>
          {initialData ? "Edit Peserta" : "Tambah Peserta Baru"}
        </CardTitle>
        <CardDescription className="text-slate-600">
          {initialData
            ? "Memperbaharui Informasi Peserta"
            : "Isi data peserta baru di bawah ini."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Participant Identity Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 pb-2 border-b border-slate-100">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md">
                <User className="h-4 w-4 text-white" />
              </div>
              Identitas Peserta
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="nik"
                  className="text-sm font-medium text-slate-700"
                >
                  NIK
                </Label>
                <Input
                  id="nik"
                  placeholder="Masukkan NIK 16 digit"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("nik")}
                  disabled={loading}
                />
                {errors.nik && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.nik.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Nama
                </Label>
                <Input
                  id="name"
                  placeholder="Masukkan nama lengkap"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("name")}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="date_of_birth"
                  className="text-sm font-medium text-slate-700"
                >
                  Tanggal Lahir
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="date_of_birth"
                    type="date"
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 flex-1"
                    {...register("date_of_birth")}
                    disabled={loading}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        setDate(new Date(value));
                      } else {
                        setDate(undefined);
                      }
                    }}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 border-slate-200 hover:border-blue-500"
                        disabled={loading}
                        type="button"
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          if (selectedDate) {
                            setValue(
                              "date_of_birth",
                              format(selectedDate, "yyyy-MM-dd")
                            );
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={id}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.date_of_birth && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.date_of_birth.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-medium text-slate-700"
                >
                  Alamat
                </Label>
                <Textarea
                  id="address"
                  placeholder="Masukkan alamat lengkap"
                  className="min-h-[44px] border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                  {...register("address")}
                  disabled={loading}
                />
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Health Data Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 pb-2 border-b border-slate-100">
              <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md">
                <Activity className="h-4 w-4 text-white" />
              </div>
              Data Kesehatan
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="bb"
                  className="text-sm font-medium text-slate-700"
                >
                  BB (Berat - kg)
                </Label>
                <Input
                  id="bb"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("bb", { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.bb && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.bb.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="tb"
                  className="text-sm font-medium text-slate-700"
                >
                  TB (Tinggi - cm)
                </Label>
                <Input
                  id="tb"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("tb", { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.tb && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.tb.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lila"
                  className="text-sm font-medium text-slate-700"
                >
                  LILA (cm)
                </Label>
                <Input
                  id="lila"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("lila", { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.lila && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.lila.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="gds"
                  className="text-sm font-medium text-slate-700"
                >
                  GDS (mg/dL)
                </Label>
                <Input
                  id="gds"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("gds", { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.gds && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.gds.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="au"
                  className="text-sm font-medium text-slate-700"
                >
                  AU
                </Label>
                <Input
                  id="au"
                  placeholder="Masukkan AU"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("au")}
                  disabled={loading}
                />
                {errors.au && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.au.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="immunization"
                  className="text-sm font-medium text-slate-700"
                >
                  Imunisasi
                </Label>
                <Input
                  id="immunization"
                  placeholder="Masukkan status imunisasi"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("immunization")}
                  disabled={loading}
                />
                {errors.immunization && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.immunization.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lp"
                  className="text-sm font-medium text-slate-700"
                >
                  LP (cm)
                </Label>
                <Input
                  id="lp"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("lp", { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.lp && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.lp.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="td"
                  className="text-sm font-medium text-slate-700"
                >
                  TD (Tekanan Darah)
                </Label>
                <Input
                  id="td"
                  placeholder="e.g., 120/80"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("td")}
                  disabled={loading}
                />
                {errors.td && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.td.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="hb"
                  className="text-sm font-medium text-slate-700"
                >
                  HB (g/dL)
                </Label>
                <Input
                  id="hb"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("hb", { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.hb && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.hb.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="chol"
                  className="text-sm font-medium text-slate-700"
                >
                  CHOL (mg/dL)
                </Label>
                <Input
                  id="chol"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  {...register("chol", { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.chol && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.chol.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Custom Fields Section */}
          <div className="space-y-4">
            <Separator className="my-6" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Field Tambahan
                </h3>
                <p className="text-sm text-slate-600">
                  Tambahkan field custom sesuai kebutuhan
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomField}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Field
              </Button>
            </div>

            {customFields.length > 0 && (
              <div className="space-y-4">
                {customFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Nama Field
                        </Label>
                        <Input
                          value={field.label}
                          onChange={(e) =>
                            updateCustomField(field.id, {
                              label: e.target.value,
                            })
                          }
                          placeholder="Contoh: Alergi, Catatan Khusus"
                          className="h-10"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Tipe Input
                        </Label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateCustomField(field.id, {
                              type: e.target.value as
                                | "text"
                                | "number"
                                | "textarea",
                            })
                          }
                          className="h-10 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        >
                          <option value="text">Teks</option>
                          <option value="number">Angka</option>
                          <option value="textarea">Teks Panjang</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Nilai
                        </Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            value={field.value}
                            onChange={(e) =>
                              updateCustomField(field.id, {
                                value: e.target.value,
                              })
                            }
                            placeholder="Masukkan nilai..."
                            className="min-h-[80px]"
                            disabled={loading}
                          />
                        ) : (
                          <Input
                            type={field.type === "number" ? "number" : "text"}
                            value={field.value}
                            onChange={(e) =>
                              updateCustomField(field.id, {
                                value: e.target.value,
                              })
                            }
                            placeholder="Masukkan nilai..."
                            className="h-10"
                            disabled={loading}
                          />
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomField(field.id)}
                      disabled={loading}
                      className="mt-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[140px] h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {initialData ? "Memperbaharui" : "Menyimpan"} Peserta
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
