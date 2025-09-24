// assets/js/components/grid.js
import { qsa } from "../utils/dom.js";

export function fillGrid(root, items, renderItem) {
  root.innerHTML = "";
  const frag = document.createDocumentFragment();
  items.forEach((it) => frag.append(renderItem(it)));
  root.append(frag);
}

export function showSkeletons(root, count = 8, skeletonFactory) {
  root.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) frag.append(skeletonFactory());
  root.append(frag);
}

export function readQueryParams() {
  return Object.fromEntries(new URL(location.href).searchParams.entries());
}

export function bindSearch(formSelector, inputSelector, onSubmit) {
  const form = document.querySelector(formSelector);
  const input = document.querySelector(inputSelector);
  if (!form || !input) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    onSubmit(q);
  });
}
