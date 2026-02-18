import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
    const getColors = (status: string) => {
        switch (status.toUpperCase()) {
            case "PENDING":
            case "MATERIAL_REQUESTED":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "IN_PRODUCTION":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "COMPLETED":
            case "APPROVED":
            case "RECEIVED":
                return "bg-green-100 text-green-800 border-green-200";
            case "VERIFIED_BY_STAFF":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "CANCELLED":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "CRITICAL":
                return "bg-red-100 text-red-800 border-red-200";
            case "WARNING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <span
            className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                getColors(status),
                className
            )}
        >
            {status.replace(/_/g, " ")}
        </span>
    );
};
