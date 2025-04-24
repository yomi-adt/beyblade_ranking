<script setup>
    import { DataTable, Column, Dialog, Divider, InputText, Button, Toolbar, IftaLabel, Textarea } from 'primevue';
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
        console.log(selectedBlader)
        bladerPopup.value = true
        build1.value = ""
        build2.value = ""
        build3.value = ""
        if(selectedBlader !== null){
            blader_id.value = selectedBlader.data.id
            name.value = selectedBlader.data.name
            blader_name.value = selectedBlader.data.blader_name
        }
        else {
            blader_id.value = -1
            name.value = ""
            blader_name.value = ""
        }

        showCommand.value = false
    }

    function generateApiCall(){
        showCommand.value = true

        let curlHeaders = '-H "Content-Type: application/vnd.api+json" -H "Accept: application/json" -H "Authorization: '+apiKey.value+'" '
        let curlData = '-d "{\\"data\\":{\\"type\\":\\"Participants\\",\\"attributes\\":{\\"name\\":\\"'+name.value+'\\",\\"seed\\":1,\\"misc\\":\\"id:'+blader_id.value+', blader_name:'+blader_name.value+', deck:'+build1.value+' '+build2.value+' '+build3.value+',\\"}}}"'
        let curlCommand = "curl -X POST https://api.challonge.com/v2.1/communities/"+communityId.value+"/tournaments/"+tournamentId.value+"/participants.json "
                        + curlHeaders + curlData

        command.value = curlCommand
    }

    // Command for curl api call to add blader
    const command = ref("Negotiation is definitely a normal part of buying and selling, and different strategies exist depending on the situation. Some people aim for the lowest possible price, while others look for a fair balance between price and value. The key is making sure both sides feel good about the deal—if a seller is comfortable accepting a lower offer, then that’s their choice!")
    const showCommand = ref(false)

    const blader_id = ref(1)
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
        <InputText placeholder="API Key" v-model="apiKey"></InputText>
        <InputText placeholder="Community ID" v-model="communityId"></InputText>
        <InputText placeholder="Tournament URL" v-model="tournamentId"></InputText>
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
            <h3>Add a new blader to the tournament!</h3>
        </template>
        <p>Blader id: {{ blader_id }}</p>
        <IftaLabel>
            <InputText id="name" v-model="name"></InputText>
            <label for="name">Name</label>
        </IftaLabel>
        <IftaLabel>
            <InputText id="blader_name" v-model="blader_name"></InputText>
            <label for="blader_name">Blader Name</label>
        </IftaLabel>
        <IftaLabel>
            <InputText id="bb1" v-model="build1"></InputText>
            <label for="bb1">Beyblade Build #1</label>
        </IftaLabel>
        <IftaLabel>
            <InputText id="bb2" v-model="build2"></InputText>
            <label for="bb2">Beyblade Build #2</label>
        </IftaLabel>
        <IftaLabel>
            <InputText id="bb3" v-model="build3"></InputText>
            <label for="bb3">Beyblade Build #3</label>
        </IftaLabel>
        <Button label="Get API call command" @click="generateApiCall"></Button>
        <Divider></Divider>
        <template #footer>
            <div v-show="showCommand">
                <p>Use this command in a cmd prompt to make the api call (Click field below, Ctrl+A, Ctrl+C, then Ctrl+v into command prompt)</p>
                <div>
                    <Textarea autoResize fluid v-model="command"></Textarea>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<style>
    
</style>