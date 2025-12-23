/**
 * UI Component Library Examples
 * 
 * This file demonstrates how to use the new UI components.
 * Import components from '@/components/ui' and use them in your pages.
 */

import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/Dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/ui/DropdownMenu';
import { Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/Tooltip';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../hooks/useToast';

export function UIExamples() {
  const { toast } = useToast();

  return (
    <div className="p-8 space-y-8">
      {/* Button Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Different button variants and sizes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </CardContent>
      </Card>

      {/* Dialog Example */}
      <Card>
        <CardHeader>
          <CardTitle>Dialog</CardTitle>
          <CardDescription>Accessible modal dialog</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  This is a dialog description. Dialogs are accessible and keyboard navigable.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">Dialog content goes here</div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Dropdown Menu Example */}
      <Card>
        <CardHeader>
          <CardTitle>Dropdown Menu</CardTitle>
          <CardDescription>Accessible dropdown menu</CardDescription>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Tooltip Example */}
      <Card>
        <CardHeader>
          <CardTitle>Tooltip</CardTitle>
          <CardDescription>Hover to see tooltip</CardDescription>
        </CardHeader>
        <CardContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is a tooltip</p>
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

      {/* Toast Example */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
          <CardDescription>Show toast notifications</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            onClick={() =>
              toast({
                title: 'Success!',
                description: 'Your action was completed successfully.',
                variant: 'success',
              })
            }
          >
            Show Success Toast
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              toast({
                title: 'Error',
                description: 'Something went wrong.',
                variant: 'destructive',
              })
            }
          >
            Show Error Toast
          </Button>
        </CardContent>
      </Card>

      {/* Skeleton Example */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Skeletons</CardTitle>
          <CardDescription>Show loading states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>
  );
}
