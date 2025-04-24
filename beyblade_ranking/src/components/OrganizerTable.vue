<script setup>
    import { DataTable, Column, Dialog, Divider, InputText, Button, Toolbar, ToggleSwitch } from 'primevue';
    import { Bladers } from '../service/BladersService';
    import { onMounted, ref } from 'vue';
    import { FilterMatchMode } from '@primevue/core/api';
    import { RouterLink } from 'vue-router';

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

    const organizerMode = ref(true)
    const apiKey = ref("")
    const communityId = ref("wbbx")
    const tournamentId = ref("")

    const bladerPopup = ref(false)
    const selectedBladerRef = ref()
    function popupBlader(selectedBlader){
        selectedBladerRef.value = selectedBlader
        bladerPopup.value = true

        showCommand.value = false
    }

    function generateApiCall(){
        showCommand.value = true
    }

    // Command for curl api call to add blader
    const command = ref("Negotiation is definitely a normal part of buying and selling, and different strategies exist depending on the situation. Some people aim for the lowest possible price, while others look for a fair balance between price and value. The key is making sure both sides feel good about the deal—if a seller is comfortable accepting a lower offer, then that’s their choice!")
    const showCommand = ref(false)

    const id = ref()
    const name = ref("")
    const blader_name = ref("")
    const build1 = ref("")
    const build2 = ref("")
    const build3 = ref("")
</script>

<template>
    <Toolbar>
    <template #start>
        <InputText v-model="filters['name'].value" placeholder="Search for Blader" />
    </template>

    <template #center>
        <div v-show="organizerMode">
        <InputText placeholder="API Key"></InputText>
        <InputText placeholder="Community ID" v-model="communityId"></InputText>
        <InputText placeholder="Tournament URL"></InputText>
        </div>
    </template>
    <template #end>
        <RouterLink to="/">Go Back to Public View</RouterLink>
    </template>
    </Toolbar>
    <DataTable v-model:filters="filters" removableSort :value="data" sortField="rank" :sortOrder="1" selectionMode="single" v-model:selection="selectedBladerRef" stripedRows paginator :rows="10"
    @rowSelect="popupBlader">

    <Column v-for="col of columns" sortable :key="col.field" :field="col.field" :header="col.header"></Column>
    <Column>
        <template #header>
            <Button label="New Blader" v-show="organizerMode" @click="popupBlader(null)"></Button>
        </template>
    </Column>
    </DataTable>

    <Dialog v-model:visible="bladerPopup" style="min-width: 20vw;">
        <template #header>
            Add a new blader to the tournament!
        </template>

        <InputText label="Name"></InputText>
        <InputText label="Blader Name"></InputText>
        <InputText label="Build 1"></InputText>
        <InputText label="Build 2"></InputText>
        <InputText label="Build 3"></InputText>
        <Button label="Get API call command" @click="generateApiCall"></Button>
        <Divider></Divider>
        <template #footer>
            <div v-show="showCommand">
                Use this command in a cmd prompt to make the api call (Click in the field, Ctrl+A, Ctrl+C, then Ctrl+v into command prompt)
                <InputText v-model="command"></InputText>
            </div>
        </template>
    </Dialog>
</template>

<style>
    
</style>