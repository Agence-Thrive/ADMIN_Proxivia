<template>
    <div class="adminTrainers">
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
                    class="float-lg-right btn-create mb-2"
                    v-b-modal.newFormateurModal
                    >Ajouter un formateur</b-button
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
            :v-if="this.trainers != null"
            :items="trainers"
            :fields="trainersFields"
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
                    @click="trainer(row.item, row.index, $event.target)"
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
                            v-on:click.prevent="updateTrainer(row.item)"
                        >
                            Sauvegarder
                        </b-button>

                        <b-button
                            variant="danger"
                            class="mr-2"
                            v-on:click.prevent="openTrainerDelete(row.item)"
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
            :id="trainerModal.id"
            :title="trainerModal.title"
            ok-only
            @hide="resetTrainerModal"
        >
            <pre>{{ trainerModal.content }}</pre>
        </b-modal>

        <!-- Delete modal -->
        <b-modal
            centered
            :id="deleteTrainerModal.id"
            :title="deleteTrainerModal.title"
            @hide="resetDeleteTrainerModal"
        >
            <p>Voulez-vous vraiment supprimer ce formateur ?</p>

            <template v-slot:modal-footer="{ cancel }">
                <b-button
                    variant="danger"
                    @click="deleteTrainer(deleteTrainerModal.item)"
                    >Supprimer ce formateur</b-button
                >
                <b-button variant="secondary" @click="cancel()"
                    >Annuler</b-button
                >
            </template>
        </b-modal>

        <!-- Add trainer modal -->
        <b-modal
            id="newFormateurModal"
            centered
            scrollable
            size="lg"
            title="Ajouter un formateur"
        >
            <template v-slot:default>
                <b-form>
                    <b-row>
                        <b-col sm="12">
                            <b-form-group
                                label="Prénom"
                                label-for="firstnameFormateur"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    id="firstnameFormateur"
                                    type="text"
                                    v-model="newTrainer.firstname"
                                    trim
                                    required
                                    placeholder="John"
                                ></b-input>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="Nom"
                                label-for="lastnameFormateur"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    id="lastnameFormateur"
                                    type="text"
                                    v-model="newTrainer.lastname"
                                    trim
                                    required
                                    placeholder="Doe"
                                ></b-input>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="Photo de profil"
                                label-for="photoFormateur"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    id="photoFormateur"
                                    type="text"
                                    v-model="newTrainer.photo"
                                    trim
                                    required
                                ></b-input>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="E-mail"
                                label-for="emailFormateur"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    id="emailFormateur"
                                    type="text"
                                    v-model="newTrainer.email"
                                    trim
                                    required
                                    placeholder="johndoe@mail.com"
                                ></b-input>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="Description"
                                label-for="aboutFormateur"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-textarea
                                    id="aboutFormateur"
                                    v-model="newTrainer.about"
                                    rows="4"
                                    maxRows="8"
                                    placeholder="Fort de 15 ans d'expériences..."
                                    required
                                ></b-textarea>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="Téléphone"
                                label-for="phoneFormateur"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    id="phoneFormateur"
                                    v-model="newTrainer.phone"
                                    type="text"
                                    trim
                                    required
                                    placeholder="0123456789"
                                ></b-input>
                            </b-form-group>
                        </b-col>
                    </b-row>
                </b-form>
            </template>

            <template v-slot:modal-footer="{ close }">
                <b-button class="btn-create" @click="createTrainer">
                    Enregistrer le formateur
                </b-button>

                <b-button @click="close()">
                    Annuler
                </b-button>
            </template>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios";
export default {
    data() {
        return {
            droppedKey: ["photo", "name", "_id", "__v", "_showDetails"],
            trainers: null,
            trainersFields: [
                {
                    key: "name",
                    label: "Nom prénom",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "email",
                    label: "E-mail",
                },
                {
                    key: "phone",
                    label: "Téléphone",
                },
                {
                    key: "totalTraining",
                    label: "Total de formations",
                    sortable: true,
                    sortDirection: "desc",
                    formatter: (value) => {
                        return value === 0 || value === undefined ? 0 : value;
                    },
                },
                {
                    key: "totalViews",
                    label: "Total de vues",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "totalArticles",
                    label: "Total de d'articles",
                    sortable: true,
                    sortDirection: "desc",
                    formatter: (value) => {
                        return value === null ? 0 : value;
                    },
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
                    key: "totalTraining",
                    label: "Total de formations",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "totalViews",
                    label: "Total de vues",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "totalArticle",
                    label: "Total d'articles",
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
            trainerModal: {
                id: "info-modal-trainer",
                title: "",
                content: "",
            },
            deleteTrainerModal: {
                id: "delete-modal-trainer",
                title: "",
                item: "",
            },
            optionsRoles: ["admin", "restricted"],
            newTrainer: {},
            inputToVerify: [
                { property: "lastname", text: "nom" },
                { property: "firstname", text: "prénom" },
                { property: "photo", text: "photo de profil" },
                { property: "email", text: "e-mail" },
                { property: "about", text: "description" },
                { property: "phone", text: "téléphone" },
            ],
            errorNewTrainerInput: [],
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
            .get("http://localhost:3003/api/v1/trainer/list", {
                headers: {
                    Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                },
            })
            .then((response) => {
                this.trainers = response.data;
                this.trainers.forEach((trainer) => {
                    // Add fullname to trainer
                    trainer.name = trainer.firstname + " " + trainer.lastname;
                });
                this.totalRows = this.trainers.length;
            })
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
        updateTrainer(row) {
            axios
                .put(`http://localhost:3003/api/v1/trainer/${row._id}`, row, {
                    headers: {
                        Authorization:
                            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                    },
                })
                .then(
                    function(result) {
                        axios
                            .get("http://localhost:3003/api/v1/trainer/list", {
                                headers: {
                                    Authorization:
                                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                                },
                            })
                            .then(
                                function(response) {
                                    this.trainers = response.data;
                                    this.trainers.forEach((trainer) => {
                                        // Add fullname to trainer
                                        trainer.name =
                                            trainer.firstname +
                                            " " +
                                            trainer.lastname;
                                    });
                                    this.totalRows = this.trainers.length;

                                    this.$bvToast.toast(
                                        `Les données pour le formateur ${result.data.firstname} ${result.data.lastname} ont bien été enregistrés`,
                                        {
                                            title:
                                                "Donnée du formateur modifiées avec succès",
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
        deleteTrainer(value) {
            axios
                .delete(`http://localhost:3003/api/v1/trainer/${value._id}`, {
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
                            this.deleteTrainerModal.id
                        );

                        this.$bvToast.toast(
                            `Les données pour le formateur ont bien été supprimés`,
                            {
                                title:
                                    "Donnée du formateur supprimé avec succès",
                                variant: "success",
                                autoHideDelay: 5000,
                            }
                        );

                        axios
                            .get("http://localhost:3003/api/v1/trainer/list", {
                                headers: {
                                    Authorization:
                                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                                },
                            })
                            .then((response) => {
                                this.trainers = response.data;
                                this.trainers.forEach((trainer) => {
                                    // Add fullname to trainer
                                    trainer.name =
                                        trainer.firstname +
                                        " " +
                                        trainer.lastname;
                                });
                                this.totalRows = this.trainers.length;
                            })
                            .catch((error) => console.log(error));
                    }.bind(this)
                )
                .catch((error) => console.log(error.message));
        },
        trainer(item, index, button) {
            this.trainerModal.title = `Formateur: ${item.name}`;
            this.trainerModal.content = JSON.stringify(item, null, 2);
            this.$root.$emit("bv::show::modal", this.trainerModal.id, button);
        },
        openTrainerDelete(item, index, button) {
            this.deleteTrainerModal.title = `Formateur: ${item.name}`;
            this.deleteTrainerModal.item = item;
            this.$root.$emit(
                "bv::show::modal",
                this.deleteTrainerModal.id,
                button
            );
        },
        resetTrainerModal() {
            this.trainerModal.title = "";
            this.trainerModal.content = "";
        },
        resetDeleteTrainerModal() {
            this.deleteTrainerModal.title = "";
            this.deleteTrainerModal.content = "";
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        createTrainer() {
            // Reset array of errors
            this.errorNewTrainerInput = [];

            // Verify if all inputs to verify is not empty (without chapters)
            this.inputToVerify.forEach(
                function(item) {
                    if (
                        !Object.prototype.hasOwnProperty.call(
                            this.newTrainer,
                            item.property
                        )
                    ) {
                        this.errorNewTrainerInput.push(item);
                    }
                }.bind(this)
            );

            // Set error message if errors arrays is not empty
            if (this.errorNewTrainerInput.length > 0) {
                var errorMessage =
                    "Veuillez remplir les champs manquants: " +
                    this.errorNewTrainerInput.map((item) => {
                        return ` ${item.text}`;
                    });

                // Send toast to inform user
                this.$bvToast.toast(errorMessage, {
                    title: "Erreur lors de la transmission des données",
                    variant: "danger",
                    autoHideDelay: 5000,
                });
                return;
            } else {
                var trainer = {
                    firstname: this.newTrainer.firstname,
                    lastname: this.newTrainer.lastname,
                    about: this.newTrainer.about,
                    photo: this.newTrainer.photo,
                    email: this.newTrainer.email,
                    phone: this.newTrainer.phone,
                };

                axios
                    .post("http://localhost:3003/api/v1/trainer", trainer, {
                        headers: {
                            Authorization:
                                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                        },
                    })
                    .then(
                        function(result) {
                            var successMessage = `Le formateur, ${result.data.firstname} ${result.data.lastname}, a été enregistrée avec succès.`;
                            // Close new formation modal & inform user of sucess
                            this.$bvModal.hide("newFormateurModal");

                            // Send toast message to success
                            this.$bvToast.toast(successMessage, {
                                title: "Nouveau formateur enregistrée",
                                variant: "success",
                                autoHideDelay: 5000,
                            });

                            axios
                                .get(
                                    "http://localhost:3003/api/v1/trainer/list",
                                    {
                                        headers: {
                                            Authorization:
                                                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                                        },
                                    }
                                )
                                .then(
                                    function(result) {
                                        this.trainers = result.data;
                                        this.trainers.forEach((trainer) => {
                                            // Add fullname to trainer
                                            trainer.name =
                                                trainer.firstname +
                                                " " +
                                                trainer.lastname;
                                        });
                                        this.totalRows = this.trainers.length;
                                    }.bind(this)
                                );
                        }.bind(this)
                    )
                    .catch(function(error) {
                        console.log(error);
                    });
            }
        },
    },
};
</script>

<style>
.adminTrainers {
    margin-top: 30px;
}
</style>
