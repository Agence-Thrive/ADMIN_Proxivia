<template>
    <b-card class="shadow-lg border-0">
        <b-tabs no-nav-style>
            <b-tab title="Utilisateurs">
                <userTable></userTable>
            </b-tab>
            <b-tab title="Agences">
                <companyTable></companyTable>
            </b-tab>
            <b-tab title="Formations">
                <trainingTable></trainingTable>
            </b-tab>
            <b-tab title="Formateurs">
                <trainerTable></trainerTable>
            </b-tab>
            <b-tab title="Prospects">
                <prospectTable></prospectTable>
            </b-tab>
            <b-tab title="Mise à jour">
                <updateTable></updateTable>
            </b-tab>
        </b-tabs>
    </b-card>
</template>

<script>
import userTable from "./admin/users/userTable";
import trainingTable from "./admin/trainings/trainingTable";
import trainerTable from "./admin/trainers/trainerTable";
import prospectTable from "./admin/prospects/prospectTable";
import companyTable from "./admin/company/companyTable";
import updateTable from "./admin/update/updateTable";

export default {
    name: "Admin",
    components: {
        userTable: userTable,
        trainingTable: trainingTable,
        trainerTable: trainerTable,
        prospectTable: prospectTable,
        companyTable: companyTable,
        updateTable: updateTable,
    },
};
</script>

<style>
.page-item.active .page-link {
    background: var(--color-secondary);
    border-color: var(--color-secondary);
}

.page-item .page-link {
    color: grey;
}

.nav-link.active {
    border-bottom: 3px solid var(--color-secondary) !important;
    color: var(--color-secondary) !important;
}

.nav-link {
    margin-right: 20px;
    color: var(--color-primary) !important;
    padding: 4px 3px 8px 3px !important;
}
</style>
