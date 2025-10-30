import { SetMetadata } from '@nestjs/common';

// Marks a route as public (skips the global AuthGuard)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
