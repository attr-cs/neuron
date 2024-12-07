import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, UserX, Shield, Mail } from 'lucide-react';

export default function UsersList({ users, onUpdateStatus }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user._id}>
            <TableCell className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.username}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.isAdmin ? 'default' : 'outline'}>
                {user.isAdmin ? 'Admin' : 'User'}
              </Badge>
            </TableCell>
            <TableCell>{format(new Date(user.lastSeen), 'MMM d, yyyy')}</TableCell>
            <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUpdateStatus(user._id, 'suspended')}>
                    <UserX className="mr-2 h-4 w-4" />
                    Suspend User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(user._id, 'active')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Activate User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 