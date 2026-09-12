/* QUÉ AÑO v1.2.1 product analytics.
 * Non-blocking by design: gameplay never depends on PostHog or network availability.
 */
(function () {
  'use strict';

  const config = window.QUE_ANO_ANALYTICS_CONFIG || { enabled: false, version: '1.2.1', featureFlags: {} };
  const queue = [];
  const sent = new Set();
  let sdkReady = false;
  let runId = null;
  let feedbackStartedAt = null;
  let feedbackKey = null;
  let observer = null;

  const now = () => Date.now();
  const safeNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
  const cleanString = (value, max = 120) => typeof value === 'string' ? value.slice(0, max) : null;

  function safeRound() {
    try { return typeof round !== 'undefined' ? round : null; } catch { return null; }
  }

  function questionForCurrentRound() {
    const r = safeRound();
    if (!r || !Array.isArray(r.questionIds)) return null;
    try {
      const id = r.questionIds[r.index];
      return typeof QUESTION_BY_ID !== 'undefined' ? QUESTION_BY_ID.get(id) || null : null;
    } catch { return null; }
  }

  function latestAnswer() {
    const r = safeRound();
    if (!r || !Array.isArray(r.answers) || !r.answers.length) return null;
    return r.answers[r.answers.length - 1] || null;
  }

  function experimentProperties() {
    const out = {};
    if (!sdkReady || !window.posthog || typeof window.posthog.getFeatureFlag !== 'function') return out;
    for (const [label, key] of Object.entries(config.featureFlags || {})) {
      try {
        const value = window.posthog.getFeatureFlag(key);
        if (value !== undefined && value !== null && value !== false) out[`experiment_${label}`] = String(value);
      } catch { /* inactive/offline flags are intentionally ignored */ }
    }
    return out;
  }

  function commonProperties(question = questionForCurrentRound()) {
    const r = safeRound();
    return {
      app_version: config.version || '1.2.1',
      session_run_id: runId,
      session_mode: cleanString(r?.mode, 30),
      question_position: Number.isInteger(r?.index) ? r.index + 1 : null,
      question_id: cleanString(question?.id, 80),
      category: cleanString(question?.category, 80),
      subcategory: cleanString(question?.subcategory, 80),
      difficulty: cleanString(question?.difficulty, 30),
      region: cleanString(question?.region, 80),
      year: safeNumber(question?.year),
      image_type: cleanString(question?.imageType, 40),
      timer_duration: 15,
      speed_bonus_enabled: true,
      ...experimentProperties()
    };
  }

  function sanitize(properties) {
    const allowed = {};
    for (const [key, value] of Object.entries(properties || {})) {
      if (value === null || value === undefined || value === '') continue;
      if (['string', 'number', 'boolean'].includes(typeof value)) allowed[key] = value;
    }
    return allowed;
  }

  function capture(eventName, properties = {}) {
    if (!config.enabled) return false;
    const payload = { eventName, properties: sanitize(properties) };
    if (!sdkReady || !window.posthog || typeof window.posthog.capture !== 'function') {
      queue.push(payload);
      return false;
    }
    try {
      window.posthog.capture(eventName, payload.properties);
      return true;
    } catch { return false; }
  }

  function captureOnce(key, eventName, properties = {}) {
    if (sent.has(key)) return false;
    sent.add(key);
    return capture(eventName, properties);
  }

  function flush() {
    if (!sdkReady || !window.posthog) return;
    while (queue.length) {
      const payload = queue.shift();
      try { window.posthog.capture(payload.eventName, payload.properties); } catch { /* analytics must never block play */ }
    }
  }

  function loadPostHog() {
    if (!config.enabled || !config.projectKey || !config.apiHost || window.posthog) return;
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `${config.apiHost}/static/array.js`;
      script.onload = () => {
        try {
          if (!window.posthog || typeof window.posthog.init !== 'function') return;
          window.posthog.init(config.projectKey, {
            api_host: config.apiHost,
            autocapture: false,
            capture_pageview: false,
            capture_pageleave: false,
            disable_session_recording: true,
            person_profiles: 'never',
            persistence: 'localStorage+cookie',
            respect_dnt: true,
            loaded: () => { sdkReady = true; flush(); inspectState(); }
          });
        } catch { /* a failed SDK is equivalent to analytics being unavailable */ }
      };
      script.onerror = () => { sdkReady = false; };
      document.head.appendChild(script);
    } catch { sdkReady = false; }
  }

  function ensureRun() {
    const r = safeRound();
    if (!r) return null;
    if (!runId) {
      try { runId = crypto.randomUUID(); } catch { runId = `run-${now()}-${Math.random().toString(36).slice(2, 9)}`; }
      captureOnce(`session:${runId}`, 'session_started', commonProperties());
    }
    return runId;
  }

  function beginFeedback(key, properties) {
    if (feedbackKey === key) return;
    closeFeedback('state_change');
    feedbackKey = key;
    feedbackStartedAt = now();
    captureOnce(`feedback:${key}`, 'feedback_seen', properties);
  }

  function closeFeedback(reason = 'continue') {
    if (!feedbackKey || !feedbackStartedAt) return;
    capture('feedback_exited', {
      session_run_id: runId,
      feedback_key: feedbackKey,
      feedback_dwell_ms: Math.max(0, now() - feedbackStartedAt),
      exit_reason: reason,
      app_version: config.version || '1.2.1'
    });
    feedbackKey = null;
    feedbackStartedAt = null;
  }

  function resultState(answer) {
    if (!answer) return null;
    if (answer.skipped) return 'revealed';
    const error = safeNumber(answer.error);
    if (error === 0) return 'exact';
    if (error !== null && error <= 2) return 'near';
    if (error !== null && error <= 10) return 'medium';
    return error !== null ? 'far' : null;
  }

  function inspectState() {
    const r = safeRound();
    if (!r) return;
    ensureRun();
    const q = questionForCurrentRound();
    const position = Number.isInteger(r.index) ? r.index + 1 : null;
    const qKey = `${runId}:${position}:${q?.id || 'unknown'}`;

    if (r.phase === 'question' && q) {
      captureOnce(`seen:${qKey}`, 'question_seen', commonProperties(q));
      return;
    }

    if (r.phase === 'answer') {
      const answer = latestAnswer();
      const answerQuestion = answer && typeof QUESTION_BY_ID !== 'undefined' ? QUESTION_BY_ID.get(answer.id) || q : q;
      const base = commonProperties(answerQuestion);
      const props = {
        ...base,
        estimated_year: safeNumber(answer?.guess),
        error_abs: safeNumber(answer?.error),
        response_ms: safeNumber(answer?.elapsedMs),
        result_state: resultState(answer),
        skipped: Boolean(answer?.skipped),
        timed_out: Boolean(answer?.timedOut),
        base_points: safeNumber(answer?.basePoints),
        time_bonus: safeNumber(answer?.timeBonus),
        total_points: safeNumber(answer?.points)
      };
      captureOnce(`answer:${qKey}`, 'answer_submitted', props);
      if (answer?.timedOut) captureOnce(`timeout:${qKey}`, 'time_expired', props);
      if (answer?.skipped) captureOnce(`reveal:${qKey}`, 'date_revealed', props);
      beginFeedback(qKey, props);
    }
  }

  function inspectSummary() {
    try {
      if (typeof lastSummary === 'undefined' || !lastSummary) return;
      const s = lastSummary;
      captureOnce(`summary:${runId || s.date || 'unknown'}`, 'summary_seen', {
        app_version: config.version || '1.2.1',
        session_run_id: runId,
        session_mode: cleanString(s.mode, 30),
        answers_count: Array.isArray(s.answers) ? s.answers.length : null,
        mean_absolute_error: safeNumber(s.avg),
        exact_count: safeNumber(s.exact),
        total_points: safeNumber(s.total),
        speed_bonus_total: safeNumber(s.timeBonus),
        average_response_ms: safeNumber(s.avgElapsedMs)
      });
    } catch { /* summary is optional */ }
  }

  function handleClick(event) {
    const target = event.target?.closest?.('[data-action],[data-view],a');
    if (!target) return;
    const action = target.dataset?.action || null;
    const view = target.dataset?.view || null;

    if (action === 'detail') capture('context_opened', { ...commonProperties(), source: 'feedback_or_summary' });
    if (action === 'review-results' || action === 'start-due') capture('review_started', { ...commonProperties(), source: action });
    if (view === 'coleccion') capture('collection_opened', { ...commonProperties(), source: 'navigation' });
    if (view === 'repaso') capture('review_opened', { ...commonProperties(), source: 'navigation' });
    if (action === 'next' || action === 'review-results' || view) closeFeedback(action || view || 'continue');

    if (target.tagName === 'A' && target.closest('#detailDialog') && /^https?:/i.test(target.href || '')) {
      capture('source_opened', { ...commonProperties(), source_domain: (() => { try { return new URL(target.href).hostname; } catch { return null; } })() });
    }
    setTimeout(() => { inspectState(); inspectSummary(); }, 0);
  }

  function start() {
    captureOnce('landing', 'landing_viewed', { app_version: config.version || '1.2.1' });
    document.addEventListener('click', handleClick, true);
    observer = new MutationObserver(() => { inspectState(); inspectSummary(); });
    const view = document.getElementById('view');
    if (view) observer.observe(view, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'open'] });
    window.addEventListener('pagehide', () => { closeFeedback('pagehide'); capture('session_exited', { ...commonProperties(), session_run_id: runId }); });
    inspectState();
    inspectSummary();
    loadPostHog();
  }

  window.qyaAnalytics = Object.freeze({
    track: (eventName, properties = {}) => capture(String(eventName || '').slice(0, 80), properties),
    getVariant: (key) => {
      if (!sdkReady || !window.posthog || typeof window.posthog.getFeatureFlag !== 'function') return null;
      try { return window.posthog.getFeatureFlag(key) || null; } catch { return null; }
    },
    inspect: inspectState,
    config
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
