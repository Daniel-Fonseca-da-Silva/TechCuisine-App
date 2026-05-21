export type AlertColor = "green" | "blue" | "red" | "yellow" | "purple" | "orange";

export interface AlertColorClasses {
  bg: string;
  border: string;
  text: string;
  title: string;
  description: string;
  hover: string;
}

export const getColorClasses = (color: AlertColor = "green"): AlertColorClasses => {
  const colorMap: Record<AlertColor, AlertColorClasses> = {
    green: {
      bg: "bg-green-500/20",
      border: "border-green-500/30",
      text: "text-green-200",
      title: "text-green-100",
      description: "text-green-200/90",
      hover: "hover:bg-green-500/30",
    },
    blue: {
      bg: "bg-lime-500/20",
      border: "border-lime-500/30",
      text: "text-lime-200",
      title: "text-lime-100",
      description: "text-lime-200/90",
      hover: "hover:bg-lime-500/30",
    },
    red: {
      bg: "bg-red-500/20",
      border: "border-red-500/30",
      text: "text-red-200",
      title: "text-red-100",
      description: "text-red-200/90",
      hover: "hover:bg-red-500/30",
    },
    yellow: {
      bg: "bg-yellow-500/20",
      border: "border-yellow-500/30",
      text: "text-yellow-200",
      title: "text-yellow-100",
      description: "text-yellow-200/90",
      hover: "hover:bg-yellow-500/30",
    },
    purple: {
      bg: "bg-amber-500/20",
      border: "border-amber-500/30",
      text: "text-amber-200",
      title: "text-amber-100",
      description: "text-amber-200/90",
      hover: "hover:bg-amber-500/30",
    },
    orange: {
      bg: "bg-orange-500/20",
      border: "border-orange-500/30",
      text: "text-orange-200",
      title: "text-orange-100",
      description: "text-orange-200/90",
      hover: "hover:bg-orange-500/30",
    },
  };

  return colorMap[color];
};
