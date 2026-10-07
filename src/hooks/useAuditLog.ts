import { useLocalStorage } from "./useLocalStorage";
import { AuditLog, User } from "../data/types";
import { INITIAL_AUDIT_LOGS } from "../data/mock-data";

export function useAuditLog(currentUser: User | null) {
  const [logs, setLogs] = useLocalStorage<AuditLog[]>("lupao-audit-logs", INITIAL_AUDIT_LOGS);

  const addLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: "Just now",
      username: currentUser?.username || "system",
      role: currentUser?.role || "System Administrator",
      action,
      module,
      details,
      ipAddress: "192.168.1." + Math.floor(10 + Math.random() * 80),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  return { logs, addLog, setLogs };
}
