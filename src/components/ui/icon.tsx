import { DynamicIcon } from 'lucide-react/dynamic';
import { LucideProps } from 'lucide-react';

type IconProps = Omit<LucideProps, 'name'> & {
  name: string | null;
};

export function Icon({ name, ...props }: IconProps) {
  // @ts-ignore
  return <DynamicIcon name={name} {...props} />;
}