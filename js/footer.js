const MGG_VERSION = 'v3.2';

(function injectFooter() {
  document.querySelectorAll('.site-footer').forEach(footer => {
    footer.innerHTML = `
      <span data-i18n="footerBy">Site by SpikerMan666. All rights reserved ©.</span>
      <span class="footer-version">${MGG_VERSION}</span>
    `;
  });
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.site-footer').forEach(footer => {
      footer.innerHTML = `
        <span data-i18n="footerBy">Site by SpikerMan666. All rights reserved ©.</span>
        <span class="footer-version">${MGG_VERSION}</span>
      `;
    });
  });
}
