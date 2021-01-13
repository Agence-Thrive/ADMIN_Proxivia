<template>
    <div class="adminUpdates">
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
                <b-button
                    class="float-lg-right btn-create mb-2 mr-2"
                    v-b-modal.newUpdateModal
                    >Ajouter une mise à jour</b-button
                >
                <b-button
                    class="float-lg-right btn-create mb-2 mr-2"
                    v-b-modal.newUpdateModal
                    >Ajouter une catégorie de mise à jour</b-button
                >
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
                        <b-form-checkbox value="city">Ville</b-form-checkbox>
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
                    v-model="currentPage"
                    :total-rows="totalRows"
                    :per-page="perPage"
                    class="float-right"
                    pills
                    size="sm"
                ></b-pagination>
            </b-col>
        </b-row>

        <!-- Main table element -->
        <b-table
            show-empty
            empty-text="Aucune données pour le moment."
            :v-if="this.updates != null"
            :items="updates"
            :fields="updatesFields"
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
                    @click="update(row.item, row.index, $event.target)"
                    class="mr-1 my-1"
                    variant="info"
                >
                    Voir les infos
                </b-button>

                <b-button class="my-1" size="sm" @click="row.toggleDetails">
                    {{ row.detailsShowing ? "Fermer" : "Modifier" }}
                </b-button>
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
                                <b-form-textarea
                                    v-if="key === 'about'"
                                    v-model="row.item[key]"
                                    rows="4"
                                    maxRows="8"
                                >
                                </b-form-textarea>

                                <b-form-input
                                    v-if="key !== 'about'"
                                    v-model="row.item[key]"
                                    type="text"
                                ></b-form-input>
                            </b-form-group>
                        </div>

                        <b-button
                            variant="primary"
                            class="mr-2"
                            v-on:click.prevent="updateUpdate(row.item)"
                        >
                            Sauvegarder
                        </b-button>

                        <b-button
                            variant="danger"
                            class="mr-2"
                            v-on:click.prevent="openUpdateDelete(row.item)"
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
            :id="updateModal.id"
            :title="updateModal.title"
            ok-only
            @hide="resetUpdateModal"
        >
            <pre>{{ updateModal.content }}</pre>
        </b-modal>

        <!-- Delete modal -->
        <b-modal
            centered
            :id="deleteUpdateModal.id"
            :title="deleteUpdateModal.title"
            @hide="resetUpdateDeleteModal"
        >
            <p>Voulez-vous vraiment supprimer cette agence ?</p>

            <template v-slot:modal-footer="{ cancel }">
                <b-button
                    variant="danger"
                    @click="deleteUpdate(deleteUpdateModal.item)"
                    >Supprimer cette agence</b-button
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
                "_id",
                "__v",
                "_showDetails",
                "createdAt",
                "updatedAt",
                "collaborators",
                "avatar",
                "master",
            ],
            updates: null,
            updatesFields: [
                {
                    key: "name",
                    label: "Nom de l'agence",
                    sortable: true,
                    sortDirection: "desc",
                },
                { key: "email", label: "E-mail" },
                { key: "phone", label: "Téléphone" },
                {
                    key: "city",
                    label: "Ville",
                    sortable: true,
                    sortDirection: "desc",
                },
                { key: "master.name", label: "Gérant" },
                { key: "actions", label: "Actions" },
            ],
            fields: [
                {
                    key: "name",
                    label: "Nom de l'agence",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "city",
                    label: "Ville",
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
            updateModal: {
                id: "info-modal-updates",
                title: "",
                content: "",
            },
            deleteUpdateModal: {
                id: "delete-modal-updates",
                title: "",
                item: "",
            },
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
            .get("http://localhost:3003/api/v1/update/list", {
                headers: {
                    Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                },
            })
            .then(
                function(response) {
                    this.updates = response.data;
                    this.totalRows = this.updates.length;
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
        // updateUpdate(row) {
        // axios
        //     .put(`http://localhost:3003/api/v1/company/${row._id}`, row, {
        //         headers: {
        //             Authorization:
        //                 "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
        //         },
        //     })
        //     .then(
        //         function(response) {
        //             axios
        //                 .get("http://localhost:3003/api/v1/company/list", {
        //                     headers: {
        //                         Authorization:
        //                             "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
        //                     },
        //                 })
        //                 .then(
        //                     function(result) {
        //                         console.log(result);
        //                         this.companies = result.data;
        //                         this.companies.forEach((c) => {
        //                             c.master.name =
        //                                 c.master.firstname +
        //                                 " " +
        //                                 c.master.lastname;
        //                         });
        //                         this.totalRows = this.companies.length;
        //                         this.$bvToast.toast(
        //                             `Les données de l'agence ${response.data.name} ont bien été enregistrés`,
        //                             {
        //                                 title:
        //                                     "Donnée de l'agence modifiées avec succès",
        //                                 variant: "success",
        //                                 autoHideDelay: 5000,
        //                             }
        //                         );
        //                     }.bind(this)
        //                 );
        //         }.bind(this)
        //     )
        //     .catch((error) => console.log(error.message));
        // },
        // deleteUpdate(value) {
        // axios
        //     .delete(`http://localhost:3003/api/v1/company/${value._id}`, {
        //         params: { value },
        //         headers: {
        //             Authorization:
        //                 "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
        //         },
        //     })
        //     .then(
        //         function() {
        //             this.$root.$emit(
        //                 "bv::hide::modal",
        //                 this.deleteUpdateModal.id
        //             );
        //             axios
        //                 .get("http://localhost:3003/api/v1/company/list", {
        //                     headers: {
        //                         Authorization:
        //                             "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
        //                     },
        //                 })
        //                 .then(
        //                     function(response) {
        //                         this.companies = response.data;
        //                         this.companies.forEach((c) => {
        //                             c.master.name =
        //                                 c.master.firstname +
        //                                 " " +
        //                                 c.master.lastname;
        //                         });
        //                         this.totalRows = this.companies.length;
        //                         this.$bvToast.toast(
        //                             `Les données de l'agence ont bien été supprimées`,
        //                             {
        //                                 title:
        //                                     "Donnée de l'agence supprimées avec succès",
        //                                 variant: "success",
        //                                 autoHideDelay: 5000,
        //                             }
        //                         );
        //                     }.bind(this)
        //                 )
        //                 .catch((error) => console.log(error));
        //         }.bind(this)
        //     )
        //     .catch((error) => console.log(error.message));
        // },
        update(item, index, button) {
            this.companyModal.title = `Agence: ${item.name}`;
            this.companyModal.content = JSON.stringify(item, null, 2);
            this.$root.$emit("bv::show::modal", this.companyModal.id, button);
        },
        openUpdateDelete(item, index, button) {
            this.deleteUpdateModal.title = `Agence: ${item.name}`;
            this.deleteUpdateModal.item = item;
            this.$root.$emit(
                "bv::show::modal",
                this.deleteUpdateModal.id,
                button
            );
        },
        resetUpdateModal() {
            this.updateModal.title = "";
            this.updateModal.content = "";
        },
        resetUpdateDeleteModal() {
            this.deleteUpdateModal.title = "";
            this.deleteUpdateModal.content = "";
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
.adminUpdates {
    margin-top: 30px;
}
</style>
