/* QUÉ AÑO v1.5 analytics configuration.
 * The PostHog client key is intentionally a browser-side project key, not a secret.
 * Analytics is disabled for file://, localhost and automated QA so offline play remains untouched.
 */
(function () {
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const automated = Boolean(window.__QUE_ANO_DISABLE_ANALYTICS__);
  const localHost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';

  window.QUE_ANO_ANALYTICS_CONFIG = Object.freeze({
    version: '1.5.0-beta.1',
    enabled: !automated && protocol === 'https:' && !localHost,
    apiHost: 'https://us.i.posthog.com',
    projectKey: 'phc_vVvmeyHXHfNajoXMVHP3z6cPmqpMJMzr2jbhjRmyYRYS',
    featureFlags: Object.freeze({
      timerDuration: 'que-ano-timer-duration',
      speedBonus: 'que-ano-speed-bonus',
      progressiveContext: 'que-ano-progressive-context',
      compactSummary: 'que-ano-compact-summary'
    })
  });
})();