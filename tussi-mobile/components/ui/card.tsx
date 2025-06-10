import * as React from 'react';
import { View } from 'react-native';

import { cn } from '../../lib/utils';

const Card = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn(
      'rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export { Card }; 