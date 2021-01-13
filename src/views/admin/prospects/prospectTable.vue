<template>
    <div class="adminProspects">
        <!-- User Interface controls -->
        <b-row class="flex-lg-row flex-column-reverse">
            <b-col lg="6">
                <b-form-group
                    label="Rechercher"
                    label-cols-sm="3"
                    label-size="sm"
                    label-for="filterInput"
                >
                    <b-input-group size="sm">
                        <b-form-input
                            v-model="filter"
                            type="search"
                            id="filterInput"
                            placeholder="Entrer pour chercher..."
                            class="rounded-0"
                        ></b-form-input>
                        <b-input-group-append>
                            <b-button :disabled="!filter" @click="filter = ''"
                                >Effacer</b-button
                            >
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>

            <b-col lg="6">
                <download-csv
                    v-if="this.prospects !== null"
                    :data="prospects"
                    name="prospects.csv"
                    class="btn btn-outline-primary float-lg-right mb-2"
                >
                    Exporter en .csv
                </download-csv>
            </b-col>
        </b-row>

        <b-row>
            <b-col lg="6">
                <b-form-group
                    label="Trier par"
                    label-cols-sm="3"
                    label-size="sm"
                    label-for="sortBySelect"
                >
                    <b-input-group size="sm">
                        <b-form-select
                            v-model="sortBy"
                            id="sortBySelect"
                            :options="sortOptions"
                            class="w-75"
                        >
                            <template v-slot:first>
                                <option value="">initial</option>
                            </template>
                        </b-form-select>
                        <b-form-select
                            v-model="sortDesc"
                            size="sm"
                            :disabled="!sortBy"
                            class="w-25"
                        >
                            <option :value="false">Ascendant</option>
                            <option :value="true">Descendant</option>
                        </b-form-select>
                    </b-input-group>
                </b-form-group>
            </b-col>

            <b-col lg="6">
                <b-form-group
                    label="Filtrer par"
                    label-cols-sm="3"
                    label-size="sm"
                    description="Ne rien cocher pour filtrer tout les champs"
                >
                    <b-form-checkbox-group v-model="filterOn" class="mt-1">
                        <b-form-checkbox value="name">Nom</b-form-checkbox>
                        <b-form-checkbox value="email">E-mail</b-form-checkbox>
                    </b-form-checkbox-group>
                </b-form-group>
            </b-col>

            <b-col sm="5" md="6">
                <b-form-group
                    label="Par page"
                    label-cols-sm="6"
                    label-cols-md="4"
                    label-cols-lg="3"
                    label-size="sm"
                    label-for="perPageSelect"
                >
                    <b-form-select
                        v-model="perPage"
                        id="perPageSelect"
                        size="sm"
                        :options="pageOptions"
                    ></b-form-select>
                </b-form-group>
            </b-col>

            <b-col sm="7" md="6">
                <b-pagination
                    class="float-right"
                    v-model="currentPage"
                    :total-rows="totalRows"
                    :per-page="perPage"
                    pills
                    size="sm"
                ></b-pagination>
            </b-col>
        </b-row>

        <!-- Main table element -->
        <b-table
            show-empty
            empty-text="Aucune données pour le moment."
            :v-if="this.prospects != null"
            :items="prospects"
            :fields="prospectsFields"
            :current-page="currentPage"
            :per-page="perPage"
            :filter="filter"
            :filterIncludedFields="filterOn"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :sort-direction="sortDirection"
            @filtered="onFiltered"
            class="mt-4 border-0 shadow-sm"
            head-variant="dark"
            responsive
        >
            <template v-slot:cell(actions)="row">
                <b-button
                    size="sm"
                    @click="prospect(row.item, row.index, $event.target)"
                    class="mr-1 my-1"
                    variant="info"
                >
                    Voir les infos
                </b-button>

                <b-button class="my-1" size="sm" @click="row.toggleDetails">
                    {{ row.detailsShowing ? "Fermer" : "Modifier" }}
                </b-button>
            </template>

            <template v-slot:cell(progress)="row">
                <b-progress max="100">
                    <b-progress-bar
                        :variant="
                            row.value === 33
                                ? 'warning'
                                : row.value === 66
                                ? 'primary'
                                : 'success'
                        "
                        :value="row.value"
                    ></b-progress-bar>
                </b-progress>
            </template>

            <template v-slot:row-details="row">
                <b-card>
                    <b-form>
                        <div v-for="(value, key) in row.item" :key="key">
                            <b-form-group
                                v-if="dropKey(key)"
                                :label="key"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-form-select
                                    v-if="key === 'status'"
                                    v-model="row.item[key]"
                                    :options="optionsStatus"
                                >
                                </b-form-select>

                                <b-form-select
                                    v-if="key === 'master'"
                                    v-model="row.item.master.name"
                                    :options="masterOptions(row.item.master)"
                                    value-field="_id"
                                    text-field="name"
                                >
                                </b-form-select>

                                <b-form-input
                                    v-if="key !== 'status' && key !== 'master'"
                                    v-model="row.item[key]"
                                    type="text"
                                ></b-form-input>
                            </b-form-group>
                        </div>

                        <b-button
                            variant="primary"
                            class="mr-2"
                            v-on:click.prevent="updateProspect(row.item)"
                        >
                            Sauvegarder
                        </b-button>

                        <b-button
                            variant="danger"
                            class="mr-2"
                            v-on:click.prevent="openDeleteProspect(row.item)"
                        >
                            Supprimer
                        </b-button>
                        <b-button @click="row.toggleDetails">
                            Annuler
                        </b-button>
                    </b-form>
                </b-card>
            </template>
        </b-table>

        <!-- Info modal -->
        <b-modal
            size="lg"
            centered
            scrollable
            :id="prospectModal.id"
            :title="prospectModal.title"
            ok-only
            @hide="resetProspectModal"
        >
            <pre>{{ prospectModal.content }}</pre>
        </b-modal>

        <!-- Delete modal -->
        <b-modal
            centered
            :id="deleteProspectModal.id"
            :title="deleteProspectModal.title"
            @hide="resetProspectDeleteModal"
        >
            <p>Voulez-vous vraiment supprimer ce prospect ?</p>

            <template v-slot:modal-footer="{ cancel }">
                <b-button
                    variant="danger"
                    @click="deleteProspect(deleteProspectModal.item)"
                    >Supprimer ce propsect</b-button
                >
                <b-button variant="secondary" @click="cancel()"
                    >Annuler</b-button
                >
            </template>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios";
export default {
    data() {
        return {
            droppedKey: [
                "houseImage",
                "name",
                "_id",
                "__v",
                "_showDetails",
                "createdAt",
                "updatedAt",
                "progress",
                "oldMaster",
            ],
            prospects: null,
            prospectsFields: [
                {
                    key: "name",
                    label: "Nom prénom",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "city",
                    label: "Ville",
                    sortable: true,
                    sortDirection: "desc",
                },
                { key: "email", label: "E-mail" },
                { key: "phone", label: "Téléphone" },
                {
                    key: "progress",
                    label: "Progression",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "master.name",
                    label: "Personne en charge",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "master.company.name",
                    label: "Agence",
                    sortable: true,
                    sortDirection: "desc",
                },
                { key: "actions", label: "Actions" },
            ],
            fields: [
                {
                    key: "name",
                    label: "Nom prénom",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "city",
                    label: "Ville",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "progress",
                    label: "Progression",
                    sortable: true,
                    sortDirection: "desc",
                },
                { key: "actions", label: "Actions" },
            ],
            totalRows: 1,
            currentPage: 1,
            perPage: 5,
            pageOptions: [5, 10, 20],
            sortBy: "",
            sortDesc: false,
            sortDirection: "asc",
            filter: null,
            filterOn: [],
            prospectModal: {
                id: "info-modal-prospects",
                title: "",
                content: "",
            },
            deleteProspectModal: {
                id: "delete-modal-prospects",
                title: "",
                item: "",
            },
            optionsStatus: ["oui", "non", "peut-être"],
        };
    },
    computed: {
        sortOptions() {
            // Create an options list from our fields
            return this.fields
                .filter((f) => f.sortable)
                .map((f) => {
                    return { text: f.label, value: f.key };
                });
        },
    },
    mounted() {
        // Set the initial number of items
        axios
            .get("http://localhost:3003/api/v1/users/prospects/list", {
                headers: {
                    Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                },
            })
            .then(
                function(response) {
                    this.prospects = response.data;
                    this.prospects.forEach((prospect) => {
                        prospect.name =
                            prospect.firstname + " " + prospect.lastname;
                        prospect.master.name =
                            prospect.master.firstname +
                            " " +
                            prospect.master.lastname;
                        prospect.oldMaster = prospect.master._id;
                    });
                    this.totalRows = this.prospects.length;
                }.bind(this)
            )
            .catch((error) => console.log(error));
    },
    methods: {
        dropKey(key) {
            let keyNotFound = true;
            this.droppedKey.forEach(function(item) {
                if (key == item) {
                    keyNotFound = false;
                }
            });
            return keyNotFound;
        },
        masterOptions(value) {
            var array = [];

            value.company.collaborators.forEach(function(item) {
                array.push({
                    name: item.firstname + " " + item.lastname,
                    id: item._id,
                });
            });
            return array;
        },
        updateProspect(row) {
            if (row.oldMaster !== row.master._id) {
                axios
                    .post(
                        `http://localhost:3003/api/v1/users/switchProspect`,
                        {
                            prospectId: row._id,
                            fromId: row.oldMaster,
                            targetId: row.master._id,
                        },
                        {
                            headers: {
                                Authorization:
                                    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                            },
                        }
                    )
                    .then(
                        function(result) {
                            axios
                                .get(
                                    "http://localhost:3003/api/v1/users/prospects/list",
                                    {
                                        headers: {
                                            Authorization:
                                                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                                        },
                                    }
                                )
                                .then(
                                    function(response) {
                                        this.prospects = response.data;
                                        this.prospects.forEach((prospect) => {
                                            prospect.name =
                                                prospect.firstname +
                                                " " +
                                                prospect.lastname;
                                            prospect.master.name =
                                                prospect.master.firstname +
                                                " " +
                                                prospect.master.lastname;
                                            prospect.oldMaster =
                                                prospect.master._id;
                                        });
                                        this.totalRows = this.prospects.length;

                                        this.$bvToast.toast(
                                            `Les données du prospect ${result.data.firstname} ${result.data.lastname} ont bien été enregistrés`,
                                            {
                                                title:
                                                    "Données prospect modifiées avec succès",
                                                variant: "success",
                                                autoHideDelay: 5000,
                                            }
                                        );
                                    }.bind(this)
                                );
                        }.bind(this)
                    )
                    .catch((error) => console.log(error.message));
            } else {
                axios
                    .put(
                        `http://localhost:3003/api/v1/users/${row.master._id}/prospect/${row._id}`,
                        row,
                        {
                            headers: {
                                Authorization:
                                    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                            },
                        }
                    )
                    .then(
                        function(result) {
                            axios
                                .get(
                                    "http://localhost:3003/api/v1/users/prospects/list",
                                    {
                                        headers: {
                                            Authorization:
                                                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                                        },
                                    }
                                )
                                .then(
                                    function(response) {
                                        this.prospects = response.data;
                                        this.prospects.forEach((prospect) => {
                                            prospect.name =
                                                prospect.firstname +
                                                " " +
                                                prospect.lastname;
                                            prospect.master.name =
                                                prospect.master.firstname +
                                                " " +
                                                prospect.master.lastname;
                                            prospect.oldMaster =
                                                prospect.master._id;
                                        });
                                        this.totalRows = this.prospects.length;

                                        this.$bvToast.toast(
                                            `Les données du prospect ${result.data.firstname} ${result.data.lastname} ont bien été enregistrés`,
                                            {
                                                title:
                                                    "Données prospect modifiées avec succès",
                                                variant: "success",
                                                autoHideDelay: 5000,
                                            }
                                        );
                                    }.bind(this)
                                );
                        }.bind(this)
                    )
                    .catch((error) => console.log(error.message));
            }
        },
        deleteProspect(value) {
            axios
                .delete(
                    `http://localhost:3003/api/v1/users/${value.master._id}/prospect/${value._id}`,
                    {
                        params: { value },
                        headers: {
                            Authorization:
                                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                        },
                    }
                )
                .then(
                    function() {
                        this.$root.$emit(
                            "bv::hide::modal",
                            this.deleteProspectModal.id
                        );

                        axios
                            .get("http://localhost:3003/api/v1/prospect/list", {
                                headers: {
                                    Authorization:
                                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                                },
                            })
                            .then(
                                function(response) {
                                    this.users = response.data;
                                    this.users.forEach((user) => {
                                        // Add fullname to trainer
                                        user.name =
                                            user.firstname +
                                            " " +
                                            user.lastname;
                                    });
                                    this.totalRows = this.users.length;

                                    this.$bvToast.toast(
                                        `Les données du prospect ont bien été supprimées`,
                                        {
                                            title:
                                                "Données prospect supprimées avec succès",
                                            variant: "success",
                                            autoHideDelay: 5000,
                                        }
                                    );
                                }.bind(this)
                            )
                            .catch((error) => console.log(error));
                    }.bind(this)
                )
                .catch((error) => console.log(error.message));
        },
        prospect(item, index, button) {
            this.prospectModal.title = `Prospect: ${item.name}`;
            this.prospectModal.content = JSON.stringify(item, null, 2);
            this.$root.$emit("bv::show::modal", this.prospectModal.id, button);
        },
        openDeleteProspect(item, index, button) {
            this.deleteProspectModal.title = `Prospect: ${item.name}`;
            this.deleteProspectModal.item = item;
            this.$root.$emit(
                "bv::show::modal",
                this.deleteProspectModal.id,
                button
            );
        },
        resetProspectModal() {
            this.prospectModal.title = "";
            this.prospectModal.content = "";
        },
        resetProspectDeleteModal() {
            this.deleteProspectModal.title = "";
            this.deleteProspectModal.content = "";
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
    },
};
</script>

<style>
.adminProspects {
    margin-top: 30px;
}
</style>
