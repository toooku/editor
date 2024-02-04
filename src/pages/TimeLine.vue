<template>
    <h1>Time Line({{ currentDate }})</h1>
    <el-form :model="form" label-width="120px" label-position="top">
        <el-form-item>
            <el-input v-model="form.post" type="textarea" />
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

onMounted(() => {
    loadEntries();
});

</script>

<style scoped></style>
