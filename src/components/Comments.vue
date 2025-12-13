<template>
  <div class="comments">
    <div class="comments-title">评论</div>
    <form class="comment-form" @submit.prevent="submitComment" aria-label="发表评论">
      <input v-model="cName" type="text" placeholder="昵称" aria-label="昵称" />
      <input v-model="cEmail" type="email" placeholder="邮箱" aria-label="邮箱" />
      <textarea v-model="cBody" rows="3" placeholder="留言" aria-label="留言"></textarea>
      <button type="submit">提交</button>
    </form>
    <ul class="comment-list">
      <li v-for="c in comments" :key="c.id" class="comment-item">
        <div class="meta">{{ c.name }} · {{ c.date }}</div>
        <div class="body">{{ c.body }}</div>
        <div class="comment-actions">
          <button class="reply-btn" @click="toggleReplyForm(c.id)">回复</button>
        </div>
        <div v-if="isReplying(c.id)" class="reply-form">
          <input v-model="replyInputs[c.id].name" type="text" placeholder="昵称" aria-label="昵称" />
          <input v-model="replyInputs[c.id].email" type="email" placeholder="邮箱" aria-label="邮箱" />
          <textarea v-model="replyInputs[c.id].body" rows="2" placeholder="回复内容" aria-label="回复内容"></textarea>
          <div class="reply-actions">
            <button class="reply-submit" @click="submitReply(c.id)">提交回复</button>
            <button class="reply-cancel" @click="toggleReplyForm(c.id)">取消</button>
          </div>
        </div>
        <ul v-if="c.replies && c.replies.length" class="reply-list">
          <li v-for="r in visibleReplies(c)" :key="r.id" :class="['reply-item', isTracked(c.id, r.id) ? 'tracked' : '']">
            <div class="meta">
              {{ r.name }} · {{ r.date }}<span v-if="r.replyToName"> · 回复 @{{ r.replyToName }}</span>
            </div>
            <div class="body">{{ r.body }}</div>
            <div class="comment-actions">
              <button class="reply-btn" @click="toggleReplyForm(r.id)">回复</button>
              <button class="reply-btn" @click="toggleTrack(c.id, r.id)">追踪对话</button>
            </div>
            <div v-if="isReplying(r.id)" class="reply-form">
              <input v-model="replyInputs[r.id].name" type="text" placeholder="昵称" aria-label="昵称" />
              <input v-model="replyInputs[r.id].email" type="email" placeholder="邮箱" aria-label="邮箱" />
              <textarea v-model="replyInputs[r.id].body" rows="2" placeholder="回复内容" aria-label="回复内容"></textarea>
              <div class="reply-actions">
                <button class="reply-submit" @click="submitReply(c.id, r.id)">提交回复</button>
                <button class="reply-cancel" @click="toggleReplyForm(r.id)">取消</button>
              </div>
            </div>
          </li>
        </ul>
        <div v-if="hasMoreReplies(c)" class="comment-actions">
          <button class="reply-btn" @click="toggleRepliesExpand(c.id)">
            {{ isExpanded(c.id) ? '收起' : `显示全部 ${c.replies.length} 条` }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getPostComments } from '@/api/post.js';

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true,
  },
});

const cName = ref('');
const cEmail = ref('');
const cBody = ref('');
const comments = ref([]);
const replyInputs = ref({});
const replyingTo = ref(new Set());
const expandedReplies = ref(new Set());
const tracked = ref({ commentId: null, replyId: null });

function submitComment() {
  const name = cName.value.trim();
  const body = cBody.value.trim();
  if (!name || !body) return;
  const email = cEmail.value.trim();
  const item = {
    name,
    email,
    body,
    date: new Date().toLocaleString(),
    id: Date.now(),
    replies: [],
  };
  comments.value = [item, ...comments.value];
  cName.value = '';
  cEmail.value = '';
  cBody.value = '';
}

function toggleReplyForm(id) {
  if (!replyInputs.value[id]) {
    replyInputs.value[id] = { name: '', email: '', body: '' };
  }
  const set = replyingTo.value;
  if (set.has(id)) set.delete(id);
  else set.add(id);
  replyingTo.value = new Set(set);
}
function isReplying(id) {
  return replyingTo.value.has(id);
}
function toggleRepliesExpand(id) {
  const es = expandedReplies.value;
  if (es.has(id)) es.delete(id);
  else es.add(id);
  expandedReplies.value = new Set(es);
}
function isExpanded(id) {
  return expandedReplies.value.has(id);
}
function toggleTrack(commentId, replyId) {
  const t = tracked.value;
  if (t.commentId === commentId && t.replyId === replyId) {
    tracked.value = { commentId: null, replyId: null };
  } else {
    tracked.value = { commentId, replyId };
  }
}
function buildReplyChainSet(replies, seedId) {
  const byId = new Map();
  const childrenMap = new Map();
  replies.forEach((r) => {
    byId.set(r.id, r);
    const pid = r.replyToId;
    if (pid) {
      const arr = childrenMap.get(pid) || [];
      arr.push(r.id);
      childrenMap.set(pid, arr);
    }
  });
  const set = new Set();
  const queue = [];
  if (seedId) queue.push(seedId);
  while (queue.length) {
    const id = queue.shift();
    if (set.has(id)) continue;
    set.add(id);
    const r = byId.get(id);
    if (r && r.replyToId && !set.has(r.replyToId)) queue.push(r.replyToId);
    const kids = childrenMap.get(id) || [];
    kids.forEach((cid) => {
      if (!set.has(cid)) queue.push(cid);
    });
  }
  return set;
}
function isTracked(commentId, replyId) {
  return (
    tracked.value.commentId === commentId &&
    tracked.value.replyId &&
    buildReplyChainSet(
      (comments.value.find((x) => x.id === commentId)?.replies || []),
      tracked.value.replyId
    ).has(replyId)
  );
}

function submitReply(parentId, replyToId) {
  const formId = replyToId || parentId;
  const input = replyInputs.value[formId] || { name: '', email: '', body: '' };
  const name = String(input.name || '').trim();
  const body = String(input.body || '').trim();
  if (!name || !body) return;
  const email = String(input.email || '').trim();
  let replyToName = '';
  if (replyToId) {
    const parent = comments.value.find((x) => x.id === parentId);
    const target =
      parent && Array.isArray(parent.replies)
        ? parent.replies.find((r) => r.id === replyToId)
        : null;
    replyToName = target?.name || '';
  }
  const reply = {
    name,
    email,
    body,
    date: new Date().toLocaleString(),
    id: Date.now(),
    replyToId: replyToId || null,
    replyToName: replyToName || '',
  };
  const parent = comments.value.find((x) => x.id === parentId);
  if (parent) {
    const prev = Array.isArray(parent.replies) ? parent.replies : [];
    parent.replies = [...prev, reply];
  }
  replyInputs.value[formId] = { name: '', email: '', body: '' };
  const set = replyingTo.value;
  if (set.has(formId)) set.delete(formId);
  replyingTo.value = new Set(set);
}

function hasMoreReplies(c) {
  return Array.isArray(c.replies) && c.replies.length > 5;
}
function visibleReplies(c) {
  const all = Array.isArray(c.replies) ? c.replies : [];
  const expanded = isExpanded(c.id);
  const overMax = all.length > 5;
  return expanded || !overMax ? all : all.slice(0, 5);
}

onMounted(async () => {
  try {
    const list = await getPostComments(props.postId);
    if (Array.isArray(list))
      comments.value = list.map((c, i) => ({
        ...c,
        id: Date.now() + i,
        replies: [],
      }));
  } catch {}
});
</script>

<style scoped lang="scss">
.comments-title {
  font-weight: 700;
  margin-bottom: 8px;
}
.comment-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 10px;
  margin-bottom: 12px;
}
.comment-form input,
.comment-form textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--theme-color-border);
  background: var(--panel);
  color: var(--text);
}
.comment-form textarea {
  grid-column: 1 / 3;
}
.comment-form button {
  grid-column: 1 / 3;
  height: 40px;
  border-radius: 8px;
  border: 0;
  background: var(--theme-color-active);
  color: var(--theme-color-active-text);
  cursor: pointer;
}
.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
.comment-item {
  padding: 10px 12px;
  border: 1px solid var(--theme-color-border);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.03);
}
.comment-item .meta {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 6px;
}
.comment-item .body {
  color: var(--text);
}
.comment-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.reply-btn,
.reply-submit,
.reply-cancel {
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--theme-color-border);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  padding: 0 10px;
}
.reply-submit {
  background: var(--theme-color-active);
  color: var(--theme-color-active-text);
  border: 0;
}
.reply-form {
  margin-top: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 10px;
}
.reply-form input,
.reply-form textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--theme-color-border);
  background: var(--panel);
  color: var(--text);
}
.reply-form textarea {
  grid-column: 1 / 3;
}
.reply-actions {
  grid-column: 1 / 3;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.reply-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  display: grid;
  gap: 8px;
}
.reply-item {
  padding: 8px 10px;
  border: 1px dashed var(--theme-color-border);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
}
.reply-item.tracked {
  border-color: var(--theme-color-active);
  background: rgba(59, 130, 246, 0.08);
}
</style>
