const COMPLETION_FIELDS = [
  { key: 'niches', test: (p, f) => f.niches?.length > 0 || (!!p?.niche) || (p?.niches?.length > 0) },
  { key: 'platforms', test: (p, f) => f.platforms?.length > 0 || !!p?.platformFocus },
  { key: 'goals', test: (p, f) => f.goals?.length > 0 || !!p?.goals },
  { key: 'photo', test: (p, f) => !!f.profilePhoto || !!p?.profilePhoto },
  { key: 'username', test: (p, f) => !!f.username || !!p?.username },
  { key: 'country', test: (p, f) => !!f.country || !!p?.country },
  { key: 'languages', test: (p, f) => (f.languages?.length > 0) || (p?.language && p.language.length > 0) },
];

export function calcCompletion(profile, formExtras) {
  const p = profile || {};
  const f = formExtras || {};
  const filled = COMPLETION_FIELDS.filter((field) => field.test(p, f)).length;
  const details = COMPLETION_FIELDS.map((field) => ({ key: field.key, done: field.test(p, f) }));
  return { percent: Math.round((filled / COMPLETION_FIELDS.length) * 100), total: COMPLETION_FIELDS.length, filled, details };
}
