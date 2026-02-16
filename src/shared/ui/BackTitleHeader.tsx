import { ScreenHeader } from "./ScreenHeader";

type BackTitleHeaderProps = {
  title: string;
  onBack: () => void;
};

export function BackTitleHeader({ title, onBack }: BackTitleHeaderProps) {
  return <ScreenHeader title={title} onBack={onBack} />;
}
