import { Prompt, Poppins } from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '700'], // Add other weights if needed
});

export const prompt = Prompt({
  subsets: ['latin'],
  weight: ['600', '700', '900'], // You can specify the weights you need
  display: 'swap',
});
