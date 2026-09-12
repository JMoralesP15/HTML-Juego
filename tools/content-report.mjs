// Generates an auditable editorial/geographic baseline without mutating question content.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ console, Date, Map, Set, Math, JSON, Intl, URL, encodeURIComponent, document: { getElementById(){ return null; } }, localStorage: { getItem(){ return null; }, setItem(){} } });
for (const name of ['content','scheduler','calendar','editorial','content-v12','storage']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'js', `${name}.js`), 'utf8'), context, { filename: `${name}.js` });
}
const questions = vm.runInContext('QUESTIONS', context);
const countBy = key => Object.fromEntries([...questions.reduce((map, q) => map.set(q[key] || 'Sin dato', (map.get(q[key] || 'Sin dato') || 0) + 1), new Map())].sort((a,b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))));
const isGeneratedImage = q => typeof q.image === 'string' && q.image.startsWith('data:image/svg+xml;charset=utf-8,');
const contexts = questions.filter(q => q.extendedContext);
const pending = contexts.filter(q => q.extendedContext?.reviewNeeded);
const regions = countBy('region');
const topRegions = Object.entries(regions).slice(0, 4);

const pendingReview = pending.map(q => ({
  id: q.id,
  title: q.title,
  category: q.category,
  region: q.region || null,
  hasSource: Boolean(q.source),
  imageClass: isGeneratedImage(q) ? 'generated_editorial_plate' : (q.image ? 'existing_asset' : 'none'),
  priority: q.source ? 'medium' : 'high'
})).sort((a,b) => (a.priority === b.priority ? 0 : a.priority === 'high' ? -1 : 1) || String(a.id).localeCompare(String(b.id)));

const report = {
  methodology: {
    reviewPriority: 'High = reviewNeeded without source URL; Medium = reviewNeeded with source URL. This is triage, not factual verification.',
    imageClassification: 'Generated editorial plate = embedded SVG created by content-v12; existing asset = non-embedded image. Existing does not automatically mean verified.'
  },
  totalQuestions: questions.length,
  categories: countBy('category'),
  difficulties: countBy('difficulty'),
  regions,
  regionConcentration: {
    top4: topRegions,
    top4Count: topRegions.reduce((sum, [,n]) => sum + n, 0),
    top4Share: questions.length ? topRegions.reduce((sum, [,n]) => sum + n, 0) / questions.length : 0
  },
  coverage: {
    withImage: questions.filter(q => q.image).length,
    generatedEditorialPlates: questions.filter(isGeneratedImage).length,
    existingImageAssets: questions.filter(q => q.image && !isGeneratedImage(q)).length,
    withExtendedContext: contexts.length,
    contextPendingReview: pending.length,
    contextNotMarkedForReview: contexts.length - pending.length
  },
  pendingReview
};

const outDir = path.join(root, 'reports');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'content-metrics.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
