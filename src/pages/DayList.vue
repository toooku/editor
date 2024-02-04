<template>
    <h1>DayList</h1>
    <el-collapse @change="handleCollapseChange">
        <el-collapse-item v-for="([date, entries]) in Object.entries(entriesByDate)" :key="date" :name="date">
            <template #title>
                <strong>{{ date }}</strong>
            </template>
            <ul>
                <li v-for="(entry, entryIndex) in entries" :key="entryIndex">
                    <div style="white-space: pre-wrap;" v-text="entry.text + '\n' + '- ' + entry.timestamp"></div>
                </li>
            </ul>
        </el-collapse-item>
    </el-collapse>
</template>

<script setup>
import { ref, onMounted } from "vue";

const entriesByDate = ref({});

const loadEntries = () => {
    const savedEntries = localStorage.getItem('TimeLine');
    if (savedEntries) {
        const entriesArray = JSON.parse(savedEntries);
        entriesByDate.value = {};
        entriesArray.forEach(entry => {
            const date = entry.timestamp.split(' ')[0];
            if (!entriesByDate.value[date]) {
                entriesByDate.value[date] = [];
            }
            entriesByDate.value[date].push({
                text: entry.text,
                timestamp: entry.timestamp
            });
        });
    }
};

const handleCollapseChange = () => {
    loadEntries();
};

onMounted(() => {
    loadEntries();
});

</script>

<style scoped></style>
