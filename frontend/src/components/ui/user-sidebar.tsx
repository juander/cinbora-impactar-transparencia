"use client";

import { useState, useEffect, useCallback } from "react";
import { UploadCloud, User, Loader2 } from "lucide-react";
import ModalPortal from "@/components/ui/modalPortal";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export function UserSidebar({
  avatarUrl,
  setAvatarUrl,
}: {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
}) {
  const [userName, setUserName] = useState("Carregando...");
  const [userEmail, setUserEmail] = useState("...");
  const [actions, setActions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showEditOngModal, setShowEditOngModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [newProfileFile, setNewProfileFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const ngoId = Cookies.get("ngo_id");
  const ngoName = Cookies.get("ngo_name");
  const authToken = Cookies.get("auth_token");

  const [editFields, setEditFields] = useState({
    nome: "",
    descricao: "",
    telefone: "",
    instagram: "",
    fundacao: "",
  });

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      document.body.classList.remove("overflow-x-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      document.body.classList.add("overflow-x-hidden");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && authToken) {
      fetch("http://127.0.0.1:3333/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token inválido");
          return res.json();
        })
        .then((data) => {
          setAvatarUrl(data?.profileUrl || null);
          setUserName(data.name || "Usuário");
          setUserEmail(data.email || "email@exemplo.com");
        })
        .catch(() => {
          Cookies.remove("auth_token");
          setAvatarUrl(null);
          setUserName("Erro ao carregar");
          setUserEmail("Erro ao carregar");
        });
    }
  }, [isOpen, authToken]);
  

  useEffect(() => {
    if (showEditProfileModal && authToken) {
      fetch("http://127.0.0.1:3333/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token inválido");
          return res.json();
        })
        .then((data) => {
          if (data?.profileUrl) {
            setProfilePreview(data.profileUrl);
          }
        })
        .catch(() => {
          Cookies.remove("auth_token");
          toast.error("Erro ao carregar imagem de perfil.");
        });
    }
  }, [showEditProfileModal, authToken]);
  

  useEffect(() => {
    if (showEditOngModal && authToken && ngoId) {
      fetch(`http://127.0.0.1:3333/ongs/${ngoId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const ngo = data.ngo;
          setEditFields({
            nome: ngo.name || "",
            descricao: ngo.description || "",
            telefone: ngo.contact_phone || "",
            instagram: ngo.instagram_link || "",
            fundacao: ngo.start_year ? `${ngo.start_year}-01-01` : "",
          });
        });
    }
  }, [showEditOngModal, authToken, ngoId]);

  const fetchUserData = useCallback(() => {
    if (authToken) {
      fetch("http://127.0.0.1:3333/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token inválido");
          return res.json();
        })
        .then((data) => {
          setUserName(data.name || "Usuário");
          setUserEmail(data.email || "email@exemplo.com");
        })
        .catch(() => {
          Cookies.remove("auth_token");
          setUserName("Erro ao carregar");
          setUserEmail("Erro ao carregar");
        });
  
      if (ngoId) {
        fetch(`http://127.0.0.1:3333/ongs/${ngoId}/actions`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
          .then((res) => res.json())
          .then((data) => setActions(Array.isArray(data) ? data : []))
          .catch(() => setActions([]));
      }
    }
  }, [authToken, ngoId]);
  

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen, fetchUserData]);

  const handleLogout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("user_name");
    Cookies.remove("user_email");
    Cookies.remove("ngo_id");
    Cookies.remove("ngo_name");
    window.location.href = "/login";
  };

  const handleSaveEdit = () => {
    const payload: Record<string, any> = {};

    if (editFields.nome) payload.name = editFields.nome;
    if (editFields.descricao) payload.description = editFields.descricao;
    if (editFields.telefone) payload.contact_phone = editFields.telefone;
    if (editFields.instagram) payload.instagram_link = editFields.instagram;
    if (editFields.fundacao) {
      const ano = parseInt(editFields.fundacao.split("-")[0]);
      if (!isNaN(ano)) payload.start_year = ano;
    }

    fetch("http://127.0.0.1:3333/ongs", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao atualizar");
        return res.json();
      })
      .then(() => {
        toast.success("Informações atualizadas com sucesso!");
        setShowEditOngModal(false);
        fetchUserData();
      })
      .catch(() => {
        toast.error("Erro ao atualizar informações da ONG.");
      });
  };

  const handleUpdateProfilePicture = async () => {
    if (!newProfileFile) {
      toast.error("Escolha uma imagem para atualizar.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("profileUrl", newProfileFile);

    try {
      const updateRes = await fetch("http://127.0.0.1:3333/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!updateRes.ok) throw new Error();

      const data = await updateRes.json();
      const uploadedUrl = data?.user?.profileUrl;

      if (!uploadedUrl) {
        toast.error("Erro ao obter URL da imagem.");
        return;
      }

      setAvatarUrl(uploadedUrl);
      setProfilePreview(uploadedUrl);
      setShowEditProfileModal(false);
      setNewProfileFile(null);
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch {
      toast.error("Erro ao atualizar foto de perfil.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full p-1 bg-gray-200 hover:bg-gray-300 transition-all"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-6 h-6 text-gray-600" />
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => !showEditOngModal && setIsOpen(false)}
          />

          <div
            className={`fixed right-0 top-0 h-full w-[320px] sm:w-[350px] md:w-[400px] 
              bg-white shadow-xl rounded-l-xl z-50 transition-transform duration-300 transform 
              ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Fechar sidebar"
              >
                ×
              </button>
            </div>

            <div className="px-6 pb-6 overflow-y-auto h-[calc(100%-64px)] flex flex-col items-center gap-4">
              <div className="relative flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <Button
                  variant="outline"
                  className="absolute top-[17px] right-[-85px] text-xs px-2 py-1 rounded-full border border-gray-300 bg-white hover:bg-gray-100"
                  onClick={() => setShowEditProfileModal(true)}
                >
                  Editar foto
                </Button>
              </div>

              <h2 className="text-lg font-bold mt-2">{userName}</h2>
              <p className="text-sm text-gray-500">{userEmail}</p>

              {ngoName && (
                <div className="w-full mt-2 text-center">
                  <p className="text-sm text-gray-600 font-medium">{ngoName}</p>
                  <Button
                    id="informacaoOngs"
                    variant="outline"
                    className="text-sm mt-2 px-4 py-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100"
                    onClick={() => setShowEditOngModal(true)}
                  >
                    Editar informações da ONG
                  </Button>
                </div>
              )}

              <Separator className="my-4" />

              <h3 className="text-md font-semibold text-gray-700">
                Ações da ONG
              </h3>
              <div className="w-full max-h-60 overflow-y-auto border rounded-lg p-3 shadow-sm bg-gray-50">
                {actions.length > 0 ? (
                  actions.map((action: any) => (
                    <div
                      key={action.id}
                      className="p-3 mb-2 rounded-lg bg-white shadow-md border"
                    >
                      <h4 className="text-sm font-medium text-gray-900 flex justify-between items-center gap-2">
                        <span className="truncate max-w-[60%] overflow-hidden text-ellipsis">
                          {action.name}
                        </span>
                        <Badge className="max-w-[40%] truncate px-2 py-1 text-xs">
                          {action.type.toUpperCase()}
                        </Badge>
                      </h4>
                      <div className="mt-4 text-sm font-semibold text-gray-700 w-full">
                        {/* Layout mobile (triangular) */}
                        <div className="flex flex-col items-center gap-2 md:hidden">
                          <div className="flex justify-center gap-4 w-full">
                            <div className="text-center flex-1">
                              <p className="text-xs text-gray-500">Arrecadado</p>
                              <p className="text-lg font-bold whitespace-nowrap">
                                R${" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  notation: "compact",
                                  compactDisplay: "short",
                                }).format(action.colected)}
                              </p>
                            </div>
                            <div className="text-center flex-1">
                              <p className="text-xs text-gray-500">Meta</p>
                              <p className="text-lg font-bold whitespace-nowrap">
                                R${" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  notation: "compact",
                                  compactDisplay: "short",
                                }).format(action.goal)}
                              </p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Gasto</p>
                            <p className="text-lg font-bold text-red-500 whitespace-nowrap">
                              R${" "}
                              {new Intl.NumberFormat("pt-BR", {
                                notation: "compact",
                                compactDisplay: "short",
                              }).format(action.spent)}
                            </p>
                          </div>
                        </div>

                        {/* Layout desktop (linha única) */}
                        <div className="hidden md:flex justify-between w-full text-center">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Arrecadado</p>
                            <p className="text-lg font-bold whitespace-nowrap">
                              R${" "}
                              {new Intl.NumberFormat("pt-BR", {
                                notation: "compact",
                                compactDisplay: "short",
                              }).format(action.colected)}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Meta</p>
                            <p className="text-lg font-bold whitespace-nowrap">
                              R${" "}
                              {new Intl.NumberFormat("pt-BR", {
                                notation: "compact",
                                compactDisplay: "short",
                              }).format(action.goal)}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Gasto</p>
                            <p className="text-lg font-bold text-red-500 whitespace-nowrap">
                              R${" "}
                              {new Intl.NumberFormat("pt-BR", {
                                notation: "compact",
                                compactDisplay: "short",
                              }).format(action.spent)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Progress
                        className="w-full h-2 mt-2 bg-gray-200 rounded-full"
                        indicatorClass="bg-green-500 rounded-full bg-[#2BAFF150]"
                        value={(action.colected / action.goal) * 100}
                      />

                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhuma ação cadastrada.
                  </p>
                )}
              </div>

              <div className="flex w-full gap-2 mt-6">
                <Button
                  className="w-1/2 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition-all shadow-md"
                  onClick={() => (window.location.href = "/dashboard/ongs")}
                >
                  Minha ONG
                </Button>
                <Button
                  id="historico"
                  className="w-1/2 bg-blue-800 text-white rounded-full hover:bg-blue-950 transition-all shadow-md"
                  onClick={() => (window.location.href = "/dashboard/history")}
                >
                  Histórico da ONG
                </Button>
              </div>

              <div className="mt-8 w-full">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full bg-red-500 text-white rounded-full px-6 py-3 hover:bg-red-600 transition-all shadow-md">
                      Sair
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl shadow-lg p-6 w-[380px] flex flex-col items-center bg-white dark:bg-gray-900 border dark:border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                        Tem certeza que deseja sair?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600 dark:text-gray-300 text-center mt-2">
                        Você será desconectado e precisará fazer login novamente
                        para acessar sua conta.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-4 mt-4">
                      <AlertDialogCancel className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-6 py-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all w-full sm:w-auto">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 text-white rounded-full px-6 py-3 hover:bg-red-600 transition-all w-full sm:w-auto"
                        onClick={handleLogout}
                      >
                        Sair
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </>
      )}

      {showEditOngModal && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999]">
            <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-8 w-[500px] h-full overflow-scroll">
              <h2 className="text-2xl pb-2 font-semibold text-gray-900">
                Editar ONG
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Modifique abaixo as informações da sua ONG. Clique em SALVAR
                ALTERAÇÕES e seus dados serão atualizados.
              </p>

              <div className="grid grid-cols-1 gap-4 mt-6">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Nome</label>
                  <input
                    className="p-4 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Nome da ONG"
                    value={editFields.nome}
                    onChange={(e) =>
                      setEditFields({ ...editFields, nome: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    className="p-4 border border-gray-300 rounded-[16px] resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Descrição da ONG"
                    rows={3}
                    value={editFields.descricao}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        descricao: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Telefone</label>
                  <input
                    className="p-4 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="(xx) xxxxx-xxxx"
                    value={editFields.telefone}
                    onChange={(e) =>
                      setEditFields({ ...editFields, telefone: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Instagram
                  </label>
                  <input
                    className="p-4 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Link do Instagram"
                    value={editFields.instagram}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        instagram: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Ano de fundação
                  </label>
                  <input
                    type="date"
                    className="p-4 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={editFields.fundacao}
                    onChange={(e) =>
                      setEditFields({ ...editFields, fundacao: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 flex justify-between">
                <button
                  className="px-5 py-2 border border-gray-400 text-gray-600 rounded-[16px] hover:bg-gray-300 transition-all"
                  onClick={() => setShowEditOngModal(false)}
                >
                  Cancelar
                </button>
                <button
                  id="salvarOngs"
                  className="px-5 py-2 bg-blue-600 text-white rounded-[16px] hover:bg-blue-500 transition-all"
                  onClick={handleSaveEdit}
                >
                  Salvar alterações
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {showEditProfileModal && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999]">
            <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-8 w-[500px]">
              <h2 className="text-2xl font-semibold text-gray-900 text-center">
                Editar perfil
              </h2>
              <p className="text-gray-500 text-sm text-center mt-2">
                Modifique abaixo sua foto de perfil. Clique em SALVAR <br />e
                sua foto de perfil será atualizada.
              </p>

              <div className="flex flex-col items-center mt-6 gap-4">
                <div className="w-32 h-32 rounded-full bg-gray-300 overflow-hidden">
                  {profilePreview && (
                    <img
                      src={profilePreview}
                      alt="Perfil"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <label className="cursor-pointer rounded-[8px] flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 transition-all">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                  Nova foto de perfil
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewProfileFile(file);
                        setProfilePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <Button
                  disabled={!newProfileFile || uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleUpdateProfilePicture}
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Salvar"
                  )}
                </Button>

                <button
                  className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition-all"
                  onClick={() => setShowEditProfileModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
