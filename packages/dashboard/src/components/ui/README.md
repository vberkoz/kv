# UI Component Library

Accessible, reusable component library built on Radix UI primitives with Tailwind CSS.

## Features

- ✅ **Accessible**: WCAG 2.1 compliant using Radix UI primitives
- 🎨 **Customizable**: Variants managed with class-variance-authority
- 📱 **Responsive**: Mobile-first design with touch-friendly interactions
- ⌨️ **Keyboard Navigation**: Full keyboard support for all interactive components
- 🎭 **Animations**: Smooth transitions and loading states
- 🔧 **Type-Safe**: Full TypeScript support with exported types

## Components

### Button

Button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Small</Button>
```

**Variants**: `default`, `destructive`, `outline`, `ghost`, `link`  
**Sizes**: `sm`, `default`, `lg`, `icon`

### Card

Layout component for content sections.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### Dialog

Accessible modal dialogs with overlay.

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

**Features**: Focus trap, scroll lock, Esc to close, click outside to close

### Dropdown Menu

Accessible dropdown menus with keyboard navigation.

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/DropdownMenu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Features**: Arrow key navigation, auto-positioning, collision detection

### Toast

Non-blocking notifications with auto-dismiss.

```tsx
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { toast } = useToast();
  
  return (
    <Button onClick={() => toast({
      title: 'Success!',
      description: 'Your action was completed.',
      variant: 'success',
    })}>
      Show Toast
    </Button>
  );
}
```

**Variants**: `default`, `success`, `destructive`  
**Features**: Auto-dismiss, swipe to dismiss, queue management

### Tooltip

Accessible tooltips with keyboard support.

```tsx
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip';

<Tooltip>
  <TooltipTrigger asChild>
    <Button>Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Tooltip content</p>
  </TooltipContent>
</Tooltip>
```

**Features**: Auto-positioning, configurable delay, keyboard accessible

### Skeleton

Loading state placeholders with pulse animation.

```tsx
import { Skeleton } from '@/components/ui/Skeleton';

<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />
```

## Utilities

### cn()

Merges Tailwind classes with conflict resolution.

```tsx
import { cn } from '@/lib/utils';

<div className={cn('bg-blue-500', isActive && 'bg-green-500')} />
```

Uses `clsx` for conditional classes and `tailwind-merge` to resolve conflicts.

## Setup

The component library is already set up in the dashboard. Make sure you have:

1. **TooltipProvider** wrapping your app (in `App.tsx`)
2. **Toaster** component rendered (in `App.tsx`)

```tsx
import { TooltipProvider } from '@/components/ui/Tooltip';
import { Toaster } from '@/components/Toaster';

function App() {
  return (
    <TooltipProvider>
      {/* Your app */}
      <Toaster />
    </TooltipProvider>
  );
}
```

## Examples

See `src/components/UIExamples.tsx` for complete usage examples of all components.

## Dependencies

- `@radix-ui/react-dialog` - Dialog primitives
- `@radix-ui/react-dropdown-menu` - Dropdown menu primitives
- `@radix-ui/react-toast` - Toast primitives
- `@radix-ui/react-tooltip` - Tooltip primitives
- `class-variance-authority` - Component variants
- `clsx` - Conditional classes
- `tailwind-merge` - Tailwind class merging

## Accessibility

All components follow WCAG 2.1 guidelines:

- Keyboard navigation (Tab, Enter, Esc, Arrow keys)
- Screen reader support with ARIA attributes
- Focus management and visible focus indicators
- Touch-friendly tap targets (min 44x44px)
- Color contrast ratios meet AA standards

## Customization

Components use Tailwind CSS and can be customized by:

1. **Passing className**: Override styles with the `className` prop
2. **Modifying variants**: Edit variant definitions in component files
3. **Tailwind config**: Extend theme in `tailwind.config.js`

```tsx
// Override styles
<Button className="bg-purple-600 hover:bg-purple-700">
  Custom Button
</Button>

// Use variants
<Button variant="outline" size="lg">
  Large Outline Button
</Button>
```
