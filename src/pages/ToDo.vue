<template>
    <h1>ToDo</h1>
    <el-form :model="form" label-width="120px" label-position="top">
        <el-form-item>
            <el-input v-model="form.todo" placeholder="Add new todo" type="text" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="onSubmit">Add</el-button>
        </el-form-item>
    </el-form>

    <ul>
        <li v-for="(entry, index) in entries" :key="index">
            <div class="checkbox-container">
                <el-checkbox v-model="entry.status" @change="() => updateEntry(index)" />
                <span>&nbsp;&nbsp;</span>
                <span class="text" :class="{ completed: entry.status }">
                    {{ entry.text }} - {{ entry.timestamp }}
                </span>
                <span>&nbsp;&nbsp;</span>
                <span class="delete" @click="() => deleteEntry(index)">delete</span>
            </div>
        </li>
    </ul>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';

const form = reactive({
    todo: ''
});

const entries = ref([]);

const onSubmit = () => {
    if (form.todo.trim().length === 0) {
        return;
    }

    const now = new Date().toLocaleString({ timeZone: "Asia/Tokyo" });

    const newEntry = {
        text: form.todo,
        timestamp: now,
        status: false
    };

    entries.value.unshift(newEntry);
    saveEntries();
    form.todo = '';
};

const updateEntry = () => {
    saveEntries();
};

const deleteEntry = (index) => {
    // Delete the entry based on the index
    entries.value.splice(index, 1);
    saveEntries();
};

const saveEntries = () => {
    localStorage.setItem('todos', JSON.stringify(entries.value));
    loadEntries();
};

const loadEntries = () => {
    const loadedEntries = localStorage.getItem('todos');
    if (loadedEntries) {
        entries.value = JSON.parse(loadedEntries);
    }
};

onMounted(() => {
    loadEntries();
});
</script>

<style scoped>
.completed {
    text-decoration: line-through;
}

:deep(.el-checkbox__input.is-checked+.el-checkbox__label) {
    color: var(--el-checkbox-text-color) !important;
}

:deep(.el-checkbox__label) {
    display: block;
    word-break: break-word;
    white-space: normal;
    overflow-wrap: break-word;
}

.text {
    font-size: 13px;
    color: #303133;
}

.delete {
    font-size: 13px;
    color: blueviolet;
}

.checkbox-container {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

ul {
    list-style-type: none;
}
</style>
