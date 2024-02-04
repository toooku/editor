<template>
    <h1>Time Line({{ currentDate }})</h1>
    <el-form :model="form" label-width="120px" label-position="top">
        <el-form-item>
            <el-input v-model="form.post" type="textarea" v-key-actions />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="onSubmit">Send</el-button>
            <el-button @click="deleteText">Cancel</el-button>
        </el-form-item>
    </el-form>

    <el-timeline>
        <el-timeline-item v-for="(activity, index) in displayedEntries" :key="index" :timestamp="activity.timestamp">
            <div style="white-space: pre-wrap;" v-text="activity.text" />
        </el-timeline-item>
    </el-timeline>

    <el-button type="primary" @click="writeEntriesToFile">Export Day TimeLine</el-button>
</template>

<script setup>
import { reactive, onMounted, ref } from "vue";
const { ipcRenderer } = window.require('electron')

const form = reactive({
    post: '',
})
const currentDate = ref(new Date().toLocaleDateString({ timeZone: "Asia/Tokyo" }));
const entries = ref([]);
const displayedEntries = ref([]);

const onSubmit = () => {
    if (form.post.trim().length === 0) {
        return;
    }

    const now = new Date().toLocaleString({ timeZone: "Asia/Tokyo" });

    const entry = {
        text: form.post,
        timestamp: now,
    };

    entries.value.unshift(entry);
    filterEntries();
    saveEntries();
    form.post = "";
};

const deleteText = () => {
    form.post = "";
}

const saveEntries = () => {
    localStorage.setItem("TimeLine", JSON.stringify(entries.value));
};

const loadEntries = () => {
    const savedEntries = localStorage.getItem("TimeLine");
    if (savedEntries) {
        entries.value = JSON.parse(savedEntries);
        filterEntries();
    }
};

const filterEntries = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    displayedEntries.value = entries.value
        .filter(entry => {
            const entryDate = new Date(entry.timestamp);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        })
        .sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateB - dateA; // 降順ソート
        });
};

const writeEntriesToFile = () => {
    const now = new Date();
    const japanTimeOffset = 9 * 60;
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + japanTimeOffset);
    const today = now.toISOString().split('T')[0];
    // その日のエントリーのみを選択
    const todayEntries = displayedEntries.value;
    const fileContent = todayEntries.map(entry => `${entry.text} - ${entry.timestamp}`).join('\n\n');
    ipcRenderer.send('write-to-file', { date: today, content: fileContent });
};

const handleKeydown = (event) => {
    const textarea = event.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (event.key === 'Tab') {
        event.preventDefault();
        const tabCharacter = '\t';

        // 選択されたテキストを取得
        const selectedText = textarea.value.substring(start, end);

        // 選択テキストに複数行が含まれているかチェック
        if (selectedText.includes('\n')) {
            // 選択された各行にタブを追加または削除
            const lines = selectedText.split('\n');

            // シフトキーが押されている場合はインデントを解除
            if (event.shiftKey) {
                const detabbedLines = lines.map(line =>
                    line.startsWith(tabCharacter) ? line.substring(1) : line
                ).join('\n');
                textarea.value = textarea.value.substring(0, start) + detabbedLines + textarea.value.substring(end);
                textarea.selectionStart = start;
                textarea.selectionEnd = start + detabbedLines.length;
            } else {
                // タブを各行の先頭に追加
                const tabbedLines = lines.map(line => tabCharacter + line).join('\n');
                textarea.value = textarea.value.substring(0, start) + tabbedLines + textarea.value.substring(end);
                textarea.selectionStart = start;
                textarea.selectionEnd = start + tabbedLines.length;
            }
        } else {
            // 選択範囲が1行の場合は通常のタブ処理
            textarea.value = textarea.value.substring(0, start) + tabCharacter + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + tabCharacter.length;
        }
    }

    // Enterキーの処理
    else if (event.key === 'Enter') {
        const line = textarea.value.substring(0, start).split("\n").pop();
        // 直前の行がハイフンで始まっている場合
        if (line.trim().startsWith('-')) {
            event.preventDefault();
            const newLineAndHyphen = "\n- ";
            textarea.value = textarea.value.substring(0, start) + newLineAndHyphen + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + newLineAndHyphen.length;
        }
    }
};

const vKeyActions = {
    mounted(el) {
        el.addEventListener('keydown', handleKeydown);
    },
    beforeUnmount(el) {
        el.removeEventListener('keydown', handleKeydown);
    },
};

onMounted(() => {
    loadEntries();
});

</script>

<style scoped></style>
