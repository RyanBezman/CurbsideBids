import { ScreenHeader } from "../../../shared/ui";

type AuthHeaderProps = {
  title: string;
  onBack: () => void;
};

export function AuthHeader({ title, onBack }: AuthHeaderProps) {
  return <ScreenHeader title={title} onBack={onBack} className="flex-row items-center mb-8" />;
}
