import * as React from 'react';
import { Pressable, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-pink-500',
        destructive: 'bg-red-500',
        outline: 'border border-pink-500 bg-transparent',
        secondary: 'bg-gray-200',
        ghost: 'bg-transparent',
        link: 'bg-transparent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  'text-center text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'text-white',
        destructive: 'text-white',
        outline: 'text-pink-500',
        secondary: 'text-gray-800',
        ghost: 'text-pink-500',
        link: 'text-pink-500 underline',
      },
    },
    defaultVariants: {
        variant: 'default'
    }
  }
);


const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  React.ComponentPropsWithoutRef<typeof Pressable> &
    VariantProps<typeof buttonVariants> & {
      textClass?: string;
    }
>(({ className, variant, size, children, textClass, ...props }, ref) => {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
        <Text className={cn(buttonTextVariants({ variant, className: textClass }))}>{children}</Text>
    </Pressable>
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants }; 