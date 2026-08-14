declare const router: import("express-serve-static-core").Router;
/**
 * An employee's effective hours: their override merged over the company
 * default, field by field. A NULL column in employee_schedules means "inherit",
 * so the override row can set only the parts that actually differ.
 *
 * Exported because the scheduling conflict checks need the same resolution —
 * two implementations would drift.
 */
export declare function resolveSchedule(employeeId: number): Promise<{
    workDays: any;
    startTime: any;
    endTime: any;
    breakMinutes: any;
    timezone: any;
    source: "default";
} | {
    workDays: any;
    startTime: any;
    endTime: any;
    breakMinutes: any;
    timezone: any;
    source: "override";
}>;
export default router;
