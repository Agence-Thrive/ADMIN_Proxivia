<template>
    <div class="adminUsers">
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
                    v-if="this.users !== null"
                    :data="users"
                    name="users.csv"
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
                        <b-form-checkbox value="age">Age</b-form-checkbox>
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
            :v-if="this.users != null"
            :items="users"
            :fields="usersFields"
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
                    @click="info(row.item, row.index, $event.target)"
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

                                <b-form-checkbox
                                    v-if="key === 'role'"
                                    v-model="row.item[key]"
                                    value="admin"
                                    unchecked-value="restricted"
                                >
                                    Utilisateur admin
                                </b-form-checkbox>

                                <b-form-input
                                    v-if="key !== 'about' && key !== 'role'"
                                    v-model="row.item[key]"
                                    type="text"
                                    >{{ log(row.item[key]) }}</b-form-input
                                >
                            </b-form-group>
                        </div>

                        <b-button
                            variant="primary"
                            class="mr-2"
                            v-on:click.prevent="updateUser(row.item)"
                        >
                            Sauvegarder
                        </b-button>

                        <b-button
                            variant="danger"
                            class="mr-2"
                            v-on:click.prevent="openDelete(row.item)"
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
            :id="infoModal.id"
            :title="infoModal.title"
            ok-only
            @hide="resetInfoModal"
        >
            <pre>{{ infoModal.content }}</pre>
        </b-modal>

        <!-- Delete modal -->
        <b-modal
            centered
            :id="deleteModal.id"
            :title="deleteModal.title"
            @hide="resetDeleteModal"
        >
            <p>Voulez-vous vraiment supprimer cet utilisateur ?</p>

            <template v-slot:modal-footer="{ cancel }">
                <b-button variant="danger" @click="deleteUser(deleteModal.item)"
                    >Supprimer cet utilisateur</b-button
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
                "document",
                "favoriteTrainings",
                "trainings",
                "password",
                "tokens",
                "createdAt",
                "updatedAt",
                "prospects",
                "_id",
                "completedProfil",
                "__v",
                "name",
                "_showDetails",
            ],
            users: null,
            usersFields: [
                {
                    key: "name",
                    label: "Nom prénom",
                    sortable: true,
                    sortDirection: "desc",
                },
                { key: "city", label: "Ville" },
                { key: "email", label: "E-mail" },
                { key: "phone", label: "Téléphone" },
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
                    key: "age",
                    label: "Age",
                    sortable: true,
                    class: "text-center",
                },
                {
                    key: "isActive",
                    label: "Actif",
                    formatter: (value) => {
                        return value ? "Yes" : "No";
                    },
                    sortable: true,
                    sortByFormatted: true,
                    filterByFormatted: true,
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
            infoModal: {
                id: "info-modal-users",
                title: "",
                content: "",
            },
            deleteModal: {
                id: "delete-modal-users",
                title: "",
                item: "",
            },
            optionsRoles: ["admin", "restricted"],
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
            .get("http://localhost:3003/api/v1/users", {
                headers: {
                    Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                },
            })
            .then(
                function(response) {
                    this.users = response.data;
                    this.users.forEach((user) => {
                        user.name = user.firstname + " " + user.lastname;
                    });
                    this.totalRows = this.users.length;
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
        log(msg) {
            console.log(msg);
        },
        updateUser(row) {
            console.log(row);
            axios
                .put(`http://localhost:3003/api/v1/users/${row._id}`, row, {
                    headers: {
                        Authorization:
                            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                    },
                })
                .then(
                    function(result) {
                        axios
                            .get("http://localhost:3003/api/v1/users", {
                                headers: {
                                    Authorization:
                                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                                },
                            })
                            .then(
                                function(response) {
                                    console.log(result);
                                    this.users = response.data;
                                    this.users.forEach((user) => {
                                        user.name =
                                            user.firstname +
                                            " " +
                                            user.lastname;
                                    });
                                    this.totalRows = this.users.length;

                                    this.$bvToast.toast(
                                        `Les données de l'utilisateur ${result.data.firstname} ${result.data.lastname} ont bien été enregistrés`,
                                        {
                                            title:
                                                "Données utilisateur modifiées avec succès",
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
        deleteUser(value) {
            axios
                .delete(`http://localhost:3003/api/v1/users/${value._id}`, {
                    params: { value },
                    headers: {
                        Authorization:
                            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                    },
                })
                .then(
                    function() {
                        this.$root.$emit(
                            "bv::hide::modal",
                            this.deleteModal.id
                        );

                        axios
                            .get("http://localhost:3003/api/v1/users", {
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
                                        `Les données de l'utilisateur ont bien été supprimées`,
                                        {
                                            title:
                                                "Données utilisateur supprimées avec succès",
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
        info(item, index, button) {
            this.infoModal.title = `Utilisateur: ${item.name}`;
            this.infoModal.content = JSON.stringify(item, null, 2);
            this.$root.$emit("bv::show::modal", this.infoModal.id, button);
        },
        openDelete(item, index, button) {
            this.deleteModal.title = `Utilisateur: ${item.name}`;
            this.deleteModal.item = item;
            this.$root.$emit("bv::show::modal", this.deleteModal.id, button);
        },
        resetInfoModal() {
            this.infoModal.title = "";
            this.infoModal.content = "";
        },
        resetDeleteModal() {
            this.deleteModal.title = "";
            this.deleteModal.content = "";
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
.adminUsers {
    margin-top: 30px;
}
</style>
