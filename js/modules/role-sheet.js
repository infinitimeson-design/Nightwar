/* role-sheet.js — bottom sheet showing a role's two-layer copy
   (Narrative Identity vs. exact Gameplay Ability, per Master Copy Lock §33). */

let sheet, backdrop, elSide, elName, elIdentity, elAbility;

export function initRoleSheet() {
  sheet = document.getElementById('sheet');
  backdrop = document.getElementById('sheetBackdrop');
  elSide = document.getElementById('sheetSide');
  elName = document.getElementById('sheetName');
  elIdentity = document.getElementById('sheetIdentity');
  elAbility = document.getElementById('sheetAbility');

  document.getElementById('sheetClose')?.addEventListener('click', closeRoleSheet);
  backdrop?.addEventListener('click', closeRoleSheet);
}

export function openRoleSheet(role) {
  if (!sheet) return;
  elSide.textContent = role.label;
  elName.textContent = role.name;
  elIdentity.textContent = role.identity;
  elAbility.textContent = role.ability;
  sheet.classList.add('is-open');
  backdrop.classList.add('is-open');
}

export function closeRoleSheet() {
  sheet?.classList.remove('is-open');
  backdrop?.classList.remove('is-open');
}
