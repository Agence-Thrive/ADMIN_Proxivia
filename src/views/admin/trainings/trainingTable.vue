<template>
    <div class="adminTrainings">
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
                    v-b-modal.newFormationModal
                    >Ajouter une formation</b-button
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
                        <b-form-checkbox value="title">Titre</b-form-checkbox>
                        <b-form-checkbox value="trainer"
                            >Formateur</b-form-checkbox
                        >
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
            id="trainingTable"
            show-empty
            empty-text="Aucune données pour le moment."
            :v-if="this.trainings != null"
            :items="trainings"
            :fields="trainingsFields"
            :current-page="currentPage"
            :per-page="perPage"
            :filter="filter"
            :filterIncludedFields="filterOn"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :sort-direction="sortDirection"
            @filtered="onFiltered"
            class="mt-4 border-0 shadow"
            head-variant="dark"
            responsive
        >
            <template v-slot:cell(actions)="row">
                <b-button
                    size="sm"
                    @click="training(row.item, row.index, $event.target)"
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
                                    v-if="key === 'description'"
                                    v-model="row.item[key]"
                                    rows="4"
                                    maxRows="8"
                                >
                                </b-form-textarea>

                                <b-form-select
                                    v-if="key === 'trainer'"
                                    v-model="row.item[key].name"
                                    :options="trainerList"
                                    value-field="_id"
                                    text-field="name"
                                >
                                </b-form-select>

                                <b-form-select
                                    v-if="key === 'difficulty'"
                                    v-model="row.item[key]"
                                    :options="optionsDifficulty"
                                >
                                </b-form-select>

                                <b-form-input
                                    v-if="
                                        key !== 'description' &&
                                            key !== 'difficulty' &&
                                            key !== 'trainer'
                                    "
                                    v-model="row.item[key]"
                                    type="text"
                                ></b-form-input>
                            </b-form-group>
                        </div>

                        <b-button
                            variant="primary"
                            class="mr-2"
                            v-on:click.prevent="updateTrainings(row.item)"
                        >
                            Sauvegarder
                        </b-button>

                        <b-button
                            variant="danger"
                            class="mr-2"
                            v-on:click.prevent="
                                openDelete(row.item, row.index, $event.target)
                            "
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
            :id="trainingModal.id"
            :title="trainingModal.title"
            ok-only
            @hide="resetTrainingModal"
        >
            <pre>{{ trainingModal.content }}</pre>
        </b-modal>

        <!-- Delete modal -->
        <b-modal
            centered
            :id="deleteTrainingModal.id"
            :title="deleteTrainingModal.title"
            @hide="resetDeleteTrainingModal"
        >
            <p>Voulez-vous vraiment supprimer cette formation ?</p>

            <template v-slot:modal-footer="{ cancel }">
                <b-button
                    variant="danger"
                    @click="deleteTraining(deleteTrainingModal.item)"
                    >Supprimer la formation</b-button
                >
                <b-button variant="secondary" @click="cancel()"
                    >Annuler</b-button
                >
            </template>
        </b-modal>

        <!-- Add training modal -->
        <b-modal
            id="newFormationModal"
            centered
            scrollable
            size="lg"
            title="Ajouter une formation"
        >
            <template v-slot:default>
                <b-form>
                    <b-row>
                        <b-col sm="12">
                            <b-form-group
                                label="Titre de la formation"
                                label-for="titleFormation"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    id="titleFormation"
                                    type="text"
                                    v-model="newTraining.title"
                                    trim
                                    required
                                    placeholder="Viager mixte..."
                                ></b-input>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="Formateur"
                                label-for="trainerFormation"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-form-select
                                    id="trainerFormation"
                                    v-model="newTraining.trainer"
                                    :options="trainerList"
                                    value-field="_id"
                                    text-field="name"
                                >
                                </b-form-select>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="Image"
                                label-for="imageFormation"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    id="imageFormation"
                                    type="text"
                                    v-model="newTraining.image"
                                    trim
                                    required
                                ></b-input>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="Sujet(s) travaillé(s)"
                                description="Saisissez les sujets travaillés dans ce cours en les séparant par des virgules."
                                label-for="subjectFormation"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    id="subjectFormation"
                                    type="text"
                                    v-model="newTraining.subject"
                                    trim
                                    required
                                    placeholder="Viager, Investissement, ..."
                                ></b-input>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="Description"
                                label-for="descriptionFormation"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-textarea
                                    id="descriptionFormation"
                                    v-model="newTraining.description"
                                    rows="4"
                                    maxRows="8"
                                    placeholder="Apprendre à..."
                                    required
                                ></b-textarea>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="URL de la vidéo du cours"
                                label-for="urlFormation"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    id="urlFormation"
                                    v-model="newTraining.url"
                                    type="text"
                                    trim
                                    required
                                    placeholder="https://urldemavideo.com"
                                ></b-input>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="Difficulté du cours"
                                label-for="difficultyFormation"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-form-select
                                    id="difficultyFormation"
                                    v-model="newTraining.difficulty"
                                    :options="optionsDifficulty"
                                    required
                                >
                                </b-form-select>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="Durée du cours"
                                label-for="timeFormation"
                                description="Durée du cours exprimée en minutes."
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    id="timeFormation"
                                    v-model="newTraining.time"
                                    type="number"
                                    trim
                                    min="0"
                                    required
                                    placeholder="321"
                                ></b-input>
                            </b-form-group>
                        </b-col>

                        <b-col sm="12">
                            <b-form-group
                                label="Points d'expérience"
                                description="Acquis à la fin du cours"
                                label-for="xpPointFormation"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    id="xpPointFormation"
                                    v-model="newTraining.xpPoint"
                                    type="number"
                                    trim
                                    min="0"
                                    required
                                    placeholder="75"
                                ></b-input>
                            </b-form-group>
                        </b-col>

                        <b-col lg="12" class="mb-2">
                            <div class="headerChapter">
                                <h6>Chapitre(s) du cours</h6>

                                <div>
                                    <b-button
                                        variant="outline-primary"
                                        title="Ajouter un chapitre"
                                        @click="addChapter"
                                        class="mr-1 mb-1"
                                    >
                                        + Ajouter un chapitre
                                    </b-button>
                                    <b-button
                                        variant="info"
                                        title="Supprimer un chapitre"
                                        @click="removeChapter"
                                        class="mb-1"
                                    >
                                        Retirer un chapitre
                                    </b-button>
                                </div>
                            </div>
                        </b-col>

                        <b-col lg="12" v-for="n in newChapter" :key="n">
                            <strong>Chapitre {{ n }}:</strong>
                            <b-form-group
                                lg="12"
                                label="Titre du chapitre"
                                :label-for="'detailTitleFormation' + n"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    :id="'detailTitleFormation' + n"
                                    v-model="detailFormation[n - 1].title"
                                    type="text"
                                    trim
                                    required
                                ></b-input>
                            </b-form-group>

                            <b-form-group
                                lg="12"
                                label="Durée du chapitre"
                                :label-for="'detailTimeFormation' + n"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    :id="'detailTimeFormation' + n"
                                    v-model="detailFormation[n - 1].time"
                                    type="text"
                                    trim
                                    required
                                ></b-input>
                            </b-form-group>

                            <b-form-group
                                lg="12"
                                label="Notion(s) du chapitre"
                                description="Saisissez les notions de ce chapitre en les séparant avec des virgules (ex: Négociation, Admistratif, ...)"
                                :label-for="'detailNotionsFormation' + n"
                                label-cols-lg="3"
                                label-size="sm"
                            >
                                <b-input
                                    :id="'detailNotionsFormation' + n"
                                    v-model="detailFormation[n - 1].notions"
                                    type="text"
                                    trim
                                    required
                                ></b-input>
                            </b-form-group>
                        </b-col>
                    </b-row>
                </b-form>
            </template>

            <template v-slot:modal-footer="{ close }">
                <b-button class="btn-create" @click="createTraining">
                    Enregistrer la formation
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
            droppedKey: [
                "ressources",
                "image",
                "details",
                "_id",
                "createdAt",
                "updatedAt",
                "__v",
                "_showDetails",
                "grade",
                "views",
            ],
            trainings: null,
            trainingsFields: [
                {
                    key: "title",
                    label: "Titre",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "trainer.fullname",
                    label: "Formateur",
                    sortable: true,
                    sortDirection: "desc",
                },
                { key: "url", label: "URL vers le cours" },
                { key: "difficulty", label: "Difficulté" },
                {
                    key: "length",
                    label: "Durée (en minutes)",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "grade",
                    label: "Note",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "xpPoint",
                    label: "Points d'expériences",
                    sortable: true,
                    sortDirection: "desc",
                },
                { key: "actions", label: "Actions" },
            ],
            fields: [
                {
                    key: "title",
                    label: "Titre",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "difficulty",
                    label: "Difficulté",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "views",
                    label: "Vues",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "grade",
                    label: "Notes",
                    sortable: true,
                    sortDirection: "desc",
                },
                {
                    key: "xpPoint",
                    label: "Expériences",
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
            trainingModal: {
                id: "info-modal-trainings",
                title: "",
                content: "",
            },
            deleteTrainingModal: {
                id: "delete-modal-trainings",
                title: "",
                item: "",
            },
            optionsDifficulty: ["Débutant", "Intermédiaire", "Expert"],
            newTraining: {},
            newChapter: 1,
            detailFormation: [
                {
                    title: "",
                    time: "",
                    notions: "",
                },
            ],
            inputToVerify: [
                { property: "title", text: "titre" },
                { property: "trainer", text: "formateur" },
                { property: "image", text: "image" },
                { property: "subject", text: "sujet(s)" },
                { property: "description", text: "description" },
                { property: "url", text: "URL" },
                { property: "difficulty", text: "difficulté" },
                { property: "time", text: "durée" },
                { property: "xpPoint", text: "points d'expériences" },
            ],
            errorNewTrainingInput: [],
            errorChapter: [],
            trainerList: [],
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
    filter: {},
    updated() {},
    mounted() {
        // Set the initial number of items
        axios
            .get("http://localhost:3003/api/v1/training/newer", {
                headers: {
                    Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                },
            })
            .then((response) => {
                this.trainings = response.data;
                this.trainings.forEach((training) => {
                    // Add fullname to trainer
                    training.trainer.fullname =
                        training.trainer.firstname +
                        " " +
                        training.trainer.lastname;
                    // Change subject array to be a string (inverse on update)
                    training.subject = training.subject
                        .map((item, index) => {
                            if (index === 0) {
                                return item;
                            } else {
                                return " " + item;
                            }
                        })
                        .toString();
                });
                this.totalRows = this.trainings.length;
            })
            .catch((error) => console.log(error));

        axios
            .get("http://localhost:3003/api/v1/trainer/list", {
                headers: {
                    Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                },
            })
            .then(
                function(result) {
                    this.trainerList = result.data.map((item) => {
                        item.name = `${item.firstname} ${item.lastname}`;
                        return item;
                    });
                }.bind(this)
            );
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
        updateTrainings(row) {
            // Change string to array and trim the results in
            var splittedRow = row.subject.split(",").map((item) => {
                return item.trim();
            });

            row.subject = splittedRow;

            axios
                .put(`http://localhost:3003/api/v1/training/${row._id}`, row, {
                    headers: {
                        Authorization:
                            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                    },
                })
                .then(
                    function(result) {
                        // Send toast to inform user
                        const training = result.data;
                        this.$root.$emit(
                            "bv::hide::modal",
                            this.trainingModal.id
                        );

                        this.$bvToast.toast(
                            `Les données pour la formation ${training.title} ont bien été enregistrés`,
                            {
                                title: "Donnée formation modifié avec succès",
                                variant: "success",
                                autoHideDelay: 5000,
                            }
                        );
                    }.bind(this)
                )
                .catch((error) => console.log(error.message));
        },
        deleteTraining(value) {
            axios
                .delete(`http://localhost:3003/api/v1/training/${value._id}`, {
                    params: { value },
                    headers: {
                        Authorization:
                            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                    },
                })
                .then(() => {
                    this.$root.$emit(
                        "bv::hide::modal",
                        this.deleteTrainingModal.id
                    );

                    axios
                        .get("http://localhost:3003/api/v1/training/popular", {
                            headers: {
                                Authorization:
                                    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                            },
                        })
                        .then((response) => {
                            this.trainings = response.data;
                            this.trainings.forEach((training) => {
                                // Add fullname to trainer
                                training.trainer.fullname =
                                    training.trainer.firstname +
                                    " " +
                                    training.trainer.lastname;
                                // Change subject array to be a string (inverse on update)
                                training.subject = training.subject
                                    .map((item, index) => {
                                        if (index === 0) {
                                            return item;
                                        } else {
                                            return " " + item;
                                        }
                                    })
                                    .toString();
                            });
                            this.totalRows = this.trainings.length;
                        })
                        .catch((error) => console.log(error));
                })
                .catch((error) => console.log(error.message));
        },
        training(item, index, button) {
            this.trainingModal.title = `Formation: ${item.title}`;
            this.trainingModal.content = JSON.stringify(item, null, 2);
            this.$root.$emit("bv::show::modal", this.trainingModal.id, button);
        },
        openDeleteTraining(item, index, button) {
            this.deleteTrainingModal.title = `Formation: ${item.title}`;
            this.deleteTrainingModal.item = item;
            this.$root.$emit("bv::show::modal", this.deleteModal.id, button);
        },
        resetTrainingModal() {
            this.trainingModal.title = "";
            this.trainingModal.content = "";
        },
        resetDeleteTrainingModal() {
            this.deleteTrainingModal.title = "";
            this.deleteTrainingModal.content = "";
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addChapter() {
            this.newChapter++;
            this.detailFormation.push({
                title: "",
                time: "",
                notions: "",
            });
        },
        removeChapter() {
            if (this.newChapter > 1) {
                this.newChapter--;
                this.detailFormation.pop();
            }
        },
        createTraining() {
            // Reset array of errors
            this.errorNewTrainingInput = [];
            this.errorChapter = [];

            // Verify if all inputs to verify is not empty (without chapters)
            this.inputToVerify.forEach((item) => {
                if (
                    !Object.prototype.hasOwnProperty.call(
                        this.newTraining,
                        item.property
                    )
                ) {
                    this.errorNewTrainingInput.push(item);
                }
            });

            // Verify if chapters is not empty
            if (this.detailFormation.length !== this.newChapter) {
                return console.log("Erreur: différence de longueur");
            } else {
                // Add errors to empty input
                this.detailFormation.forEach((item, index) => {
                    if (item.title === "") {
                        this.errorChapter.push(
                            `titre du chapitre ${index + 1}`
                        );
                    }
                    if (item.time === "") {
                        this.errorChapter.push(
                            `durée du chapitre ${index + 1}`
                        );
                    }
                    if (item.notions === "") {
                        this.errorChapter.push(
                            `notions du chapitre ${index + 1}`
                        );
                    }
                });
            }

            // Set error message if errors arrays is not empty
            if (
                this.errorNewTrainingInput.length > 0 ||
                this.errorChapter.length > 0
            ) {
                var errorMessage =
                    "Veuillez remplir les champs manquants: " +
                    this.errorNewTrainingInput.map((item) => {
                        return ` ${item.text}`;
                    }) +
                    "," +
                    this.errorChapter.map((item) => {
                        return ` ${item}`;
                    });

                // Send toast to inform user
                this.$bvToast.toast(errorMessage, {
                    title: "Erreur lors de la transmission des données",
                    variant: "danger",
                    autoHideDelay: 5000,
                });
                return;
            } else {
                // Transform string of subjects to array before saving in database
                this.newTraining.subject = this.newTraining.subject
                    .split(",")
                    .map((item) => item.trim());

                // Transform string of notions to array before saving in database
                this.detailFormation.forEach((item, index) => {
                    this.detailFormation[index].notions = item.notions
                        .split(",")
                        .map((val) => {
                            return val.trim();
                        });
                });

                var training = {
                    title: this.newTraining.title,
                    description: this.newTraining.description,
                    trainer: this.newTraining.trainer,
                    image: this.newTraining.image,
                    url: this.newTraining.url,
                    length: this.newTraining.time,
                    subject: this.newTraining.subject,
                    difficulty: this.newTraining.difficulty,
                    xpPoint: this.newTraining.xpPoint,
                    details: {
                        chapter: this.detailFormation,
                    },
                };

                axios
                    .post("http://localhost:3003/api/v1/training", training, {
                        headers: {
                            Authorization:
                                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                        },
                    })
                    .then(
                        function(result) {
                            var successMessage = `La formation, ${result.data.title}, a été enregistrée avec succès.`;
                            // Close new formation modal & inform user of sucess
                            this.$bvModal.hide("newFormationModal");

                            // Send toast message to success
                            this.$bvToast.toast(successMessage, {
                                title: "Formation enregistrée",
                                variant: "success",
                                autoHideDelay: 5000,
                            });

                            axios
                                .get(
                                    "http://localhost:3003/api/v1/training/popular",
                                    {
                                        headers: {
                                            Authorization:
                                                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE1NGQ1MGU4MjEwMjE2MmMyMzIxNjgiLCJpYXQiOjE1OTUyMzE1Njh9.LIb7VAGmB9TvVllkorclB7Zf7pDYJJXQSbj13199h8E",
                                        },
                                    }
                                )
                                .then(
                                    function(result) {
                                        this.trainings = result.data;
                                        return;
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
.adminTrainings {
    margin-top: 30px;
}

.btn-create {
    background: var(--color-secondary) !important;
    border: none !important;
}

.headerChapter {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
