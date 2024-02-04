<template>
    <el-tabs class="tabs" v-model="activeTabName">

        <el-tab-pane label="TimeLine" name="first">
            <TimeLine />
        </el-tab-pane>

        <el-tab-pane label="List" name="second">
            <DayList />
        </el-tab-pane>

        <el-tab-pane label="ToDo" name="third">
            <ToDo />
        </el-tab-pane>
    </el-tabs>
</template>

<script setup lang="ts">
import DayList from '../pages/DayList.vue';
import TimeLine from '../pages/TimeLine.vue';
import ToDo from '../pages/ToDo.vue';

const activeTabName = 'first'

</script>

<style scoped>
</style>
