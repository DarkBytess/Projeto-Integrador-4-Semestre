import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiClient, User } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Users as UsersIcon, Shield, UserCircle, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await apiClient.getUsuarios();
      setUsers(data);
    } catch (error: any) {
      toast.error("Erro ao carregar usuários: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este usuário?")) return;
    try {
      await apiClient.deleteUsuario(id);
      toast.success("Usuário deletado com sucesso!");
      loadUsers();
    } catch (error: any) {
      toast.error("Erro ao deletar usuário: " + error.message);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: any; color: string; icon: any }> = {
      ADMIN: { variant: "default", color: "bg-red-500/10 text-red-600", icon: Shield },
      AGRICULTOR: { variant: "outline", color: "bg-green-500/10 text-green-600", icon: UserCircle },
    };
    const config = variants[role] || variants.AGRICULTOR;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {role}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              Gestão de Usuários
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Visualize e gerencie os usuários do sistema
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{users.length}</div>
              <p className="text-xs text-muted-foreground">Total de Usuários</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-500">
                {users.filter(u => u.role === "ADMIN").length}
              </div>
              <p className="text-xs text-muted-foreground">Administradores</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">
                {users.filter(u => u.role === "AGRICULTOR").length}
              </div>
              <p className="text-xs text-muted-foreground">Agricultores</p>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum usuário cadastrado</h3>
                <p className="text-sm text-muted-foreground">
                  Os usuários aparecerão aqui após se registrarem
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="block lg:hidden space-y-3">
                  {users.map((user) => (
                    <div 
                      key={user.id}
                      className="p-4 bg-secondary/30 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.nome}`} />
                            <AvatarFallback>{getInitials(user.nome)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-foreground">{user.nome}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">#{user.id}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        {getRoleBadge(user.role)}
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block">
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">ID</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Função</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-mono text-muted-foreground">#{user.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.nome}`} />
                                  <AvatarFallback>{getInitials(user.nome)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{user.nome}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Users;
