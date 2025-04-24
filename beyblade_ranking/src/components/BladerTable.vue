<script setup>
    import { DataTable, Column, Dialog, Avatar, Panel, Divider, Message, InputText, Button, Toolbar, ToggleSwitch } from 'primevue';
    import { Bladers } from '../service/BladersService';
    import { onMounted, ref } from 'vue';
    import { FilterMatchMode } from '@primevue/core/api';

    onMounted(() => {
        data.value = Bladers.getBladers()
        data.value.sort((a, b) => b.points - a.points);
        for(let i=1; i<=data.value.length; i++){
            data.value[i-1].rank = i.toString()
        }
    })

    const data = ref([])
    const columns = [
        {field: 'rank', header: 'Rank'},
        {field: 'name', header: 'Name'},
        {field: 'points', header: 'Points'},
    ]

    const filters = ref({
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });

    const organizerMode = ref(false)
    const apiKey = ref("")
    const communityId = ref("wbbx")
    const tournamentId = ref("")

    const bladerPopup = ref(false)
    const selectedBladerRef = ref()
    function popupBlader(selectedBlader){
        selectedBladerRef.value = selectedBlader
        bladerPopup.value = true
    }
</script>

<template>
    <Toolbar>
    <template #start>
        <InputText v-model="filters['name'].value" placeholder="Search for Blader" />
    </template>
    </Toolbar>
    <DataTable v-model:filters="filters" removableSort :value="data" sortField="rank" :sortOrder="1" selectionMode="single" v-model:selection="selectedBladerRef" stripedRows paginator :rows="10"
    @rowSelect="popupBlader">
        <Column v-for="col of columns" sortable :key="col.field" :field="col.field" :header="col.header"></Column>
    </DataTable>

    <Dialog v-model:visible="bladerPopup" style="min-width: 20vw;">
        <template #header>
        <div class="fadeIn">
            <Avatar :label="'#' + selectedBladerRef.data['rank']" shape="circle"></Avatar> {{ selectedBladerRef.data["name"] }}<span v-show="selectedBladerRef.data['blader_name']">, "{{ selectedBladerRef.data['blader_name'] }}"</span>
        </div>
        </template>
        <div class="fadeInDelay1Sec">
        <Panel header="Description:">
            <div v-if="selectedBladerRef.data['Description']">{{selectedBladerRef.data['Description']}}</div>
            <div v-if="!selectedBladerRef.data['Description']">[NO DATA AVAILABLE]</div>
        </Panel>
        </div>
        
        <div class="fadeInDelay2Sec">
        <Divider></Divider>

        <Message severity="success" icon="pi pi-trophy">
            Total Podiums: {{ selectedBladerRef.data['Total Wins'] }}
        </Message>
        <div class="bladerField">
            <i class="pi pi-angle-right"></i>
            First Place Finishes: {{ selectedBladerRef.data['First Place Finishes'] }}
        </div>
        <div class="bladerField">
            <i class="pi pi-angle-right"></i>
            Second Place Finishes: {{ selectedBladerRef.data['Second Place Finishes'] }}
        </div>
        <div class="bladerField">
            <i class="pi pi-angle-right"></i>
            Third Place Finishes: {{ selectedBladerRef.data['Third Place Finishes'] }}
        </div>
        <div class="bladerField">
            <i class="pi pi-angle-right"></i>
            Swiss Wins: {{ selectedBladerRef.data['Swiss Wins'] }}
        </div>

        <Divider></Divider>

        <Message v-if="selectedBladerRef.data['Signature Combo']" severity="warn" icon="pi pi-exclamation-triangle">
            Signature Combo: {{ selectedBladerRef.data['Signature Combo'] }}
        </Message>
        <Message v-if="!selectedBladerRef.data['Signature Combo']" severity="info" icon="pi pi-info">
            Signature Combo: [NO DATA AVAILABLE]
        </Message>
        </div>
        <template #footer>
        <Divider></Divider>
        </template>
    </Dialog>
</template>

<style>
    
</style>