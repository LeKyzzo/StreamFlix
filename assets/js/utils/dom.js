// dom.js - tiny DOM helpers
export const qs = (sel, root=document)=>root.querySelector(sel);
export const qsa = (sel, root=document)=>[...root.querySelectorAll(sel)];
export function el(tag, cls){ const e = document.createElement(tag); if(cls) e.className = cls; return e; }
export function setAttrs(node, attrs){ Object.entries(attrs).forEach(([k,v])=> node.setAttribute(k,String(v))); return node; }
