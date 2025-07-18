import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  ParticipantForm,
  ParticipantFormData,
} from "@/components/ParticipantForm";
import { ParticipantTable } from "@/components/ParticipantTable";
import { supabase, Participant } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Dashboard() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingParticipant, setEditingParticipant] =
    useState<Participant | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scroll ke bawah
        setShowHeader(false);
      } else {
        // Scroll ke atas
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);


  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error("Gagal mengambil data peserta:", error);
      toast({
        title: "Kesalahan",
        description: "Gagal memuat data peserta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async (data: ParticipantFormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("participants")
        .insert([{ ...data, user_id: user?.id }]);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Peserta berhasil ditambahkan",
      });

      fetchParticipants();
    } catch (error) {
      console.error("Gagal menambahkan peserta:", error);
      toast({
        title: "Kesalahan",
        description: "Gagal menambahkan peserta",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditParticipant = async (data: ParticipantFormData) => {
    if (!editingParticipant) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("participants")
        .update(data)
        .eq("id", editingParticipant.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data peserta berhasil diperbarui",
      });

      setEditingParticipant(null);
      setShowEditModal(false);
      fetchParticipants();
    } catch (error) {
      console.error("Gagal memperbarui peserta:", error);
      toast({
        title: "Kesalahan",
        description: "Gagal memperbarui peserta",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    try {
      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Peserta berhasil dihapus",
      });

      fetchParticipants();
    } catch (error) {
      console.error("Gagal menghapus peserta:", error);
      toast({
        title: "Kesalahan",
        description: "Gagal menghapus peserta",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Gagal keluar:", error);
      toast({
        title: "Kesalahan",
        description: "Gagal keluar dari akun",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (participant: Participant) => {
    setEditingParticipant(participant);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header
        className={`bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 sticky top-0 z-40 transition-transform duration-500 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center py-2">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Manajemen Posyandu
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Selamat datang kembali, {user?.email}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Add Participant Form */}
          <div>
            <ParticipantForm
              onSubmit={handleAddParticipant}
              loading={submitting}
            />
          </div>

          {/* Participants Table */}
          <ParticipantTable
            participants={participants}
            onEdit={openEditModal}
            onDelete={handleDeleteParticipant}
            loading={loading}
          />
        </div>
      </main>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Edit className="h-4 w-4 text-white" />
              </div>
              Edit Data Peserta
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Perbarui informasi peserta di bawah ini.
            </DialogDescription>
          </DialogHeader>
          {editingParticipant && (
            <ParticipantForm
              onSubmit={handleEditParticipant}
              initialData={editingParticipant}
              loading={submitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
