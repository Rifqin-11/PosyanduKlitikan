import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Edit, Trash2, Users, Calendar } from "lucide-react";
import { Participant } from "@/lib/supabase";
import { format } from "date-fns";

interface ParticipantTableProps {
  participants: Participant[];
  onEdit: (participant: Participant) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function ParticipantTable({
  participants,
  onEdit,
  onDelete,
  loading,
}: ParticipantTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bmiFilter, setBmiFilter] = useState("all");


  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) =>
    format(new Date(dateString), "dd MMM yyyy");

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      age--;
    return age;
  };

  const calculateBMI = (weight: number, height: number) => {
    if (weight === 0 || height === 0) return 0;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi === 0) return { text: "Tidak Ada", variant: "secondary" as const };
    if (bmi < 18.5) return { text: "Kurus", variant: "secondary" as const };
    if (bmi < 25) return { text: "Normal", variant: "default" as const };
    if (bmi < 30) return { text: "Gemuk", variant: "destructive" as const };
    return { text: "Obesitas", variant: "destructive" as const };
  };


  const filteredParticipants = participants.filter((participant) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      participant.name.toLowerCase().includes(query) ||
      participant.nik.toLowerCase().includes(query);

    const bmi = calculateBMI(participant.bb, participant.tb);
    const category = getBMICategory(bmi).text;

    const matchesBMI = bmiFilter === "all" || category === bmiFilter;

    return matchesSearch && matchesBMI;
  });



  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Peserta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            Peserta ({filteredParticipants.length})
          </CardTitle>
          <CardDescription className="text-slate-600">
            Daftar peserta yang terdaftar di sistem. Anda dapat mencari,
            mengedit, atau menghapus peserta.
          </CardDescription>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Cari berdasarkan nama atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md"
            />
            <Select value={bmiFilter} onValueChange={setBmiFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter BMI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Kurus">Kurus</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Gemuk">Gemuk</SelectItem>
                <SelectItem value="Obesitas">Obesitas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-slate-400" />
              </div>
              <p>Tidak ada peserta ditemukan</p>
              <p className="text-sm">
                Coba gunakan kata kunci pencarian yang lain.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
              <Table className="bg-white">
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <TableHead className="font-semibold text-slate-700">
                      No
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      NIK
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Nama
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Umur
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Berat (kg)
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Tinggi (cm)
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      BMI
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Tekanan Darah
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Terdaftar
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => {
                    const age = calculateAge(participant.date_of_birth);
                    const bmi = calculateBMI(participant.bb, participant.tb);
                    const bmiCategory = getBMICategory(bmi);

                    return (
                      <TableRow
                        key={participant.id}
                        className="hover:bg-slate-50/50 transition-colors duration-150"
                      >
                        <TableCell className="font-medium">
                          {participant.no}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-600">
                          {participant.nik}
                        </TableCell>
                        <TableCell className="font-medium">
                          {participant.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>{age} Tahun</span>
                          </div>
                        </TableCell>
                        <TableCell>{participant.bb || "N/A"}</TableCell>
                        <TableCell>{participant.tb || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">
                              {bmi > 0 ? bmi.toFixed(1) : "N/A"}
                            </span>
                            <Badge
                              variant={bmiCategory.variant}
                              className="text-xs"
                            >
                              {bmiCategory.text}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{participant.td || "N/A"}</TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {formatDate(participant.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors duration-200"
                              onClick={() => onEdit(participant)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors duration-200"
                              onClick={() => setDeleteId(participant.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800">
              Apakah anda yakin?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Aksi ini akan menghapus peserta secara permanen. Anda tidak dapat
              mengembalikannya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
