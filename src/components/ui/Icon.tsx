import * as React from "react";

/** Minimal inline icon set to avoid extra deps */
type P = React.SVGProps<SVGSVGElement>;
const base: P = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" };

export const IPlus = (p: P) => <svg {...base} {...p}><path d="M12 5v14M5 12h14"/></svg>;
export const ITrash = (p: P) => <svg {...base} {...p}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>;
export const IDownload = (p: P) => <svg {...base} {...p}><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg>;
export const IShare = (p: P) => <svg {...base} {...p}><path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v14"/></svg>;
export const IWhatsapp = (p: P) => <svg {...base} {...p}><path d="M21 12a9 9 0 11-3.6-7.2L21 3l-1.2 3.6A9 9 0 0121 12z"/><path d="M8 11c.5 2 2 3.5 4 4l1.5-1.5 2.5 1-1 2.5c-4 0-8-4-8-8l2.5-1 1 2.5L8 11z"/></svg>;
export const IMail = (p: P) => <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
export const IFile = (p: P) => <svg {...base} {...p}><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z"/><path d="M14 3v6h6"/></svg>;
export const IEye = (p: P) => <svg {...base} {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>;
export const IEdit = (p: P) => <svg {...base} {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
export const IUser = (p: P) => <svg {...base} {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>;
export const IBriefcase = (p: P) => <svg {...base} {...p}><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
export const IReceipt = (p: P) => <svg {...base} {...p}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>;
export const ILogo = (p: P) => <svg {...base} {...p} strokeWidth={2}><path d="M6 3h9l3 3v15H6z"/><path d="M9 8h6M9 12h6M9 16h4"/><circle cx="18" cy="7" r="3" fill="currentColor" stroke="none"/></svg>;
export const IChevron = (p: P) => <svg {...base} {...p}><path d="M6 9l6 6 6-6"/></svg>;
export const ICheck = (p: P) => <svg {...base} {...p}><path d="M5 12l5 5L20 7"/></svg>;
export const IX = (p: P) => <svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
export const ISparkle = (p: P) => <svg {...base} {...p}><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>;
export const IMenu = (p: P) => <svg {...base} {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
export const IPhone = (p: P) => <svg {...base} {...p}><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.4 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6A2 2 0 0122 16.9z"/></svg>;
