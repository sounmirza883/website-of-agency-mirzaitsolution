declare const router: import("express-serve-static-core").Router;
/** The employee board says "Done", the admin board says "Completed". Both mean finished. */
export declare function isDone(status: string | null | undefined): boolean;
export default router;
