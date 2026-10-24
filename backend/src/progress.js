import { courseDays, FRESH_TERMS, lensOrder } from "./course.js";
import { PATH, TERMS } from "./glossary.js";

const HOME = { beginner: "today", amateur: "today", pro: "today" };

function dayList(user, key) {
  return user[key]?.[user.today] || [];
}

export function dailyGoal(user) {
  const lessonDone = user.lastLessonDate === user.today;
  const reads = dayList(user, "reads").length;
  const dives = dayList(user, "dives").length;
  if (user.level === "beginner") return { label: "1 lesson", progress: lessonDone ? 1 : 0, target: 1, met: lessonDone };
  if (user.level === "amateur") {
    const progress = lessonDone ? 3 : Math.min(reads, 3);
    return { label: "1 lesson or 3 posts", progress, target: 3, met: progress >= 3 };
  }
  const progress = Math.min(reads, 5) + Math.min(dives, 1);
  return { label: "5 posts + 1 deep dive", progress, target: 6, met: progress >= 6 };
}

export function questsFor(user) {
  const goal = dailyGoal(user);
  const lessonDone = user.lastLessonDate === user.today;
  const reads = dayList(user, "reads").length;
  const queued = user.queuedByDay?.[user.today] || 0;
  const decodes = user.decodesByDay?.[user.today] || 0;
  const level = user.level;
  const title = level === "beginner" ? "Finish today's lesson" : level === "amateur" ? "Lesson or 3 posts" : "5 posts + 1 deep dive";
  const streak = {
    id: "q_streak",
    kind: "streak",
    title,
    progress: goal.progress,
    target: goal.target,
    xp: 15,
    done: goal.met,
    action: level === "beginner" ? "lesson" : level === "pro" ? "pulse" : lessonDone ? "pulse" : "lesson",
  };
  const bonus = (id, questTitle, progress, target, xp, action) => ({
    id,
    kind: "bonus",
    title: questTitle,
    progress: Math.min(progress, target),
    target,
    xp,
    done: progress >= target,
    action,
  });
  const extras = level === "beginner"
    ? [bonus("q_read2", "Read 2 starter posts", reads, 2, 10, "pulse"), bonus("q_tap", "Save a new word from a post", queued, 1, 5, "pulse")]
    : level === "amateur"
      ? [bonus("q_tap", "Save a word for tomorrow", queued, 1, 10, "pulse"), bonus("q_decode", "Decode a post from elsewhere", decodes, 1, 15, "decode")]
      : [bonus("q_drill", "Do the catch-up drill", lessonDone ? 1 : 0, 1, 10, "lesson"), bonus("q_decode", "Decode a post from elsewhere", decodes, 1, 15, "decode")];
  return [streak, ...extras];
}

export function settleProgress(user) {
  for (const quest of questsFor(user)) {
    const key = `${user.today}:${quest.id}`;
    if (quest.kind === "bonus" && quest.done && !user.questXp[key]) {
      user.questXp[key] = true;
      user.xp += quest.xp;
    }
  }
  if (dailyGoal(user).met && user.lastGoalMetDate !== user.today) {
    user.streak += 1;
    user.lastGoalMetDate = user.today;
    user.xp += 15;
  }
}

function clamp(value) {
  return Math.max(3, Math.min(99, Math.round(value)));
}

export function percentiles(user, wordsKnown) {
  return {
    streak: clamp(18 + user.streak * 7),
    words: clamp((wordsKnown / (TERMS.length || 1)) * 92 + 4),
    xp: clamp(10 + Math.sqrt(user.xp) * 2.1),
  };
}

export function userExtras(user, wordsKnown) {
  return {
    lens: user.lens ?? null,
    homeTab: HOME[user.level] || "today",
    dailyGoal: dailyGoal(user),
    lessonDoneToday: user.lastLessonDate === user.today,
    lessonsCompleted: user.lessonsCompleted || 0,
    quests: questsFor(user),
    percentiles: percentiles(user, wordsKnown),
  };
}

export function pathFor(db, userId, termStatus) {
  const user = db.users[userId];
  const isKnown = (id) => termStatus(id) === "learning" || termStatus(id) === "known";
  const days = courseDays(user.lens);
  const pending = days.filter((day) => !day.termIds.every((id) => isKnown(id)));
  const base = user.lastLessonDate === user.today ? 1 : 0;
  let currentAssigned = false;
  return lensOrder(user.lens).map((chapter) => {
    const meta = PATH.find((unit) => unit.title === chapter) || { id: chapter, title: chapter, emoji: "✨" };
    const chapterDays = days.filter((day) => day.chapter === chapter).map((day) => {
      const index = pending.indexOf(day);
      return {
        id: day.id,
        n: day.n,
        title: day.title,
        terms: day.termIds.map((id) => {
          const term = db.terms.find((item) => item.id === id);
          return { id, term: term?.term || id, status: termStatus(id) };
        }),
        status: index === -1 ? "done" : index === 0 && base === 0 ? "today" : "upcoming",
        inDays: index === -1 ? -1 : index + base,
      };
    });
    const terms = chapterDays.flatMap((day) => day.terms);
    const progress = terms.length ? terms.filter((term) => isKnown(term.id)).length / terms.length : 0;
    let unitStatus = "locked";
    if (chapterDays.every((day) => day.status === "done")) unitStatus = "done";
    else if (!currentAssigned) {
      unitStatus = "current";
      currentAssigned = true;
    }
    return { ...meta, status: unitStatus, progress, days: chapterDays };
  });
}

export function lessonTermIds(db, userId, status) {
  const user = db.users[userId];
  const queued = Object.entries(db.userTerms[userId] || {})
    .filter(([, row]) => row.status === "queued")
    .map(([id]) => id)
    .slice(0, 3);
  const termIds = [...queued];
  const isPro = user.level === "pro";
  if (isPro) {
    for (const id of FRESH_TERMS) {
      if (termIds.length >= 3) break;
      if (status(id) === "new" && !termIds.includes(id)) termIds.push(id);
    }
  }
  const pending = courseDays(user.lens).filter((day) => !day.termIds.every((id) => status(id) === "learning" || status(id) === "known"));
  // One lesson = one path day, so finishing it never ticks off the next day too. Pros catch up faster.
  for (const day of isPro ? pending : pending.slice(0, 1)) {
    if (termIds.length >= 3) break;
    for (const id of day.termIds) {
      if (status(id) !== "learning" && status(id) !== "known" && !termIds.includes(id) && termIds.length < 3) termIds.push(id);
    }
  }
  return termIds;
}

export function presentPost(post, status) {
  const point = post.whyItMatters || "This is a current AI story.";
  return {
    ...post,
    terms: (post.terms || []).map((term) => ({ ...term, status: status(term.id) })),
    whyItMattersByLens: {
      researcher: `The research question: ${point}`,
      builder: `What you can ship: ${point}`,
      investor: `Where the money moves: ${point}`,
      operator: `What changes at work: ${point}`,
    },
    debate: post.debate || (post.terms?.[0]
      ? `The other reading: this may overstate how much ${post.terms[0].term} changes the outcome.`
      : "The other reading: one headline is not a trend."),
  };
}
